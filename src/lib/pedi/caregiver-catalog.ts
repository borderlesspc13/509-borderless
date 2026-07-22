import type { PediArea } from "@/lib/pedi/types";

/** Escala oficial PEDI Caregiver Assistance (0–5). */
export type PediCaregiverLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const PEDI_CAREGIVER_LEVEL_LABELS: Record<PediCaregiverLevel, string> = {
  0: "Assistência total",
  1: "Assistência máxima",
  2: "Assistência moderada",
  3: "Assistência mínima",
  4: "Supervisão / preparo",
  5: "Independente",
};

export type PediCaregiverItemDefinition = {
  id: string;
  area: PediArea;
  sortOrder: number;
  label: string;
  text: string;
};

/**
 * Itens complexos da Parte II (Assistência do Cuidador) — PEDI clássico.
 * Textos oficiais em PT-BR alinhados aos domínios do Avalia TO / Quadro 1.
 */
export const PEDI_CAREGIVER_ITEMS: readonly PediCaregiverItemDefinition[] = [
  // Autocuidado (8) — bruto máx. 40
  {
    id: "ASC-AC-01",
    area: "self_care",
    sortOrder: 1,
    label: "ASC-AC-01",
    text: "Alimentação",
  },
  {
    id: "ASC-AC-02",
    area: "self_care",
    sortOrder: 2,
    label: "ASC-AC-02",
    text: "Higiene pessoal (rosto/cabelo/dentes)",
  },
  {
    id: "ASC-AC-03",
    area: "self_care",
    sortOrder: 3,
    label: "ASC-AC-03",
    text: "Banho",
  },
  {
    id: "ASC-AC-04",
    area: "self_care",
    sortOrder: 4,
    label: "ASC-AC-04",
    text: "Vestir-se — parte superior",
  },
  {
    id: "ASC-AC-05",
    area: "self_care",
    sortOrder: 5,
    label: "ASC-AC-05",
    text: "Vestir-se — parte inferior",
  },
  {
    id: "ASC-AC-06",
    area: "self_care",
    sortOrder: 6,
    label: "ASC-AC-06",
    text: "Uso do vaso sanitário",
  },
  {
    id: "ASC-AC-07",
    area: "self_care",
    sortOrder: 7,
    label: "ASC-AC-07",
    text: "Controle vesical",
  },
  {
    id: "ASC-AC-08",
    area: "self_care",
    sortOrder: 8,
    label: "ASC-AC-08",
    text: "Controle intestinal",
  },
  // Mobilidade (7) — bruto máx. 35
  {
    id: "ASC-MB-01",
    area: "mobility",
    sortOrder: 1,
    label: "ASC-MB-01",
    text: "Transferências cadeira / vaso",
  },
  {
    id: "ASC-MB-02",
    area: "mobility",
    sortOrder: 2,
    label: "ASC-MB-02",
    text: "Transferências para o carro",
  },
  {
    id: "ASC-MB-03",
    area: "mobility",
    sortOrder: 3,
    label: "ASC-MB-03",
    text: "Mobilidade / transferências na cama",
  },
  {
    id: "ASC-MB-04",
    area: "mobility",
    sortOrder: 4,
    label: "ASC-MB-04",
    text: "Transferências para a banheira / chuveiro",
  },
  {
    id: "ASC-MB-05",
    area: "mobility",
    sortOrder: 5,
    label: "ASC-MB-05",
    text: "Locomoção em ambientes internos",
  },
  {
    id: "ASC-MB-06",
    area: "mobility",
    sortOrder: 6,
    label: "ASC-MB-06",
    text: "Locomoção em ambientes externos",
  },
  {
    id: "ASC-MB-07",
    area: "mobility",
    sortOrder: 7,
    label: "ASC-MB-07",
    text: "Escadas",
  },
  // Função social (5) — bruto máx. 25
  {
    id: "ASC-FS-01",
    area: "social_function",
    sortOrder: 1,
    label: "ASC-FS-01",
    text: "Compreensão",
  },
  {
    id: "ASC-FS-02",
    area: "social_function",
    sortOrder: 2,
    label: "ASC-FS-02",
    text: "Expressão",
  },
  {
    id: "ASC-FS-03",
    area: "social_function",
    sortOrder: 3,
    label: "ASC-FS-03",
    text: "Resolução conjunta de problemas",
  },
  {
    id: "ASC-FS-04",
    area: "social_function",
    sortOrder: 4,
    label: "ASC-FS-04",
    text: "Brincar com pares",
  },
  {
    id: "ASC-FS-05",
    area: "social_function",
    sortOrder: 5,
    label: "ASC-FS-05",
    text: "Segurança",
  },
] as const;

export const PEDI_CAREGIVER_MAX_RAW: Record<PediArea, number> = {
  self_care: 40,
  mobility: 35,
  social_function: 25,
};

export const PEDI_CAREGIVER_ITEMS_BY_AREA: Record<
  PediArea,
  PediCaregiverItemDefinition[]
> = {
  self_care: PEDI_CAREGIVER_ITEMS.filter((item) => item.area === "self_care"),
  mobility: PEDI_CAREGIVER_ITEMS.filter((item) => item.area === "mobility"),
  social_function: PEDI_CAREGIVER_ITEMS.filter(
    (item) => item.area === "social_function"
  ),
};

export function createEmptyPediCaregiverAnswers(): Record<
  string,
  PediCaregiverLevel | null
> {
  const sheet: Record<string, PediCaregiverLevel | null> = {};
  for (const item of PEDI_CAREGIVER_ITEMS) {
    sheet[item.id] = null;
  }
  return sheet;
}

export function sumCaregiverRawScore(
  area: PediArea,
  items: Record<string, PediCaregiverLevel | null | undefined>
): number {
  let total = 0;
  for (const item of PEDI_CAREGIVER_ITEMS_BY_AREA[area]) {
    const value = items[item.id];
    if (typeof value === "number") {
      total += value;
    }
  }
  return total;
}

/**
 * Proxy linear 0–100 até seed oficial de tabelas ASC.
 * Indica nível relativo de independência (maior = menos assistência).
 */
export function provisionalCaregiverContinuous(
  rawScore: number,
  maxRaw: number
): number {
  if (maxRaw <= 0) {
    return 0;
  }
  return Math.round((rawScore / maxRaw) * 10000) / 100;
}

export function isPediCaregiverLevel(
  value: unknown
): value is PediCaregiverLevel {
  return (
    value === 0 ||
    value === 1 ||
    value === 2 ||
    value === 3 ||
    value === 4 ||
    value === 5
  );
}
