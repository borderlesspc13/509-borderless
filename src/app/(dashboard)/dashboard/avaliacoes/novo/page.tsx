import type { Metadata } from "next";

import { AssessmentCreatePageView } from "@/components/assessments/assessment-create-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Nova Avaliação",
  description: "Cadastro de instrumento de avaliação ABA.",
};

export default async function AssessmentCreatePage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  return <AssessmentCreatePageView />;
}
