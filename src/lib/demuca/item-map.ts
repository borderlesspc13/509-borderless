import {
  DEMUCA_DOMAINS,
  type DemucaDomainId,
  type DemucaItemDefinition,
  type DemucaRating,
  type DemucaScoreResult,
  type DemucaDomainScore,
} from "@/lib/demuca/types";

type ItemSeed = {
  label: string;
  weight?: 1 | 2;
  inverted?: boolean;
};

const DOMAIN_ITEMS: Record<DemucaDomainId, readonly ItemSeed[]> = {
  comp_restritivos: [
    { label: "Estereotipias", inverted: true },
    { label: "Agressividade", inverted: true },
    { label: "Desinteresse", inverted: true },
    { label: "Passividade", inverted: true },
    { label: "Reclusão (Isolamento)", inverted: true },
    { label: "Resistência", inverted: true },
    { label: "Pirraça", inverted: true },
  ],
  int_social: [
    { label: "Contato visual" },
    { label: "Comunicação verbal" },
    { label: "Interação com outros objetos" },
    { label: "Interação com instrumentos musicais" },
    { label: "Interação com educador/musicoterapeuta" },
    { label: "Interação com os pais (se aplicável)" },
    { label: "Interação com os pares (se aplicável)" },
    { label: "Atenção" },
    { label: "Imitação" },
  ],
  expl_ritmica: [
    { label: "Pulso interno" },
    { label: "Regulação temporal" },
    { label: "Ritmo real", weight: 2 },
    { label: "Apoio", weight: 2 },
    { label: "Contrastes de andamento", weight: 2 },
  ],
  expl_sonora: [
    { label: "Som / Silêncio" },
    { label: "Timbre" },
    { label: "Planos de altura" },
    { label: "Movimento sonoro" },
    { label: "Contrastes de intensidade" },
    { label: "Repetição de idéias rítmicas e/ou melódicas" },
    { label: "Senso de conclusão" },
  ],
  expl_vocal: [
    { label: "Vocalizações" },
    { label: "Balbucios" },
    { label: "Sílabas canônicas" },
    { label: "Imitação de canções", weight: 2 },
    { label: "Criação vocal", weight: 2 },
  ],
  mov_corporal: [
    { label: "Andar" },
    { label: "Correr" },
    { label: "Parar" },
    { label: "Gesticular" },
    { label: "Dançar" },
    { label: "Movimentar-se no lugar" },
    { label: "Pular" },
  ],
};

function buildDemucaItems(): DemucaItemDefinition[] {
  const items: DemucaItemDefinition[] = [];
  let sortOrder = 0;

  for (const domain of DEMUCA_DOMAINS) {
    const seeds = DOMAIN_ITEMS[domain.id];
    seeds.forEach((seed, index) => {
      sortOrder += 1;
      const padded = String(sortOrder).padStart(2, "0");
      items.push({
        id: `DEMUCA-${padded}`,
        sortOrder,
        domainId: domain.id,
        domainLabel: domain.label,
        label: `${index + 1} - ${seed.label}`,
        weight: seed.weight ?? 1,
        inverted: seed.inverted ?? false,
      });
    });
  }

  return items;
}

export const DEMUCA_ITEMS = buildDemucaItems();
export const DEMUCA_ITEM_COUNT = DEMUCA_ITEMS.length;

export function createEmptyDemucaAnswers(): Record<
  string,
  DemucaRating | undefined
> {
  return Object.fromEntries(DEMUCA_ITEMS.map((item) => [item.id, undefined]));
}

/** Pontuação base por resposta (antes do peso). */
export function basePointsForRating(
  rating: DemucaRating,
  inverted: boolean
): number {
  if (inverted) {
    if (rating === "N") return 2;
    if (rating === "P") return 1;
    return 0;
  }

  if (rating === "N") return 0;
  if (rating === "P") return 1;
  return 2;
}

export function itemScore(
  item: DemucaItemDefinition,
  rating: DemucaRating
): number {
  return basePointsForRating(rating, item.inverted) * item.weight;
}

export function itemMaxScore(item: DemucaItemDefinition): number {
  return 2 * item.weight;
}

export function countAnsweredDemucaItems(
  items: Record<string, DemucaRating | undefined>
): number {
  return DEMUCA_ITEMS.filter((item) => items[item.id] !== undefined).length;
}

export function getDemucaDomainGroups(): {
  domainId: DemucaDomainId;
  domainLabel: string;
  shortLabel: string;
  items: DemucaItemDefinition[];
}[] {
  return DEMUCA_DOMAINS.map((domain) => ({
    domainId: domain.id,
    domainLabel: domain.label,
    shortLabel: domain.shortLabel,
    items: DEMUCA_ITEMS.filter((item) => item.domainId === domain.id),
  }));
}

export function calculateDemucaScore(input: {
  items: Record<string, DemucaRating | undefined>;
  allowPartial: boolean;
}): DemucaScoreResult {
  const answeredCount = countAnsweredDemucaItems(input.items);
  const domainScores: DemucaDomainScore[] = [];

  for (const domain of DEMUCA_DOMAINS) {
    const domainItems = DEMUCA_ITEMS.filter(
      (item) => item.domainId === domain.id
    );
    let rawScore = 0;
    let possibleScore = 0;
    let domainAnswered = 0;

    for (const item of domainItems) {
      const rating = input.items[item.id];
      if (rating === undefined) {
        if (!input.allowPartial) {
          possibleScore += itemMaxScore(item);
        }
        continue;
      }

      domainAnswered += 1;
      rawScore += itemScore(item, rating);
      possibleScore += itemMaxScore(item);
    }

    const finalScore =
      possibleScore > 0 ? Number((rawScore / possibleScore).toFixed(4)) : 0;

    domainScores.push({
      domainId: domain.id,
      domainLabel: domain.label,
      rawScore,
      possibleScore,
      finalScore,
      answeredCount: domainAnswered,
      itemCount: domainItems.length,
    });
  }

  const scoredDomains = domainScores.filter((d) => d.possibleScore > 0);
  const rawScore = scoredDomains.reduce((sum, d) => sum + d.rawScore, 0);
  const possibleScore = scoredDomains.reduce(
    (sum, d) => sum + d.possibleScore,
    0
  );
  const overallScore =
    scoredDomains.length > 0
      ? Number(
          (
            scoredDomains.reduce((sum, d) => sum + d.finalScore, 0) /
            scoredDomains.length
          ).toFixed(4)
        )
      : 0;

  const isComplete = input.allowPartial
    ? answeredCount > 0
    : answeredCount >= DEMUCA_ITEM_COUNT;

  return {
    domains: domainScores,
    rawScore,
    possibleScore,
    overallScore,
    itemCount: DEMUCA_ITEM_COUNT,
    answeredCount,
    allowPartial: input.allowPartial,
    isComplete,
  };
}

export function formatDemucaPercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}
