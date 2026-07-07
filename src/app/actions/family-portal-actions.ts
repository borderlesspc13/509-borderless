"use server";

import type { HomeActivity } from "@/app/actions/home-activity-actions";
import { requireFamilySession } from "@/lib/auth-guard";
import {
  buildEvolutionSeries,
  calculateScoreTrend,
  formatEvaluationDateLabel,
  type EvaluationEvolutionPoint,
} from "@/lib/clinical-reports";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  ClinicalEvolutionRecordRow,
  FamilyPortalNoticeRow,
  PatientRow,
} from "@/lib/supabase/database.types";

export type FamilyPortalLastEvolution = {
  id: string;
  sessionDate: string;
  sessionDateLabel: string;
  professionalName: string;
  professionalRole: string;
  contentHtml: string;
};

export type FamilyPortalNotice = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  createdAtLabel: string;
};

export type FamilyPortalHomeData = {
  patient: Pick<PatientRow, "id" | "full_name" | "diagnosis">;
  lastEvolution: FamilyPortalLastEvolution | null;
  evolutionPoints: EvaluationEvolutionPoint[];
  scoreTrend: number | null;
  notices: FamilyPortalNotice[];
  homeActivities: HomeActivity[];
};

function formatNoticeDate(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapLastEvolution(
  record: ClinicalEvolutionRecordRow
): FamilyPortalLastEvolution {
  return {
    id: record.id,
    sessionDate: record.session_date,
    sessionDateLabel: formatEvaluationDateLabel(record.session_date),
    professionalName: record.professional_name,
    professionalRole: record.professional_role,
    contentHtml: record.content_html,
  };
}

function mapNotice(notice: FamilyPortalNoticeRow): FamilyPortalNotice {
  return {
    id: notice.id,
    title: notice.title,
    content: notice.content,
    authorName: notice.author_name,
    createdAt: notice.created_at,
    createdAtLabel: formatNoticeDate(notice.created_at),
  };
}

function mapHomeActivity(row: {
  id: string;
  patient_id: string;
  title: string;
  description: string;
  instructions: string | null;
  created_by_name: string;
  is_published: boolean;
  due_date: string | null;
  created_at: string;
}): HomeActivity {
  return {
    id: row.id,
    patientId: row.patient_id,
    title: row.title,
    description: row.description,
    instructions: row.instructions,
    createdByName: row.created_by_name,
    isPublished: row.is_published,
    dueDate: row.due_date,
    dueDateLabel: row.due_date ? formatNoticeDate(row.due_date) : null,
    createdAt: row.created_at,
    createdAtLabel: formatNoticeDate(row.created_at),
  };
}

export async function getFamilyPortalHomeDataAction(): Promise<FamilyPortalHomeData | null> {
  const session = await requireFamilySession();
  const patientId = session.patientId;

  if (!patientId) {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const [patientResult, evolutionResult, evaluationsResult, noticesResult, activitiesResult] =
    await Promise.all([
      supabase
        .from("patients")
        .select("id, full_name, diagnosis")
        .eq("id", patientId)
        .maybeSingle(),
      supabase
        .from("clinical_evolution_records")
        .select("*")
        .eq("patient_id", patientId)
        .eq("status", "finalized")
        .order("session_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("evaluations")
        .select("id, evaluation_date, title, content_html, total_score")
        .eq("patient_id", patientId)
        .eq("status", "finalized")
        .order("evaluation_date", { ascending: true }),
      supabase
        .from("family_portal_notices")
        .select("*")
        .eq("patient_id", patientId)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("home_activities")
        .select("*")
        .eq("patient_id", patientId)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  if (patientResult.error || !patientResult.data) {
    return null;
  }

  const evolutionPoints = buildEvolutionSeries(evaluationsResult.data ?? []);

  return {
    patient: patientResult.data,
    lastEvolution: evolutionResult.data
      ? mapLastEvolution(evolutionResult.data)
      : null,
    evolutionPoints,
    scoreTrend: calculateScoreTrend(evolutionPoints),
    notices: (noticesResult.data ?? []).map(mapNotice),
    homeActivities: (activitiesResult.data ?? []).map(mapHomeActivity),
  };
}
