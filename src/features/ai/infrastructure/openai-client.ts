import type {
  AiAgentId,
  AiChatCompletionInput,
  AiChatCompletionResult,
  AiScreenContext,
} from "@/features/ai/domain/types";
import { getAiAgent } from "@/features/ai/domain/agents";
import {
  getToolDefinitions,
  inferToolsFromMessage,
  type AiToolContext,
} from "@/features/ai/application/tool-registry";
import { isAiMockMode } from "@/lib/ai/env";

function buildMockReply(
  agentId: AiAgentId,
  message: string,
  screenContext: AiScreenContext | undefined,
  toolSummaries: string[]
) {
  const agent = getAiAgent(agentId);
  const entityHint = screenContext?.entityLabel
    ? ` para **${screenContext.entityLabel}**`
    : "";
  const routeHint = screenContext?.route
    ? ` (tela: \`${screenContext.route}\`)`
    : "";

  const toolSection =
    toolSummaries.length > 0
      ? `\n\n**Ferramentas que seriam acionadas:**\n${toolSummaries.map((item) => `- ${item}`).join("\n")}`
      : "";

  const agentIntros: Record<AiAgentId, string> = {
    global:
      "Como assistente geral, posso orquestrar tarefas entre aprendizes, agenda, evolução clínica, avaliações e equipe — sempre respeitando suas permissões.",
    patients:
      "No módulo de Aprendizes, posso ajudar com cadastro, resumo de prontuário e sugestões de observações clínicas.",
    "clinical-evolution":
      "Na Evolução Clínica, posso gerar rascunhos ABA, revisar linguagem e consolidar contexto da sessão.",
    agenda:
      "Na Agenda, posso resumir o dia, explicar status e simular busca de horários disponíveis.",
    assessments:
      "Em Avaliações, posso explicar instrumentos ABA e habilidades do template selecionado.",
    "document-templates":
      "Na Biblioteca de Modelos, posso sugerir adaptações de documentos clínicos.",
    reports:
      "Em Relatórios, posso interpretar indicadores, destacar tendências e verificar o padrão de escrita contra modelos clínicos.",
    team: "Em Profissionais, posso resumir a equipe clínica e filtrar por cargo.",
  };

  return `**${agent.name}** (modo demonstração)\n\n${agentIntros[agentId]}\n\nSobre sua solicitação *"${message.trim()}"*${entityHint}${routeHint}: em produção, consultaria o Supabase via tools tipadas e, se configurado, o modelo **${agent.model}** da OpenAI.\n\nPor ora, esta resposta é simulada para validar UX e contratos da integração.${toolSection}\n\n> Quando \`OPENAI_API_KEY\` estiver definida e \`AI_MOCK_MODE=false\`, o mesmo fluxo chamará a API real com auditoria e confirmação humana para escrita.`;
}

export async function runMockChatCompletion(
  agentId: AiAgentId,
  message: string,
  input: AiChatCompletionInput,
  context: AiToolContext
): Promise<AiChatCompletionResult> {
  const agent = getAiAgent(agentId);
  const inferred = inferToolsFromMessage(message, agent.tools);
  const tools = getToolDefinitions(inferred);
  const toolCalls = tools.map((tool) => tool.simulate({}, context));
  const toolSummaries = toolCalls.map(
    (trace) => `\`${trace.name}\`: ${trace.summary}`
  );

  return {
    content: buildMockReply(agentId, message, context.screenContext, toolSummaries),
    toolCalls,
  };
}

export async function runChatCompletion(
  agentId: AiAgentId,
  message: string,
  input: AiChatCompletionInput,
  context: AiToolContext
): Promise<AiChatCompletionResult> {
  if (isAiMockMode()) {
    return runMockChatCompletion(agentId, message, input, context);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return runMockChatCompletion(agentId, message, input, context);
  }

  // Ponto de extensão: substituir por chamada real à OpenAI Responses/Chat API.
  // Mantemos fallback mock até a integração live ser configurada feature a feature.
  return runMockChatCompletion(agentId, message, input, context);
}
