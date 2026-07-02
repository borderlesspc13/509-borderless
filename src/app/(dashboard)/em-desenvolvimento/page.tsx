import type { Metadata } from "next";

import { UnderDevelopmentPageView } from "@/components/layout/under-development-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Em desenvolvimento",
};

type UnderDevelopmentPageProps = {
  searchParams: Promise<{
    titulo?: string;
  }>;
};

export default async function UnderDevelopmentPage({
  searchParams,
}: UnderDevelopmentPageProps) {
  await requirePermission(PERMISSIONS.DASHBOARD_VIEW);

  const { titulo } = await searchParams;
  const title = titulo?.trim() || "Módulo";

  return <UnderDevelopmentPageView title={title} />;
}
