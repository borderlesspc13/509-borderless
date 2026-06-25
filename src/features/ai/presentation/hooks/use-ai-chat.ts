"use client";

import { useCallback, useState, useTransition } from "react";

import { sendAiMessageAction } from "@/app/actions/ai-actions";
import type { AiAgentId, AiChatMessage, AiScreenContext, AiToolCallTrace } from "@/features/ai/domain/types";

type UseAiChatOptions = {
  agentId: AiAgentId;
  screenContext?: AiScreenContext;
};

export function useAiChat({ agentId, screenContext }: UseAiChatOptions) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [toolCalls, setToolCalls] = useState<AiToolCallTrace[]>([]);
  const [mode, setMode] = useState<"mock" | "live">("mock");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sendMessage = useCallback(
    (message: string) => {
      const trimmed = message.trim();

      if (!trimmed || isPending) {
        return;
      }

      const userMessage: AiChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, userMessage]);
      setError(null);

      startTransition(async () => {
        const result = await sendAiMessageAction({
          agentId,
          message: trimmed,
          screenContext,
          history: [...messages, userMessage],
        });

        if (!result.success || !result.data) {
          setError(result.success ? "Resposta inválida." : result.error);
          return;
        }

        setMode(result.data.mode);
        setToolCalls(result.data.toolCalls);
        setMessages((current) => [...current, result.data!.message]);
      });
    },
    [agentId, isPending, messages, screenContext]
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setToolCalls([]);
    setError(null);
  }, []);

  return {
    messages,
    toolCalls,
    mode,
    error,
    isPending,
    sendMessage,
    resetChat,
  };
}
