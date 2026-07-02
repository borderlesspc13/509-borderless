"use client";

import { ProgramList } from "@/components/programs/program-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import type { ProgramListItem } from "@/lib/program-format";

type ProgramsPageViewProps = {
  programs: ProgramListItem[];
  error?: string;
};

export function ProgramsPageView({ programs, error }: ProgramsPageViewProps) {
  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title="Programas"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Programas" },
        ]}
      />

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <ProgramList programs={programs} />
      )}
    </PageContainer>
  );
}
