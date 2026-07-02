import type {
  ProgramCriterionRow,
  ProgramFileRow,
  ProgramRow,
  ProgramTargetRow,
} from "@/lib/supabase/database.types";

export const programProtocols = [
  "Barreiras comportamentais",
  "VB-MAPP",
  "PORTAGE",
  "ABLLS-R - Linguagem e Aprendizagem Básicas",
  "Socially Savvy",
  "Social Skills Solutions",
] as const;

export const programSpecialties = [
  "Educador Físico",
  "Fisioterapia",
  "Fonoaudiologia",
  "Psicopedagogia",
  "Psicologia",
  "Terapia Ocupacional",
] as const;

export const programTeachingTypes = [
  "Tentativa Discreta - Estruturada",
  "Análise de Tarefas",
  "Ensino Naturalístico",
  "Tentativa Discreta - Intercalada",
  "Frequência",
  "Duração",
] as const;

export const programCriterionDegrees = [
  "Erro",
  "Mais Intrusiva",
  "Parcialmente Intrusiva",
  "Menos Intrusiva",
  "Independente",
] as const;

export const programQuantityOptions = Array.from({ length: 20 }, (_, index) =>
  String(index + 1)
);

export const programStatusLabels = {
  active: "Ativo",
  inactive: "Inativo",
} as const;

export const programVisibilityLabels = {
  private: "Programa Privado",
  public: "Programa Público",
} as const;

export const programRegistrationTypeLabels = {
  catalog: "Catálogo de Programa",
  learner: "Programa de Aprendiz",
} as const;

export const programTargetSituationLabels = {
  active: "Ativo",
  inactive: "Inativo",
  acquired: "Adquirido",
  maintenance: "Manutenção",
} as const;

export const DEFAULT_PROGRAM_CRITERIA: Array<{
  position: number;
  acronym: string | null;
  degree: string;
}> = [
  { position: 0, acronym: "-", degree: "Erro" },
  { position: 1, acronym: "AFT", degree: "Mais Intrusiva" },
  { position: 2, acronym: "AFP", degree: "Parcialmente Intrusiva" },
  { position: 3, acronym: "AG", degree: "Menos Intrusiva" },
  { position: 4, acronym: "+", degree: "Independente" },
];

export const PROGRAM_TEXT_MAX_LENGTH = 4000;

export const PROGRAM_FILE_MAX_BYTES = 10 * 1024 * 1024;

export type ProgramListItem = ProgramRow & {
  patientName: string | null;
};

export type ProgramDetails = {
  program: ProgramRow;
  patientName: string | null;
  targets: ProgramTargetRow[];
  criteria: ProgramCriterionRow[];
  files: ProgramFileRow[];
};

export function getProgramInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "PR";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export function formatProgramDisplayValue(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : "—";
}

export function formatProgramDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatProgramDateTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();

  if (diffMs < 60_000) {
    return "Agora mesmo";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatProgramFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getProgramToggleActionLabel(status: ProgramRow["status"]) {
  return status === "active" ? "Inativar" : "Ativar";
}

export function getRemainingCharacters(value: string) {
  return Math.max(0, PROGRAM_TEXT_MAX_LENGTH - value.length);
}

export function mapProgramListItem(
  row: ProgramRow,
  patientName?: string | null
): ProgramListItem {
  return {
    ...row,
    patientName: patientName ?? null,
  };
}
