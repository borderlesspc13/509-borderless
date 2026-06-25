import type { AgendaEventRow } from "@/lib/supabase/database.types";

export function isActiveAgendaEvent(status: AgendaEventRow["status"]) {
  return status !== "cancelado";
}

export function parseTimeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getSessionDurationMinutes(startTime: string, endTime: string) {
  return Math.max(0, parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime));
}

export function formatDurationLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} minuto${minutes === 1 ? "" : "s"}`;
  }

  return `${hours} hora${hours === 1 ? "" : "s"} e ${minutes} minuto${minutes === 1 ? "" : "s"}`;
}

export function getWeekStartKey(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());

  return weekStart.toISOString().slice(0, 10);
}

export function formatWeekLabel(dateKey: string) {
  const [, month, day] = dateKey.split("-");
  return `${day}/${month}/${dateKey.slice(0, 4)}`;
}

export function groupSessionsByLearner(events: AgendaEventRow[]) {
  const counts = new Map<string, number>();

  events.forEach((event) => {
    const label = event.patient_name.trim() || "Sem aprendiz";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([learner, sessions]) => ({ learner, sessions }))
    .sort((left, right) => right.sessions - left.sessions);
}

export function groupSessionsByWeek(events: AgendaEventRow[]) {
  const counts = new Map<string, number>();

  events.forEach((event) => {
    const weekKey = getWeekStartKey(event.event_date);
    counts.set(weekKey, (counts.get(weekKey) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([weekKey, sessions]) => ({
      weekLabel: formatWeekLabel(weekKey),
      sessions,
    }));
}

export function groupSessionsByProfessionalRole(events: AgendaEventRow[]) {
  const counts = new Map<string, number>();

  events.forEach((event) => {
    const label = event.professional_name.trim() || "Sem profissional";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([skill, score]) => ({ skill, score }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 8);
}

export function groupEvaluationsByInstrument(
  evaluations: Array<{ instrument: string | null; title: string }>
) {
  const counts = new Map<string, number>();

  evaluations.forEach((evaluation) => {
    const label =
      evaluation.instrument?.trim() ||
      evaluation.title.trim() ||
      "Instrumento não informado";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([program, score]) => ({ program, score }))
    .sort((left, right) => right.score - left.score);
}
