"use server";

import { requirePermission } from "@/lib/auth-guard";
import {
  AI_REPORT_TRAINING_SAMPLE_LIMIT,
  AI_WRITING_TRAINING_CONTEXTS,
  getAiWritingTrainingContextLabel,
  isValidAiWritingTrainingContext,
  type AiReportTrainingStatus,
} from "@/lib/ai-report-training/constants";
import {
  generateClinicalReportDraft,
  trainWritingPatternFromSamples,
} from "@/lib/ai-report-training/engine";
import type {
  AiReportAreaTrainingState,
  AiReportGenerationInput,
  AiReportGenerationResult,
  AiReportTrainingSample,
  TrainAiReportAreaResult,
} from "@/lib/ai-report-training/types";
import { isAiMockMode } from "@/lib/ai/env";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  ClinicalAreaAiMemoryRow,
  ClinicalAreaReportTrainingSampleRow,
} from "@/lib/supabase/database.types";

type ActionResult<T = undefined> = {
  success: boolean;
  error?: string;
  data?: T;
};

const MIN_SAMPLE_LENGTH = 120;

function resolveTrainingContextKey(input: {
  trainingContextKey?: string;
  clinicalArea?: string;
}): string | null {
  const key = input.trainingContextKey ?? input.clinicalArea ?? "";
  return isValidAiWritingTrainingContext(key) ? key : null;
}

function mapSampleRow(row: ClinicalAreaReportTrainingSampleRow): AiReportTrainingSample {
  return {
    id: row.id,
    trainingContextKey: row.clinical_area,
    clinicalArea: row.clinical_area,
    sortOrder: row.sort_order,
    title: row.title,
    bodyText: row.body_text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMemoryRow(row: ClinicalAreaAiMemoryRow) {
  return {
    trainingContextKey: row.clinical_area,
    clinicalArea: row.clinical_area,
    patternSummary: row.pattern_summary,
    styleGuidelines: row.style_guidelines,
    sectionOutline: row.section_outline,
    sampleCount: row.sample_count,
    status: row.status as AiReportTrainingStatus,
    trainedAt: row.trained_at,
  };
}

function buildTrainingState(
  trainingContextKey: string,
  samples: AiReportTrainingSample[],
  memoryRow: ClinicalAreaAiMemoryRow | null
): AiReportAreaTrainingState {
  const memory = memoryRow
    ? mapMemoryRow(memoryRow)
    : {
        trainingContextKey,
        clinicalArea: trainingContextKey,
        patternSummary: "",
        styleGuidelines: "",
        sectionOutline: "",
        sampleCount: 0,
        status: "not_started" as const,
        trainedAt: null,
      };

  const canTrain = samples.length >= AI_REPORT_TRAINING_SAMPLE_LIMIT;
  const isReady = memory.status === "ready";

  return {
    trainingContextKey,
    clinicalArea: trainingContextKey,
    contextLabel: getAiWritingTrainingContextLabel(trainingContextKey),
    samples,
    memory,
    isReady,
    canTrain,
  };
}

async function markMemoryStaleIfNeeded(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  trainingContextKey: string
) {
  await supabase
    .from("clinical_area_ai_memory")
    .update({
      status: "stale",
      updated_at: new Date().toISOString(),
    })
    .eq("clinical_area", trainingContextKey)
    .eq("status", "ready");
}

async function loadTrainingMaps(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>
) {
  const [{ data: samples }, { data: memories }] = await Promise.all([
    supabase
      .from("clinical_area_report_training_samples")
      .select("*")
      .order("clinical_area", { ascending: true })
      .order("sort_order", { ascending: true }),
    supabase.from("clinical_area_ai_memory").select("*"),
  ]);

  const memoryByKey = new Map(
    (memories ?? []).map((row) => [row.clinical_area, row])
  );

  const samplesByKey = new Map<string, AiReportTrainingSample[]>();
  for (const row of samples ?? []) {
    const list = samplesByKey.get(row.clinical_area) ?? [];
    list.push(mapSampleRow(row));
    samplesByKey.set(row.clinical_area, list);
  }

  return { memoryByKey, samplesByKey };
}

export async function getAiReportTrainingDashboardAction(): Promise<
  ActionResult<{ areas: AiReportAreaTrainingState[]; mockMode: boolean }>
> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { memoryByKey, samplesByKey } = await loadTrainingMaps(supabase);

  const areas = AI_WRITING_TRAINING_CONTEXTS.map((context) =>
    buildTrainingState(
      context.key,
      samplesByKey.get(context.key) ?? [],
      memoryByKey.get(context.key) ?? null
    )
  );

  return {
    success: true,
    data: { areas, mockMode: isAiMockMode() },
  };
}

export async function getAiWritingTrainingStateAction(input: {
  trainingContextKey: string;
}): Promise<ActionResult<AiReportAreaTrainingState>> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  if (!isValidAiWritingTrainingContext(input.trainingContextKey)) {
    return { success: false, error: "Contexto de treinamento inválido." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const [{ data: samples }, { data: memory }] = await Promise.all([
    supabase
      .from("clinical_area_report_training_samples")
      .select("*")
      .eq("clinical_area", input.trainingContextKey)
      .order("sort_order", { ascending: true }),
    supabase
      .from("clinical_area_ai_memory")
      .select("*")
      .eq("clinical_area", input.trainingContextKey)
      .maybeSingle(),
  ]);

  return {
    success: true,
    data: buildTrainingState(
      input.trainingContextKey,
      (samples ?? []).map(mapSampleRow),
      memory
    ),
  };
}

export async function saveAiReportTrainingSampleAction(input: {
  trainingContextKey?: string;
  clinicalArea?: string;
  sortOrder: number;
  title: string;
  bodyText: string;
}): Promise<ActionResult<{ sample: AiReportTrainingSample }>> {
  const session = await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);
  const trainingContextKey = resolveTrainingContextKey(input);

  if (!trainingContextKey) {
    return { success: false, error: "Contexto de treinamento inválido." };
  }

  if (
    input.sortOrder < 1 ||
    input.sortOrder > AI_REPORT_TRAINING_SAMPLE_LIMIT
  ) {
    return { success: false, error: "Posição da amostra deve ser entre 1 e 5." };
  }

  const title = input.title.trim();
  const bodyText = input.bodyText.trim();

  if (!title) {
    return { success: false, error: "Informe o título do documento." };
  }

  if (bodyText.length < MIN_SAMPLE_LENGTH) {
    return {
      success: false,
      error: `O conteúdo deve ter pelo menos ${MIN_SAMPLE_LENGTH} caracteres.`,
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("clinical_area_report_training_samples")
    .upsert(
      {
        clinical_area: trainingContextKey,
        sort_order: input.sortOrder,
        title,
        body_text: bodyText,
        created_by: session.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clinical_area,sort_order" }
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  const { count } = await supabase
    .from("clinical_area_report_training_samples")
    .select("id", { count: "exact", head: true })
    .eq("clinical_area", trainingContextKey);

  const sampleCount = count ?? 0;

  await supabase.from("clinical_area_ai_memory").upsert(
    {
      clinical_area: trainingContextKey,
      sample_count: sampleCount,
      status: sampleCount > 0 ? "collecting" : "not_started",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clinical_area" }
  );

  await markMemoryStaleIfNeeded(supabase, trainingContextKey);

  return { success: true, data: { sample: mapSampleRow(data) } };
}

export async function deleteAiReportTrainingSampleAction(input: {
  sampleId: string;
}): Promise<ActionResult<void>> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: existing } = await supabase
    .from("clinical_area_report_training_samples")
    .select("clinical_area")
    .eq("id", input.sampleId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Amostra não encontrada." };
  }

  const { error } = await supabase
    .from("clinical_area_report_training_samples")
    .delete()
    .eq("id", input.sampleId);

  if (error) {
    return { success: false, error: error.message };
  }

  const { count } = await supabase
    .from("clinical_area_report_training_samples")
    .select("id", { count: "exact", head: true })
    .eq("clinical_area", existing.clinical_area);

  const sampleCount = count ?? 0;

  await supabase
    .from("clinical_area_ai_memory")
    .update({
      sample_count: sampleCount,
      status: sampleCount === 0 ? "not_started" : "collecting",
      updated_at: new Date().toISOString(),
    })
    .eq("clinical_area", existing.clinical_area);

  await markMemoryStaleIfNeeded(supabase, existing.clinical_area);

  return { success: true };
}

export async function trainAiReportAreaAction(input: {
  trainingContextKey?: string;
  clinicalArea?: string;
}): Promise<ActionResult<TrainAiReportAreaResult>> {
  const session = await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);
  const trainingContextKey = resolveTrainingContextKey(input);

  if (!trainingContextKey) {
    return { success: false, error: "Contexto de treinamento inválido." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: rows, error } = await supabase
    .from("clinical_area_report_training_samples")
    .select("*")
    .eq("clinical_area", trainingContextKey)
    .order("sort_order", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  const samples = (rows ?? []).map(mapSampleRow);

  if (samples.length < AI_REPORT_TRAINING_SAMPLE_LIMIT) {
    return {
      success: false,
      error: `São necessários ${AI_REPORT_TRAINING_SAMPLE_LIMIT} documentos manuais para treinar a IA.`,
    };
  }

  const contextLabel = getAiWritingTrainingContextLabel(trainingContextKey);
  const extracted = await trainWritingPatternFromSamples(contextLabel, samples);

  const now = new Date().toISOString();

  const { data: memoryRow, error: memoryError } = await supabase
    .from("clinical_area_ai_memory")
    .upsert(
      {
        clinical_area: trainingContextKey,
        pattern_summary: extracted.patternSummary,
        style_guidelines: extracted.styleGuidelines,
        section_outline: extracted.sectionOutline,
        sample_count: samples.length,
        status: "ready",
        trained_at: now,
        trained_by: session.id,
        updated_at: now,
      },
      { onConflict: "clinical_area" }
    )
    .select()
    .single();

  if (memoryError) {
    return { success: false, error: memoryError.message };
  }

  return {
    success: true,
    data: {
      trainingContextKey,
      clinicalArea: trainingContextKey,
      memory: mapMemoryRow(memoryRow),
      mockMode: extracted.mockMode,
    },
  };
}

export async function generateClinicalReportWithAiAction(
  input: AiReportGenerationInput
): Promise<ActionResult<AiReportGenerationResult>> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  const trainingContextKey = resolveTrainingContextKey(input);

  if (!trainingContextKey) {
    return { success: false, error: "Contexto de treinamento inválido." };
  }

  if (!input.patientName.trim()) {
    return { success: false, error: "Informe o nome do paciente." };
  }

  if (!input.evaluationPeriod.trim()) {
    return { success: false, error: "Informe o período da avaliação." };
  }

  if (!input.clinicalDemand.trim()) {
    return { success: false, error: "Descreva a demanda clínica." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: memoryRow, error } = await supabase
    .from("clinical_area_ai_memory")
    .select("*")
    .eq("clinical_area", trainingContextKey)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!memoryRow || memoryRow.status !== "ready") {
    return {
      success: false,
      error:
        "A IA ainda não foi treinada para este contexto. Salve 5 documentos manuais e execute o treinamento.",
    };
  }

  const contextLabel = getAiWritingTrainingContextLabel(trainingContextKey);

  const draft = await generateClinicalReportDraft({
    contextLabel,
    memory: {
      patternSummary: memoryRow.pattern_summary,
      styleGuidelines: memoryRow.style_guidelines,
      sectionOutline: memoryRow.section_outline,
    },
    patientName: input.patientName.trim(),
    patientAge: input.patientAge?.trim(),
    evaluationPeriod: input.evaluationPeriod.trim(),
    clinicalDemand: input.clinicalDemand.trim(),
    sessionSummary: input.sessionSummary?.trim(),
    therapeuticGoals: input.therapeuticGoals?.trim(),
    additionalNotes: input.additionalNotes?.trim(),
  });

  return {
    success: true,
    data: {
      title: draft.title,
      bodyHtml: draft.bodyHtml,
      bodyText: draft.bodyText,
      mockMode: draft.mockMode,
      trainingContextKey,
      clinicalArea: trainingContextKey,
    },
  };
}
