"use server";

import { requirePermission } from "@/lib/auth-guard";
import { toDateKey } from "@/lib/calendar-utils";
import {
  applyDocumentTemplate,
  buildDocumentTemplateVariables,
} from "@/lib/document-template-format";
import {
  calculateExactAgeBreakdown,
  createEmptyPediCaregiverAnswers,
  findNearestRawScore,
  isPediCaregiverLevel,
  PEDI_AREA_MAX_RAW,
  PEDI_AREAS,
  PEDI_CAREGIVER_MAX_RAW,
  PEDI_HTML_PLACEHOLDER_KEYS,
  PEDI_INSTRUMENT,
  PEDI_NORMATIVE_MAX_AGE_MONTHS,
  PEDI_TO_REPORT_TEMPLATE_NAME,
  provisionalCaregiverContinuous,
  resolveContinuousDisplay,
  resolveNormativeDisplay,
  resolveStandardError,
  sumCaregiverRawScore,
  sumRawScoreForArea,
  buildPediToReportVariables,
  type PediAnswerSheet,
  type PediArea,
  type PediAreaScoreResult,
  type PediCapability,
  type PediCaregiverLevel,
  type PediScoreResult,
} from "@/lib/pedi";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EvaluationRow } from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isCapability(value: unknown): value is PediCapability {
  return value === 0 || value === 1;
}

function validateAnswerSheet(input: PediAnswerSheet): string | null {
  if (!DATE_PATTERN.test(input.birthDate)) {
    return "Data de nascimento inválida.";
  }

  if (!DATE_PATTERN.test(input.evaluationDate)) {
    return "Data da avaliação inválida.";
  }

  if (!input.items || typeof input.items !== "object") {
    return "Folha de respostas inválida.";
  }

  for (const value of Object.values(input.items)) {
    if (!isCapability(value)) {
      return "Cada item deve ser 0 ou 1.";
    }
  }

  return null;
}

function validateCaregiverItems(
  caregiverItems: Record<string, PediCaregiverLevel | null> | undefined
): string | null {
  if (!caregiverItems) {
    return null;
  }

  for (const value of Object.values(caregiverItems)) {
    if (value === null) {
      continue;
    }
    if (!isPediCaregiverLevel(value)) {
      return "Itens de assistência do cuidador devem ser 0–5.";
    }
  }

  return null;
}

async function lookupContinuousScore(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  area: PediArea,
  rawScore: number
) {
  const { data: exact } = await supabase
    .from("pedi_continuous_scores")
    .select("raw_score, continuous_score, standard_error")
    .eq("area", area)
    .eq("raw_score", rawScore)
    .maybeSingle();

  if (exact) {
    return {
      lookup: exact,
      bounds: null as { minRaw: number; maxRaw: number } | null,
    };
  }

  const { data: boundsRows } = await supabase
    .from("pedi_continuous_scores")
    .select("raw_score")
    .eq("area", area)
    .order("raw_score", { ascending: true });

  const raws = (boundsRows ?? []).map((row) => row.raw_score);
  const bounds =
    raws.length > 0
      ? { minRaw: Math.min(...raws), maxRaw: Math.max(...raws) }
      : null;

  return { lookup: null, bounds };
}

async function lookupNormativeScore(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  area: PediArea,
  ageMonths: number,
  rawScore: number
) {
  const { data: bandRows } = await supabase
    .from("pedi_normative_scores")
    .select(
      "raw_score, normative_score, standard_error, age_months_min, age_months_max"
    )
    .eq("area", area)
    .lte("age_months_min", ageMonths)
    .gte("age_months_max", ageMonths)
    .order("raw_score", { ascending: true });

  const rows = bandRows ?? [];
  const availableRawScores = rows.map((row) => row.raw_score);

  if (rows.length === 0) {
    return { lookup: null, availableRawScores: [] as number[] };
  }

  const exact = rows.find((row) => row.raw_score === rawScore);
  if (exact) {
    return { lookup: exact, availableRawScores };
  }

  const nearestRaw = findNearestRawScore(rawScore, availableRawScores);
  if (nearestRaw === null) {
    return { lookup: null, availableRawScores };
  }

  const minRaw = Math.min(...availableRawScores);
  const maxRaw = Math.max(...availableRawScores);
  if (rawScore < minRaw || rawScore > maxRaw) {
    return { lookup: null, availableRawScores };
  }

  const nearest = rows.find((row) => row.raw_score === nearestRaw) ?? null;
  return { lookup: nearest, availableRawScores };
}

function scoreCaregiverAreas(
  caregiverItems: Record<string, PediCaregiverLevel | null>,
  appliesNormative: boolean
): PediAreaScoreResult[] {
  return PEDI_AREAS.map((area) => {
    const maxRawScore = PEDI_CAREGIVER_MAX_RAW[area];
    const rawScore = sumCaregiverRawScore(area, caregiverItems);
    const continuousScore = provisionalCaregiverContinuous(rawScore, maxRawScore);

    return {
      area,
      rawScore,
      continuousScore,
      continuousStandardError: null,
      /** Normativo ASC aguarda tabelas oficiais — proxy linear só até 7 anos. */
      normativeScore: appliesNormative ? continuousScore : null,
      normativeStandardError: null,
      maxRawScore,
    };
  });
}

export type CalculatePediScoreInput = PediAnswerSheet & {
  caregiverItems?: Record<string, PediCaregiverLevel | null>;
};

export async function calculatePediScoreAction(
  sheet: CalculatePediScoreInput
): Promise<ActionResult<PediScoreResult>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const validationError = validateAnswerSheet(sheet);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const caregiverError = validateCaregiverItems(sheet.caregiverItems);
  if (caregiverError) {
    return { success: false, error: caregiverError };
  }

  let age;
  try {
    age = calculateExactAgeBreakdown(sheet.birthDate, sheet.evaluationDate);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível calcular a idade.",
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const appliesNormative = age.totalMonths <= PEDI_NORMATIVE_MAX_AGE_MONTHS;
  const areas: PediAreaScoreResult[] = [];

  for (const area of PEDI_AREAS) {
    const rawScore = sumRawScoreForArea(area, sheet.items);
    const maxRawScore = PEDI_AREA_MAX_RAW[area];

    const continuous = await lookupContinuousScore(supabase, area, rawScore);
    const continuousScore = resolveContinuousDisplay(
      rawScore,
      continuous.lookup,
      continuous.bounds
    );
    const continuousStandardError = resolveStandardError(continuous.lookup);

    let normativeScore: PediAreaScoreResult["normativeScore"] = null;
    let normativeStandardError: number | null = null;

    if (appliesNormative) {
      const normative = await lookupNormativeScore(
        supabase,
        area,
        age.totalMonths,
        rawScore
      );
      normativeScore = resolveNormativeDisplay(
        rawScore,
        normative.lookup,
        normative.availableRawScores
      );
      normativeStandardError = resolveStandardError(normative.lookup);
    }

    areas.push({
      area,
      rawScore,
      continuousScore,
      continuousStandardError,
      normativeScore,
      normativeStandardError,
      maxRawScore,
    });
  }

  const caregiverItems =
    sheet.caregiverItems ?? createEmptyPediCaregiverAnswers();
  const hasAnyCaregiver = Object.values(caregiverItems).some(
    (value) => value !== null
  );

  return {
    success: true,
    data: {
      age,
      ageMonths: age.totalMonths,
      areas,
      caregiverAreas: hasAnyCaregiver
        ? scoreCaregiverAreas(caregiverItems, appliesNormative)
        : undefined,
    },
  };
}

export type SavePediEvaluationInput = {
  patientId: string;
  patientName: string;
  birthDate: string;
  evaluationDate: string;
  items: Record<string, PediCapability>;
  caregiverItems?: Record<string, PediCaregiverLevel | null>;
  scores: PediScoreResult;
  professionalName: string;
  professionalRole: string;
  status?: "draft" | "finalized";
};

function averageNumericContinuous(scores: PediScoreResult): number | null {
  const numeric = scores.areas
    .map((area) => area.continuousScore)
    .filter((value): value is number => typeof value === "number");

  if (numeric.length === 0) {
    return null;
  }

  const sum = numeric.reduce((acc, value) => acc + value, 0);
  return Math.round((sum / numeric.length) * 100) / 100;
}

export async function savePediEvaluationAction(
  input: SavePediEvaluationInput
): Promise<ActionResult<{ evaluation: EvaluationRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  if (!input.patientId.trim()) {
    return { success: false, error: "Paciente obrigatório." };
  }

  if (!DATE_PATTERN.test(input.evaluationDate)) {
    return { success: false, error: "Data da avaliação inválida." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    instrument: PEDI_INSTRUMENT,
    birthDate: input.birthDate,
    evaluationDate: input.evaluationDate,
    ageMonths: input.scores.ageMonths,
    age: input.scores.age,
    items: input.items,
    caregiverItems: input.caregiverItems ?? null,
    scores: input.scores,
  };

  const totalScore = averageNumericContinuous(input.scores);
  const status = input.status ?? "draft";
  const title = `PEDI — ${input.patientName} — ${input.evaluationDate}`;

  const { data, error } = await supabase
    .from("evaluations")
    .insert({
      patient_id: input.patientId,
      title,
      instrument: PEDI_INSTRUMENT,
      evaluation_date: input.evaluationDate || toDateKey(new Date()),
      content_html: JSON.stringify(payload),
      total_score: totalScore,
      status,
      professional_name: input.professionalName,
      professional_role: input.professionalRole,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { evaluation: data } };
}

export type MergePediToReportInput = {
  patientName: string;
  birthDate?: string;
  evaluationDate: string;
  items: Record<string, PediCapability>;
  scores: PediScoreResult;
  professionalName?: string;
  professionalRole?: string;
};

export async function mergePediIntoToReportAction(
  input: MergePediToReportInput
): Promise<ActionResult<{ html: string; templateName: string }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: template, error } = await supabase
    .from("document_templates")
    .select("id, name, body_html, status")
    .eq("name", PEDI_TO_REPORT_TEMPLATE_NAME)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!template?.body_html) {
    return {
      success: false,
      error: `Modelo "${PEDI_TO_REPORT_TEMPLATE_NAME}" não encontrado. Cadastre-o em Modelos.`,
    };
  }

  const baseVars = buildDocumentTemplateVariables({
    patientName: input.patientName,
    sessionDate: input.evaluationDate,
    professionalName: input.professionalName,
    professionalRole: input.professionalRole,
  });

  const pediVars = buildPediToReportVariables({
    patientName: input.patientName,
    birthDate: input.birthDate,
    evaluationDate: input.evaluationDate,
    items: input.items,
    scores: input.scores,
  });

  const html = applyDocumentTemplate(
    template.body_html,
    { ...baseVars, ...pediVars },
    { htmlKeys: PEDI_HTML_PLACEHOLDER_KEYS }
  );

  return {
    success: true,
    data: { html, templateName: template.name },
  };
}
