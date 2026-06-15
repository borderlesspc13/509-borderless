import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAssessmentTemplateAction } from "@/app/actions/assessment-template-actions";
import { AccessDeniedCard } from "@/components/auth/access-denied-card";
import { AssessmentEditPageView } from "@/components/assessments/assessment-edit-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

type AssessmentEditPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: AssessmentEditPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getAssessmentTemplateAction(id);

  return {
    title: result.success
      ? `Editar ${result.data?.template.name ?? "Avaliação"}`
      : "Editar Avaliação",
    description: "Edição do instrumento de avaliação ABA.",
  };
}

export default async function AssessmentEditPage({ params }: AssessmentEditPageProps) {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const { id } = await params;
  const result = await getAssessmentTemplateAction(id);

  if (!result.success) {
    if (result.error === "Avaliação não encontrada.") {
      notFound();
    }

    return (
      <AccessDeniedCard
        title="Edição indisponível"
        description={result.error}
      />
    );
  }

  return <AssessmentEditPageView initialDetails={result.data!} />;
}
