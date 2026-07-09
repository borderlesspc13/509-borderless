import {
  SENSORY_ITEM_TEMPLATES,
  SENSORY_QUADRANT_PREFIX,
  SENSORY_SECTION_PREFIX,
} from "@/lib/sensory-profile/constants";
import {
  SENSORY_QUADRANTS,
  SENSORY_SECTIONS,
  type SensoryItemDefinition,
  type SensoryLikert,
  type SensoryQuadrant,
  type SensoryQuadrantGroup,
  type SensorySection,
} from "@/lib/sensory-profile/types";

function buildItemsForSection(section: SensorySection): SensoryItemDefinition[] {
  const sectionPrefix = SENSORY_SECTION_PREFIX[section];
  const items: SensoryItemDefinition[] = [];
  let sortOrder = 0;

  for (const quadrant of SENSORY_QUADRANTS) {
    const quadrantPrefix = SENSORY_QUADRANT_PREFIX[quadrant];
    const templates = SENSORY_ITEM_TEMPLATES[quadrant];

    templates.forEach(([label, description], index) => {
      sortOrder += 1;
      const padded = String(index + 1).padStart(2, "0");
      items.push({
        id: `${sectionPrefix}-${quadrantPrefix}-${padded}`,
        section,
        quadrant,
        sortOrder,
        label,
        description,
      });
    });
  }

  return items;
}

export const SENSORY_ITEMS: SensoryItemDefinition[] = SENSORY_SECTIONS.flatMap(
  (section) => buildItemsForSection(section)
);

export const SENSORY_ITEMS_BY_SECTION: Record<
  SensorySection,
  SensoryItemDefinition[]
> = {
  auditory: SENSORY_ITEMS.filter((item) => item.section === "auditory"),
  visual: SENSORY_ITEMS.filter((item) => item.section === "visual"),
  touch: SENSORY_ITEMS.filter((item) => item.section === "touch"),
  movement: SENSORY_ITEMS.filter((item) => item.section === "movement"),
};

export function getSensoryQuadrantGroups(
  section: SensorySection
): SensoryQuadrantGroup[] {
  const items = SENSORY_ITEMS_BY_SECTION[section];
  const byQuadrant = new Map<SensoryQuadrant, SensoryItemDefinition[]>();

  for (const item of items) {
    const group = byQuadrant.get(item.quadrant) ?? [];
    group.push(item);
    byQuadrant.set(item.quadrant, group);
  }

  return SENSORY_QUADRANTS.map((quadrant) => ({
    quadrant,
    items: byQuadrant.get(quadrant) ?? [],
  }));
}

export function createEmptySensoryAnswers(): Record<string, SensoryLikert> {
  return Object.fromEntries(
    SENSORY_ITEMS.map((item) => [item.id, 3 as SensoryLikert])
  );
}

export function sumRawScoreForQuadrant(
  quadrant: SensoryQuadrant,
  items: Record<string, SensoryLikert>
): number {
  return SENSORY_ITEMS.filter((item) => item.quadrant === quadrant).reduce(
    (sum, item) => sum + (items[item.id] ?? 0),
    0
  );
}

export function countItemsForQuadrant(quadrant: SensoryQuadrant): number {
  return SENSORY_ITEMS.filter((item) => item.quadrant === quadrant).length;
}
