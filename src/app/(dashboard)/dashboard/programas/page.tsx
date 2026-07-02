import type { Metadata } from "next";

import { listProgramsAction } from "@/app/actions/program-actions";
import { ProgramsPageView } from "@/components/programs/programs-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Programas",
  description: "Catálogo de programas ABA.",
};

export default async function ProgramasPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const result = await listProgramsAction();

  return (
    <ProgramsPageView
      programs={result.success ? (result.data?.programs ?? []) : []}
      error={result.success ? undefined : result.error}
    />
  );
}
