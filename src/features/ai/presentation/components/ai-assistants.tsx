"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { resolveAgentFromPathname } from "@/features/ai/domain/resolve-agent";
import type { AiAgentId } from "@/features/ai/domain/types";
import { getAiAgent } from "@/features/ai/domain/agents";
import { AiAssistantPanel } from "@/features/ai/presentation/components/ai-assistant-panel";
import { useAiScreenContext } from "@/contexts/ai-screen-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AiModuleCopilot() {
  const pathname = usePathname();
  const { patchScreenContext } = useAiScreenContext();
  const [open, setOpen] = useState(false);
  const moduleAgentId = resolveAgentFromPathname(pathname);

  useEffect(() => {
    if (!moduleAgentId || moduleAgentId === "global") {
      return;
    }

    const agent = getAiAgent(moduleAgentId);
    patchScreenContext({
      route: pathname,
      moduleLabel: agent.moduleLabel,
    });
  }, [moduleAgentId, pathname, patchScreenContext]);

  if (!moduleAgentId || moduleAgentId === "global") {
    return null;
  }

  const agent = getAiAgent(moduleAgentId);

  return (
    <>
      <Button
        type="button"
        className={cn(
          "fixed bottom-5 right-5 z-40 h-11 gap-2 rounded-full px-4 shadow-lg",
          open && "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(true)}
      >
        <Sparkles className="size-4" aria-hidden />
        IA · {agent.moduleLabel}
      </Button>

      <AiAssistantPanel
        agentId={moduleAgentId}
        open={open}
        onOpenChange={setOpen}
        variant="module"
      />
    </>
  );
}

export function AiGlobalAssistant() {
  const pathname = usePathname();
  const { patchScreenContext } = useAiScreenContext();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    patchScreenContext({ route: pathname });
  }, [pathname, patchScreenContext]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "app-header-icon-btn h-9 shrink-0 gap-2 px-2.5 sm:h-9 sm:w-auto sm:px-3",
          "hover:bg-white/30 active:bg-white/35"
        )}
        onClick={() => setOpen(true)}
        aria-label="Abrir assistente de IA"
      >
        <Sparkles className="size-4 shrink-0" aria-hidden />
        <span className="hidden max-w-[7.5rem] truncate text-sm font-medium sm:inline md:max-w-none">
          Assistente IA
        </span>
        <kbd className="hidden rounded border border-white/30 bg-white/15 px-1.5 py-0.5 text-[0.65rem] font-medium text-primary-foreground/90 lg:inline">
          Ctrl+K
        </kbd>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full max-w-xl flex-col gap-0 p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Assistente Geral de IA</SheetTitle>
            <SheetDescription>
              Assistente com acesso orquestrado a todos os módulos permitidos.
            </SheetDescription>
          </SheetHeader>
          <AiAssistantPanel
            agentId={"global" satisfies AiAgentId}
            open={open}
            onOpenChange={setOpen}
            variant="global"
            className="h-full border-0 shadow-none"
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
