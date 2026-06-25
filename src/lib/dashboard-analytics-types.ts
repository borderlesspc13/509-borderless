export type DashboardLearnerOption = {
  id: string;
  label: string;
};

export type DashboardCurriculumFolder = {
  id: string;
  label: string;
};

export type DashboardMetric = {
  label: string;
  value: string;
  icon: "sessions" | "programs" | "attempts" | "independence";
};

export type SkillPerformance = {
  skill: string;
  score: number;
};

export type ProgramPerformance = {
  program: string;
  score: number;
};

export type ProfessionalMetric = {
  label: string;
  value: string;
  icon: "sessions" | "hours" | "programs" | "avgPrograms";
  accent: "emerald" | "sky" | "slate" | "muted";
};

export type DashboardProfessionalOption = {
  id: string;
  label: string;
};

export type SessionByLearner = {
  learner: string;
  sessions: number;
};

export type SessionByWeek = {
  weekLabel: string;
  sessions: number;
};

export const dashboardServiceTypes = [
  { id: "sessao", label: "Sessão" },
  { id: "supervisao", label: "Supervisão" },
  { id: "avaliacao", label: "Avaliação" },
] as const;

export function getDefaultDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
