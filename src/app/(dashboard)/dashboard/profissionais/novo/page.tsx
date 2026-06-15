import type { Metadata } from "next";

import { ProfessionalCreatePageView } from "@/components/team/professional-create-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Novo Profissional",
  description: "Cadastro de novo profissional da clínica.",
};

export default async function ProfessionalCreatePage() {
  await requirePermission(PERMISSIONS.TEAM_MANAGE);

  return <ProfessionalCreatePageView />;
}
