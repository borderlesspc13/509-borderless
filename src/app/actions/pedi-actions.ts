"use server";

import { requirePermission } from "@/lib/auth-guard";
import { toDateKey } from "@/lib/calendar-utils";
import {
  calculateExactAgeInMonths,
  findNearestRawScore,
  PEDI_AREA_MAX_RAW,
  PEDI_AREAS,
  PEDI_INSTRUMENT,
  resolveContinuousDisplay,
  resolveNormativeDisplay,
  sumRawScoreForArea,
  type PediAnswerSheet,
  type PediArea,
  type PediAreaScoreResult,
  type PediCapability,
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

async function lookupContinuousScore(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  area: PediArea,
  rawScore: number
) {
  const { data: exact } = await supabase
    .from("pedi_continuous_scores")
    .select("raw_score, continuous_score")
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
    .select("raw_score, normative_score, age_months_min, age_months_max")
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

  // Fora da curva amostrada: não usa vizinho — sinaliza piso/teto.
  const minRaw = Math.min(...availableRawScores);
  const maxRaw = Math.max(...availableRawScores);
  if (rawScore < minRaw || rawScore > maxRaw) {
    return { lookup: null, availableRawScores };
  }

  const nearest = rows.find((row) => row.raw_score === nearestRaw) ?? null;
  return { lookup: nearest, availableRawScores };
}

export async function calculatePediScoreAction(
  sheet: PediAnswerSheet
): Promise<ActionResult<PediScoreResult>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const validationError = validateAnswerSheet(sheet);
  if (validationError) {
    return { success: false, error: validationError };
  }

  let ageMonths: number;
  try {
    ageMonths = calculateExactAgeInMonths(
      sheet.birthDate,
      sheet.evaluationDate
    );
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Não foi possível calcular a idade.",
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

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

    const normative = await lookupNormativeScore(
      supabase,
      area,
      ageMonths,
      rawScore
    );
    const normativeScore = resolveNormativeDisplay(
      rawScore,
      normative.lookup,
      normative.availableRawScores
    );

    areas.push({
      area,
      rawScore,
      continuousScore,
      normativeScore,
      maxRawScore,
    });
  }

  return {
    success: true,
    data: { ageMonths, areas },
  };
}

export type SavePediEvaluationInput = {
  patientId: string;
  patientName: string;
  birthDate: string;
  evaluationDate: string;
  items: Record<string, PediCapability>;
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
    items: input.items,
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
