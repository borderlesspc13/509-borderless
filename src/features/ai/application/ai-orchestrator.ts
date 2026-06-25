import { AI_AGENTS, getAiAgent } from "@/features/ai/domain/agents";
import type {
  AiAgentId,
  AiChatRequest,
  AiChatResponse,
  AiChatMessage,
} from "@/features/ai/domain/types";
import type { AiToolContext } from "@/features/ai/application/tool-registry";
import { getToolDefinitions } from "@/features/ai/application/tool-registry";
import { runChatCompletion } from "@/features/ai/infrastructure/openai-client";
import { isAiMockMode } from "@/lib/ai/env";
import { hasPermission, type Permission } from "@/lib/rbac";
import type { UserProfile } from "@/lib/auth";

export type AiSessionContext = {
  userId: string;
  userName: string;
  profile: UserProfile;
  isMaster: boolean;
};

function createMessage(role: AiChatMessage["role"], content: string): AiChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function canAccessAgent(agentId: AiAgentId, session: AiSessionContext) {
  const agent = getAiAgent(agentId);

  if (agent.requiredPermissions.length === 0) {
    return true;
  }

  return agent.requiredPermissions.every((permission) =>
    hasPermission(session.profile, permission as Permission, session.isMaster)
  );
}

function resolveAllowedTools(agentId: AiAgentId, session: AiSessionContext) {
  const agent = getAiAgent(agentId);

  if (agentId !== "global") {
    return canAccessAgent(agentId, session) ? agent.tools : [];
  }

  return agent.tools.filter((toolName) => {
    const owner = Object.values(AI_AGENTS).find((candidate) =>
      candidate.tools.includes(toolName)
    );

    if (!owner || owner.requiredPermissions.length === 0) {
      return true;
    }

    return owner.requiredPermissions.every((permission) =>
      hasPermission(session.profile, permission as Permission, session.isMaster)
    );
  });
}

function buildSystemPrompt(agentId: AiAgentId, session: AiSessionContext) {
  const agent = getAiAgent(agentId);

  return [
    `Você é ${agent.name} do sistema Borderless.`,
    agent.description,
    `Usuário: ${session.userName}.`,
    "Respeite LGPD: minimize dados sensíveis e nunca execute escrita sem confirmação humana.",
    "Use tools server-side para buscar dados; não invente registros clínicos.",
  ].join(" ");
}

export async function runAiChat(
  request: AiChatRequest,
  session: AiSessionContext
): Promise<AiChatResponse> {
  const agent = getAiAgent(request.agentId);
  const trimmedMessage = request.message.trim();

  if (!trimmedMessage) {
    throw new Error("Informe uma mensagem para o assistente.");
  }

  if (!canAccessAgent(request.agentId, session)) {
    throw new Error("Você não tem permissão para usar este assistente de IA.");
  }

  const allowedTools = resolveAllowedTools(request.agentId, session);
  const toolContext: AiToolContext = {
    screenContext: request.screenContext,
    userName: session.userName,
    allowedTools,
  };

  const history = (request.history ?? []).slice(-12).map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const completion = await runChatCompletion(
    request.agentId,
    trimmedMessage,
    {
      systemPrompt: buildSystemPrompt(request.agentId, session),
      messages: [
        ...history,
        { role: "user", content: trimmedMessage },
      ],
      tools: getToolDefinitions(allowedTools).map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: { type: "object", properties: {} },
      })),
      model: agent.model,
    },
    toolContext
  );

  return {
    message: createMessage("assistant", completion.content),
    toolCalls: completion.toolCalls,
    mode: isAiMockMode() ? "mock" : "live",
    agentId: request.agentId,
  };
}

export function listAccessibleAgents(session: AiSessionContext): AiAgentId[] {
  return (Object.keys(AI_AGENTS) as AiAgentId[]).filter((agentId) =>
    canAccessAgent(agentId, session)
  );
}
