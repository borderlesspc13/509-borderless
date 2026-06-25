"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  RotateCcw,
  SendHorizontal,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

import { getAiAgent } from "@/features/ai/domain/agents";
import type { AiAgentId } from "@/features/ai/domain/types";
import { AiMessageContent } from "@/features/ai/presentation/components/ai-message-content";
import { useAiChat } from "@/features/ai/presentation/hooks/use-ai-chat";
import { useAiScreenContext } from "@/contexts/ai-screen-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AiAssistantPanelProps = {
  agentId: AiAgentId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: "module" | "global";
  className?: string;
};

export function AiAssistantPanel({
  agentId,
  open,
  onOpenChange,
  variant = "module",
  className,
}: AiAssistantPanelProps) {
  const agent = getAiAgent(agentId);
  const { screenContext } = useAiScreenContext();
  const { messages, toolCalls, mode, error, isPending, sendMessage, resetChat } =
    useAiChat({
      agentId,
      screenContext: {
        ...screenContext,
        route: screenContext.route,
        moduleLabel: screenContext.moduleLabel ?? agent.moduleLabel,
      },
    });
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusInput = () => {
      inputRef.current?.focus({ preventScroll: true });
    };

    focusInput();
    const timer = window.setTimeout(focusInput, 100);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, isPending]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = draft.trim();

    if (!value) {
      return;
    }

    sendMessage(value);
    setDraft("");
  }

  if (!open) {
    return null;
  }

  return (
    <>
      {variant === "module" ? (
        <button
          type="button"
          aria-label="Fechar assistente"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => onOpenChange(false)}
        />
      ) : null}

      <aside
      className={cn(
        "flex h-full flex-col border-border bg-card shadow-xl",
        variant === "global"
          ? "w-full"
          : "fixed inset-y-0 right-0 z-50 w-full max-w-md border-l",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-4">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            <h2 className="truncate text-base font-semibold">{agent.name}</h2>
            <Badge variant="outline" className="text-[0.65rem] uppercase">
              {mode === "mock" ? "Demo" : "Live"}
            </Badge>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {agent.description}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => onOpenChange(false)}
          aria-label="Fechar assistente"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border/70 px-4 py-3">
        {agent.quickPrompts.map((prompt) => (
          <Button
            key={prompt}
            type="button"
            size="sm"
            variant="outline"
            className="h-8 max-w-full truncate text-xs"
            disabled={isPending}
            onClick={() => sendMessage(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center">
            <Bot className="mx-auto mb-3 size-8 text-primary/80" aria-hidden />
            <p className="text-sm font-medium">Como posso ajudar?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Integração preparada para OpenAI. Respostas atuais são simuladas.
            </p>
          </div>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[92%] rounded-2xl px-4 py-3",
              message.role === "user"
                ? "ml-auto bg-primary text-primary-foreground"
                : "mr-auto border border-border/70 bg-muted/30"
            )}
          >
            {message.role === "assistant" ? (
              <AiMessageContent content={message.content} />
            ) : (
              <p className="text-sm leading-relaxed">{message.content}</p>
            )}
          </div>
        ))}

        {toolCalls.length > 0 ? (
          <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Wrench className="size-3.5" aria-hidden />
              Tools simuladas
            </p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {toolCalls.map((tool) => (
                <li key={`${tool.name}-${tool.summary}`}>
                  <code className="text-foreground">{tool.name}</code>
                  <span className="mx-1">—</span>
                  {tool.summary}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Processando...
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-border p-4"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={resetChat}
            aria-label="Limpar conversa"
            disabled={isPending || messages.length === 0}
          >
            <RotateCcw className="size-4" />
          </Button>
          <Input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Pergunte ao assistente..."
            className="h-11"
            disabled={isPending}
            autoComplete="off"
          />
          <Button type="submit" size="icon" className="size-11 shrink-0" disabled={isPending}>
            <SendHorizontal className="size-4" />
          </Button>
        </div>
      </form>
    </aside>
    </>
  );
}
