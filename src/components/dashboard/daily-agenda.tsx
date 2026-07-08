"use client";

import { AgendaCalendar } from "@/components/dashboard/agenda-calendar";
import type { AgendaIndividualFilter } from "@/lib/agenda-individual-filter";
import type { CareType } from "@/lib/supabase/database.types";

type DailyAgendaProps = {
  individualFilter?: AgendaIndividualFilter | null;
  careType?: CareType;
};

export function DailyAgenda({ individualFilter = null, careType = "ABA" }: DailyAgendaProps) {
  return <AgendaCalendar individualFilter={individualFilter} careType={careType} />;
}
