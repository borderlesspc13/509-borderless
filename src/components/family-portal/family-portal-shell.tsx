"use client";

import { Heart, LogOut } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import type { AppUserSession } from "@/lib/user-profile";
import { cn } from "@/lib/utils";

type FamilyPortalShellProps = {
  session: AppUserSession;
  children: React.ReactNode;
};

export function FamilyPortalShell({ session, children }: FamilyPortalShellProps) {
  const [isPending, startTransition] = useTransition();
  const firstName = session.fullName.split(" ")[0] ?? session.fullName;

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <div className="min-h-dvh bg-[linear-gradient(180deg,oklch(0.97_0.02_245)_0%,var(--background)_28%)]">
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary"
              aria-hidden
            >
              <Heart className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                Portal da Família
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Olá, {firstName}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5 rounded-full px-3 text-xs"
            onClick={handleSignOut}
            disabled={isPending}
          >
            <LogOut className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">
              {isPending ? "Saindo..." : "Sair"}
            </span>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-5 pb-10 sm:px-6 sm:py-6">
        {children}
      </main>
    </div>
  );
}

type FamilyPortalNavProps = {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  className?: string;
};

const NAV_ITEMS = [
  { id: "resumo", label: "Resumo" },
  { id: "evolucao", label: "Evolução" },
  { id: "progresso", label: "Progresso" },
  { id: "atividades-casa", label: "Atividades" },
  { id: "avisos", label: "Avisos" },
] as const;

export function FamilyPortalNav({
  activeSection,
  onNavigate,
  className,
}: FamilyPortalNavProps) {
  return (
    <nav
      aria-label="Seções do portal"
      className={cn(
        "sticky top-[4.25rem] z-20 -mx-4 border-b border-border/40 bg-background/80 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6",
        className
      )}
    >
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
