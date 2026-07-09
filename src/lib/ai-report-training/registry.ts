import { EBAI_INSTRUMENT } from "@/lib/ebai";
import { documentTemplateCategories } from "@/lib/document-template-format";
import { PEDI_INSTRUMENT } from "@/lib/pedi";
import { programSpecialties } from "@/lib/program-format";
import { SENSORY_PROFILE_INSTRUMENT } from "@/lib/sensory-profile";

export type AiWritingTrainingContextType =
  | "clinical_area"
  | "assessment"
  | "report";

export type AiWritingTrainingContext = {
  key: string;
  label: string;
  type: AiWritingTrainingContextType;
  group: string;
};

const REPORT_CATEGORY_KEYS = new Set([
  "relatorio",
  "parecer",
  "encaminhamento",
  "evolucao_clinica",
]);

const ASSESSMENT_CONTEXTS: AiWritingTrainingContext[] = [
  {
    key: PEDI_INSTRUMENT,
    label: "PEDI",
    type: "assessment",
    group: "Avaliações",
  },
  {
    key: SENSORY_PROFILE_INSTRUMENT,
    label: "Perfil Sensorial II",
    type: "assessment",
    group: "Avaliações",
  },
  {
    key: EBAI_INSTRUMENT,
    label: "EBAI",
    type: "assessment",
    group: "Avaliações",
  },
];

const CLINICAL_AREA_CONTEXTS: AiWritingTrainingContext[] = programSpecialties.map(
  (specialty) => ({
    key: specialty,
    label: specialty,
    type: "clinical_area" as const,
    group: "Áreas clínicas",
  })
);

const REPORT_CONTEXTS: AiWritingTrainingContext[] = documentTemplateCategories
  .filter((category) => REPORT_CATEGORY_KEYS.has(category.value))
  .map((category) => ({
    key: category.label,
    label: category.label,
    type: "report" as const,
    group: "Relatórios e documentos",
  }));

export const AI_WRITING_TRAINING_CONTEXTS: AiWritingTrainingContext[] = [
  ...CLINICAL_AREA_CONTEXTS,
  ...ASSESSMENT_CONTEXTS,
  ...REPORT_CONTEXTS,
];

export const AI_WRITING_TRAINING_CONTEXT_KEYS = AI_WRITING_TRAINING_CONTEXTS.map(
  (context) => context.key
);

const contextByKey = new Map(
  AI_WRITING_TRAINING_CONTEXTS.map((context) => [context.key, context])
);

export function getAiWritingTrainingContext(key: string) {
  return contextByKey.get(key) ?? null;
}

export function isValidAiWritingTrainingContext(key: string): boolean {
  return contextByKey.has(key);
}

export function getAiWritingTrainingContextLabel(key: string): string {
  return getAiWritingTrainingContext(key)?.label ?? key;
}

export function groupAiWritingTrainingContexts() {
  const groups = new Map<string, AiWritingTrainingContext[]>();

  for (const context of AI_WRITING_TRAINING_CONTEXTS) {
    const items = groups.get(context.group) ?? [];
    items.push(context);
    groups.set(context.group, items);
  }

  return Array.from(groups.entries()).map(([group, contexts]) => ({
    group,
    contexts,
  }));
}
