import type { DailyAppointment } from "@/lib/agenda-types";

export type AgendaIndividualFilterType = "patient" | "professional";

export type AgendaIndividualFilter = {
  type: AgendaIndividualFilterType;
  id: string;
  name: string;
};

function namesMatch(left: string, right: string) {
  return (
    left.localeCompare(right, "pt-BR", { sensitivity: "accent" }) === 0
  );
}

export function filterAppointmentsByIndividualFilter(
  appointments: DailyAppointment[],
  filter: AgendaIndividualFilter | null
) {
  if (!filter) {
    return appointments;
  }

  if (filter.type === "patient") {
    return appointments.filter(
      (appointment) =>
        appointment.patientId === filter.id ||
        (!appointment.patientId && namesMatch(appointment.patient, filter.name))
    );
  }

  return appointments.filter(
    (appointment) =>
      appointment.professionalUserId === filter.id ||
      namesMatch(appointment.professional, filter.name)
  );
}
