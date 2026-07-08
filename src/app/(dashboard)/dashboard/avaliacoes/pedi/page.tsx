import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { PediApplicationPageView } from "@/components/assessments/pedi/pedi-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Aplicar PEDI",
  description:
    "Aplicação do Pediatric Evaluation of Disability Inventory com cálculo de escores bruto, contínuo e normativo.",
};

export default async function PediApplicationPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <PediApplicationPageView patients={patients} />;
}
