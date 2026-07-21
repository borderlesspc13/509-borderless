"use client";

import { AssessmentList } from "@/components/assessments/assessment-list";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import type { AssessmentTemplateRow } from "@/lib/supabase/database.types";

type AvaliacoesPageViewProps = {
  templates: AssessmentTemplateRow[];
  error?: string;
};

export function AvaliacoesPageView({ templates, error }: AvaliacoesPageViewProps) {
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

      {error ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <AssessmentList templates={templates} />
      )}
    </PageContainer>
  );
}
