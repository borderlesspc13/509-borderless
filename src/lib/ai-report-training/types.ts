import type { AiReportTrainingStatus } from "@/lib/ai-report-training/constants";

export type AiReportTrainingSample = {
  id: string;
  /** Chave do contexto (área, avaliação ou tipo de relatório) */
  trainingContextKey: string;
  /** @deprecated Use trainingContextKey */
  clinicalArea: string;
  sortOrder: number;
  title: string;
  bodyText: string;
  createdAt: string;
  updatedAt: string;
};

export type AiReportAreaMemory = {
  trainingContextKey: string;
  /** @deprecated Use trainingContextKey */
  clinicalArea: string;
  patternSummary: string;
  styleGuidelines: string;
  sectionOutline: string;
  sampleCount: number;
  status: AiReportTrainingStatus;
  trainedAt: string | null;
};

export type AiReportAreaTrainingState = {
  trainingContextKey: string;
  /** @deprecated Use trainingContextKey */
  clinicalArea: string;
  contextLabel: string;
  samples: AiReportTrainingSample[];
  memory: AiReportAreaMemory;
  isReady: boolean;
  canTrain: boolean;
};

export type AiReportGenerationInput = {
  trainingContextKey: string;
  /** @deprecated Use trainingContextKey */
  clinicalArea?: string;
  patientName: string;
  patientAge?: string;
  evaluationPeriod: string;
  clinicalDemand: string;
  sessionSummary?: string;
  therapeuticGoals?: string;
  additionalNotes?: string;
};

export type AiReportGenerationResult = {
  title: string;
  bodyHtml: string;
  bodyText: string;
  mockMode: boolean;
  trainingContextKey: string;
  /** @deprecated Use trainingContextKey */
  clinicalArea: string;
};

export type TrainAiReportAreaResult = {
  trainingContextKey: string;
  /** @deprecated Use trainingContextKey */
  clinicalArea: string;
  memory: AiReportAreaMemory;
  mockMode: boolean;
};
