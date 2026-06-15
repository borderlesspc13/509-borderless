"use server";

import { requirePermission } from "@/lib/auth-guard";
import { requireServerUserSession } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AgendaEventRow,
  ClinicalEvolutionRecordRow,
  EvaluationRow,
  PatientDocumentRow,
  PatientRow,
  TherapeuticPlanRow,
} from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type PatientRecordData = {
  patient: PatientRow;
  evolutions: ClinicalEvolutionRecordRow[];
  evaluations: EvaluationRow[];
  therapeuticPlans: TherapeuticPlanRow[];
  documents: PatientDocumentRow[];
  attendances: AgendaEventRow[];
};

export async function listPatientsAction(): Promise<
  ActionResult<{ patients: PatientRow[] }>
> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("full_name");

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { patients: data ?? [] } };
}

export async function getPatientAction(
  patientId: string
): Promise<ActionResult<{ patient: PatientRow }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data) {
    return { success: false, error: "Paciente não encontrado." };
  }

  return { success: true, data: { patient: data } };
}

export type UpdatePatientInput = {
  patientId: string;
  fullName: string;
  cpf?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  diagnosis?: string;
  birthDate?: string;
  notes?: string;
};

function normalizeOptionalText(value: string | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

export async function updatePatientAction(
  input: UpdatePatientInput
): Promise<ActionResult<{ patient: PatientRow }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const fullName = input.fullName.trim();

  if (!fullName) {
    return { success: false, error: "Informe o nome do aprendiz." };
  }

  const guardianEmail = normalizeOptionalText(input.guardianEmail);

  if (guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail)) {
    return { success: false, error: "Informe um e-mail válido." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("patients")
    .update({
      full_name: fullName,
      cpf: normalizeOptionalText(input.cpf),
      guardian_name: normalizeOptionalText(input.guardianName),
      guardian_phone: normalizeOptionalText(input.guardianPhone),
      guardian_email: guardianEmail,
      diagnosis: normalizeOptionalText(input.diagnosis),
      birth_date: normalizeOptionalText(input.birthDate),
      notes: normalizeOptionalText(input.notes),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.patientId)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error:
        error.code === "42501"
          ? "Sem permissão para editar aprendizes."
          : error.message,
    };
  }

  return { success: true, data: { patient: data } };
}

export async function togglePatientStatusAction(
  patientId: string
): Promise<ActionResult<{ patient: PatientRow }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: currentPatient, error: fetchError } = await supabase
    .from("patients")
    .select("status")
    .eq("id", patientId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!currentPatient) {
    return { success: false, error: "Paciente não encontrado." };
  }

  const nextStatus =
    currentPatient.status === "active" ? "inactive" : "active";

  const { data, error } = await supabase
    .from("patients")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", patientId)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error:
        error.code === "42501"
          ? "Sem permissão para alterar o status do aprendiz."
          : error.message,
    };
  }

  return { success: true, data: { patient: data } };
}

export async function getPatientRecordAction(
  patientId: string
): Promise<ActionResult<PatientRecordData>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .maybeSingle();

  if (patientError) {
    return { success: false, error: patientError.message };
  }

  if (!patient) {
    return { success: false, error: "Paciente não encontrado." };
  }

  const [
    evolutionsResult,
    evaluationsResult,
    plansResult,
    documentsResult,
    attendancesResult,
  ] = await Promise.all([
    supabase
      .from("clinical_evolution_records")
      .select("*")
      .eq("patient_id", patientId)
      .order("session_date", { ascending: false }),
    supabase
      .from("evaluations")
      .select("*")
      .eq("patient_id", patientId)
      .order("evaluation_date", { ascending: false }),
    supabase
      .from("therapeutic_plans")
      .select("*")
      .eq("patient_id", patientId)
      .order("start_date", { ascending: false }),
    supabase
      .from("patient_documents")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("agenda_events")
      .select("*")
      .eq("patient_id", patientId)
      .order("event_date", { ascending: false })
      .limit(50),
  ]);

  if (evolutionsResult.error) {
    return { success: false, error: evolutionsResult.error.message };
  }

  if (evaluationsResult.error) {
    return { success: false, error: evaluationsResult.error.message };
  }

  if (plansResult.error) {
    return { success: false, error: plansResult.error.message };
  }

  if (documentsResult.error) {
    return { success: false, error: documentsResult.error.message };
  }

  if (attendancesResult.error) {
    return { success: false, error: attendancesResult.error.message };
  }

  return {
    success: true,
    data: {
      patient,
      evolutions: evolutionsResult.data ?? [],
      evaluations: evaluationsResult.data ?? [],
      therapeuticPlans: plansResult.data ?? [],
      documents: documentsResult.data ?? [],
      attendances: attendancesResult.data ?? [],
    },
  };
}

export type SavePatientEvolutionInput = {
  patientId: string;
  patientName: string;
  sessionDate: string;
  contentHtml: string;
  status?: "draft" | "finalized";
};

export async function savePatientEvolutionAction(
  input: SavePatientEvolutionInput
): Promise<ActionResult<{ record: ClinicalEvolutionRecordRow }>> {
  const session = await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_MANAGE);

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
    professional_name: session.fullName,
    professional_role: session.displayRole,
    professional_council: session.professionalCouncil,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("clinical_evolution_records")
    .upsert(payload, {
      onConflict: "patient_id,session_date,professional_name",
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { record: data } };
}

export async function loadPatientEvolutionAction(
  patientId: string,
  sessionDate: string
): Promise<ActionResult<{ record: ClinicalEvolutionRecordRow | null }>> {
  await requirePermission(PERMISSIONS.CLINICAL_EVOLUTION_VIEW);

  const session = await requireServerUserSession();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("clinical_evolution_records")
    .select("*")
    .eq("patient_id", patientId)
    .eq("session_date", sessionDate)
    .eq("professional_name", session.fullName)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { record: data } };
}
