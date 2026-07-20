import type { Metadata } from "next";
import { Suspense } from "react";

import { listProfessionalsAction } from "@/app/actions/team-actions";
import { ProfissionaisPageView } from "@/components/team/profissionais-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Profissionais",
  description: "Cadastro e gestão da equipe clínica e terapêutica.",
};

export default async function ProfissionaisPage() {
  await requirePermission(PERMISSIONS.PROFESSIONALS_VIEW);

  const result = await listProfessionalsAction();

  return (
    <Suspense fallback={null}>
      <ProfissionaisPageView
        professionals={result.success ? (result.data?.professionals ?? []) : []}
        error={result.success ? undefined : result.error}
      />
    </Suspense>
  );
}
