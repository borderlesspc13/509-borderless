"use server";

import {
  listAccessibleAgents,
  runAiChat,
  type AiSessionContext,
} from "@/features/ai/application/ai-orchestrator";
import type { AiAgentId, AiChatMessage, AiChatRequest, AiScreenContext } from "@/features/ai/domain/types";
import { getAiAgent } from "@/features/ai/domain/agents";
import { requireServerUserSession } from "@/lib/auth-server";
import { isAiEnabled, isAiMockMode } from "@/lib/ai/env";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function toSessionContext(
  session: Awaited<ReturnType<typeof requireServerUserSession>>
): AiSessionContext {
  return {
    userId: session.id,
    userName: session.fullName,
    profile: session.profile,
    isMaster: session.isMaster,
  };
}

export async function sendAiMessageAction(input: {
  agentId: AiAgentId;
  message: string;
  screenContext?: AiScreenContext;
  history?: AiChatMessage[];
}): Promise<
  ActionResult<Awaited<ReturnType<typeof runAiChat>>>
> {
  if (!isAiEnabled()) {
    return {
      success: false,
      error: "Assistente de IA desabilitado. Configure OPENAI_API_KEY ou AI_MOCK_MODE=true.",
    };
  }

  try {
    const session = await requireServerUserSession();
    const request: AiChatRequest = {
      agentId: input.agentId,
      message: input.message,
      screenContext: input.screenContext,
      history: input.history,
    };

    const data = await runAiChat(request, toSessionContext(session));

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível processar a mensagem.",
    };
  }
}

export async function getAiAssistantsAction(): Promise<
  ActionResult<{
    agents: Array<{
      id: AiAgentId;
      name: string;
      description: string;
      moduleLabel: string;
      quickPrompts: string[];
    }>;
    mockMode: boolean;
  }>
> {
  if (!isAiEnabled()) {
    return { success: false, error: "Assistente de IA desabilitado." };
  }

  try {
    const session = await requireServerUserSession();
    const accessible = listAccessibleAgents(toSessionContext(session));

    return {
      success: true,
      data: {
        mockMode: isAiMockMode(),
        agents: accessible.map((agentId) => {
          const agent = getAiAgent(agentId);
          return {
            id: agent.id,
            name: agent.name,
            description: agent.description,
            moduleLabel: agent.moduleLabel,
            quickPrompts: agent.quickPrompts,
          };
        }),
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível carregar assistentes.",
    };
  }
}
