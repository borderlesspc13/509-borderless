import type { AiAgentDefinition, AiAgentId } from "@/features/ai/domain/types";
import { getOpenAiDefaultModel, getOpenAiGlobalModel } from "@/lib/ai/env";
import { PERMISSIONS } from "@/lib/rbac";

export const AI_AGENTS: Record<AiAgentId, AiAgentDefinition> = {
  global: {
    id: "global",
    name: "Assistente Geral",
    description:
      "Orquestra tarefas entre módulos conforme suas permissões de acesso.",
    moduleLabel: "Sistema",
    requiredPermissions: [],
    model: getOpenAiGlobalModel(),
    quickPrompts: [
      "O que posso fazer neste sistema?",
      "Resuma minhas prioridades de hoje",
      "Como cadastrar um novo aprendiz?",
      "Quais módulos tenho acesso?",
    ],
    tools: [
      "search_patients",
      "get_patient_summary",
      "list_today_appointments",
      "search_availability",
      "get_evolution_draft",
      "list_assessment_templates",
      "get_team_overview",
    ],
  },
  patients: {
    id: "patients",
    name: "IA de Aprendizes",
    description: "Ajuda em cadastro, prontuário e dados do aprendiz.",
    moduleLabel: "Aprendizes",
    requiredPermissions: [PERMISSIONS.PATIENTS_VIEW],
    model: getOpenAiDefaultModel(),
    quickPrompts: [
      "Quais campos são obrigatórios no cadastro?",
      "Sugerir observações para o prontuário",
      "Resumir o aprendiz aberto",
      "Listar aprendizes ativos",
    ],
    tools: ["search_patients", "get_patient_summary", "propose_patient_notes"],
  },
  "clinical-evolution": {
    id: "clinical-evolution",
    name: "IA de Evolução Clínica",
    description: "Apoia redação e revisão de evoluções ABA.",
    moduleLabel: "Evolução Clínica",
    requiredPermissions: [PERMISSIONS.CLINICAL_EVOLUTION_VIEW],
    model: getOpenAiDefaultModel(),
    quickPrompts: [
      "Gerar rascunho de evolução ABA",
      "Melhorar redação clínica do texto",
      "Sugerir objetivos da sessão",
      "Listar evoluções recentes",
    ],
    tools: [
      "get_patient_context",
      "get_evolution_draft",
      "propose_evolution_text",
      "list_recent_evolutions",
    ],
  },
  agenda: {
    id: "agenda",
    name: "IA da Agenda",
    description: "Ajuda com horários, status e organização da agenda.",
    moduleLabel: "Agenda",
    requiredPermissions: [PERMISSIONS.AGENDA_VIEW],
    model: getOpenAiDefaultModel(),
    quickPrompts: [
      "Resumir a agenda de hoje",
      "Quem está disponível às 14h?",
      "Explicar os status dos agendamentos",
      "Sugerir encaixe de sessão",
    ],
    tools: [
      "list_today_appointments",
      "search_availability",
      "explain_appointment_status",
    ],
  },
  assessments: {
    id: "assessments",
    name: "IA de Avaliações",
    description: "Apoia instrumentos e templates de avaliação ABA.",
    moduleLabel: "Avaliações",
    requiredPermissions: [PERMISSIONS.ASSESSMENTS_VIEW],
    model: getOpenAiDefaultModel(),
    quickPrompts: [
      "Explicar este instrumento de avaliação",
      "Sugerir habilidades para avaliar",
      "Resumir templates ativos",
    ],
    tools: ["list_assessment_templates", "explain_assessment_skill"],
  },
  "document-templates": {
    id: "document-templates",
    name: "IA de Modelos",
    description: "Ajuda a usar e adaptar modelos de documentos clínicos.",
    moduleLabel: "Biblioteca de Modelos",
    requiredPermissions: [PERMISSIONS.DOCUMENT_TEMPLATES_VIEW],
    model: getOpenAiDefaultModel(),
    quickPrompts: [
      "Sugerir modelo para evolução",
      "Adaptar texto do modelo aberto",
      "Listar modelos por categoria",
    ],
    tools: ["list_document_templates", "propose_template_text"],
  },
  reports: {
    id: "reports",
    name: "IA de Relatórios",
    description: "Interpreta indicadores e relatórios clínicos.",
    moduleLabel: "Relatórios",
    requiredPermissions: [PERMISSIONS.REPORTS_VIEW],
    model: getOpenAiDefaultModel(),
    quickPrompts: [
      "Explicar indicadores do período",
      "Resumir sessões da semana",
      "Sugerir pontos de atenção",
      "Verificar padrão de escrita do relatório",
      "Analisar foto de relatório clínico",
    ],
    tools: [
      "get_dashboard_summary",
      "explain_clinical_metric",
      "verify_writing_pattern",
    ],
  },
  team: {
    id: "team",
    name: "IA de Equipe",
    description: "Apoia gestão e consulta de profissionais.",
    moduleLabel: "Profissionais",
    requiredPermissions: [PERMISSIONS.PROFESSIONALS_VIEW],
    model: getOpenAiDefaultModel(),
    quickPrompts: [
      "Listar profissionais ativos",
      "Quem atende como psicólogo?",
      "Resumir equipe clínica",
    ],
    tools: ["get_team_overview", "search_professionals"],
  },
};

export function getAiAgent(agentId: AiAgentId) {
  return AI_AGENTS[agentId];
}

export function listAiAgents() {
  return Object.values(AI_AGENTS);
}
