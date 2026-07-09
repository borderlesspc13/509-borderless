export const SENSORY_SECTIONS = [
  "auditory",
  "visual",
  "touch",
  "movement",
] as const;

export type SensorySection = (typeof SENSORY_SECTIONS)[number];

export const SENSORY_QUADRANTS = [
  "seeking",
  "avoiding",
  "sensitivity",
  "registration",
] as const;

export type SensoryQuadrant = (typeof SENSORY_QUADRANTS)[number];

export const SENSORY_AGE_BANDS = [
  "infant_0_6m",
  "toddler_7_35m",
  "child_3_14y",
  "school",
] as const;

export type SensoryAgeBand = (typeof SENSORY_AGE_BANDS)[number];

export type SensoryLikert = 1 | 2 | 3 | 4 | 5;

export type SensoryClassification =
  | "typical"
  | "probable_difference"
  | "definite_difference";

export type SensoryAnswerSheet = {
  ageBand: SensoryAgeBand;
  birthDate?: string;
  evaluationDate?: string;
  items: Record<string, SensoryLikert>;
};

export type SensoryQuadrantScoreResult = {
  quadrant: SensoryQuadrant;
  rawScore: number;
  meanScore: number;
  sdScore: number;
  zScore: number;
  classification: SensoryClassification;
  classificationLabel: string;
  itemCount: number;
};

export type SensoryProfileScoreResult = {
  ageBand: SensoryAgeBand;
  ageMonths: number | null;
  quadrants: SensoryQuadrantScoreResult[];
};

export type SensoryItemDefinition = {
  id: string;
  section: SensorySection;
  quadrant: SensoryQuadrant;
  sortOrder: number;
  label: string;
  description: string;
};

export type SensoryQuadrantGroup = {
  quadrant: SensoryQuadrant;
  items: SensoryItemDefinition[];
};
