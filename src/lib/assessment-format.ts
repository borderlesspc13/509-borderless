import type {
  AssessmentLevelRow,
  AssessmentScoreGroupRow,
  AssessmentScoreRow,
  AssessmentSkillRow,
  AssessmentTemplateRow,
} from "@/lib/supabase/database.types";

export const assessmentStatusLabels = {
  active: "Ativo",
  inactive: "Inativo",
} as const;

export type AssessmentStatus = keyof typeof assessmentStatusLabels;

export const assessmentTypeLabels = {
  acquisition: "Aquisição",
  reduction: "Redução",
} as const;

export type AssessmentEvaluationType = keyof typeof assessmentTypeLabels;

export const assessmentTypeOptions = [
  {
    value: "acquisition" as const,
    label: "Aquisição de Habilidades",
  },
  {
    value: "reduction" as const,
    label: "Redução de Comportamentos",
  },
];

export function formatAssessmentDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function getAssessmentInitials(name: string) {
  const cleaned = name.replace(/[^\p{L}\p{N}\s-]/gu, " ");
  const words = cleaned.split(/[\s-]+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function formatAssessmentDisplayValue(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : "—";
}

export function getAssessmentToggleActionLabel(status: AssessmentStatus) {
  return status === "active" ? "Inativar" : "Ativar";
}

export function getAssessmentStatusToggleMessage(
  actionLabel: string,
  name: string
) {
  return `Tem certeza que deseja ${actionLabel} a avaliação ${name}`;
}

export function buildAssessmentSortCode(sortOrder: number) {
  return String(sortOrder).padStart(3, "0");
}

export type AssessmentTemplateDetails = {
  template: AssessmentTemplateRow;
  levels: AssessmentLevelRow[];
  skills: AssessmentSkillRow[];
  scoreGroups: AssessmentScoreGroupRow[];
  scores: AssessmentScoreRow[];
};
