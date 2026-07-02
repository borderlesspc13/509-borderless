import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProgramDetailsAction } from "@/app/actions/program-actions";
import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { ProgramEditPageView } from "@/components/programs/program-edit-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Editar Programa",
};

type ProgramEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProgramEditPage({ params }: ProgramEditPageProps) {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const { id } = await params;

  const [detailsResult, patientsResult] = await Promise.all([
    getProgramDetailsAction(id),
    listPatientsAction(),
  ]);

  if (!detailsResult.success || !detailsResult.data) {
    notFound();
  }

  return (
    <ProgramEditPageView
      initialDetails={detailsResult.data}
      patients={patientsResult.success ? (patientsResult.data?.patients ?? []) : []}
    />
  );
}
