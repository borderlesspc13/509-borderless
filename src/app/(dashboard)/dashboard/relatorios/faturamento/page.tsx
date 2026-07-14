import type { Metadata } from "next";

import { getFaturamentoMensalAction } from "@/app/actions/faturamento-actions";
import { FaturamentoReportClient } from "@/components/clinical-reports/faturamento-report-client";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Faturamento Mensal",
};

export default async function FaturamentoReportPage() {
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth() + 1;
  const anoAtual = dataAtual.getFullYear();

  const data = await getFaturamentoMensalAction(anoAtual, mesAtual);

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title="Faturamento Mensal"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Relatórios" },
          { label: "Faturamento" },
        ]}
      />

      <FaturamentoReportClient initialData={data} initialMes={mesAtual} initialAno={anoAtual} />
    </PageContainer>
  );
}
