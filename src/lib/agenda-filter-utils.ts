import {
  filterAgendaProfessionalsByRole,
  getAgendaProfessionalRole,
  type AgendaProfessional,
} from "@/lib/agenda-professionals";
import type { DailyAppointment } from "@/lib/agenda-types";
import type { ProfessionalRole } from "@/lib/professionals-data";

export type AgendaAvailabilityFilter = "all" | "vacant";

export type AgendaFilters = {
  role: ProfessionalRole | "all";
  availability: AgendaAvailabilityFilter;
};

export const DEFAULT_AGENDA_FILTERS: AgendaFilters = {
  role: "all",
  availability: "all",
};

export type VacantSlot = {
  id: string;
  date: string;
  time: string;
  endTime: string;
  professional: string;
  role: ProfessionalRole | null;
};

export const CLINIC_TIME_SLOTS = [
  { time: "08:00", endTime: "09:00" },
  { time: "09:00", endTime: "10:00" },
  { time: "10:00", endTime: "11:00" },
  { time: "11:00", endTime: "12:00" },
  { time: "13:00", endTime: "14:00" },
  { time: "14:00", endTime: "15:00" },
  { time: "15:00", endTime: "16:00" },
  { time: "16:00", endTime: "17:00" },
] as const;

function isActiveAppointment(appointment: DailyAppointment) {
  return appointment.status !== "cancelado";
}

function isSlotOccupied(
  appointments: DailyAppointment[],
  date: string,
  professional: string,
  slotTime: string
) {
  return appointments.some(
    (appointment) =>
      appointment.date === date &&
      appointment.professional === professional &&
      isActiveAppointment(appointment) &&
      appointment.time === slotTime
  );
}

export function countActiveFilters(filters: AgendaFilters) {
  let count = 0;

  if (filters.role !== "all") {
    count += 1;
  }

  if (filters.availability !== "all") {
    count += 1;
  }

  return count;
}

export function filterAppointmentsByRole(
  appointments: DailyAppointment[],
  role: ProfessionalRole | "all",
  professionals: AgendaProfessional[]
) {
  if (role === "all") {
    return appointments;
  }

  return appointments.filter(
    (appointment) =>
      getAgendaProfessionalRole(
        professionals,
        appointment.professional,
        appointment.professionalUserId
      ) === role
  );
}

export function getVacantSlotsForDate(
  date: string,
  appointments: DailyAppointment[],
  filters: AgendaFilters,
  professionals: AgendaProfessional[]
): VacantSlot[] {
  const matchingProfessionals = filterAgendaProfessionalsByRole(
    professionals,
    filters.role
  );
  const vacantSlots: VacantSlot[] = [];

  matchingProfessionals.forEach((professional) => {
    CLINIC_TIME_SLOTS.forEach((slot) => {
      if (
        !isSlotOccupied(
          appointments,
          date,
          professional.name,
          slot.time
        )
      ) {
        vacantSlots.push({
          id: `${date}-${professional.id}-${slot.time}`,
          date,
          time: slot.time,
          endTime: slot.endTime,
          professional: professional.name,
          role: professional.role,
        });
      }
    });
  });

  return vacantSlots.sort((a, b) => a.time.localeCompare(b.time));
}

export function countVacantSlotsForDate(
  date: string,
  appointments: DailyAppointment[],
  filters: AgendaFilters,
  professionals: AgendaProfessional[]
) {
  return getVacantSlotsForDate(
    date,
    appointments,
    filters,
    professionals
  ).length;
}

export function hasVacantSlotsForDate(
  date: string,
  appointments: DailyAppointment[],
  filters: AgendaFilters,
  professionals: AgendaProfessional[]
) {
  return countVacantSlotsForDate(date, appointments, filters, professionals) > 0;
}
