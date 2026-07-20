"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth-guard";
import { requireServerUserSession } from "@/lib/auth-server";
import type { BodyMarkType, BodyViewSide } from "@/lib/body-map-format";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  Database,
  PatientBodyMarkRow,
} from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type BodyMarkInput = {
  viewSide: BodyViewSide;
  xPct: number;
  yPct: number;
  markType: BodyMarkType;
  severity?: number | null;
  notes?: string | null;
  isActive?: boolean;
};

function clampPct(value: number) {
  return Math.min(100, Math.max(0, Number(value.toFixed(3))));
}

function revalidatePatientPaths(patientId: string) {
  revalidatePath(`/dashboard/pacientes/${patientId}/editar`);
  revalidatePath(`/paciente/${patientId}/prontuario`);
  revalidatePath("/dashboard/pacientes");
}

export async function listPatientBodyMarksAction(
  patientId: string,
  options?: { includeInactive?: boolean }
): Promise<ActionResult<{ marks: PatientBodyMarkRow[] }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Falha na conexão." };
  }

  let query = supabase
    .from("patient_body_marks")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: "Não foi possível carregar o mapa corporal." };
  }

  return { success: true, data: { marks: data ?? [] } };
}

export async function createPatientBodyMarkAction(
  patientId: string,
  input: BodyMarkInput
): Promise<ActionResult<{ mark: PatientBodyMarkRow }>> {
  const session = await requireServerUserSession();
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Falha na conexão." };
  }

  const { data, error } = await supabase
    .from("patient_body_marks")
    .insert({
      patient_id: patientId,
      view_side: input.viewSide,
      x_pct: clampPct(input.xPct),
      y_pct: clampPct(input.yPct),
      mark_type: input.markType,
      severity:
        input.markType === "pain" && input.severity != null
          ? Math.min(10, Math.max(0, Math.round(input.severity)))
          : null,
      notes: input.notes?.trim() || null,
      is_active: input.isActive ?? true,
      created_by: session.id,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Não foi possível salvar a marcação." };
  }

  revalidatePatientPaths(patientId);
  return { success: true, data: { mark: data } };
}

export async function createPatientBodyMarksBatchAction(
  patientId: string,
  marks: BodyMarkInput[]
): Promise<ActionResult<{ count: number }>> {
  if (marks.length === 0) {
    return { success: true, data: { count: 0 } };
  }

  const session = await requireServerUserSession();
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Falha na conexão." };
  }

  const rows = marks.map((input) => ({
    patient_id: patientId,
    view_side: input.viewSide,
    x_pct: clampPct(input.xPct),
    y_pct: clampPct(input.yPct),
    mark_type: input.markType,
    severity:
      input.markType === "pain" && input.severity != null
        ? Math.min(10, Math.max(0, Math.round(input.severity)))
        : null,
    notes: input.notes?.trim() || null,
    is_active: input.isActive ?? true,
    created_by: session.id,
  }));

  const { error } = await supabase.from("patient_body_marks").insert(rows);

  if (error) {
    return { success: false, error: "Não foi possível salvar as marcações." };
  }

  revalidatePatientPaths(patientId);
  return { success: true, data: { count: rows.length } };
}

export async function updatePatientBodyMarkAction(
  markId: string,
  patientId: string,
  input: Partial<BodyMarkInput> & { isActive?: boolean }
): Promise<ActionResult<{ mark: PatientBodyMarkRow }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Falha na conexão." };
  }

  const patch: Database["public"]["Tables"]["patient_body_marks"]["Update"] = {
    updated_at: new Date().toISOString(),
  };

  if (input.viewSide) patch.view_side = input.viewSide;
  if (input.xPct != null) patch.x_pct = clampPct(input.xPct);
  if (input.yPct != null) patch.y_pct = clampPct(input.yPct);
  if (input.markType) patch.mark_type = input.markType;
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null;
  if (input.isActive !== undefined) patch.is_active = input.isActive;
  if (input.severity !== undefined) {
    patch.severity =
      input.severity == null
        ? null
        : Math.min(10, Math.max(0, Math.round(input.severity)));
  }

  const { data, error } = await supabase
    .from("patient_body_marks")
    .update(patch)
    .eq("id", markId)
    .eq("patient_id", patientId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Não foi possível atualizar a marcação." };
  }

  revalidatePatientPaths(patientId);
  return { success: true, data: { mark: data } };
}

export async function deletePatientBodyMarkAction(
  markId: string,
  patientId: string
): Promise<ActionResult<{ id: string }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { success: false, error: "Falha na conexão." };
  }

  const { error } = await supabase
    .from("patient_body_marks")
    .delete()
    .eq("id", markId)
    .eq("patient_id", patientId);

  if (error) {
    return { success: false, error: "Não foi possível remover a marcação." };
  }

  revalidatePatientPaths(patientId);
  return { success: true, data: { id: markId } };
}
