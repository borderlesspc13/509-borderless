import {
  EBAI_DOMAIN_DEFS,
  EBAI_ITEM_COUNT,
  type EbaiItemDefinition,
  type EbaiLikert,
} from "@/lib/ebai/types";

function buildEbaiItems(): EbaiItemDefinition[] {
  const items: EbaiItemDefinition[] = [];
  let globalIndex = 0;

  for (const { domain, itemCount } of EBAI_DOMAIN_DEFS) {
    for (let i = 1; i <= itemCount; i += 1) {
      globalIndex += 1;
      const padded = String(globalIndex).padStart(2, "0");
      items.push({
        id: `EBAI-${padded}`,
        sortOrder: globalIndex,
        domain,
        label: `Item ${globalIndex}`,
      });
    }
  }

  if (items.length !== EBAI_ITEM_COUNT) {
    throw new Error(`Mapa EBAI inválido: ${items.length} ≠ ${EBAI_ITEM_COUNT}`);
  }

  return items;
}

export const EBAI_ITEMS = buildEbaiItems();

export function createEmptyEbaiAnswers(): Record<string, EbaiLikert> {
  return Object.fromEntries(
    EBAI_ITEMS.map((item) => [item.id, 4 as EbaiLikert])
  );
}

export function sumEbaiRawScore(items: Record<string, EbaiLikert>): number {
  return EBAI_ITEMS.reduce((sum, item) => sum + (items[item.id] ?? 0), 0);
}

export function countAnsweredEbaiItems(items: Record<string, EbaiLikert>): number {
  return EBAI_ITEMS.filter((item) => items[item.id] !== undefined).length;
}

export function getEbaiDomainGroups(): {
  domain: string;
  items: EbaiItemDefinition[];
}[] {
  const byDomain = new Map<string, EbaiItemDefinition[]>();

  for (const item of EBAI_ITEMS) {
    const group = byDomain.get(item.domain) ?? [];
    group.push(item);
    byDomain.set(item.domain, group);
  }

  return EBAI_DOMAIN_DEFS.map(({ domain }) => ({
    domain,
    items: byDomain.get(domain) ?? [],
  }));
}
