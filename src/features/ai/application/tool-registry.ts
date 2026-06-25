import type { AiScreenContext, AiToolCallTrace } from "@/features/ai/domain/types";

export type AiToolContext = {
  screenContext?: AiScreenContext;
  userName: string;
  allowedTools: string[];
};

export type AiToolDefinition = {
  name: string;
  description: string;
  requiredPermission?: string;
  simulate: (input: Record<string, unknown>, context: AiToolContext) => AiToolCallTrace;
};

function buildTrace(
  name: string,
  summary: string,
  status: AiToolCallTrace["status"] = "simulated"
): AiToolCallTrace {
  return { name, summary, status };
}

export const AI_TOOL_REGISTRY: Record<string, AiToolDefinition> = {
  search_patients: {
    name: "search_patients",
    description: "Busca aprendizes por nome no Supabase.",
    simulate: (_input, context) =>
      buildTrace(
        "search_patients",
        context.screenContext?.entityLabel
          ? `Localizaria registros relacionados a "${context.screenContext.entityLabel}".`
          : "Consultaria a tabela patients com filtro por nome."
      ),
  },
  get_patient_summary: {
    name: "get_patient_summary",
    description: "Resume prontuário, evoluções e atendimentos do aprendiz.",
    simulate: (_input, context) =>
      buildTrace(
        "get_patient_summary",
        context.screenContext?.entityId
          ? `Montaria resumo clínico do aprendiz ${context.screenContext.entityId}.`
          : "Agregaria dados de patients, evoluções e agenda_events."
      ),
  },
  propose_patient_notes: {
    name: "propose_patient_notes",
    description: "Sugere observações para o cadastro sem salvar automaticamente.",
    simulate: () =>
      buildTrace(
        "propose_patient_notes",
        "Geraria sugestão de texto para o campo de observações."
      ),
  },
  get_patient_context: {
    name: "get_patient_context",
    description: "Carrega contexto clínico do aprendiz para redação.",
    simulate: (_input, context) =>
      buildTrace(
        "get_patient_context",
        context.screenContext?.entityLabel
          ? `Carregaria histórico clínico de ${context.screenContext.entityLabel}.`
          : "Buscaria paciente selecionado e últimas evoluções."
      ),
  },
  get_evolution_draft: {
    name: "get_evolution_draft",
    description: "Gera rascunho de evolução ABA para revisão humana.",
    simulate: () =>
      buildTrace(
        "get_evolution_draft",
        "Criaria rascunho em clinical_evolution_records com status draft."
      ),
  },
  propose_evolution_text: {
    name: "propose_evolution_text",
    description: "Reescreve ou melhora texto clínico informado.",
    simulate: () =>
      buildTrace(
        "propose_evolution_text",
        "Aplicaria revisão de linguagem clínica no texto do editor."
      ),
  },
  list_recent_evolutions: {
    name: "list_recent_evolutions",
    description: "Lista evoluções recentes do aprendiz ou do profissional.",
    simulate: () =>
      buildTrace(
        "list_recent_evolutions",
        "Consultaria clinical_evolution_records ordenado por session_date."
      ),
  },
  list_today_appointments: {
    name: "list_today_appointments",
    description: "Lista agendamentos do dia corrente.",
    simulate: () =>
      buildTrace(
        "list_today_appointments",
        "Consultaria agenda_events filtrando pela data de hoje."
      ),
  },
  search_availability: {
    name: "search_availability",
    description: "Busca profissionais disponíveis em horário específico.",
    simulate: () =>
      buildTrace(
        "search_availability",
        "Usaria user_profiles + agenda_events para calcular disponibilidade."
      ),
  },
  explain_appointment_status: {
    name: "explain_appointment_status",
    description: "Explica regras de status da agenda.",
    simulate: () =>
      buildTrace(
        "explain_appointment_status",
        "Retornaria definições de agendado, confirmado, em espera e chamado."
      ),
  },
  list_assessment_templates: {
    name: "list_assessment_templates",
    description: "Lista instrumentos de avaliação ativos.",
    simulate: () =>
      buildTrace(
        "list_assessment_templates",
        "Consultaria assessment_templates com status active."
      ),
  },
  explain_assessment_skill: {
    name: "explain_assessment_skill",
    description: "Explica habilidade de um instrumento ABA.",
    simulate: () =>
      buildTrace(
        "explain_assessment_skill",
        "Consultaria assessment_skills e assessment_scores do template."
      ),
  },
  list_document_templates: {
    name: "list_document_templates",
    description: "Lista modelos de documentos clínicos.",
    simulate: () =>
      buildTrace(
        "list_document_templates",
        "Consultaria document_templates por categoria."
      ),
  },
  propose_template_text: {
    name: "propose_template_text",
    description: "Sugere adaptação de modelo de documento.",
    simulate: () =>
      buildTrace(
        "propose_template_text",
        "Geraria variação do template sem persistir automaticamente."
      ),
  },
  get_dashboard_summary: {
    name: "get_dashboard_summary",
    description: "Resume indicadores do dashboard no período.",
    simulate: () =>
      buildTrace(
        "get_dashboard_summary",
        "Agregaria agenda_events, evoluções e avaliações do período."
      ),
  },
  explain_clinical_metric: {
    name: "explain_clinical_metric",
    description: "Explica um indicador clínico exibido no painel.",
    simulate: () =>
      buildTrace(
        "explain_clinical_metric",
        "Detalharia cálculo da métrica selecionada."
      ),
  },
  get_team_overview: {
    name: "get_team_overview",
    description: "Resume equipe clínica e cargos.",
    simulate: () =>
      buildTrace(
        "get_team_overview",
        "Consultaria user_profiles com perfis clínicos ativos."
      ),
  },
  search_professionals: {
    name: "search_professionals",
    description: "Busca profissionais por nome ou cargo.",
    simulate: () =>
      buildTrace(
        "search_professionals",
        "Filtraria user_profiles por full_name e professional_role."
      ),
  },
};

export function getToolDefinitions(toolNames: string[]) {
  return toolNames
    .map((name) => AI_TOOL_REGISTRY[name])
    .filter((tool): tool is AiToolDefinition => Boolean(tool));
}

export function inferToolsFromMessage(
  message: string,
  availableTools: string[]
) {
  const normalized = message.toLowerCase();
  const matches: string[] = [];

  const rules: Array<{ keywords: string[]; tool: string }> = [
    { keywords: ["aprendiz", "paciente", "prontuário", "cadastro"], tool: "search_patients" },
    { keywords: ["resum", "prontuário"], tool: "get_patient_summary" },
    { keywords: ["evolução", "sessão", "rascunho", "redação"], tool: "get_evolution_draft" },
    { keywords: ["agenda", "horário", "hoje", "dispon"], tool: "list_today_appointments" },
    { keywords: ["dispon", "encaixe", "vago"], tool: "search_availability" },
    { keywords: ["avaliação", "instrumento", "habilidade"], tool: "list_assessment_templates" },
    { keywords: ["modelo", "documento", "template"], tool: "list_document_templates" },
    { keywords: ["indicador", "relatório", "métrica"], tool: "get_dashboard_summary" },
    { keywords: ["profissional", "equipe", "terapeuta"], tool: "get_team_overview" },
    { keywords: ["status", "confirmado", "espera"], tool: "explain_appointment_status" },
  ];

  rules.forEach((rule) => {
    if (
      availableTools.includes(rule.tool) &&
      rule.keywords.some((keyword) => normalized.includes(keyword))
    ) {
      matches.push(rule.tool);
    }
  });

  if (matches.length === 0 && availableTools.length > 0) {
    return [availableTools[0]];
  }

  return [...new Set(matches)].slice(0, 3);
}
