import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { EbaiApplicationPageView } from "@/components/assessments/ebai/ebai-application-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Escala EBAI",
  description:
    "Aplicação da Escala EBAI com conversão de escore bruto para Escore T e nível de severidade.",
};

export default async function EbaiApplicationPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <EbaiApplicationPageView patients={patients} />;
}
