import type { Metadata } from "next";

import { AiReportTrainingPanel } from "@/components/clinical-reports/ai-report-training-panel";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Treinamento IA — Relatórios",
  description:
    "Treine a IA com relatórios manuais por área clínica e gere novos relatórios automaticamente.",
};

export default async function AiReportTrainingPage() {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title="IA para Relatórios Clínicos"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Relatórios", href: "/dashboard/relatorios" },
          { label: "Treinamento IA" },
        ]}
      />
      <AiReportTrainingPanel />
    </PageContainer>
  );
}
