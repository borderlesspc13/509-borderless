"use server";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS, CLINICAL_ROLES } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProfessionalRole } from "@/lib/professionals-data";
import { PROFESSIONAL_ROLES } from "@/lib/professionals-data";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type AgendaSearchPatient = {
  id: string;
  fullName: string;
};

export type AgendaSearchProfessional = {
  id: string;
  fullName: string;
  professionalRole: ProfessionalRole | null;
};

function isProfessionalRole(value: string | null): value is ProfessionalRole {
  return (
    value !== null &&
    (PROFESSIONAL_ROLES as readonly string[]).includes(value)
  );
}

export async function searchAgendaPatientsAction(
  query: string
): Promise<ActionResult<{ patients: AgendaSearchPatient[] }>> {
  await requirePermission(PERMISSIONS.AGENDA_VIEW);

  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return { success: true, data: { patients: [] } };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("patients")
    .select("id, full_name")
    .ilike("full_name", `%${trimmed}%`)
    .order("full_name")
    .limit(20);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      patients: (data ?? []).map((patient) => ({
        id: patient.id,
        fullName: patient.full_name,
      })),
    },
  };
}

export async function searchAgendaProfessionalsAction(
  query: string
): Promise<ActionResult<{ professionals: AgendaSearchProfessional[] }>> {
  await requirePermission(PERMISSIONS.AGENDA_VIEW);

  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return { success: true, data: { professionals: [] } };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, full_name, professional_role")
    .eq("status", "active")
    .in("profile", [...CLINICAL_ROLES])
    .ilike("full_name", `%${trimmed}%`)
    .order("full_name")
    .limit(20);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      professionals: (data ?? []).map((professional) => ({
        id: professional.id,
        fullName: professional.full_name,
        professionalRole: isProfessionalRole(professional.professional_role)
          ? professional.professional_role
          : null,
      })),
    },
  };
}
