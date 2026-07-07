"use server";

import { requireFamilySession, requirePermission } from "@/lib/auth-guard";
import { requireServerUserSession } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { HomeActivityRow } from "@/lib/supabase/database.types";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type HomeActivity = {
  id: string;
  patientId: string;
  title: string;
  description: string;
  instructions: string | null;
  createdByName: string;
  isPublished: boolean;
  dueDate: string | null;
  dueDateLabel: string | null;
  createdAt: string;
  createdAtLabel: string;
};

function formatActivityDate(isoDate: string | null) {
  if (!isoDate) {
    return null;
  }

  return new Date(isoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapHomeActivity(row: HomeActivityRow): HomeActivity {
  return {
    id: row.id,
    patientId: row.patient_id,
    title: row.title,
    description: row.description,
    instructions: row.instructions,
    createdByName: row.created_by_name,
    isPublished: row.is_published,
    dueDate: row.due_date,
    dueDateLabel: formatActivityDate(row.due_date),
    createdAt: row.created_at,
    createdAtLabel: formatActivityDate(row.created_at) ?? "—",
  };
}

export async function listHomeActivitiesAction(
  patientId: string
): Promise<ActionResult<{ activities: HomeActivity[] }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("home_activities")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: { activities: (data ?? []).map(mapHomeActivity) },
  };
}

export async function listFamilyHomeActivitiesAction(): Promise<
  ActionResult<{ activities: HomeActivity[] }>
> {
  const session = await requireFamilySession();
  const patientId = session.patientId;

  if (!patientId) {
    return { success: false, error: "Paciente não vinculado ao perfil." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("home_activities")
    .select("*")
    .eq("patient_id", patientId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: { activities: (data ?? []).map(mapHomeActivity) },
  };
}

export type SaveHomeActivityInput = {
  id?: string;
  patientId: string;
  title: string;
  description: string;
  instructions?: string;
  isPublished?: boolean;
  dueDate?: string;
};

export async function saveHomeActivityAction(
  input: SaveHomeActivityInput
): Promise<ActionResult<{ activity: HomeActivity }>> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_MANAGE);

  const title = input.title.trim();
  const description = input.description.trim();

  if (!title || !description) {
    return {
      success: false,
      error: "Informe o título e a descrição da atividade.",
    };
  }

  const session = await requireServerUserSession();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    patient_id: input.patientId,
    title,
    description,
    instructions: input.instructions?.trim() || null,
    is_published: input.isPublished ?? true,
    due_date: input.dueDate?.trim() || null,
    created_by_name: session.fullName,
    created_by_user_id: session.id,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("home_activities")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { activity: mapHomeActivity(data) } };
  }

  const { data, error } = await supabase
    .from("home_activities")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { activity: mapHomeActivity(data) } };
}

export async function deleteHomeActivityAction(
  activityId: string
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("home_activities")
    .delete()
    .eq("id", activityId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
