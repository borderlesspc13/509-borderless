"use server";

import { requirePermission } from "@/lib/auth-guard";
import { toDateKey } from "@/lib/calendar-utils";
import { calculateExactAgeInMonths } from "@/lib/pedi/age";
import { PERMISSIONS } from "@/lib/rbac";
import {
  classifySensoryScore,
  countItemsForQuadrant,
  isSensoryAgeBand,
  SENSORY_PROFILE_INSTRUMENT,
  SENSORY_QUADRANTS,
  sumRawScoreForQuadrant,
  type SensoryAnswerSheet,
  type SensoryLikert,
  type SensoryProfileScoreResult,
  type SensoryQuadrantScoreResult,
} from "@/lib/sensory-profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EvaluationRow } from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

function isLikert(value: unknown): value is SensoryLikert {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function validateSensorySheet(sheet: SensoryAnswerSheet): string | null {
  if (!isSensoryAgeBand(sheet.ageBand)) {
    return "Faixa etária inválida.";
  }

  if (!sheet.items || typeof sheet.items !== "object") {
    return "Folha de respostas inválida.";
  }

  for (const value of Object.values(sheet.items)) {
    if (!isLikert(value)) {
      return "Cada item deve ser pontuado de 1 a 5.";
    }
  }

  return null;
}

export async function calculateSensoryProfileAction(
  sheet: SensoryAnswerSheet
): Promise<ActionResult<SensoryProfileScoreResult>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const validationError = validateSensorySheet(sheet);
  if (validationError) {
    return { success: false, error: validationError };
  }

  let ageMonths: number | null = null;
  if (sheet.birthDate && sheet.evaluationDate) {
    try {
      ageMonths = calculateExactAgeInMonths(
        sheet.birthDate,
        sheet.evaluationDate
      );
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível calcular a idade.",
      };
    }
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: normRows, error: normError } = await supabase
    .from("sensory_profile_normative_table")
    .select(
      "quadrant, mean_score, sd_score, typical_max_sd, definite_min_sd"
    )
    .eq("age_band", sheet.ageBand);

  if (normError) {
    return { success: false, error: normError.message };
  }

  if (!normRows || normRows.length === 0) {
    return {
      success: false,
      error: "Tabela normativa não encontrada para a faixa etária selecionada.",
    };
  }

  const quadrants: SensoryQuadrantScoreResult[] = [];

  for (const quadrant of SENSORY_QUADRANTS) {
    const norm = normRows.find((row) => row.quadrant === quadrant);
    if (!norm) {
      return {
        success: false,
        error: `Norma ausente para o quadrante ${quadrant}.`,
      };
    }

    const rawScore = sumRawScoreForQuadrant(quadrant, sheet.items);
    const classified = classifySensoryScore(
      rawScore,
      Number(norm.mean_score),
      Number(norm.sd_score),
      Number(norm.typical_max_sd),
      Number(norm.definite_min_sd)
    );

    quadrants.push({
      quadrant,
      rawScore,
      meanScore: Number(norm.mean_score),
      sdScore: Number(norm.sd_score),
      zScore: classified.zScore,
      classification: classified.classification,
      classificationLabel: classified.label,
      itemCount: countItemsForQuadrant(quadrant),
    });
  }

  return {
    success: true,
    data: {
      ageBand: sheet.ageBand,
      ageMonths,
      quadrants,
    },
  };
}

export type SaveSensoryProfileEvaluationInput = {
  patientId: string;
  patientName: string;
  birthDate?: string;
  evaluationDate: string;
  ageBand: SensoryAnswerSheet["ageBand"];
  items: Record<string, SensoryLikert>;
  scores: SensoryProfileScoreResult;
  professionalName: string;
  professionalRole: string;
  status?: "draft" | "finalized";
};

export async function saveSensoryProfileEvaluationAction(
  input: SaveSensoryProfileEvaluationInput
): Promise<ActionResult<{ evaluation: EvaluationRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  if (!input.patientId.trim()) {
    return { success: false, error: "Paciente obrigatório." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    instrument: SENSORY_PROFILE_INSTRUMENT,
    ageBand: input.ageBand,
    birthDate: input.birthDate,
    evaluationDate: input.evaluationDate,
    items: input.items,
    scores: input.scores,
  };

  const definiteCount = input.scores.quadrants.filter(
    (q) => q.classification === "definite_difference"
  ).length;

  const status = input.status ?? "draft";
  const title = `Perfil Sensorial II — ${input.patientName} — ${input.evaluationDate}`;

  const { data, error } = await supabase
    .from("evaluations")
    .insert({
      patient_id: input.patientId,
      title,
      instrument: SENSORY_PROFILE_INSTRUMENT,
      evaluation_date: input.evaluationDate || toDateKey(new Date()),
      content_html: JSON.stringify(payload),
      total_score: definiteCount,
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
