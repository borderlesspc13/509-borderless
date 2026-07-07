"use server";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PatientRow } from "@/lib/supabase/database.types";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

export type ProfessionalTeamPatient = {
  id: string;
  fullName: string;
  isAssigned: boolean;
};

export async function getProfessionalTeamAction(
  professionalId: string
): Promise<
  ActionResult<{
    patients: ProfessionalTeamPatient[];
    assignedCount: number;
  }>
> {
  await requirePermission(PERMISSIONS.PROFESSIONALS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const [patientsResult, assignmentsResult] = await Promise.all([
    supabase
      .from("patients")
      .select("id, full_name")
      .eq("status", "active")
      .order("full_name"),
    supabase
      .from("professional_patient_assignments")
      .select("patient_id")
      .eq("professional_id", professionalId),
  ]);

  if (patientsResult.error) {
    return { success: false, error: patientsResult.error.message };
  }

  if (assignmentsResult.error) {
    return { success: false, error: assignmentsResult.error.message };
  }

  const assignedPatientIds = new Set(
    (assignmentsResult.data ?? []).map((row) => row.patient_id)
  );

  const patients = (patientsResult.data ?? []).map((patient: Pick<PatientRow, "id" | "full_name">) => ({
    id: patient.id,
    fullName: patient.full_name,
    isAssigned: assignedPatientIds.has(patient.id),
  }));

  return {
    success: true,
    data: {
      patients,
      assignedCount: assignedPatientIds.size,
    },
  };
}

export async function saveProfessionalTeamAction(input: {
  professionalId: string;
  patientIds: string[];
}): Promise<ActionResult<{ assignedCount: number }>> {
  await requirePermission(PERMISSIONS.TEAM_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error: deleteError } = await supabase
    .from("professional_patient_assignments")
    .delete()
    .eq("professional_id", input.professionalId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  if (input.patientIds.length === 0) {
    return { success: true, data: { assignedCount: 0 } };
  }

  const rows = input.patientIds.map((patientId) => ({
    professional_id: input.professionalId,
    patient_id: patientId,
  }));

  const { error: insertError } = await supabase
    .from("professional_patient_assignments")
    .insert(rows);

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return {
    success: true,
    data: { assignedCount: input.patientIds.length },
  };
}
