"use server";

import { requirePermission } from "@/lib/auth-guard";
import { toDateKey } from "@/lib/calendar-utils";
import {
  calculateDemucaScore,
  countAnsweredDemucaItems,
  DEMUCA_INSTRUMENT,
  DEMUCA_ITEM_COUNT,
  DEMUCA_ITEMS,
  type DemucaAnswerSheet,
  type DemucaRating,
  type DemucaScoreResult,
} from "@/lib/demuca";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EvaluationRow } from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

function isDemucaRating(value: unknown): value is DemucaRating {
  return value === "N" || value === "P" || value === "M";
}

function validateDemucaSheet(sheet: DemucaAnswerSheet): string | null {
  if (!sheet.items || typeof sheet.items !== "object") {
    return "Folha de respostas inválida.";
  }

  for (const [itemId, value] of Object.entries(sheet.items)) {
    if (value === undefined) continue;
    if (!isDemucaRating(value)) {
      return "Cada item deve ser pontuado como N, P ou M.";
    }
    if (!DEMUCA_ITEMS.some((item) => item.id === itemId)) {
      return `Item desconhecido: ${itemId}`;
    }
  }

  return null;
}

export async function calculateDemucaScoreAction(
  sheet: DemucaAnswerSheet
): Promise<ActionResult<DemucaScoreResult>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const validationError = validateDemucaSheet(sheet);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const answeredCount = countAnsweredDemucaItems(sheet.items);

  if (!sheet.allowPartial && answeredCount < DEMUCA_ITEM_COUNT) {
    return {
      success: false,
      error: `Preencha todos os ${DEMUCA_ITEM_COUNT} itens ou habilite avaliação parcial.`,
    };
  }

  if (sheet.allowPartial && answeredCount === 0) {
    return {
      success: false,
      error: "Responda ao menos um item para calcular o escore parcial.",
    };
  }

  const scores = calculateDemucaScore({
    items: sheet.items,
    allowPartial: sheet.allowPartial,
  });

  return { success: true, data: scores };
}

export type SaveDemucaEvaluationInput = {
  patientId: string;
  patientName: string;
  evaluationDate: string;
  items: Record<string, DemucaRating | undefined>;
  allowPartial: boolean;
  scores: DemucaScoreResult;
  professionalName: string;
  professionalRole: string;
  status?: "draft" | "finalized";
  notes?: string;
};

export async function saveDemucaEvaluationAction(
  input: SaveDemucaEvaluationInput
): Promise<ActionResult<{ evaluation: EvaluationRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  if (!input.patientId.trim()) {
    return { success: false, error: "Paciente obrigatório." };
  }

  if (!input.scores.isComplete) {
    return {
      success: false,
      error: input.allowPartial
        ? "Responda ao menos um item antes de salvar."
        : "Preencha todos os itens antes de salvar.",
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    instrument: DEMUCA_INSTRUMENT,
    evaluationDate: input.evaluationDate,
    allowPartial: input.allowPartial,
    items: input.items,
    scores: input.scores,
    notes: input.notes?.trim() || undefined,
  };

  const status = input.status ?? "draft";
  const title = `DEMUCA — ${input.patientName} — ${input.evaluationDate}`;

  const { data, error } = await supabase
    .from("evaluations")
    .insert({
      patient_id: input.patientId,
      title,
      instrument: DEMUCA_INSTRUMENT,
      evaluation_date: input.evaluationDate || toDateKey(new Date()),
      content_html: JSON.stringify(payload),
      total_score: Number((input.scores.overallScore * 100).toFixed(2)),
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
