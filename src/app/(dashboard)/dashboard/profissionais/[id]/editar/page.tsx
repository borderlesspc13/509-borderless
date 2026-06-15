import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProfessionalAction } from "@/app/actions/team-actions";
import { AccessDeniedCard } from "@/components/auth/access-denied-card";
import { ProfessionalEditPageView } from "@/components/team/professional-edit-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

type ProfessionalEditPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ProfessionalEditPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getProfessionalAction(id);

  return {
    title: result.success
      ? `Editar ${result.data?.professional.fullName ?? "Profissional"}`
      : "Editar Profissional",
    description: "Edição cadastral do profissional.",
  };
}

export default async function ProfessionalEditPage({
  params,
}: ProfessionalEditPageProps) {
  await requirePermission(PERMISSIONS.PROFESSIONALS_VIEW);

  const { id } = await params;
  const result = await getProfessionalAction(id);

  if (!result.success) {
    if (result.error === "Profissional não encontrado.") {
      notFound();
    }

    return (
      <AccessDeniedCard
        title="Edição indisponível"
        description={result.error}
      />
    );
  }

  return <ProfessionalEditPageView professional={result.data!.professional} />;
}
