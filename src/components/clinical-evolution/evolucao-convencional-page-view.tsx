"use client";

import { ShieldCheck } from "lucide-react";

import { ConventionalEvolutionForm } from "@/components/clinical-evolution/conventional-evolution-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import type { ClinicalPatient } from "@/lib/clinical-evolution-data";

type EvolucaoConvencionalPageViewProps = {
  patients: ClinicalPatient[];
};

export function EvolucaoConvencionalPageView({
  patients,
}: EvolucaoConvencionalPageViewProps) {
  return (
    <PageContainer>
      <DashboardPageHeader
        title="Evolução Convencional"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Atendimento" },
          { label: "Evolução Convencional" },
        ]}
      />

      <section className="rounded-xl border border-border/70 bg-card/60 p-4 text-sm text-muted-foreground sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 size-5 shrink-0 text-primary"
            aria-hidden
          />
          <p>
            Módulo independente do fluxo ABA para atendimentos convencionais. As
            anamneses e evoluções ficam sob sigilo profissional, acessíveis
            apenas ao profissional responsável.
          </p>
        </div>
      </section>

      <ConventionalEvolutionForm patients={patients} />
    </PageContainer>
  );
}
