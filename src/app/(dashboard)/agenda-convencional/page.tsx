import type { Metadata } from "next";

import { AgendaPageView } from "@/components/dashboard/agenda-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Agenda Convencional",
  description:
    "Agenda dos atendimentos convencionais, separada do fluxo ABA.",
};

export default async function AgendaConvencionalPage() {
  await requirePermission(PERMISSIONS.AGENDA_VIEW);

  return <AgendaPageView careType="CONVENTIONAL" />;
}
