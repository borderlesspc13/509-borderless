"use server";

import { requirePermission } from "@/lib/auth-guard";
import type { AssessmentTemplateDetails } from "@/lib/assessment-format";
import { buildAssessmentSortCode } from "@/lib/assessment-format";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AssessmentLevelRow,
  AssessmentScoreGroupRow,
  AssessmentScoreRow,
  AssessmentSkillRow,
  AssessmentTemplateRow,
} from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

function normalizeOptionalText(value: string | undefined) {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

export async function listAssessmentTemplatesAction(): Promise<
  ActionResult<{ templates: AssessmentTemplateRow[] }>
> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("assessment_templates")
    .select("*")
    .order("name");

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { templates: data ?? [] } };
}

export async function getAssessmentTemplateAction(
  templateId: string
): Promise<ActionResult<AssessmentTemplateDetails>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: template, error: templateError } = await supabase
    .from("assessment_templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();

  if (templateError) {
    return { success: false, error: templateError.message };
  }

  if (!template) {
    return { success: false, error: "Avaliação não encontrada." };
  }

  const [levelsResult, skillsResult, groupsResult, scoresResult] =
    await Promise.all([
      supabase
        .from("assessment_levels")
        .select("*")
        .eq("template_id", templateId)
        .order("sort_order"),
      supabase
        .from("assessment_skills")
        .select("*")
        .eq("template_id", templateId)
        .order("sort_order"),
      supabase
        .from("assessment_score_groups")
        .select("*")
        .eq("template_id", templateId)
        .order("sort_order"),
      supabase
        .from("assessment_scores")
        .select("*")
        .eq("template_id", templateId)
        .order("sort_order"),
    ]);

  if (levelsResult.error) {
    return { success: false, error: levelsResult.error.message };
  }

  if (skillsResult.error) {
    return { success: false, error: skillsResult.error.message };
  }

  if (groupsResult.error) {
    return { success: false, error: groupsResult.error.message };
  }

  if (scoresResult.error) {
    return { success: false, error: scoresResult.error.message };
  }

  return {
    success: true,
    data: {
      template,
      levels: levelsResult.data ?? [],
      skills: skillsResult.data ?? [],
      scoreGroups: groupsResult.data ?? [],
      scores: scoresResult.data ?? [],
    },
  };
}

export type SaveAssessmentTemplateInput = {
  templateId?: string;
  name: string;
  description?: string;
  evaluationType: AssessmentTemplateRow["evaluation_type"];
};

export async function saveAssessmentTemplateAction(
  input: SaveAssessmentTemplateInput
): Promise<ActionResult<{ template: AssessmentTemplateRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const name = input.name.trim();

  if (!name) {
    return { success: false, error: "Informe o nome da avaliação." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    name,
    description: normalizeOptionalText(input.description),
    evaluation_type: input.evaluationType,
    updated_at: new Date().toISOString(),
  };

  if (input.templateId) {
    const { data, error } = await supabase
      .from("assessment_templates")
      .update(payload)
      .eq("id", input.templateId)
      .select("*")
      .single();

    if (error) {
      return {
        success: false,
        error:
          error.code === "42501"
            ? "Sem permissão para editar avaliações."
            : error.message,
      };
    }

    return { success: true, data: { template: data } };
  }

  const { data, error } = await supabase
    .from("assessment_templates")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error:
        error.code === "42501"
          ? "Sem permissão para cadastrar avaliações."
          : error.message,
    };
  }

  return { success: true, data: { template: data } };
}

export async function toggleAssessmentTemplateStatusAction(
  templateId: string
): Promise<ActionResult<{ template: AssessmentTemplateRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: current, error: fetchError } = await supabase
    .from("assessment_templates")
    .select("status")
    .eq("id", templateId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!current) {
    return { success: false, error: "Avaliação não encontrada." };
  }

  const nextStatus = current.status === "active" ? "inactive" : "active";

  const { data, error } = await supabase
    .from("assessment_templates")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error:
        error.code === "42501"
          ? "Sem permissão para alterar o status."
          : error.message,
    };
  }

  return { success: true, data: { template: data } };
}

export type SaveAssessmentLevelInput = {
  templateId: string;
  levelId?: string;
  sortOrder: number;
  description: string;
  ageRange?: string;
};

export async function saveAssessmentLevelAction(
  input: SaveAssessmentLevelInput
): Promise<ActionResult<{ level: AssessmentLevelRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const description = input.description.trim();

  if (!description) {
    return { success: false, error: "Informe a descrição do nível." };
  }

  if (input.sortOrder <= 0) {
    return { success: false, error: "Informe uma ordem válida." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    template_id: input.templateId,
    code: buildAssessmentSortCode(input.sortOrder),
    sort_order: input.sortOrder,
    description,
    age_range: normalizeOptionalText(input.ageRange),
  };

  if (input.levelId) {
    const { data, error } = await supabase
      .from("assessment_levels")
      .update(payload)
      .eq("id", input.levelId)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { level: data } };
  }

  const { data, error } = await supabase
    .from("assessment_levels")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { level: data } };
}

export async function deleteAssessmentLevelAction(
  levelId: string
): Promise<ActionResult<void>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("assessment_levels")
    .delete()
    .eq("id", levelId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export type SaveAssessmentSkillInput = {
  templateId: string;
  skillId?: string;
  sortOrder: number;
  description: string;
};

export async function saveAssessmentSkillAction(
  input: SaveAssessmentSkillInput
): Promise<ActionResult<{ skill: AssessmentSkillRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const description = input.description.trim();

  if (!description) {
    return { success: false, error: "Informe a descrição da habilidade." };
  }

  if (input.sortOrder <= 0) {
    return { success: false, error: "Informe uma ordem válida." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    template_id: input.templateId,
    code: buildAssessmentSortCode(input.sortOrder),
    sort_order: input.sortOrder,
    description,
  };

  if (input.skillId) {
    const { data, error } = await supabase
      .from("assessment_skills")
      .update(payload)
      .eq("id", input.skillId)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { skill: data } };
  }

  const { data, error } = await supabase
    .from("assessment_skills")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { skill: data } };
}

export async function deleteAssessmentSkillAction(
  skillId: string
): Promise<ActionResult<void>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("assessment_skills")
    .delete()
    .eq("id", skillId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function createAssessmentScoreGroupAction(
  templateId: string
): Promise<ActionResult<{ group: AssessmentScoreGroupRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { count, error: countError } = await supabase
    .from("assessment_score_groups")
    .select("*", { count: "exact", head: true })
    .eq("template_id", templateId);

  if (countError) {
    return { success: false, error: countError.message };
  }

  const { data, error } = await supabase
    .from("assessment_score_groups")
    .insert({
      template_id: templateId,
      sort_order: (count ?? 0) + 1,
    })
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { group: data } };
}

export async function deleteAssessmentScoreGroupAction(
  groupId: string
): Promise<ActionResult<void>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("assessment_score_groups")
    .delete()
    .eq("id", groupId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export type SaveAssessmentScoreInput = {
  templateId: string;
  groupId: string;
  scoreId?: string;
  sortOrder: number;
  scoreType?: string;
  description: string;
  value?: number | null;
};

export async function saveAssessmentScoreAction(
  input: SaveAssessmentScoreInput
): Promise<ActionResult<{ score: AssessmentScoreRow }>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const description = input.description.trim();

  if (!description) {
    return { success: false, error: "Informe a descrição da pontuação." };
  }

  if (input.sortOrder <= 0) {
    return { success: false, error: "Informe uma ordem válida." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    template_id: input.templateId,
    group_id: input.groupId,
    code: buildAssessmentSortCode(input.sortOrder),
    sort_order: input.sortOrder,
    score_type: normalizeOptionalText(input.scoreType),
    description,
    value: input.value ?? null,
  };

  if (input.scoreId) {
    const { data, error } = await supabase
      .from("assessment_scores")
      .update(payload)
      .eq("id", input.scoreId)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { score: data } };
  }

  const { data, error } = await supabase
    .from("assessment_scores")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { score: data } };
}

export async function deleteAssessmentScoreAction(
  scoreId: string
): Promise<ActionResult<void>> {
  await requirePermission(PERMISSIONS.ASSESSMENTS_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("assessment_scores")
    .delete()
    .eq("id", scoreId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
