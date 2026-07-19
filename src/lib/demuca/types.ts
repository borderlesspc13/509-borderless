export const DEMUCA_TEMPLATE_NAME = "DEMUCA";
export const DEMUCA_INSTRUMENT = "DEMUCA";

/** N = Não | P = Pouco | M = Muito */
export const DEMUCA_RATING_LABELS = {
  N: "Não",
  P: "Pouco",
  M: "Muito",
} as const;

export type DemucaRating = keyof typeof DEMUCA_RATING_LABELS;

export type DemucaDomainId =
  | "comp_restritivos"
  | "int_social"
  | "expl_ritmica"
  | "expl_sonora"
  | "expl_vocal"
  | "mov_corporal";

export type DemucaItemDefinition = {
  id: string;
  sortOrder: number;
  domainId: DemucaDomainId;
  domainLabel: string;
  label: string;
  /** Multiplicador (itens marcados x2 na planilha). */
  weight: 1 | 2;
  /**
   * Comportamentos restritivos usam escala invertida:
   * N=2, P=1, M=0 (ausência do comportamento = melhor escore).
   */
  inverted: boolean;
};

export type DemucaDomainDefinition = {
  id: DemucaDomainId;
  label: string;
  shortLabel: string;
};

export type DemucaAnswerSheet = {
  items: Record<string, DemucaRating | undefined>;
  allowPartial: boolean;
};

export type DemucaDomainScore = {
  domainId: DemucaDomainId;
  domainLabel: string;
  rawScore: number;
  possibleScore: number;
  /** Escore final da categoria (bruto ÷ possível), 0–1. */
  finalScore: number;
  answeredCount: number;
  itemCount: number;
};

export type DemucaScoreResult = {
  domains: DemucaDomainScore[];
  rawScore: number;
  possibleScore: number;
  /** Média dos escores finais das categorias respondidas, 0–1. */
  overallScore: number;
  itemCount: number;
  answeredCount: number;
  allowPartial: boolean;
  isComplete: boolean;
};

export const DEMUCA_DOMAINS: readonly DemucaDomainDefinition[] = [
  {
    id: "comp_restritivos",
    label: "Comportamentos Restritivos",
    shortLabel: "Comp. Restritivos",
  },
  {
    id: "int_social",
    label: "Interação Social / Cognição",
    shortLabel: "Int. Social",
  },
  {
    id: "expl_ritmica",
    label: "Percepção / Exploração Rítmica",
    shortLabel: "Expl. Rítmica",
  },
  {
    id: "expl_sonora",
    label: "Percepção / Exploração Sonora",
    shortLabel: "Expl. Sonora",
  },
  {
    id: "expl_vocal",
    label: "Exploração Vocal",
    shortLabel: "Expl. Vocal",
  },
  {
    id: "mov_corporal",
    label: "Movimentação Corporal com a Música",
    shortLabel: "Mov. Corporal",
  },
] as const;
