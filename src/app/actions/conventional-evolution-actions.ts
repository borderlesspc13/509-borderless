"use server";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ConventionalEvolutionRecordRow } from "@/lib/supabase/database.types";

export type SaveConventionalEvolutionInput = {
  patientId: string;
  patientName: string;
  sessionDate: string;
  contentHtml: string;
  professionalName: string;
  professionalRole: string;
  professionalCouncil?: string;
  status?: "draft" | "finalized";
};

export type SaveConventionalEvolutionResult = {
  success: boolean;
  error?: string;
  record?: ConventionalEvolutionRecordRow;
};

export type LoadConventionalEvolutionResult = {
  success: boolean;
  error?: string;
  record: ConventionalEvolutionRecordRow | null;
};

export type ListConventionalDraftsResult = {
  success: boolean;
  error?: string;
  drafts: ConventionalEvolutionRecordRow[];
};

export async function saveConventionalEvolutionAction(
  input: SaveConventionalEvolutionInput
): Promise<SaveConventionalEvolutionResult> {
  const session = await requirePermission(
    PERMISSIONS.CONVENTIONAL_EVOLUTION_MANAGE
  );

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    patient_id: input.patientId,
    patient_name: input.patientName,
    session_date: input.sessionDate,
    content_html: input.contentHtml,
    status: input.status ?? "draft",
    professional_id: session.id,
    professional_name: input.professionalName,
    professional_role: input.professionalRole,
    professional_council: input.professionalCouncil ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("conventional_evolution_records")
    .upsert(payload, {
      onConflict: "patient_id,session_date,professional_id",
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, record: data };
}

export async function loadConventionalEvolutionAction(
  patientId: string,
  sessionDate: string
): Promise<LoadConventionalEvolutionResult> {
  const session = await requirePermission(
    PERMISSIONS.CONVENTIONAL_EVOLUTION_VIEW
  );

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado.", record: null };
  }

  const { data, error } = await supabase
    .from("conventional_evolution_records")
    .select("*")
    .eq("patient_id", patientId)
    .eq("session_date", sessionDate)
    .eq("professional_id", session.id)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message, record: null };
  }

  return { success: true, record: data };
}

export async function listConventionalEvolutionDraftsAction(): Promise<ListConventionalDraftsResult> {
  const session = await requirePermission(
    PERMISSIONS.CONVENTIONAL_EVOLUTION_VIEW
  );

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado.", drafts: [] };
  }

  const { data, error } = await supabase
    .from("conventional_evolution_records")
    .select("*")
    .eq("professional_id", session.id)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) {
    return { success: false, error: error.message, drafts: [] };
  }

  return { success: true, drafts: data ?? [] };
}
