import type { Metadata } from "next";

import { listAssessmentTemplatesAction } from "@/app/actions/assessment-template-actions";
import { AvaliacoesPageView } from "@/components/assessments/avaliacoes-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Avaliações",
  description: "Instrumentos de avaliação ABA.",
};

export default async function AvaliacoesPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const result = await listAssessmentTemplatesAction();

  return (
    <AvaliacoesPageView
      templates={result.success ? (result.data?.templates ?? []) : []}
      error={result.success ? undefined : result.error}
    />
  );
}
