export type {
  SensoryAgeBand,
  SensoryAnswerSheet,
  SensoryClassification,
  SensoryItemDefinition,
  SensoryLikert,
  SensoryProfileScoreResult,
  SensoryQuadrant,
  SensoryQuadrantGroup,
  SensoryQuadrantScoreResult,
  SensorySection,
} from "@/lib/sensory-profile/types";

export { SENSORY_AGE_BANDS, SENSORY_QUADRANTS, SENSORY_SECTIONS } from "@/lib/sensory-profile/types";

export {
  SENSORY_AGE_BAND_LABELS,
  SENSORY_CLASSIFICATION_LABELS,
  SENSORY_LIKERT_LABELS,
  SENSORY_PROFILE_INSTRUMENT,
  SENSORY_PROFILE_TEMPLATE_NAME,
  SENSORY_QUADRANT_LABELS,
  SENSORY_SECTION_LABELS,
} from "@/lib/sensory-profile/constants";

export {
  countItemsForQuadrant,
  createEmptySensoryAnswers,
  getSensoryQuadrantGroups,
  SENSORY_ITEMS,
  SENSORY_ITEMS_BY_SECTION,
  sumRawScoreForQuadrant,
} from "@/lib/sensory-profile/item-map";

export { isSensoryAgeBand, suggestSensoryAgeBand } from "@/lib/sensory-profile/age-band";
export { classifySensoryScore } from "@/lib/sensory-profile/classification";
