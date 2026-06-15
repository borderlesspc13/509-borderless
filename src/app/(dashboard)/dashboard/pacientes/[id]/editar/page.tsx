import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPatientAction } from "@/app/actions/patient-record-actions";
import { AccessDeniedCard } from "@/components/auth/access-denied-card";
import { PatientEditPageView } from "@/components/patients/patient-edit-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

type PatientEditPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PatientEditPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getPatientAction(id);

  return {
    title: result.success
      ? `Editar ${result.data?.patient.full_name ?? "Aprendiz"}`
      : "Editar Aprendiz",
    description: "Edição cadastral do aprendiz.",
  };
}

export default async function PatientEditPage({ params }: PatientEditPageProps) {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const { id } = await params;
  const result = await getPatientAction(id);

  if (!result.success) {
    if (result.error === "Paciente não encontrado.") {
      notFound();
    }

    return (
      <AccessDeniedCard
        title="Edição indisponível"
        description={result.error}
      />
    );
  }

  return <PatientEditPageView patient={result.data!.patient} />;
}
