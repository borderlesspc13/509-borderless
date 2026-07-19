export type {
  DemucaAnswerSheet,
  DemucaDomainDefinition,
  DemucaDomainId,
  DemucaDomainScore,
  DemucaItemDefinition,
  DemucaRating,
  DemucaScoreResult,
} from "@/lib/demuca/types";

export {
  DEMUCA_DOMAINS,
  DEMUCA_INSTRUMENT,
  DEMUCA_RATING_LABELS,
  DEMUCA_TEMPLATE_NAME,
} from "@/lib/demuca/types";

export {
  DEMUCA_ITEM_COUNT,
  DEMUCA_ITEMS,
  basePointsForRating,
  calculateDemucaScore,
  countAnsweredDemucaItems,
  createEmptyDemucaAnswers,
  formatDemucaPercent,
  getDemucaDomainGroups,
  itemMaxScore,
  itemScore,
} from "@/lib/demuca/item-map";
