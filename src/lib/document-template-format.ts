import type { DocumentTemplateRow } from "@/lib/supabase/database.types";

export const documentTemplateCategories = [
  { value: "evolucao_clinica", label: "Evolução clínica" },
  { value: "relatorio", label: "Relatório" },
  { value: "anamnese", label: "Anamnese" },
  { value: "parecer", label: "Parecer" },
  { value: "encaminhamento", label: "Encaminhamento" },
  { value: "outro", label: "Outro" },
] as const;

export type DocumentTemplateCategory =
  (typeof documentTemplateCategories)[number]["value"];

export const documentTemplateStatusLabels: Record<
  DocumentTemplateRow["status"],
  string
> = {
  active: "Ativo",
  inactive: "Inativo",
};

export const documentTemplateVariables = [
  { key: "NOME_PACIENTE", label: "Nome do paciente" },
  { key: "DATA_SESSAO", label: "Data da sessão" },
  { key: "NOME_PROFISSIONAL", label: "Nome do profissional" },
  { key: "CARGO_PROFISSIONAL", label: "Cargo do profissional" },
  { key: "CONSELHO_PROFISSIONAL", label: "Conselho profissional" },
  { key: "DIAGNOSTICO", label: "Diagnóstico" },
  { key: "RESPONSAVEL", label: "Responsável legal" },
] as const;

export type DocumentTemplateVariableKey =
  (typeof documentTemplateVariables)[number]["key"];

export type DocumentTemplateVariables = Partial<
  Record<DocumentTemplateVariableKey, string>
>;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function getDocumentTemplateCategoryLabel(category: string) {
  return (
    documentTemplateCategories.find((item) => item.value === category)?.label ??
    category
  );
}

export function formatDocumentTemplateDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function applyDocumentTemplate(
  bodyHtml: string,
  variables: DocumentTemplateVariables
) {
  return bodyHtml.replace(/\[([A-Z0-9_]+)\]/g, (match, key: string) => {
    const value = variables[key as DocumentTemplateVariableKey]?.trim();

    if (value) {
      return escapeHtml(value);
    }

    return `<mark class="rounded bg-amber-100 px-1 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100" data-template-var="${key}">${match}</mark>`;
  });
}

export function buildDocumentTemplateVariables(input: {
  patientName?: string;
  sessionDate?: string;
  professionalName?: string;
  professionalRole?: string;
  professionalCouncil?: string;
  diagnosis?: string;
  guardianName?: string;
}): DocumentTemplateVariables {
  const formattedSessionDate = input.sessionDate
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(
        new Date(
          Number(input.sessionDate.slice(0, 4)),
          Number(input.sessionDate.slice(5, 7)) - 1,
          Number(input.sessionDate.slice(8, 10))
        )
      )
    : undefined;

  return {
    NOME_PACIENTE: input.patientName,
    DATA_SESSAO: formattedSessionDate,
    NOME_PROFISSIONAL: input.professionalName,
    CARGO_PROFISSIONAL: input.professionalRole,
    CONSELHO_PROFISSIONAL: input.professionalCouncil,
    DIAGNOSTICO: input.diagnosis,
    RESPONSAVEL: input.guardianName,
  };
}
