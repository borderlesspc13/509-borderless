import type { Metadata } from "next";

import { listPatientsAction } from "@/app/actions/patient-record-actions";
import { ProgramCreatePageView } from "@/components/programs/program-create-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Novo Programa",
  description: "Cadastro de novo programa ABA.",
};

export default async function ProgramCreatePage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const patientsResult = await listPatientsAction();

  return (
    <ProgramCreatePageView
      patients={patientsResult.success ? (patientsResult.data?.patients ?? []) : []}
    />
  );
}
