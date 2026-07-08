import {
  PEDI_AREA_MAX_RAW,
  PEDI_AREA_PREFIX,
  PEDI_DOMAIN_DEFS,
} from "@/lib/pedi/constants";
import {
  PEDI_AREAS,
  type PediArea,
  type PediDomainGroup,
  type PediItemDefinition,
} from "@/lib/pedi/types";

function buildItemsForArea(area: PediArea): PediItemDefinition[] {
  const prefix = PEDI_AREA_PREFIX[area];
  const domains = PEDI_DOMAIN_DEFS[area];
  const items: PediItemDefinition[] = [];
  let globalIndex = 0;

  for (const domain of domains) {
    for (let i = 1; i <= domain.itemCount; i += 1) {
      globalIndex += 1;
      const padded = String(globalIndex).padStart(2, "0");
      items.push({
        id: `${prefix}-${padded}`,
        area,
        domainCode: domain.code,
        domainLabel: domain.label,
        sortOrder: globalIndex,
        label: `${prefix}-${padded}`,
      });
    }
  }

  const expected = PEDI_AREA_MAX_RAW[area];
  if (items.length !== expected) {
    throw new Error(
      `PEDI item map inválido para ${area}: ${items.length} ≠ ${expected}`
    );
  }

  return items;
}

export const PEDI_ITEMS: PediItemDefinition[] = PEDI_AREAS.flatMap((area) =>
  buildItemsForArea(area)
);

export const PEDI_ITEMS_BY_AREA: Record<PediArea, PediItemDefinition[]> = {
  self_care: PEDI_ITEMS.filter((item) => item.area === "self_care"),
  mobility: PEDI_ITEMS.filter((item) => item.area === "mobility"),
  social_function: PEDI_ITEMS.filter(
    (item) => item.area === "social_function"
  ),
};

export function getPediDomainGroups(area: PediArea): PediDomainGroup[] {
  const items = PEDI_ITEMS_BY_AREA[area];
  const byDomain = new Map<string, PediItemDefinition[]>();

  for (const item of items) {
    const list = byDomain.get(item.domainCode) ?? [];
    list.push(item);
    byDomain.set(item.domainCode, list);
  }

  return PEDI_DOMAIN_DEFS[area].map((domain) => ({
    area,
    domainCode: domain.code,
    domainLabel: domain.label,
    items: byDomain.get(domain.code) ?? [],
  }));
}

export function createEmptyPediAnswers(): Record<string, 0 | 1> {
  const answers: Record<string, 0 | 1> = {};
  for (const item of PEDI_ITEMS) {
    answers[item.id] = 0;
  }
  return answers;
}
