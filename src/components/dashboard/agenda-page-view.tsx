"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Monitor } from "lucide-react";

import { AgendaIndividualFilter } from "@/components/dashboard/agenda-individual-filter";
import { DailyAgenda } from "@/components/dashboard/daily-agenda";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import type { AgendaIndividualFilter as AgendaIndividualFilterState } from "@/lib/agenda-individual-filter";
import type { CareType } from "@/lib/supabase/database.types";

type AgendaPageViewProps = {
  careType?: CareType;
};

export function AgendaPageView({ careType = "ABA" }: AgendaPageViewProps) {
  const [individualFilter, setIndividualFilter] =
    useState<AgendaIndividualFilterState | null>(null);

  const title =
    careType === "CONVENTIONAL" ? "Agenda Convencional" : "Agenda ABA";

  return (
    <PageContainer size="wide">
      <div className="space-y-4">
        <DashboardPageHeader
          title={title}
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: title },
          ]}
          actions={
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  href="/painel-chamada"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Monitor className="size-4" aria-hidden />
              Abrir painel da recepção
              <ExternalLink className="size-3.5 opacity-60" aria-hidden />
            </Button>
          }
        />

        <AgendaIndividualFilter
          filter={individualFilter}
          onFilterChange={setIndividualFilter}
        />
      </div>

      <div className="mt-5">
        <DailyAgenda individualFilter={individualFilter} careType={careType} />
      </div>
    </PageContainer>
  );
}
