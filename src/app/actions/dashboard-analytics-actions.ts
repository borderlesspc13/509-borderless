"use server";

import { requirePermission } from "@/lib/auth-guard";
import {
  formatDurationLabel,
  getSessionDurationMinutes,
  groupEvaluationsByInstrument,
  groupSessionsByLearner,
  groupSessionsByProfessionalRole,
  groupSessionsByWeek,
  isActiveAgendaEvent,
} from "@/lib/dashboard-analytics";
import type {
  DashboardCurriculumFolder,
  DashboardLearnerOption,
  DashboardMetric,
  DashboardProfessionalOption,
  ProfessionalMetric,
  ProgramPerformance,
  SessionByLearner,
  SessionByWeek,
  SkillPerformance,
} from "@/lib/dashboard-analytics-types";
import { PERMISSIONS } from "@/lib/rbac";
import { CLINICAL_ROLES } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProfessionalRole } from "@/lib/professionals-data";
import { PROFESSIONAL_ROLES } from "@/lib/professionals-data";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type LearnerDashboardFilters = {
  startDate: string;
  endDate: string;
  learnerId: string;
  folderId: string;
};

export type ProfessionalDashboardFilters = {
  startDate: string;
  endDate: string;
  professionalUserId: string;
};

export type LearnerDashboardData = {
  learners: DashboardLearnerOption[];
  folders: DashboardCurriculumFolder[];
  metrics: DashboardMetric[];
  skillPerformance: SkillPerformance[];
  topPrograms: ProgramPerformance[];
  bottomPrograms: ProgramPerformance[];
};

export type ProfessionalDashboardData = {
  professionals: DashboardProfessionalOption[];
  metrics: ProfessionalMetric[];
  sessionsByLearner: SessionByLearner[];
  sessionsByWeek: SessionByWeek[];
};

function isProfessionalRole(value: string | null): value is ProfessionalRole {
  return (
    value !== null &&
    (PROFESSIONAL_ROLES as readonly string[]).includes(value)
  );
}

function filterAgendaEvents<T extends { event_date: string; status: string }>(
  events: T[],
  startDate: string,
  endDate: string
) {
  return events.filter(
    (event) =>
      isActiveAgendaEvent(event.status as never) &&
      event.event_date >= startDate &&
      event.event_date <= endDate
  );
}

export async function getLearnerDashboardDataAction(
  filters: LearnerDashboardFilters
): Promise<ActionResult<LearnerDashboardData>> {
  await requirePermission(PERMISSIONS.DASHBOARD_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const [
    patientsResult,
    templatesResult,
    agendaResult,
    evolutionsResult,
    evaluationsResult,
    scoresResult,
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("id, full_name, status")
      .eq("status", "active")
      .order("full_name"),
    supabase
      .from("assessment_templates")
      .select("id, name")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("agenda_events")
      .select("*")
      .gte("event_date", filters.startDate)
      .lte("event_date", filters.endDate),
    supabase
      .from("clinical_evolution_records")
      .select("id, patient_id, session_date")
      .gte("session_date", filters.startDate)
      .lte("session_date", filters.endDate),
    supabase
      .from("evaluations")
      .select("id, patient_id, instrument, title, evaluation_date")
      .gte("evaluation_date", filters.startDate)
      .lte("evaluation_date", filters.endDate),
    filters.folderId === "all"
      ? Promise.resolve({ data: [], error: null })
      : supabase
          .from("assessment_scores")
          .select("id, description, value, template_id")
          .eq("template_id", filters.folderId)
          .order("sort_order"),
  ]);

  const queryError =
    patientsResult.error ??
    templatesResult.error ??
    agendaResult.error ??
    evolutionsResult.error ??
    evaluationsResult.error ??
    scoresResult.error;

  if (queryError) {
    return { success: false, error: queryError.message };
  }

  const learners: DashboardLearnerOption[] = [
    { id: "all", label: "Todos os aprendizes" },
    ...(patientsResult.data ?? []).map((patient) => ({
      id: patient.id,
      label: patient.full_name,
    })),
  ];

  const folders: DashboardCurriculumFolder[] = [
    { id: "all", label: "Todas as pastas" },
    ...(templatesResult.data ?? []).map((template) => ({
      id: template.id,
      label: template.name,
    })),
  ];

  const agendaEvents = filterAgendaEvents(
    agendaResult.data ?? [],
    filters.startDate,
    filters.endDate
  ).filter((event) =>
    filters.learnerId === "all"
      ? true
      : event.patient_id === filters.learnerId
  );

  const evolutions = (evolutionsResult.data ?? []).filter((record) =>
    filters.learnerId === "all"
      ? true
      : record.patient_id === filters.learnerId
  );

  const evaluations = (evaluationsResult.data ?? []).filter((evaluation) =>
    filters.learnerId === "all"
      ? true
      : evaluation.patient_id === filters.learnerId
  );

  const totalMinutes = agendaEvents.reduce(
    (total, event) =>
      total + getSessionDurationMinutes(event.start_time, event.end_time),
    0
  );
  const averageMinutes =
    agendaEvents.length > 0
      ? Math.round(totalMinutes / agendaEvents.length)
      : 0;

  const metrics: DashboardMetric[] = [
    {
      label: "Sessões Atendidas",
      value: String(agendaEvents.length),
      icon: "sessions",
    },
    {
      label: "Evoluções Registradas",
      value: String(evolutions.length),
      icon: "programs",
    },
    {
      label: "Avaliações no Período",
      value: String(evaluations.length),
      icon: "attempts",
    },
    {
      label: "Média de Duração/Sessão",
      value: `${averageMinutes} min`,
      icon: "independence",
    },
  ];

  const skillPerformance =
    filters.folderId === "all"
      ? groupSessionsByProfessionalRole(agendaEvents)
      : (scoresResult.data ?? [])
          .filter((score) => score.value !== null)
          .map((score) => ({
            skill: score.description,
            score: Math.round(Number(score.value ?? 0)),
          }))
          .slice(0, 8);

  const rankedPrograms = groupEvaluationsByInstrument(evaluations);
  const topPrograms = rankedPrograms.slice(0, 10);
  const bottomPrograms = [...rankedPrograms].reverse().slice(0, 10);

  return {
    success: true,
    data: {
      learners,
      folders,
      metrics,
      skillPerformance,
      topPrograms,
      bottomPrograms,
    },
  };
}

export async function getProfessionalDashboardDataAction(
  filters: ProfessionalDashboardFilters
): Promise<ActionResult<ProfessionalDashboardData>> {
  await requirePermission(PERMISSIONS.DASHBOARD_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const [professionalsResult, agendaResult] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("id, full_name, professional_role, status, profile")
      .eq("status", "active")
      .in("profile", [...CLINICAL_ROLES])
      .order("full_name"),
    supabase
      .from("agenda_events")
      .select("*")
      .gte("event_date", filters.startDate)
      .lte("event_date", filters.endDate),
  ]);

  if (professionalsResult.error) {
    return { success: false, error: professionalsResult.error.message };
  }

  if (agendaResult.error) {
    return { success: false, error: agendaResult.error.message };
  }

  const professionals: DashboardProfessionalOption[] = [
    { id: "all", label: "Todos os profissionais" },
    ...(professionalsResult.data ?? []).map((professional) => ({
      id: professional.id,
      label: professional.full_name,
    })),
  ];

  const agendaEvents = filterAgendaEvents(
    agendaResult.data ?? [],
    filters.startDate,
    filters.endDate
  ).filter((event) =>
    filters.professionalUserId === "all"
      ? true
      : event.professional_user_id === filters.professionalUserId
  );

  const totalMinutes = agendaEvents.reduce(
    (total, event) =>
      total + getSessionDurationMinutes(event.start_time, event.end_time),
    0
  );
  const distinctPatients = new Set(
    agendaEvents
      .map((event) => event.patient_id ?? event.patient_name)
      .filter(Boolean)
  ).size;
  const averageProgramsPerSession =
    agendaEvents.length > 0
      ? (distinctPatients / agendaEvents.length).toFixed(1)
      : "0";

  const metrics: ProfessionalMetric[] = [
    {
      label: "Sessões Realizadas",
      value: String(agendaEvents.length),
      icon: "sessions",
      accent: "emerald",
    },
    {
      label: "Horas de Atendimento",
      value: formatDurationLabel(totalMinutes),
      icon: "hours",
      accent: "sky",
    },
    {
      label: "Aprendizes Atendidos",
      value: String(distinctPatients),
      icon: "programs",
      accent: "slate",
    },
    {
      label: "Média Aprendizes/Sessão",
      value: averageProgramsPerSession,
      icon: "avgPrograms",
      accent: "muted",
    },
  ];

  return {
    success: true,
    data: {
      professionals,
      metrics,
      sessionsByLearner: groupSessionsByLearner(agendaEvents),
      sessionsByWeek: groupSessionsByWeek(agendaEvents),
    },
  };
}

export async function listAgendaProfessionalsAction(): Promise<
  ActionResult<{
    professionals: Array<{
      id: string;
      fullName: string;
      professionalRole: ProfessionalRole | null;
      slotDurationMinutes: number;
      windowsByWeekday: Record<
        number,
        Array<{ startTime: string; endTime: string }>
      >;
    }>;
  }>
> {
  await requirePermission(PERMISSIONS.AGENDA_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      "id, full_name, professional_role, status, profile, slot_duration_minutes"
    )
    .eq("status", "active")
    .in("profile", [...CLINICAL_ROLES])
    .order("full_name");

  if (error) {
    return { success: false, error: error.message };
  }

  const professionalIds = (data ?? []).map((row) => row.id);
  const windowsByUser = new Map<
    string,
    Record<number, Array<{ startTime: string; endTime: string }>>
  >();

  if (professionalIds.length > 0) {
    const { data: availabilityRows, error: availabilityError } = await supabase
      .from("professional_availability")
      .select("user_id, weekday, start_time, end_time")
      .in("user_id", professionalIds);

    if (availabilityError) {
      return { success: false, error: availabilityError.message };
    }

    for (const row of availabilityRows ?? []) {
      const current = windowsByUser.get(row.user_id) ?? {};
      const weekdayWindows = current[row.weekday] ?? [];
      weekdayWindows.push({
        startTime: String(row.start_time).slice(0, 5),
        endTime: String(row.end_time).slice(0, 5),
      });
      current[row.weekday] = weekdayWindows;
      windowsByUser.set(row.user_id, current);
    }
  }

  return {
    success: true,
    data: {
      professionals: (data ?? []).map((row) => ({
        id: row.id,
        fullName: row.full_name,
        professionalRole: isProfessionalRole(row.professional_role)
          ? row.professional_role
          : null,
        slotDurationMinutes: row.slot_duration_minutes ?? 60,
        windowsByWeekday: windowsByUser.get(row.id) ?? {},
      })),
    },
  };
}
