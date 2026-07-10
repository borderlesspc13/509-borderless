import type { ProfessionalRole } from "@/lib/professionals-data";
import type { SlotDurationMinutes } from "@/lib/professional-availability";
import { DEFAULT_SLOT_DURATION_MINUTES } from "@/lib/professional-availability";

export type AgendaProfessional = {
  id: string;
  name: string;
  role: ProfessionalRole | null;
  slotDurationMinutes: SlotDurationMinutes;
  windowsByWeekday: Record<
    number,
    Array<{ startTime: string; endTime: string }>
  >;
};

export function mapAgendaProfessionalOption(input: {
  id: string;
  fullName: string;
  professionalRole: ProfessionalRole | null;
  slotDurationMinutes?: number | null;
  windowsByWeekday?: Record<
    number,
    Array<{ startTime: string; endTime: string }>
  >;
}): AgendaProfessional {
  const duration =
    input.slotDurationMinutes &&
    Number.isInteger(input.slotDurationMinutes) &&
    input.slotDurationMinutes >= 5 &&
    input.slotDurationMinutes <= 60 &&
    input.slotDurationMinutes % 5 === 0
      ? (input.slotDurationMinutes as SlotDurationMinutes)
      : DEFAULT_SLOT_DURATION_MINUTES;

  return {
    id: input.id,
    name: input.fullName,
    role: input.professionalRole,
    slotDurationMinutes: duration,
    windowsByWeekday: input.windowsByWeekday ?? {},
  };
}

export function getAgendaProfessionalRole(
  professionals: AgendaProfessional[],
  professionalName: string,
  professionalUserId?: string | null
): ProfessionalRole | null {
  const match = professionals.find(
    (professional) =>
      (professionalUserId && professional.id === professionalUserId) ||
      professional.name.localeCompare(professionalName, "pt-BR", {
        sensitivity: "accent",
      }) === 0
  );

  return match?.role ?? null;
}

export function filterAgendaProfessionalsByRole(
  professionals: AgendaProfessional[],
  role: ProfessionalRole | "all"
) {
  if (role === "all") {
    return professionals;
  }

  return professionals.filter((professional) => professional.role === role);
}
