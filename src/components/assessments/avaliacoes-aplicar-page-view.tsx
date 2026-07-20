"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { APPLICABLE_ASSESSMENTS } from "@/lib/assessment-apply-routes";

export function AvaliacoesAplicarPageView() {
  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title="Avaliações"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Evolução" },
          { label: "Avaliações" },
        ]}
      />

      <p className="max-w-2xl text-sm text-muted-foreground">
        Selecione o instrumento para avaliar o paciente. O cadastro e a edição
        dos testes ficam em Cadastro → Avaliações.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {APPLICABLE_ASSESSMENTS.map((instrument) => (
          <article
            key={instrument.name}
            className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm"
          >
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ClipboardList className="size-5" aria-hidden />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-foreground">
                  {instrument.buttonLabel}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {instrument.description}
                </p>
              </div>
            </div>
            <div className="border-t border-border/60 bg-muted/20 p-3">
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href={instrument.href} />}
              >
                Avaliar paciente
              </Button>
            </div>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
