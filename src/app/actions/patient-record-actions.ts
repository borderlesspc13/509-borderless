"use server";

import { requirePermission } from "@/lib/auth-guard";
import { requireServerUserSession } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AgendaEventRow,
  ClinicalEvolutionRecordRow,
  ConventionalEvolutionRecordRow,
  EvaluationRow,
  HomeActivityRow,
  ParentOrientationRow,
  PatientDocumentRow,
  PatientRow,
  ProgramRow,
  TherapeuticPlanRow,
} from "@/lib/supabase/database.types";
import {
  buildPatientTimeline,
  type PatientTimelineItem,
} from "@/lib/patient-timeline";
import {
  buildPatientDocumentStoragePath,
  CLINICAL_FILES_BUCKET,
  PATIENT_DOCUMENT_ALLOWED_MIME_TYPES,
  PATIENT_DOCUMENT_MAX_BYTES,
} from "@/lib/clinical-files";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type PatientRecordData = {
  patient: PatientRow;
  evolutions: ClinicalEvolutionRecordRow[];
  conventionalEvolutions: ConventionalEvolutionRecordRow[];
  evaluations: EvaluationRow[];
  therapeuticPlans: TherapeuticPlanRow[];
  documents: PatientDocumentRow[];
  attendances: AgendaEventRow[];
  homeActivities: HomeActivityRow[];
  parentOrientations: ParentOrientationRow[];
  programs: ProgramRow[];
  timeline: PatientTimelineItem[];
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

export type PatientFormInput = {
  fullName: string;
  cpf?: string;
  guardianName?: string;
  guardianName2?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  diagnosis?: string;
  birthDate?: string;
  notes?: string;
  zipCode?: string;
  state?: string;
  city?: string;
  street?: string;
  neighborhood?: string;
  addressComplement?: string;
  gender?: string;
  maritalStatus?: string;
  rg?: string;
  rgIssuer?: string;
  profession?: string;
  website?: string;
  birthplace?: string;
  contact?: string;
  phone?: string;
  healthPlan?: string;
  healthPlanIdentifier?: string;
  supportLevel?: string;
};

export type UpdatePatientInput = PatientFormInput & {
  patientId: string;
};

function normalizeOptionalText(value: string | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function validatePatientFormInput(input: PatientFormInput) {
  const fullName = input.fullName.trim();

  if (!fullName) {
    return { error: "Informe o nome do aprendiz." as const };
  }

  const guardianEmail = normalizeOptionalText(input.guardianEmail);

  if (guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail)) {
    return { error: "Informe um e-mail válido." as const };
  }

  return {
    fullName,
    cpf: normalizeOptionalText(input.cpf),
    guardianName: normalizeOptionalText(input.guardianName),
    guardianName2: normalizeOptionalText(input.guardianName2),
    guardianPhone: normalizeOptionalText(input.guardianPhone),
    guardianEmail,
    diagnosis: normalizeOptionalText(input.diagnosis),
    birthDate: normalizeOptionalText(input.birthDate),
    notes: normalizeOptionalText(input.notes),
    zipCode: normalizeOptionalText(input.zipCode),
    state: normalizeOptionalText(input.state),
    city: normalizeOptionalText(input.city),
    street: normalizeOptionalText(input.street),
    neighborhood: normalizeOptionalText(input.neighborhood),
    addressComplement: normalizeOptionalText(input.addressComplement),
    gender: normalizeOptionalText(input.gender),
    maritalStatus: normalizeOptionalText(input.maritalStatus),
    rg: normalizeOptionalText(input.rg),
    rgIssuer: normalizeOptionalText(input.rgIssuer),
    profession: normalizeOptionalText(input.profession),
    website: normalizeOptionalText(input.website),
    birthplace: normalizeOptionalText(input.birthplace),
    contact: normalizeOptionalText(input.contact),
    phone: normalizeOptionalText(input.phone),
    healthPlan: normalizeOptionalText(input.healthPlan),
    healthPlanIdentifier: normalizeOptionalText(input.healthPlanIdentifier),
    supportLevel: normalizeOptionalText(input.supportLevel),
  };
}

function toPatientRecord(
  validated: Exclude<ReturnType<typeof validatePatientFormInput>, { error: string }>
) {
  return {
    full_name: validated.fullName,
    cpf: validated.cpf,
    guardian_name: validated.guardianName,
    guardian_name_2: validated.guardianName2,
    guardian_phone: validated.guardianPhone,
    guardian_email: validated.guardianEmail,
    diagnosis: validated.diagnosis,
    birth_date: validated.birthDate,
    notes: validated.notes,
    zip_code: validated.zipCode,
    state: validated.state,
    city: validated.city,
    street: validated.street,
    neighborhood: validated.neighborhood,
    address_complement: validated.addressComplement,
    gender: validated.gender,
    marital_status: validated.maritalStatus,
    rg: validated.rg,
    rg_issuer: validated.rgIssuer,
    profession: validated.profession,
    website: validated.website,
    birthplace: validated.birthplace,
    contact: validated.contact,
    phone: validated.phone,
    health_plan: validated.healthPlan,
    health_plan_identifier: validated.healthPlanIdentifier,
    support_level: validated.supportLevel,
  };
}

export async function createPatientAction(
  input: PatientFormInput
): Promise<ActionResult<{ patient: PatientRow }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const validated = validatePatientFormInput(input);

  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("patients")
    .insert({
      ...toPatientRecord(validated),
      status: "active",
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error:
        error.code === "42501"
          ? "Sem permissão para cadastrar aprendizes."
          : error.message,
    };
  }

  return { success: true, data: { patient: data } };
}

export async function updatePatientAction(
  input: UpdatePatientInput
): Promise<ActionResult<{ patient: PatientRow }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const validated = validatePatientFormInput(input);

  if ("error" in validated) {
    return { success: false, error: validated.error };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("patients")
    .update({
      ...toPatientRecord(validated),
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
    conventionalEvolutionsResult,
    evaluationsResult,
    plansResult,
    documentsResult,
    attendancesResult,
    homeActivitiesResult,
    parentOrientationsResult,
    programsResult,
  ] = await Promise.all([
    supabase
      .from("clinical_evolution_records")
      .select("*")
      .eq("patient_id", patientId)
      .order("session_date", { ascending: false }),
    supabase
      .from("conventional_evolution_records")
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
      .limit(100),
    supabase
      .from("home_activities")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("parent_orientations")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("programs")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false }),
  ]);

  if (evolutionsResult.error) {
    return { success: false, error: evolutionsResult.error.message };
  }

  if (conventionalEvolutionsResult.error) {
    return {
      success: false,
      error: conventionalEvolutionsResult.error.message,
    };
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

  if (homeActivitiesResult.error) {
    return { success: false, error: homeActivitiesResult.error.message };
  }

  if (parentOrientationsResult.error) {
    return { success: false, error: parentOrientationsResult.error.message };
  }

  if (programsResult.error) {
    return { success: false, error: programsResult.error.message };
  }

  const evolutions = evolutionsResult.data ?? [];
  const conventionalEvolutions = conventionalEvolutionsResult.data ?? [];
  const evaluations = evaluationsResult.data ?? [];
  const therapeuticPlans = plansResult.data ?? [];
  const documents = documentsResult.data ?? [];
  const attendances = attendancesResult.data ?? [];
  const homeActivities = homeActivitiesResult.data ?? [];
  const parentOrientations = parentOrientationsResult.data ?? [];
  const programs = programsResult.data ?? [];

  return {
    success: true,
    data: {
      patient,
      evolutions,
      conventionalEvolutions,
      evaluations,
      therapeuticPlans,
      documents,
      attendances,
      homeActivities,
      parentOrientations,
      programs,
      timeline: buildPatientTimeline({
        attendances,
        evolutions,
        conventionalEvolutions,
        evaluations,
        therapeuticPlans,
        documents,
        homeActivities,
        parentOrientations,
        programs,
      }),
    },
  };
}

export type UploadPatientDocumentInput = {
  patientId: string;
  title: string;
  documentType: string;
  notes?: string;
};

export async function uploadPatientDocumentAction(
  input: UploadPatientDocumentInput,
  formData: FormData
): Promise<ActionResult<{ document: PatientDocumentRow }>> {
  const session = await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const title = input.title.trim();
  const documentType = input.documentType.trim() || "anexo";
  const file = formData.get("file");

  if (!title) {
    return { success: false, error: "Informe o título do documento." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Selecione um arquivo válido." };
  }

  if (file.size > PATIENT_DOCUMENT_MAX_BYTES) {
    return {
      success: false,
      error: "O arquivo deve ter no máximo 10 MB.",
    };
  }

  if (
    file.type &&
    !PATIENT_DOCUMENT_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof PATIENT_DOCUMENT_ALLOWED_MIME_TYPES)[number]
    )
  ) {
    return {
      success: false,
      error: "Formato não suportado. Use PDF, imagem ou documento Office.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const storagePath = buildPatientDocumentStoragePath(
    input.patientId,
    file.name
  );
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(CLINICAL_FILES_BUCKET)
    .upload(storagePath, fileBuffer, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(CLINICAL_FILES_BUCKET).getPublicUrl(storagePath);

  const notes = input.notes?.trim() ? input.notes.trim() : null;

  const { data, error } = await supabase
    .from("patient_documents")
    .insert({
      patient_id: input.patientId,
      title,
      document_type: documentType,
      file_url: publicUrl,
      notes,
      uploaded_by: session.fullName,
    })
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { document: data } };
}

export async function deletePatientDocumentAction(
  documentId: string
): Promise<ActionResult<{ deleted: true }>> {
  await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("patient_documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { deleted: true } };
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
