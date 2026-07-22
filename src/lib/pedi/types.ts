export const PEDI_AREAS = [
  "self_care",
  "mobility",
  "social_function",
] as const;

export type PediArea = (typeof PEDI_AREAS)[number];

export type PediCapability = 0 | 1;

export type PediAnswerSheet = {
  birthDate: string;
  evaluationDate: string;
  items: Record<string, PediCapability>;
};

export type PediContinuousDisplay = number | "> 100" | "< 0";
export type PediNormativeDisplay = number | "> 100" | "< 10";

export type PediAgeBreakdown = {
  years: number;
  months: number;
  days: number;
  /** Meses completos (para lookup normativo). */
  totalMonths: number;
};

export type PediAreaScoreResult = {
  area: PediArea;
  rawScore: number;
  continuousScore: PediContinuousDisplay;
  /** Erro padrão do escore contínuo (null até tabelas oficiais). */
  continuousStandardError: number | null;
  /**
   * Null quando idade > 7 anos (normativo não se aplica).
   * String de piso/teto quando fora da curva da tabela.
   */
  normativeScore: PediNormativeDisplay | null;
  /** Erro padrão do escore normativo (null se N/A ou sem tabela). */
  normativeStandardError: number | null;
  maxRawScore: number;
};

export type PediScoreResult = {
  age: PediAgeBreakdown;
  /** @deprecated Preferir `age.totalMonths`. Mantido para compatibilidade. */
  ageMonths: number;
  areas: PediAreaScoreResult[];
  /** Parte II — Assistência do Cuidador (opcional até preenchimento). */
  caregiverAreas?: PediAreaScoreResult[];
};

export type PediItemDefinition = {
  id: string;
  area: PediArea;
  domainCode: string;
  domainLabel: string;
  sortOrder: number;
  /** Identificador curto (ex.: AC-01). */
  label: string;
  /** Enunciado clínico do item. */
  text: string;
};

export type PediDomainGroup = {
  area: PediArea;
  domainCode: string;
  domainLabel: string;
  items: PediItemDefinition[];
};

/** Item gap (0 à esquerda da linha de capacidade) → objetivo sugerido. */
export type PediSuggestedObjective = {
  itemId: string;
  area: PediArea;
  areaLabel: string;
  domainCode: string;
  domainLabel: string;
  sortOrder: number;
  itemLabel: string;
  itemText: string;
  /** Texto pronto para plano terapêutico. */
  objectiveText: string;
  /** Proxy linear 0–100 até calibração Rasch oficial. */
  provisionalDifficulty: number;
  abilityScore: number;
  /** Capacidade + EP (quando disponível). */
  abilityCeiling: number;
  continuousStandardError: number | null;
};
