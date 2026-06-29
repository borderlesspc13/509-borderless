"use client";

import { AgendaCalendar } from "@/components/dashboard/agenda-calendar";
import type { AgendaIndividualFilter } from "@/lib/agenda-individual-filter";

type DailyAgendaProps = {
  individualFilter?: AgendaIndividualFilter | null;
};

export function DailyAgenda({ individualFilter = null }: DailyAgendaProps) {
  return <AgendaCalendar individualFilter={individualFilter} />;
}
