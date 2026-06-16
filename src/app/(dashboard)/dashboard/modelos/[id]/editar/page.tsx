import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getDocumentTemplateAction } from "@/app/actions/document-template-actions";
import { DocumentTemplateForm } from "@/components/document-templates/document-template-form";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

type DocumentTemplateEditPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: DocumentTemplateEditPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getDocumentTemplateAction(id);

  return {
    title: result.success
      ? `Editar — ${result.data?.template.name}`
      : "Editar modelo",
    description: "Edição de modelo narrativo.",
  };
}

export default async function DocumentTemplateEditPage({
  params,
}: DocumentTemplateEditPageProps) {
  await requirePermission(PERMISSIONS.DOCUMENT_TEMPLATES_MANAGE);

  const { id } = await params;
  const result = await getDocumentTemplateAction(id);

  if (!result.success || !result.data?.template) {
    notFound();
  }

  return <DocumentTemplateForm template={result.data.template} />;
}
