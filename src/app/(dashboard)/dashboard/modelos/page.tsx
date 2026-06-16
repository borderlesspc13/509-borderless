import type { Metadata } from "next";

import { listDocumentTemplatesAction } from "@/app/actions/document-template-actions";
import { DocumentTemplatesPageView } from "@/components/document-templates/document-templates-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Biblioteca de Modelos",
  description: "Modelos narrativos reutilizáveis para evolução clínica.",
};

export default async function DocumentTemplatesPage() {
  await requirePermission(PERMISSIONS.DOCUMENT_TEMPLATES_MANAGE);

  const result = await listDocumentTemplatesAction();

  return (
    <DocumentTemplatesPageView
      templates={result.success ? (result.data?.templates ?? []) : []}
      error={result.success ? undefined : result.error}
    />
  );
}
