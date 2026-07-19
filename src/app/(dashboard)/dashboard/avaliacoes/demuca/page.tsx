import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { DemucaApplicationPageView } from "@/components/assessments/demuca/demuca-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Escala DEMUCA 2.0",
  description:
    "Aplicação da Escala DEMUCA 2.0 — desenvolvimento musical da criança com autismo.",
};

export default async function DemucaApplicationPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <DemucaApplicationPageView patients={patients} />;
}
