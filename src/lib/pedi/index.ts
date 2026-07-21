export type {
  PediAgeBreakdown,
  PediAnswerSheet,
  PediArea,
  PediAreaScoreResult,
  PediCapability,
  PediContinuousDisplay,
  PediDomainGroup,
  PediItemDefinition,
  PediNormativeDisplay,
  PediScoreResult,
  PediSuggestedObjective,
} from "@/lib/pedi/types";

export { PEDI_AREAS } from "@/lib/pedi/types";

export {
  PEDI_AREA_LABELS,
  PEDI_AREA_MAX_RAW,
  PEDI_AREA_PREFIX,
  PEDI_DOMAIN_DEFS,
  PEDI_INSTRUMENT,
  PEDI_NORMATIVE_MAX_AGE_MONTHS,
  PEDI_TEMPLATE_NAME,
} from "@/lib/pedi/constants";

export {
  createEmptyPediAnswers,
  getPediDomainGroups,
  PEDI_ITEMS,
  PEDI_ITEMS_BY_AREA,
} from "@/lib/pedi/item-map";

export {
  calculateExactAgeBreakdown,
  calculateExactAgeInMonths,
  formatPediAgeLabel,
} from "@/lib/pedi/age";

export {
  findNearestRawScore,
  resolveContinuousDisplay,
  resolveNormativeDisplay,
  resolveStandardError,
  sumRawScoreForArea,
} from "@/lib/pedi/score-lookup";

export {
  derivePediSuggestedObjectives,
  downloadSuggestedObjectivesCsv,
  provisionalItemDifficulty,
  suggestedObjectivesToCsv,
} from "@/lib/pedi/suggested-objectives";
