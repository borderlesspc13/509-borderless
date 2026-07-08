"use server";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ParentOrientationRow } from "@/lib/supabase/database.types";

export type SaveParentOrientationInput = {
  id?: string;
  patientId: string;
  title: string;
  contentHtml: string;
  peiUrl?: string | null;
  peiLabel?: string | null;
  isPublished?: boolean;
};

export type SaveParentOrientationResult = {
  success: boolean;
  error?: string;
  record?: ParentOrientationRow;
};

export type ListParentOrientationsResult = {
  success: boolean;
  error?: string;
  orientations: ParentOrientationRow[];
};

export async function saveParentOrientationAction(
  input: SaveParentOrientationInput
): Promise<SaveParentOrientationResult> {
  const session = await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const now = new Date().toISOString();

  if (input.id) {
    // Update existing
    const { data, error } = await supabase
      .from("parent_orientations")
      .update({
        title: input.title,
        content_html: input.contentHtml,
        pei_url: input.peiUrl ?? null,
        pei_label: input.peiLabel ?? null,
        is_published: input.isPublished ?? true,
        updated_at: now,
      })
      .eq("id", input.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, record: data };
  }

  // Insert new
  const { data, error } = await supabase
    .from("parent_orientations")
    .insert({
      patient_id: input.patientId,
      title: input.title,
      content_html: input.contentHtml,
      pei_url: input.peiUrl ?? null,
      pei_label: input.peiLabel ?? null,
      author_name: session.fullName,
      author_user_id: session.id,
      is_published: input.isPublished ?? true,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, record: data };
}

export async function listParentOrientationsAction(
  patientId: string
): Promise<ListParentOrientationsResult> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase não configurado.",
      orientations: [],
    };
  }

  const { data, error } = await supabase
    .from("parent_orientations")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return { success: false, error: error.message, orientations: [] };
  }

  return { success: true, orientations: data ?? [] };
}

export async function deleteParentOrientationAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("parent_orientations")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
