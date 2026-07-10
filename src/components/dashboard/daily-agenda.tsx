"use client";

import { AgendaCalendar } from "@/components/dashboard/agenda-calendar";
import type { CareType } from "@/lib/supabase/database.types";

type DailyAgendaProps = {
  careType?: CareType;
};

export function DailyAgenda({ careType = "ABA" }: DailyAgendaProps) {
  return <AgendaCalendar careType={careType} />;
}
