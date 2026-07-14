"use client";

import { Suspense, useState } from "react";

import { AccessDeniedBanner } from "@/components/layout/access-denied-banner";
import { PatientWaitingBanner } from "@/components/internal-communication/patient-waiting-banner";
import { AiModuleCopilot } from "@/features/ai/presentation/components/ai-assistants";
import { TermsAlert } from "@/components/shared/terms-alert";
import { AppLogo } from "@/components/layout/app-logo";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { LogoutButton } from "@/components/layout/logout-button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-background lg:flex-row">
      <aside className="hidden w-[17.5rem] shrink-0 border-r border-sidebar-border bg-sidebar shadow-[2px_0_12px_rgb(0_0_0_/_0.04)] lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <AppLogo linkToHome variant="compact" />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <Suspense fallback={null}>
            <DashboardNav />
          </Suspense>
        </div>
        <Separator />
        <div className="space-y-3 px-4 py-5">
          <LogoutButton />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Soluções em Saúde para equipes multidisciplinares.
          </p>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <DashboardHeader onMenuClick={() => setIsMobileNavOpen(true)} />
        <Suspense fallback={null}>
          <AccessDeniedBanner />
        </Suspense>
        <PatientWaitingBanner />

        <main className="flex-1 overflow-y-auto">
          <div className="page-content">{children}</div>
        </main>

        <TermsAlert />
        <AiModuleCopilot />
      </div>

      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent
          side="left"
          className="flex w-[min(100vw-2rem,20rem)] flex-col p-0"
        >
          <SheetHeader className="border-b border-border px-5 py-4 text-left">
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <SheetDescription className="sr-only">
              Acesso às seções da clínica
            </SheetDescription>
            <AppLogo linkToHome variant="compact" />
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-2">
            <Suspense fallback={null}>
              <DashboardNav onNavigate={() => setIsMobileNavOpen(false)} />
            </Suspense>
          </div>

          <div className="mt-auto border-t border-border px-4 py-5">
            <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
