"use server";

import { mapAgendaEventToDailyAppointment, sortAppointments } from "@/lib/agenda-events";
import type { DailyAppointment } from "@/lib/agenda-types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function listAgendaEventsAction(): Promise<
  ActionResult<{ appointments: DailyAppointment[] }>
> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("agenda_events")
    .select("*")
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(500);

  if (error) {
    return { success: false, error: error.message };
  }

  const appointments = sortAppointments(
    (data ?? []).map(mapAgendaEventToDailyAppointment)
  );

  return { success: true, data: { appointments } };
}
