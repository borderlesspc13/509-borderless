"use server";

import { mapAgendaEventToDailyAppointment } from "@/lib/agenda-events";
import { toDateKey } from "@/lib/calendar-utils";
import type { DailyAppointment } from "@/lib/agenda-types";
import { requirePermission } from "@/lib/auth-guard";
import {
  resolveQueueNumberForAppointment,
} from "@/lib/reception-panel-queue";
import {
  buildReceptionPanelData,
  type ReceptionPanelData,
} from "@/lib/reception-panel";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type CallPatientInput = {
  appointmentId: string;
  patientName: string;
  professionalName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  roomName: string;
  queueNumber?: number | null;
};

export async function getReceptionPanelDataAction(): Promise<
  ActionResult<ReceptionPanelData>
> {
  const supabase = await createServerSupabaseClient();
  const todayKey = toDateKey(new Date());

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("agenda_events")
    .select("*")
    .eq("event_date", todayKey)
    .in("status", ["em_espera", "chamado"])
    .order("called_at", { ascending: false, nullsFirst: false })
    .order("queue_number", { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  const appointments = (data ?? []).map(mapAgendaEventToDailyAppointment);

  return {
    success: true,
    data: buildReceptionPanelData(appointments, todayKey),
  };
}

export async function callPatientAction(
  input: CallPatientInput
): Promise<ActionResult<{ appointment: DailyAppointment }>> {
  await requirePermission(PERMISSIONS.AGENDA_MANAGE);

  const roomName = input.roomName.trim();

  if (!roomName) {
    return { success: false, error: "Informe a sala de atendimento." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: existingEvent, error: fetchError } = await supabase
    .from("agenda_events")
    .select("*")
    .eq("id", input.appointmentId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  let queueNumber = input.queueNumber ?? existingEvent?.queue_number ?? null;

  if (!queueNumber) {
    try {
      queueNumber = await resolveQueueNumberForAppointment(
        supabase,
        input.eventDate,
        input.appointmentId
      );
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível gerar a senha de atendimento.",
      };
    }
  }

  const now = new Date().toISOString();

  const payload = {
    id: input.appointmentId,
    patient_name: input.patientName,
    professional_name: input.professionalName,
    professional_user_id: existingEvent?.professional_user_id ?? null,
    patient_id: existingEvent?.patient_id ?? null,
    event_date: input.eventDate,
    start_time: input.startTime,
    end_time: input.endTime,
    status: "chamado" as const,
    queue_number: queueNumber,
    room_name: roomName,
    called_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("agenda_events")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: { appointment: mapAgendaEventToDailyAppointment(data) },
  };
}

export async function resolveQueueNumberForWaitingAction(
  eventDate: string,
  appointmentId: string
): Promise<ActionResult<{ queueNumber: number }>> {
  await requirePermission(PERMISSIONS.AGENDA_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: existingEvent, error: fetchError } = await supabase
    .from("agenda_events")
    .select("queue_number")
    .eq("id", appointmentId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  try {
    const queueNumber = await resolveQueueNumberForAppointment(
      supabase,
      eventDate,
      appointmentId
    );

    return { success: true, data: { queueNumber } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível gerar a senha de atendimento.",
    };
  }
}
