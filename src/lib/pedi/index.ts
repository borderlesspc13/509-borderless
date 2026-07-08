export type {
  PediAnswerSheet,
  PediArea,
  PediAreaScoreResult,
  PediCapability,
  PediContinuousDisplay,
  PediDomainGroup,
  PediItemDefinition,
  PediNormativeDisplay,
  PediScoreResult,
} from "@/lib/pedi/types";

export { PEDI_AREAS } from "@/lib/pedi/types";

export {
  PEDI_AREA_LABELS,
  PEDI_AREA_MAX_RAW,
  PEDI_AREA_PREFIX,
  PEDI_DOMAIN_DEFS,
  PEDI_INSTRUMENT,
  PEDI_TEMPLATE_NAME,
} from "@/lib/pedi/constants";

export {
  createEmptyPediAnswers,
  getPediDomainGroups,
  PEDI_ITEMS,
  PEDI_ITEMS_BY_AREA,
} from "@/lib/pedi/item-map";

export { calculateExactAgeInMonths } from "@/lib/pedi/age";

export {
  findNearestRawScore,
  resolveContinuousDisplay,
  resolveNormativeDisplay,
  sumRawScoreForArea,
} from "@/lib/pedi/score-lookup";
