import { PEDI_ITEMS_BY_AREA } from "@/lib/pedi/item-map";
import type {
  PediArea,
  PediCapability,
  PediContinuousDisplay,
  PediNormativeDisplay,
} from "@/lib/pedi/types";

export function sumRawScoreForArea(
  area: PediArea,
  items: Record<string, PediCapability>
): number {
  const areaItems = PEDI_ITEMS_BY_AREA[area];
  let total = 0;

  for (const item of areaItems) {
    if (items[item.id] === 1) {
      total += 1;
    }
  }

  return total;
}

export function resolveContinuousDisplay(
  rawScore: number,
  lookup: { raw_score: number; continuous_score: number } | null,
  bounds: { minRaw: number; maxRaw: number } | null
): PediContinuousDisplay {
  if (lookup) {
    const value = Number(lookup.continuous_score);
    if (value > 100) {
      return "> 100";
    }
    if (value < 0) {
      return "< 0";
    }
    return value;
  }

  if (!bounds) {
    return rawScore <= 0 ? "< 0" : "> 100";
  }

  if (rawScore < bounds.minRaw) {
    return "< 0";
  }

  if (rawScore > bounds.maxRaw) {
    return "> 100";
  }

  return rawScore <= 0 ? "< 0" : "> 100";
}

export function resolveNormativeDisplay(
  rawScore: number,
  lookup: { raw_score: number; normative_score: number } | null,
  availableRawScores: number[]
): PediNormativeDisplay {
  if (lookup) {
    const value = Number(lookup.normative_score);
    if (value > 100) {
      return "> 100";
    }
    if (value < 10) {
      return "< 10";
    }
    return value;
  }

  if (availableRawScores.length === 0) {
    return rawScore <= 0 ? "< 10" : "> 100";
  }

  const minRaw = Math.min(...availableRawScores);
  const maxRaw = Math.max(...availableRawScores);

  if (rawScore < minRaw) {
    return "< 10";
  }

  if (rawScore > maxRaw) {
    return "> 100";
  }

  return rawScore <= minRaw ? "< 10" : "> 100";
}

export function findNearestRawScore(
  rawScore: number,
  availableRawScores: number[]
): number | null {
  if (availableRawScores.length === 0) {
    return null;
  }

  if (availableRawScores.includes(rawScore)) {
    return rawScore;
  }

  return availableRawScores.reduce((best, current) =>
    Math.abs(current - rawScore) < Math.abs(best - rawScore) ? current : best
  );
}
