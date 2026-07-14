"use server";

import { revalidatePath } from "next/cache";

import { requireFamilySession } from "@/lib/auth-guard";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type FamilyAgendaEvent = {
  id: string;
  patientId: string;
  title: string;
  professionalName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: string;
  roomName: string | null;
};

export async function getFamilyPortalAgendaAction(): Promise<FamilyAgendaEvent[]> {
  const session = await requireFamilySession();
  const patientId = session.patientId;

  if (!patientId) return [];

  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("agenda_events")
    .select("id, patient_id, title, professional_name, event_date, start_time, end_time, status, room_name")
    .eq("patient_id", patientId)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    title: row.title,
    professionalName: row.professional_name,
    eventDate: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    roomName: row.room_name,
  }));
}

export async function updateFamilyPortalAgendaStatusAction(
  eventId: string,
  newStatus: "confirmado" | "cancelado"
) {
  const session = await requireFamilySession();
  const patientId = session.patientId;

  if (!patientId) {
    return { success: false, error: "Não autorizado." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Erro de conexão." };
  }

  // Verificar se o evento pertence ao paciente
  const { data: event, error: checkError } = await supabase
    .from("agenda_events")
    .select("id")
    .eq("id", eventId)
    .eq("patient_id", patientId)
    .single();

  if (checkError || !event) {
    return { success: false, error: "Agendamento não encontrado." };
  }

  const { error: updateError } = await supabase
    .from("agenda_events")
    .update({ status: newStatus })
    .eq("id", eventId);

  if (updateError) {
    return { success: false, error: "Falha ao atualizar o agendamento." };
  }

  revalidatePath("/portal-familia/agenda");
  return { success: true };
}
