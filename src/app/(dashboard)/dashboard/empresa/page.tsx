import type { Metadata } from "next";

import { getCompanyProfileAction } from "@/app/actions/company-actions";
import { AccessDeniedCard } from "@/components/auth/access-denied-card";
import { CompanyPageView } from "@/components/company/company-page-view";
import { requireAdmin } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Minha Empresa",
  description: "Cadastro e configurações da empresa.",
};

export default async function CompanyPage() {
  await requireAdmin();

  const result = await getCompanyProfileAction();

  if (!result.success || !result.data) {
    return (
      <AccessDeniedCard
        title="Empresa indisponível"
        description={result.success ? "Empresa não encontrada." : result.error}
      />
    );
  }

  return <CompanyPageView initialProfile={result.data} />;
}
