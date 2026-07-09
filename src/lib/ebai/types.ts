export const EBAI_TEMPLATE_NAME = "EBAI";
export const EBAI_INSTRUMENT = "EBAI";

export const EBAI_ITEM_COUNT = 35;

export const EBAI_MIN_ITEM_SCORE = 1;
export const EBAI_MAX_ITEM_SCORE = 7;

export const EBAI_MIN_RAW_SCORE = EBAI_ITEM_COUNT * EBAI_MIN_ITEM_SCORE;
export const EBAI_MAX_RAW_SCORE = EBAI_ITEM_COUNT * EBAI_MAX_ITEM_SCORE;

export const EBAI_LIKERT_LABELS: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, string> = {
  1: "Nunca",
  2: "Raramente",
  3: "Às vezes",
  4: "Frequentemente",
  5: "Muito frequentemente",
  6: "Quase sempre",
  7: "Sempre",
};

export const EBAI_SEVERITY_LABELS = {
  leve: "Leve",
  moderado: "Moderado",
  severo: "Severo",
} as const;

export type EbaiSeverity = keyof typeof EBAI_SEVERITY_LABELS;

export type EbaiLikert = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type EbaiAnswerSheet = {
  items: Record<string, EbaiLikert>;
};

export type EbaiScoreResult = {
  rawScore: number;
  tScore: number;
  classification: EbaiSeverity;
  classificationLabel: string;
  itemCount: number;
  answeredCount: number;
};

export type EbaiItemDefinition = {
  id: string;
  sortOrder: number;
  label: string;
  domain: string;
};

/** Domínios ilustrativos da EBAI (substituir por itens oficiais). */
export const EBAI_DOMAIN_DEFS: readonly {
  domain: string;
  itemCount: number;
}[] = [
  { domain: "Comunicação", itemCount: 7 },
  { domain: "Socialização", itemCount: 7 },
  { domain: "Autonomia", itemCount: 7 },
  { domain: "Cognição", itemCount: 7 },
  { domain: "Comportamento adaptativo", itemCount: 7 },
];
