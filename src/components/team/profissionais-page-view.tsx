"use client";

import { ProfessionalList } from "@/components/team/professional-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import type { TeamMember } from "@/app/actions/team-actions";

type ProfissionaisPageViewProps = {
  professionals: TeamMember[];
  error?: string;
};

export function ProfissionaisPageView({
  professionals,
  error,
}: ProfissionaisPageViewProps) {
  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title="Profissionais"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Profissionais" },
        ]}
      />

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <ProfessionalList professionals={professionals} />
      )}
    </PageContainer>
  );
}
