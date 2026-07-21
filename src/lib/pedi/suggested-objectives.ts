import { PEDI_AREA_LABELS, PEDI_AREA_MAX_RAW } from "@/lib/pedi/constants";
import { PEDI_ITEMS_BY_AREA } from "@/lib/pedi/item-map";
import type {
  PediArea,
  PediCapability,
  PediContinuousDisplay,
  PediScoreResult,
  PediSuggestedObjective,
} from "@/lib/pedi/types";

/**
 * Dificuldade provisória no eixo 0–100 (proxy linear por ordem do item).
 * Substitui a calibração Rasch oficial até a Fase 3 / Excel do cliente.
 */
export function provisionalItemDifficulty(
  sortOrder: number,
  maxRaw: number
): number {
  if (maxRaw <= 0) {
    return 0;
  }

  return Number((((sortOrder - 0.5) / maxRaw) * 100).toFixed(2));
}

function resolveAbilityThreshold(
  continuousScore: PediContinuousDisplay | null | undefined
): number | null {
  if (continuousScore == null) {
    return null;
  }

  if (typeof continuousScore === "number") {
    return continuousScore;
  }

  if (continuousScore === "> 100") {
    return 100;
  }

  if (continuousScore === "< 0") {
    return 0;
  }

  return null;
}

/**
 * Gap clínico (ABA+): item com resposta 0 à esquerda da linha de capacidade
 * (dificuldade ≤ escore contínuo ± EP, quando EP disponível).
 */
export function derivePediSuggestedObjectives(
  items: Record<string, PediCapability>,
  scores: PediScoreResult
): PediSuggestedObjective[] {
  const objectives: PediSuggestedObjective[] = [];

  for (const areaScore of scores.areas) {
    const area = areaScore.area;
    const maxRaw = PEDI_AREA_MAX_RAW[area];
    const ability = resolveAbilityThreshold(areaScore.continuousScore);

    if (ability == null) {
      continue;
    }

    const standardError = areaScore.continuousStandardError;
    const abilityCeiling =
      standardError != null ? ability + standardError : ability;

    for (const item of PEDI_ITEMS_BY_AREA[area]) {
      if (items[item.id] !== 0) {
        continue;
      }

      const difficulty = provisionalItemDifficulty(item.sortOrder, maxRaw);
      if (difficulty > abilityCeiling) {
        continue;
      }

      objectives.push({
        itemId: item.id,
        area,
        areaLabel: PEDI_AREA_LABELS[area],
        domainCode: item.domainCode,
        domainLabel: item.domainLabel,
        sortOrder: item.sortOrder,
        itemLabel: item.label,
        itemText: item.text,
        objectiveText: `Desenvolver: ${item.text}`,
        provisionalDifficulty: difficulty,
        abilityScore: ability,
        abilityCeiling,
        continuousStandardError: standardError,
      });
    }
  }

  return objectives.sort((a, b) => {
    if (a.area !== b.area) {
      const order: PediArea[] = ["self_care", "mobility", "social_function"];
      return order.indexOf(a.area) - order.indexOf(b.area);
    }
    return a.sortOrder - b.sortOrder;
  });
}

function csvEscape(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function suggestedObjectivesToCsv(
  objectives: PediSuggestedObjective[]
): string {
  const headers = [
    "Area",
    "Dominio",
    "Item",
    "Numero",
    "Enunciado",
    "Objetivo",
    "Dificuldade_provisoria",
    "Capacidade",
    "Teto_capacidade",
    "EP_continuo",
  ];

  const rows = objectives.map((objective) =>
    [
      objective.areaLabel,
      `${objective.domainCode}. ${objective.domainLabel}`,
      objective.itemLabel,
      objective.sortOrder,
      objective.itemText,
      objective.objectiveText,
      objective.provisionalDifficulty.toFixed(2),
      objective.abilityScore.toFixed(2),
      objective.abilityCeiling.toFixed(2),
      objective.continuousStandardError?.toFixed(2) ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadSuggestedObjectivesCsv(
  objectives: PediSuggestedObjective[],
  filename = "pedi-objetivos-sugeridos.csv"
) {
  const csv = suggestedObjectivesToCsv(objectives);
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
