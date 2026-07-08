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

export type PediAreaScoreResult = {
  area: PediArea;
  rawScore: number;
  continuousScore: PediContinuousDisplay;
  normativeScore: PediNormativeDisplay;
  maxRawScore: number;
};

export type PediScoreResult = {
  ageMonths: number;
  areas: PediAreaScoreResult[];
};

export type PediItemDefinition = {
  id: string;
  area: PediArea;
  domainCode: string;
  domainLabel: string;
  sortOrder: number;
  label: string;
};

export type PediDomainGroup = {
  area: PediArea;
  domainCode: string;
  domainLabel: string;
  items: PediItemDefinition[];
};
