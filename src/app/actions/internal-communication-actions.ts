"use server";

import { requirePermission } from "@/lib/auth-guard";
import { mapAgendaEventToDailyAppointment } from "@/lib/agenda-events";
import type { DailyAppointment } from "@/lib/agenda-types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  InternalMessageRow,
  InternalNotificationRow,
} from "@/lib/supabase/database.types";
import {
  isUserOnline,
  type OnlineProfessional,
} from "@/lib/internal-communication";
import { validateAgendaAppointmentSlot } from "@/lib/agenda-conflict-server";
import { resolveQueueNumberForAppointment } from "@/lib/reception-panel-queue";
import { CLINICAL_ROLES, PERMISSIONS } from "@/lib/rbac";

import type { AppointmentConflictType } from "@/lib/agenda-conflicts";

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | {
      success: false;
      error: string;
      conflictType?: AppointmentConflictType;
    };

export type SyncAgendaStatusInput = {
  appointmentId: string;
  patientName: string;
  professionalName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: "confirmado" | "agendado" | "em_espera" | "chamado" | "cancelado";
};

async function resolveProfessionalUserId(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  professionalName: string
) {
  const { data } = await supabase
    .from("user_profiles")
    .select("id, full_name")
    .in("profile", [...CLINICAL_ROLES])
    .ilike("full_name", professionalName)
    .maybeSingle();

  return data?.id ?? null;
}

export async function syncAgendaStatusAction(
  input: SyncAgendaStatusInput
): Promise<ActionResult<{ appointment?: DailyAppointment }>> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const professionalUserId = await resolveProfessionalUserId(
    supabase,
    input.professionalName
  );

  if (input.status !== "cancelado") {
    try {
      const conflict = await validateAgendaAppointmentSlot(supabase, {
        id: input.appointmentId,
        patientName: input.patientName,
        professionalName: input.professionalName,
        professionalUserId,
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
  }

  const payload = {
    id: input.appointmentId,
    patient_name: input.patientName,
    professional_name: input.professionalName,
    professional_user_id: professionalUserId,
    event_date: input.eventDate,
    start_time: input.startTime,
    end_time: input.endTime,
    status: input.status,
    updated_at: new Date().toISOString(),
  };

  if (input.status === "em_espera") {
    try {
      const queueNumber = await resolveQueueNumberForAppointment(
        supabase,
        input.eventDate,
        input.appointmentId
      );

      Object.assign(payload, { queue_number: queueNumber });
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível gerar a senha.",
      };
    }
  }

  const { data, error } = await supabase
    .from("agenda_events")
    .upsert(payload, {
      onConflict: "id",
    })
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

export async function sendInternalMessageAction(
  receiverId: string,
  content: string
): Promise<ActionResult<{ message: InternalMessageRow }>> {
  await requirePermission(PERMISSIONS.INTERNAL_MESSAGING);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Sessão inválida." };
  }

  const trimmedContent = content.trim();

  if (!trimmedContent) {
    return { success: false, error: "A mensagem não pode estar vazia." };
  }

  const { data, error } = await supabase
    .from("internal_messages")
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: trimmedContent,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Falha ao enviar mensagem." };
  }

  return { success: true, data: { message: data } };
}

export async function listNotificationsAction(): Promise<
  ActionResult<{ notifications: InternalNotificationRow[] }>
> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Sessão inválida." };
  }

  const { data, error } = await supabase
    .from("internal_notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { notifications: data ?? [] } };
}

export async function listMessagesAction(): Promise<
  ActionResult<{ messages: InternalMessageRow[] }>
> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Sessão inválida." };
  }

  const { data, error } = await supabase
    .from("internal_messages")
    .select("*")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { messages: data ?? [] } };
}

export async function listOnlineProfessionalsAction(): Promise<
  ActionResult<{ professionals: OnlineProfessional[] }>
> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("id, full_name, profile")
    .in("profile", [...CLINICAL_ROLES])
    .order("full_name");

  if (profilesError) {
    return { success: false, error: profilesError.message };
  }

  const { data: presenceRows, error: presenceError } = await supabase
    .from("user_presence")
    .select("user_id, last_seen_at");

  if (presenceError) {
    return { success: false, error: presenceError.message };
  }

  const presenceByUserId = new Map(
    (presenceRows ?? []).map((row) => [row.user_id, row.last_seen_at])
  );

  const professionals: OnlineProfessional[] = (profiles ?? []).map(
    (profile) => {
      const lastSeenAt =
        presenceByUserId.get(profile.id) ?? new Date(0).toISOString();

      return {
        id: profile.id,
        fullName: profile.full_name,
        profile: profile.profile,
        lastSeenAt,
        isOnline: isUserOnline(lastSeenAt),
      };
    }
  );

  professionals.sort((a, b) => {
    if (a.isOnline !== b.isOnline) {
      return a.isOnline ? -1 : 1;
    }

    return a.fullName.localeCompare(b.fullName, "pt-BR");
  });

  return { success: true, data: { professionals } };
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("internal_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

export async function markMessageReadAction(
  messageId: string
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("internal_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId)
    .is("read_at", null);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}

export async function updatePresenceAction(): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Sessão inválida." };
  }

  const now = new Date().toISOString();

  const { error } = await supabase.from("user_presence").upsert(
    {
      user_id: user.id,
      last_seen_at: now,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: undefined };
}
