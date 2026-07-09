import { SENSORY_CLASSIFICATION_LABELS } from "@/lib/sensory-profile/constants";
import type { SensoryClassification } from "@/lib/sensory-profile/types";

export function classifySensoryScore(
  rawScore: number,
  meanScore: number,
  sdScore: number,
  typicalMaxSd: number,
  definiteMinSd: number
): { classification: SensoryClassification; zScore: number; label: string } {
  const zScore =
    sdScore > 0 ? Math.round((Math.abs(rawScore - meanScore) / sdScore) * 100) / 100 : 0;

  let classification: SensoryClassification;

  if (zScore <= typicalMaxSd) {
    classification = "typical";
  } else if (zScore < definiteMinSd) {
    classification = "probable_difference";
  } else {
    classification = "definite_difference";
  }

  return {
    classification,
    zScore,
    label: SENSORY_CLASSIFICATION_LABELS[classification],
  };
}
