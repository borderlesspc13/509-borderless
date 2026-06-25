import { NextResponse } from "next/server";

import { runAiChat, type AiSessionContext } from "@/features/ai/application/ai-orchestrator";
import type { AiAgentId, AiChatMessage, AiScreenContext } from "@/features/ai/domain/types";
import { requireServerUserSession } from "@/lib/auth-server";
import { isAiEnabled, isAiMockMode } from "@/lib/ai/env";

type ChatBody = {
  agentId: AiAgentId;
  message: string;
  screenContext?: AiScreenContext;
  history?: AiChatMessage[];
};

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

export async function POST(request: Request) {
  if (!isAiEnabled()) {
    return NextResponse.json(
      { error: "Assistente de IA desabilitado." },
      { status: 503 }
    );
  }

  let body: ChatBody;

  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  try {
    const session = await requireServerUserSession();
    const result = await runAiChat(
      {
        agentId: body.agentId,
        message: body.message,
        screenContext: body.screenContext,
        history: body.history,
      },
      toSessionContext(session)
    );

    return NextResponse.json({
      ...result,
      mockMode: isAiMockMode(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível processar a mensagem.",
      },
      { status: 400 }
    );
  }
}
