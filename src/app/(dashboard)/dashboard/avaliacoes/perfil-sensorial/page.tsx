import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { SensoryProfileApplicationPageView } from "@/components/assessments/sensory-profile/sensory-profile-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Perfil Sensorial II",
  description:
    "Aplicação do Perfil Sensorial II com cálculo dos quadrantes Busca, Esquiva, Sensibilidade e Registro.",
};

export default async function SensoryProfileApplicationPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <SensoryProfileApplicationPageView patients={patients} />;
}
