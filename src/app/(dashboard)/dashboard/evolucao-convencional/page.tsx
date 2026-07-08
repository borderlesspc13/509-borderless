import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { EvolucaoConvencionalPageView } from "@/components/clinical-evolution/evolucao-convencional-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { mapPatientToClinicalPatient } from "@/lib/clinical-evolution-data";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Evolução Convencional",
  description:
    "Registro sigiloso de evolução dos atendimentos convencionais, restrito ao profissional responsável.",
};

export default async function EvolucaoConvencionalPage() {
  await requirePermission(PERMISSIONS.CONVENTIONAL_EVOLUTION_VIEW);

  const patientsResult = await listPatientsAction();
  const patients =
    patientsResult.success && patientsResult.data
      ? patientsResult.data.patients
          .filter((patient) => patient.status === "active")
          .map(mapPatientToClinicalPatient)
      : [];

  return <EvolucaoConvencionalPageView patients={patients} />;
}
