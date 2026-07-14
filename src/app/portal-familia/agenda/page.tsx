import type { Metadata } from "next";

import { getFamilyPortalAgendaAction } from "@/app/actions/family-portal-agenda-actions";
import { FamilyAgendaClient } from "@/components/family-portal/family-agenda-client";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Agenda - Portal da Família",
};

export default async function FamilyAgendaPage() {
  const events = await getFamilyPortalAgendaAction();

  return (
    <PageContainer size="base" className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Agenda de Sessões</h1>
        <p className="text-sm text-muted-foreground">
          Confira os próximos agendamentos e confirme a presença do aprendiz.
        </p>
      </div>

      <FamilyAgendaClient events={events} />
    </PageContainer>
  );
}
