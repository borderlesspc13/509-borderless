import {
  AI_WRITING_TRAINING_CONTEXTS,
  getAiWritingTrainingContext,
  isValidAiWritingTrainingContext,
} from "@/lib/ai-report-training/registry";

export const AI_REPORT_TRAINING_SAMPLE_LIMIT = 5;

/** @deprecated Use AI_WRITING_TRAINING_CONTEXTS */
export const AI_REPORT_CLINICAL_AREAS = AI_WRITING_TRAINING_CONTEXTS.filter(
  (context) => context.type === "clinical_area"
).map((context) => context.key);

export const AI_REPORT_TRAINING_STATUS_LABELS = {
  not_started: "Não iniciado",
  collecting: "Coletando amostras",
  ready: "IA treinada",
  stale: "Retreinar necessário",
} as const;

export type AiReportTrainingStatus = keyof typeof AI_REPORT_TRAINING_STATUS_LABELS;

/** @deprecated Use isValidAiWritingTrainingContext */
export function isAiReportClinicalArea(value: string): boolean {
  const context = getAiWritingTrainingContext(value);
  return context?.type === "clinical_area";
}

export {
  AI_WRITING_TRAINING_CONTEXTS,
  getAiWritingTrainingContext,
  getAiWritingTrainingContextLabel,
  groupAiWritingTrainingContexts,
  isValidAiWritingTrainingContext,
} from "@/lib/ai-report-training/registry";

export type { AiWritingTrainingContext } from "@/lib/ai-report-training/registry";
