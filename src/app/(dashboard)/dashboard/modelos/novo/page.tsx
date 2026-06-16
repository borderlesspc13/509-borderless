import type { Metadata } from "next";

import { DocumentTemplateForm } from "@/components/document-templates/document-template-form";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Novo modelo",
  description: "Cadastro de modelo narrativo.",
};

export default async function DocumentTemplateCreatePage() {
  await requirePermission(PERMISSIONS.DOCUMENT_TEMPLATES_MANAGE);

  return <DocumentTemplateForm />;
}
