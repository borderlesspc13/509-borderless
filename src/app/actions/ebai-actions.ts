"use server";

import { requirePermission } from "@/lib/auth-guard";
import { toDateKey } from "@/lib/calendar-utils";
import {
  countAnsweredEbaiItems,
  EBAI_INSTRUMENT,
  EBAI_ITEM_COUNT,
  EBAI_MAX_ITEM_SCORE,
  EBAI_MIN_ITEM_SCORE,
  EBAI_SEVERITY_LABELS,
  sumEbaiRawScore,
  type EbaiAnswerSheet,
  type EbaiLikert,
  type EbaiScoreResult,
  type EbaiSeverity,
} from "@/lib/ebai";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EvaluationRow } from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

function isEbaiLikert(value: unknown): value is EbaiLikert {
  return (
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5 ||
    value === 6 ||
    value === 7
  );
}

function validateEbaiSheet(sheet: EbaiAnswerSheet): string | null {
  if (!sheet.items || typeof sheet.items !== "object") {
    return "Folha de respostas inválida.";
  }

  for (const value of Object.values(sheet.items)) {
    if (!isEbaiLikert(value)) {
      return "Cada item deve ser pontuado de 1 a 7.";
    }
  }

  return null;
}

function isEbaiSeverity(value: string): value is EbaiSeverity {
  return value === "leve" || value === "moderado" || value === "severo";
}

async function lookupEbaiNormative(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  rawScore: number
) {
  const { data: exact } = await supabase
    .from("ebai_normative_table")
    .select("raw_score, t_score, classification")
    .eq("raw_score", rawScore)
    .maybeSingle();

  if (exact) {
    return exact;
  }

  const { data: nearest } = await supabase
    .from("ebai_normative_table")
    .select("raw_score, t_score, classification")
    .order("raw_score", { ascending: true });

  const rows = nearest ?? [];
  if (rows.length === 0) {
    return null;
  }

  let closest = rows[0];
  let minDiff = Math.abs(rows[0].raw_score - rawScore);

  for (const row of rows) {
    const diff = Math.abs(row.raw_score - rawScore);
    if (diff < minDiff) {
      minDiff = diff;
      closest = row;
    }
  }

  return closest;
}

export async function calculateEbaiScoreAction(
  sheet: EbaiAnswerSheet
): Promise<ActionResult<EbaiScoreResult>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const validationError = validateEbaiSheet(sheet);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const answeredCount = countAnsweredEbaiItems(sheet.items);
  if (answeredCount < EBAI_ITEM_COUNT) {
    return {
      success: false,
      error: `Preencha todos os ${EBAI_ITEM_COUNT} itens antes de calcular.`,
    };
  }

  const rawScore = sumEbaiRawScore(sheet.items);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const lookup = await lookupEbaiNormative(supabase, rawScore);
  if (!lookup) {
    return {
      success: false,
      error: "Tabela normativa EBAI não configurada.",
    };
  }

  if (!isEbaiSeverity(lookup.classification)) {
    return { success: false, error: "Classificação normativa inválida." };
  }

  return {
    success: true,
    data: {
      rawScore,
      tScore: lookup.t_score,
      classification: lookup.classification,
      classificationLabel: EBAI_SEVERITY_LABELS[lookup.classification],
      itemCount: EBAI_ITEM_COUNT,
      answeredCount,
    },
  };
}

export type SaveEbaiEvaluationInput = {
  patientId: string;
  patientName: string;
  evaluationDate: string;
  items: Record<string, EbaiLikert>;
  scores: EbaiScoreResult;
  professionalName: string;
  professionalRole: string;
  status?: "draft" | "finalized";
};

export async function saveEbaiEvaluationAction(
  input: SaveEbaiEvaluationInput
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
    instrument: EBAI_INSTRUMENT,
    evaluationDate: input.evaluationDate,
    items: input.items,
    scores: input.scores,
  };

  const status = input.status ?? "draft";
  const title = `EBAI — ${input.patientName} — ${input.evaluationDate}`;

  const { data, error } = await supabase
    .from("evaluations")
    .insert({
      patient_id: input.patientId,
      title,
      instrument: EBAI_INSTRUMENT,
      evaluation_date: input.evaluationDate || toDateKey(new Date()),
      content_html: JSON.stringify(payload),
      total_score: input.scores.tScore,
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

export async function getEbaiScoreRangeHintAction(): Promise<{
  minItemScore: number;
  maxItemScore: number;
  itemCount: number;
}> {
  return {
    minItemScore: EBAI_MIN_ITEM_SCORE,
    maxItemScore: EBAI_MAX_ITEM_SCORE,
    itemCount: EBAI_ITEM_COUNT,
  };
}
