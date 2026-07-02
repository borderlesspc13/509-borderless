"use client";

import Link from "next/link";

import { ProgramGeneralTab } from "@/components/programs/program-general-tab";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import type { PatientRow } from "@/lib/supabase/database.types";

type ProgramCreatePageViewProps = {
  patients: PatientRow[];
};

export function ProgramCreatePageView({ patients }: ProgramCreatePageViewProps) {
  return (
    <PageContainer size="wide" className="space-y-8">
      <DashboardPageHeader
        title="Novo Programa"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Programas", href: "/dashboard/programas" },
          { label: "Novo" },
        ]}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/programas" />}
          >
            Voltar
          </Button>
        }
      />

      <section className="overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:p-6">
        <ProgramGeneralTab patients={patients} />
      </section>
    </PageContainer>
  );
}
