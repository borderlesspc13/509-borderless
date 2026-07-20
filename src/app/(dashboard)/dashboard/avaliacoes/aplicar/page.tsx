import type { Metadata } from "next";

import { AvaliacoesAplicarPageView } from "@/components/assessments/avaliacoes-aplicar-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Avaliações — Aplicar",
  description: "Aplicação de instrumentos de avaliação ao paciente.",
};

export default async function AvaliacoesAplicarPage() {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  return <AvaliacoesAplicarPageView />;
}
