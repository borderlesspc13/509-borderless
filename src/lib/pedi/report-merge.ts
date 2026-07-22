import {
  PEDI_AREA_LABELS,
  PEDI_AREAS,
  formatPediAgeLabel,
  getPediDomainGroups,
  type PediArea,
  type PediCapability,
  type PediContinuousDisplay,
  type PediNormativeDisplay,
  type PediScoreResult,
} from "@/lib/pedi";
import { derivePediSuggestedObjectives } from "@/lib/pedi/suggested-objectives";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export const PEDI_TO_REPORT_TEMPLATE_NAME =
  "Relatório Terapia Ocupacional — Avaliação/Evolução/Reavaliação";

/** Chaves cujo valor já é HTML confiável gerado pelo app (não escapar). */
export const PEDI_HTML_PLACEHOLDER_KEYS = [
  "MAPA_ITENS_AUTOCUIDADO",
  "MAPA_ITENS_MOBILIDADE",
  "MAPA_ITENS_FUNCAO_SOCIAL",
] as const;

export type PediToReportVariables = Record<string, string>;

type AreaScoreSlice = {
  rawScore: number;
  maxRawScore: number;
  continuousScore: PediContinuousDisplay | null | undefined;
  normativeScore: PediNormativeDisplay | null | undefined;
};

function formatDisplayScore(
  value: PediContinuousDisplay | PediNormativeDisplay | null | undefined
): string {
  if (value == null) {
    return "—";
  }
  if (typeof value === "number") {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }
  return value;
}

function areaKeyPrefix(area: PediArea): "AC" | "MOB" | "FS" {
  if (area === "self_care") return "AC";
  if (area === "mobility") return "MOB";
  return "FS";
}

function mapaKey(area: PediArea): (typeof PEDI_HTML_PLACEHOLDER_KEYS)[number] {
  if (area === "self_care") return "MAPA_ITENS_AUTOCUIDADO";
  if (area === "mobility") return "MAPA_ITENS_MOBILIDADE";
  return "MAPA_ITENS_FUNCAO_SOCIAL";
}

function analiseKey(area: PediArea): string {
  if (area === "self_care") return "ANALISE_AUTOCUIDADO";
  if (area === "mobility") return "ANALISE_MOBILIDADE";
  return "ANALISE_FUNCAO_SOCIAL";
}

function findAreaScore(
  scores: PediScoreResult | null | undefined,
  area: PediArea
): AreaScoreSlice | null {
  return scores?.areas.find((item) => item.area === area) ?? null;
}

function findCaregiverScore(
  scores: PediScoreResult | null | undefined,
  area: PediArea
): AreaScoreSlice | null {
  return scores?.caregiverAreas?.find((item) => item.area === area) ?? null;
}

/** HTML compacto do mapa de itens para inserção no relatório TO. */
export function buildPediItemMapHtml(
  area: PediArea,
  items: Record<string, PediCapability>
): string {
  const domains = getPediDomainGroups(area);
  const sections = domains
    .map((domain) => {
      const cells = domain.items
        .map((item) => {
          const value = items[item.id];
          const bg =
            value === 1
              ? "#16a34a"
              : value === 0
                ? "#fecaca"
                : "#e5e7eb";
          const label = value === 1 ? "1" : value === 0 ? "0" : "—";
          return `<span title="${escapeHtml(`${item.sortOrder}. ${item.text}`)}" style="display:inline-flex;width:1.15rem;height:1.15rem;align-items:center;justify-content:center;margin:1px;border-radius:2px;background:${bg};font-size:9px;font-weight:600">${item.sortOrder}</span>`;
        })
        .join("");

      return `<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:600;margin-bottom:4px">${escapeHtml(`${domain.domainCode}. ${domain.domainLabel}`)}</div><div>${cells}</div></div>`;
    })
    .join("");

  return `<div data-pedi-mapa="${area}" style="font-family:system-ui,sans-serif">
  <div style="font-size:12px;font-weight:700;margin-bottom:6px">${escapeHtml(PEDI_AREA_LABELS[area])}</div>
  <div style="font-size:10px;color:#64748b;margin-bottom:8px">Verde = realiza (1) · Vermelho claro = não realiza (0)</div>
  ${sections}
</div>`;
}

function buildAreaAnalysis(
  area: PediArea,
  items: Record<string, PediCapability>,
  scores: PediScoreResult
): string {
  const areaScore = findAreaScore(scores, area);
  const objectives = derivePediSuggestedObjectives(items, scores).filter(
    (item) => item.area === area
  );

  const continuous = formatDisplayScore(areaScore?.continuousScore);
  const raw = areaScore?.rawScore ?? 0;
  const max = areaScore?.maxRawScore ?? 0;

  if (objectives.length === 0) {
    return `apresentou escore bruto ${raw}/${max} e contínuo ${continuous}, sem itens gap evidentes nesta aplicação (repertório compatível com a linha de capacidade estimada).`;
  }

  const sample = objectives
    .slice(0, 5)
    .map((item) => item.itemText)
    .join("; ");

  const more =
    objectives.length > 5
      ? ` (e mais ${objectives.length - 5} objetivo(s) sugerido(s))`
      : "";

  return `apresentou escore bruto ${raw}/${max} e contínuo ${continuous}. Foram identificados ${objectives.length} item(ns) gap (não realiza, porém abaixo da capacidade estimada), destacando-se: ${sample}${more}.`;
}

export type BuildPediToReportInput = {
  patientName?: string;
  birthDate?: string;
  evaluationDate?: string;
  items: Record<string, PediCapability>;
  scores: PediScoreResult;
};

/**
 * Monta variáveis para o template Relatório TO a partir de uma aplicação PEDI.
 * Placeholders ASC usam caregiverAreas quando presentes; senão ficam vazios (mark amarelo).
 */
export function buildPediToReportVariables(
  input: BuildPediToReportInput
): PediToReportVariables {
  const vars: PediToReportVariables = {};

  if (input.patientName?.trim()) {
    vars.NOME_PACIENTE = input.patientName.trim();
  }

  if (input.birthDate) {
    const [y, m, d] = input.birthDate.split("-").map(Number);
    if (y && m && d) {
      vars.DATA_NASCIMENTO = new Intl.DateTimeFormat("pt-BR").format(
        new Date(y, m - 1, d)
      );
    }
  }

  if (input.evaluationDate) {
    const [y, m, d] = input.evaluationDate.split("-").map(Number);
    if (y && m && d) {
      vars.DATA_SESSAO = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(y, m - 1, d));
    }
  }

  vars.IDADE = formatPediAgeLabel(input.scores.age);
  vars.INSTRUMENTO_UTILIZADO = "PEDI (Pediatric Evaluation of Disability Inventory)";

  for (const area of PEDI_AREAS) {
    const prefix = areaKeyPrefix(area);
    const functional = findAreaScore(input.scores, area);
    const caregiver = findCaregiverScore(input.scores, area);

    if (functional) {
      vars[`PEDI_${prefix}_BRUTO`] = String(functional.rawScore);
      vars[`PEDI_${prefix}_NORMATIVO`] = formatDisplayScore(
        functional.normativeScore
      );
      vars[`PEDI_${prefix}_CONTINUO`] = formatDisplayScore(
        functional.continuousScore
      );
    }

    if (caregiver) {
      vars[`PEDI_ASC_${prefix}_BRUTO`] = String(caregiver.rawScore);
      vars[`PEDI_ASC_${prefix}_NORMATIVO`] = formatDisplayScore(
        caregiver.normativeScore
      );
      vars[`PEDI_ASC_${prefix}_CONTINUO`] = formatDisplayScore(
        caregiver.continuousScore
      );
    }

    vars[mapaKey(area)] = buildPediItemMapHtml(area, input.items);
    vars[analiseKey(area)] = buildAreaAnalysis(
      area,
      input.items,
      input.scores
    );
  }

  return vars;
}
