"use server";

import { getServerUserSession } from "@/lib/auth-server";
import { mapAgendaEventToDailyAppointment } from "@/lib/agenda-events";
import { canForceAppointment } from "@/lib/agenda-permissions";
import { validateAgendaAppointmentSlot } from "@/lib/agenda-conflict-server";
import type { AppointmentConflictType } from "@/lib/agenda-conflicts";
import {
  filterAvailableProfessionals,
  isValidTimeRange,
  type AvailabilitySearchParams,
  type AvailableProfessional,
} from "@/lib/agenda-availability";
import type { DailyAppointment } from "@/lib/agenda-types";
import type { CareType } from "@/lib/supabase/database.types";
import type { ProfessionalRole } from "@/lib/professionals-data";
import { CLINICAL_ROLES } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | {
      success: false;
      error: string;
      conflictType?: AppointmentConflictType;
    };

export type CreateAppointmentInput = {
  patientName: string;
  professionalName: string;
  professionalUserId?: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  force?: boolean;
  careType?: CareType;
};

export type UpdateAppointmentInput = CreateAppointmentInput & {
  appointmentId: string;
  status?: "confirmado" | "agendado" | "em_espera" | "chamado" | "cancelado";
};

export async function searchAvailableProfessionalsAction(
  input: AvailabilitySearchParams
): Promise<ActionResult<{ professionals: AvailableProfessional[] }>> {
  if (!isValidTimeRange(input.startTime, input.endTime)) {
    return {
      success: false,
      error: "O horário final deve ser posterior ao horário inicial.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: profileRows, error: profilesError } = await supabase
    .from("user_profiles")
    .select("id, full_name, professional_role")
    .eq("professional_role", input.role)
    .in("profile", [...CLINICAL_ROLES])
    .order("full_name");

  if (profilesError) {
    return { success: false, error: profilesError.message };
  }

  const professionals: AvailableProfessional[] = (profileRows ?? []).map(
    (row) => ({
      id: row.id,
      fullName: row.full_name,
      role: row.professional_role as ProfessionalRole,
      source: "database",
    })
  );

  const { data: eventRows, error: eventsError } = await supabase
    .from("agenda_events")
    .select(
      "professional_name, professional_user_id, start_time, end_time, status"
    )
    .eq("event_date", input.date)
    .neq("status", "cancelado");

  if (eventsError) {
    return { success: false, error: eventsError.message };
  }

  const busyEvents = (eventRows ?? []).map((event) => ({
    professionalName: event.professional_name,
    professionalUserId: event.professional_user_id,
    startTime: event.start_time,
    endTime: event.end_time,
  }));

  const availableProfessionals = filterAvailableProfessionals(
    professionals,
    busyEvents,
    {
      startTime: input.startTime,
      endTime: input.endTime,
    }
  );

  return {
    success: true,
    data: { professionals: availableProfessionals },
  };
}

async function resolveProfessionalUserId(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  professionalName: string,
  professionalUserId?: string | null
) {
  if (professionalUserId) {
    return professionalUserId;
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id")
    .ilike("full_name", professionalName)
    .in("profile", [...CLINICAL_ROLES])
    .maybeSingle();

  return profile?.id ?? null;
}

async function ensureNoAppointmentConflict(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  input: CreateAppointmentInput & { id?: string },
  force: boolean
): Promise<ActionResult> {
  if (force) {
    const session = await getServerUserSession();

    if (
      !session ||
      !canForceAppointment(session.profile, session.isMaster)
    ) {
      return {
        success: false,
        error: "Apenas administradores podem forçar agendamentos em conflito.",
      };
    }

    return { success: true };
  }

  try {
    const conflict = await validateAgendaAppointmentSlot(supabase, {
      id: input.id,
      patientName: input.patientName,
      professionalName: input.professionalName,
      professionalUserId: input.professionalUserId,
      eventDate: input.eventDate,
      startTime: input.startTime,
      endTime: input.endTime,
    });

    if (conflict) {
      return {
        success: false,
        error: conflict.message,
        conflictType: conflict.type,
      };
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível validar conflitos de agenda.",
    };
  }

  return { success: true };
}

export async function createAppointmentAction(
  input: CreateAppointmentInput
): Promise<ActionResult<{ appointment: DailyAppointment }>> {
  const patientName = input.patientName.trim();

  if (!patientName) {
    return { success: false, error: "Informe o nome do paciente." };
  }

  if (!isValidTimeRange(input.startTime, input.endTime)) {
    return {
      success: false,
      error: "O horário final deve ser posterior ao horário inicial.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const conflictCheck = await ensureNoAppointmentConflict(
    supabase,
    { ...input, patientName },
    Boolean(input.force)
  );

  if (!conflictCheck.success) {
    return conflictCheck;
  }

  const professionalUserId = await resolveProfessionalUserId(
    supabase,
    input.professionalName,
    input.professionalUserId
  );

  const appointmentId = crypto.randomUUID();
  const now = new Date().toISOString();

  const payload = {
    id: appointmentId,
    patient_name: patientName,
    professional_name: input.professionalName,
    professional_user_id: professionalUserId,
    event_date: input.eventDate,
    start_time: input.startTime,
    end_time: input.endTime,
    status: "agendado" as const,
    care_type: input.careType ?? "ABA",
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("agenda_events")
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Falha ao criar agendamento." };
  }

  return {
    success: true,
    data: { appointment: mapAgendaEventToDailyAppointment(data) },
  };
}

export async function updateAppointmentAction(
  input: UpdateAppointmentInput
): Promise<ActionResult<{ appointment: DailyAppointment }>> {
  const patientName = input.patientName.trim();

  if (!patientName) {
    return { success: false, error: "Informe o nome do paciente." };
  }

  if (!isValidTimeRange(input.startTime, input.endTime)) {
    return {
      success: false,
      error: "O horário final deve ser posterior ao horário inicial.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const status = input.status ?? "agendado";

  if (status !== "cancelado") {
    const conflictCheck = await ensureNoAppointmentConflict(
      supabase,
      {
        ...input,
        id: input.appointmentId,
        patientName,
      },
      Boolean(input.force)
    );

    if (!conflictCheck.success) {
      return conflictCheck;
    }
  }

  const professionalUserId = await resolveProfessionalUserId(
    supabase,
    input.professionalName,
    input.professionalUserId
  );

  const { data, error } = await supabase
    .from("agenda_events")
    .update({
      patient_name: patientName,
      professional_name: input.professionalName,
      professional_user_id: professionalUserId,
      event_date: input.eventDate,
      start_time: input.startTime,
      end_time: input.endTime,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.appointmentId)
    .select()
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "Falha ao atualizar agendamento.",
    };
  }

  return {
    success: true,
    data: { appointment: mapAgendaEventToDailyAppointment(data) },
  };
}
