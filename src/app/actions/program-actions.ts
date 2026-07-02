"use server";

import { requirePermission } from "@/lib/auth-guard";
import {
  DEFAULT_PROGRAM_CRITERIA,
  type ProgramDetails,
  type ProgramListItem,
  mapProgramListItem,
} from "@/lib/program-format";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  ProgramCriterionRow,
  ProgramFileRow,
  ProgramRow,
  ProgramTargetRow,
} from "@/lib/supabase/database.types";

type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

function normalizeOptionalText(value: string | undefined | null) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function normalizeOptionalNumber(value: number | string | undefined | null) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOptionalInteger(value: number | string | undefined | null) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);

  return Number.isFinite(parsed) ? parsed : null;
}

async function getProgramPatientName(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  patientId: string | null
) {
  if (!patientId) {
    return null;
  }

  const { data } = await supabase
    .from("patients")
    .select("full_name")
    .eq("id", patientId)
    .maybeSingle();

  return data?.full_name ?? null;
}

export async function listProgramsAction(): Promise<
  ActionResult<{ programs: ProgramListItem[] }>
> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("programs")
    .select("*, patients(full_name)")
    .order("name");

  if (error) {
    return { success: false, error: error.message };
  }

  const programs = (data ?? []).map((row) =>
    mapProgramListItem(
      row as ProgramRow,
      (row as ProgramRow & { patients?: { full_name: string } | null }).patients
        ?.full_name ?? null
    )
  );

  return { success: true, data: { programs } };
}

export async function getProgramDetailsAction(
  programId: string
): Promise<ActionResult<ProgramDetails>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select("*")
    .eq("id", programId)
    .maybeSingle();

  if (programError) {
    return { success: false, error: programError.message };
  }

  if (!program) {
    return { success: false, error: "Programa não encontrado." };
  }

  const [targetsResult, criteriaResult, filesResult, patientName] =
    await Promise.all([
      supabase
        .from("program_targets")
        .select("*")
        .eq("program_id", programId)
        .order("sort_order"),
      supabase
        .from("program_criteria")
        .select("*")
        .eq("program_id", programId)
        .order("position"),
      supabase
        .from("program_files")
        .select("*")
        .eq("program_id", programId)
        .order("created_at", { ascending: false }),
      getProgramPatientName(supabase, program.patient_id),
    ]);

  if (targetsResult.error) {
    return { success: false, error: targetsResult.error.message };
  }

  if (criteriaResult.error) {
    return { success: false, error: criteriaResult.error.message };
  }

  if (filesResult.error) {
    return { success: false, error: filesResult.error.message };
  }

  return {
    success: true,
    data: {
      program: program as ProgramRow,
      patientName,
      targets: (targetsResult.data ?? []) as ProgramTargetRow[],
      criteria: (criteriaResult.data ?? []) as ProgramCriterionRow[],
      files: (filesResult.data ?? []) as ProgramFileRow[],
    },
  };
}

export type SaveProgramGeneralInput = {
  programId?: string;
  name: string;
  registrationType: ProgramRow["registration_type"];
  protocol?: string;
  specialty?: string;
  skill?: string;
  milestoneCoding?: string;
  teachingType: string;
  targetsPerSession: number;
  attemptsPerTarget: number;
  patientId?: string;
  visibility?: ProgramRow["visibility"];
};

export async function saveProgramGeneralAction(
  input: SaveProgramGeneralInput
): Promise<ActionResult<{ program: ProgramRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const name = input.name.trim();

  if (!name) {
    return { success: false, error: "Informe o nome do programa." };
  }

  if (!input.teachingType.trim()) {
    return { success: false, error: "Selecione o tipo de ensino." };
  }

  if (input.registrationType === "learner" && !input.patientId) {
    return {
      success: false,
      error: "Selecione o aprendiz para programas de aprendiz.",
    };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    name,
    registration_type: input.registrationType,
    protocol: normalizeOptionalText(input.protocol),
    specialty: normalizeOptionalText(input.specialty),
    skill: normalizeOptionalText(input.skill),
    milestone_coding: normalizeOptionalText(input.milestoneCoding),
    teaching_type: input.teachingType.trim(),
    targets_per_session: input.targetsPerSession,
    attempts_per_target: input.attemptsPerTarget,
    patient_id:
      input.registrationType === "learner"
        ? input.patientId ?? null
        : null,
    visibility: input.visibility ?? "private",
    updated_at: new Date().toISOString(),
  };

  if (input.programId) {
    const { data, error } = await supabase
      .from("programs")
      .update(payload)
      .eq("id", input.programId)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Programa atualizado com sucesso.",
      data: { program: data as ProgramRow },
    };
  }

  const { data, error } = await supabase
    .from("programs")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  const program = data as ProgramRow;

  await supabase.from("program_criteria").insert(
    DEFAULT_PROGRAM_CRITERIA.map((criterion) => ({
      program_id: program.id,
      position: criterion.position,
      acronym: criterion.acronym,
      degree: criterion.degree,
    }))
  );

  return {
    success: true,
    message: "Programa criado com sucesso.",
    data: { program },
  };
}

export type SaveProgramInstructionsInput = {
  programId: string;
  teachingProcedure?: string;
  instructionSd?: string;
  objective?: string;
  hintStep?: string;
  correctionProcedure?: string;
  learningCriterion?: string;
  materialsUsed?: string;
  observations?: string;
};

export async function saveProgramInstructionsAction(
  input: SaveProgramInstructionsInput
): Promise<ActionResult<{ program: ProgramRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("programs")
    .update({
      teaching_procedure: normalizeOptionalText(input.teachingProcedure),
      instruction_sd: normalizeOptionalText(input.instructionSd),
      objective: normalizeOptionalText(input.objective),
      hint_step: normalizeOptionalText(input.hintStep),
      correction_procedure: normalizeOptionalText(input.correctionProcedure),
      learning_criterion: normalizeOptionalText(input.learningCriterion),
      materials_used: normalizeOptionalText(input.materialsUsed),
      observations: normalizeOptionalText(input.observations),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.programId)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Instruções salvas com sucesso.",
    data: { program: data as ProgramRow },
  };
}

export type SaveProgramEvolutionInput = {
  programId: string;
  evolutionPrimaryCorrectPct?: number | string;
  evolutionPrimarySessions?: number | string;
  evolutionSecondaryCorrectPct?: number | string;
  evolutionSecondarySessions?: number | string;
  correctionPrimaryIncorrectPct?: number | string;
  correctionPrimarySessions?: number | string;
  correctionSecondaryIncorrectPct?: number | string;
  correctionSecondarySessions?: number | string;
};

export async function saveProgramEvolutionAction(
  input: SaveProgramEvolutionInput
): Promise<ActionResult<{ program: ProgramRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("programs")
    .update({
      evolution_primary_correct_pct: normalizeOptionalNumber(
        input.evolutionPrimaryCorrectPct
      ),
      evolution_primary_sessions: normalizeOptionalInteger(
        input.evolutionPrimarySessions
      ),
      evolution_secondary_correct_pct: normalizeOptionalNumber(
        input.evolutionSecondaryCorrectPct
      ),
      evolution_secondary_sessions: normalizeOptionalInteger(
        input.evolutionSecondarySessions
      ),
      correction_primary_incorrect_pct: normalizeOptionalNumber(
        input.correctionPrimaryIncorrectPct
      ),
      correction_primary_sessions: normalizeOptionalInteger(
        input.correctionPrimarySessions
      ),
      correction_secondary_incorrect_pct: normalizeOptionalNumber(
        input.correctionSecondaryIncorrectPct
      ),
      correction_secondary_sessions: normalizeOptionalInteger(
        input.correctionSecondarySessions
      ),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.programId)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Parâmetros de evolução salvos com sucesso.",
    data: { program: data as ProgramRow },
  };
}

export type SaveProgramTargetInput = {
  programId: string;
  targetId?: string;
  targetGroup?: string;
  sortOrder?: number;
  targetName: string;
  situation?: ProgramTargetRow["situation"];
  startDate?: string;
  maintenances?: string;
  acquiredDate?: string;
};

export async function saveProgramTargetAction(
  input: SaveProgramTargetInput
): Promise<ActionResult<{ target: ProgramTargetRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const targetName = input.targetName.trim();

  if (!targetName) {
    return { success: false, error: "Informe o nome do alvo." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    program_id: input.programId,
    target_group: normalizeOptionalText(input.targetGroup),
    sort_order: input.sortOrder ?? 0,
    target_name: targetName,
    situation: input.situation ?? "active",
    start_date: normalizeOptionalText(input.startDate),
    maintenances: normalizeOptionalText(input.maintenances),
    acquired_date: normalizeOptionalText(input.acquiredDate),
    updated_at: new Date().toISOString(),
  };

  if (input.targetId) {
    const { data, error } = await supabase
      .from("program_targets")
      .update(payload)
      .eq("id", input.targetId)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { target: data as ProgramTargetRow } };
  }

  const { data, error } = await supabase
    .from("program_targets")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { target: data as ProgramTargetRow } };
}

export async function deleteProgramTargetAction(
  targetId: string
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("program_targets")
    .delete()
    .eq("id", targetId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Alvo removido com sucesso." };
}

export type SaveProgramCriterionInput = {
  programId: string;
  criterionId?: string;
  position: number;
  acronym?: string;
  degree: string;
};

export async function saveProgramCriterionAction(
  input: SaveProgramCriterionInput
): Promise<ActionResult<{ criterion: ProgramCriterionRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const degree = input.degree.trim();

  if (!degree) {
    return { success: false, error: "Informe o grau do critério." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    program_id: input.programId,
    position: input.position,
    acronym: normalizeOptionalText(input.acronym),
    degree,
    updated_at: new Date().toISOString(),
  };

  if (input.criterionId) {
    const { data, error } = await supabase
      .from("program_criteria")
      .update(payload)
      .eq("id", input.criterionId)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { criterion: data as ProgramCriterionRow } };
  }

  const { data, error } = await supabase
    .from("program_criteria")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { criterion: data as ProgramCriterionRow } };
}

export async function deleteProgramCriterionAction(
  criterionId: string
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("program_criteria")
    .delete()
    .eq("id", criterionId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Critério removido com sucesso." };
}

export async function uploadProgramFileAction(
  programId: string,
  formData: FormData
): Promise<ActionResult<{ file: ProgramFileRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Selecione um arquivo válido." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const extension = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase() ?? null
    : null;
  const storagePath = `program-files/${programId}/${Date.now()}-${file.name.replaceAll(/[^a-zA-Z0-9._-]/g, "_")}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("clinic-assets")
    .upload(storagePath, fileBuffer, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("clinic-assets").getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from("program_files")
    .insert({
      program_id: programId,
      file_name: file.name,
      file_extension: extension,
      file_size: file.size,
      file_url: publicUrl,
    })
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Arquivo enviado com sucesso.",
    data: { file: data as ProgramFileRow },
  };
}

export async function deleteProgramFileAction(
  fileId: string
): Promise<ActionResult> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("program_files")
    .delete()
    .eq("id", fileId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: "Arquivo removido com sucesso." };
}

export async function toggleProgramStatusAction(
  programId: string
): Promise<ActionResult<{ program: ProgramRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: current, error: fetchError } = await supabase
    .from("programs")
    .select("status")
    .eq("id", programId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!current) {
    return { success: false, error: "Programa não encontrado." };
  }

  const nextStatus = current.status === "active" ? "inactive" : "active";

  const { data, error } = await supabase
    .from("programs")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", programId)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { program: data as ProgramRow } };
}
