import type { SensoryAgeBand } from "@/lib/sensory-profile/types";

export function suggestSensoryAgeBand(ageMonths: number): SensoryAgeBand {
  if (ageMonths <= 6) {
    return "infant_0_6m";
  }

  if (ageMonths <= 35) {
    return "toddler_7_35m";
  }

  if (ageMonths <= 168) {
    return "child_3_14y";
  }

  return "school";
}

export function isSensoryAgeBand(value: string): value is SensoryAgeBand {
  return (
    value === "infant_0_6m" ||
    value === "toddler_7_35m" ||
    value === "child_3_14y" ||
    value === "school"
  );
}
