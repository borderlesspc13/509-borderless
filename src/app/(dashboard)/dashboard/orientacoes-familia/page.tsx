import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { ParentOrientationsManager } from "@/components/family-portal/parent-orientations-manager";
import { PageContainer } from "@/components/layout/page-container";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Orientações para a Família",
  description:
    "Publique orientações, demandas e o PEI para os responsáveis acompanharem em casa.",
};

export default async function OrientacoesFamiliaPage() {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return (
    <PageContainer>
      <DashboardPageHeader
        title="Orientações para a Família"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Família/Escola" },
          { label: "Orientações/Dicas" },
        ]}
      />

      <section className="rounded-xl border border-border/70 bg-card/60 p-4 text-sm text-muted-foreground sm:p-5">
        Compartilhe apenas o conteúdo relevante para o acompanhamento em casa. As
        evoluções e registros técnicos permanecem restritos à equipe — os pais
        veem somente o que for publicado aqui.
      </section>

      <ParentOrientationsManager patients={patients} />
    </PageContainer>
  );
}
