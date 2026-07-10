import type { DailyAppointment } from "@/lib/agenda-types";

export type AgendaPersonSelection = {
  id: string;
  name: string;
};

export type AgendaPersonFilters = {
  patient: AgendaPersonSelection | null;
  professional: AgendaPersonSelection | null;
};

export const EMPTY_AGENDA_PERSON_FILTERS: AgendaPersonFilters = {
  patient: null,
  professional: null,
};

function namesMatch(left: string, right: string) {
  return (
    left.localeCompare(right, "pt-BR", { sensitivity: "accent" }) === 0
  );
}

export function filterAppointmentsByPersonFilters(
  appointments: DailyAppointment[],
  filters: AgendaPersonFilters
) {
  return appointments.filter((appointment) => {
    if (filters.patient) {
      const matchesPatient =
        appointment.patientId === filters.patient.id ||
        (!appointment.patientId &&
          namesMatch(appointment.patient, filters.patient.name));

      if (!matchesPatient) {
        return false;
      }
    }

    if (filters.professional) {
      const matchesProfessional =
        appointment.professionalUserId === filters.professional.id ||
        namesMatch(appointment.professional, filters.professional.name);

      if (!matchesProfessional) {
        return false;
      }
    }

    return true;
  });
}

/** @deprecated Use AgendaPersonFilters */
export type AgendaIndividualFilterType = "patient" | "professional";

/** @deprecated Use AgendaPersonFilters */
export type AgendaIndividualFilter = {
  type: AgendaIndividualFilterType;
  id: string;
  name: string;
};

/** @deprecated Use filterAppointmentsByPersonFilters */
export function filterAppointmentsByIndividualFilter(
  appointments: DailyAppointment[],
  filter: AgendaIndividualFilter | null
) {
  if (!filter) {
    return appointments;
  }

  return filterAppointmentsByPersonFilters(appointments, {
    patient:
      filter.type === "patient"
        ? { id: filter.id, name: filter.name }
        : null,
    professional:
      filter.type === "professional"
        ? { id: filter.id, name: filter.name }
        : null,
  });
}
