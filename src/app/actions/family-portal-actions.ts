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
  FamilyPortalNoticeRow,
  ParentOrientationRow,
  PatientRow,
} from "@/lib/supabase/database.types";

export type FamilyPortalNotice = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  createdAtLabel: string;
};

export type FamilyParentOrientation = {
  id: string;
  title: string;
  contentHtml: string;
  peiUrl: string | null;
  peiLabel: string | null;
  authorName: string;
  createdAt: string;
  createdAtLabel: string;
};

export type FamilyPortalHomeData = {
  patient: Pick<PatientRow, "id" | "full_name" | "diagnosis">;
  evolutionPoints: EvaluationEvolutionPoint[];
  scoreTrend: number | null;
  notices: FamilyPortalNotice[];
  homeActivities: HomeActivity[];
  parentOrientations: FamilyParentOrientation[];
};

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapNotice(notice: FamilyPortalNoticeRow): FamilyPortalNotice {
  return {
    id: notice.id,
    title: notice.title,
    content: notice.content,
    authorName: notice.author_name,
    createdAt: notice.created_at,
    createdAtLabel: formatDate(notice.created_at),
  };
}

function mapParentOrientation(
  row: ParentOrientationRow
): FamilyParentOrientation {
  return {
    id: row.id,
    title: row.title,
    contentHtml: row.content_html,
    peiUrl: row.pei_url,
    peiLabel: row.pei_label,
    authorName: row.author_name,
    createdAt: row.created_at,
    createdAtLabel: formatDate(row.created_at),
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
    dueDateLabel: row.due_date ? formatDate(row.due_date) : null,
    createdAt: row.created_at,
    createdAtLabel: formatDate(row.created_at),
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

  const [
    patientResult,
    evaluationsResult,
    noticesResult,
    activitiesResult,
    parentOrientationsResult,
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("id, full_name, diagnosis")
      .eq("id", patientId)
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
    supabase
      .from("parent_orientations")
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
    evolutionPoints,
    scoreTrend: calculateScoreTrend(evolutionPoints),
    notices: (noticesResult.data ?? []).map(mapNotice),
    homeActivities: (activitiesResult.data ?? []).map(mapHomeActivity),
    parentOrientations: (parentOrientationsResult.data ?? []).map(
      mapParentOrientation
    ),
  };
}
