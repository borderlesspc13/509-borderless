import type { DailyAppointment } from "@/lib/agenda-types";

export const AGENDA_DRAG_MIME = "application/x-agenda-appointment";

export function moveAppointmentToDate(
  appointments: DailyAppointment[],
  appointmentId: string,
  newDate: string
) {
  return appointments.map((appointment) =>
    appointment.id === appointmentId
      ? { ...appointment, date: newDate }
      : appointment
  );
}

export function moveAppointmentToProfessional(
  appointments: DailyAppointment[],
  appointmentId: string,
  newProfessional: string
) {
  return appointments.map((appointment) =>
    appointment.id === appointmentId
      ? { ...appointment, professional: newProfessional }
      : appointment
  );
}

export function parseDraggedAppointmentId(
  dataTransfer: DataTransfer
): string | null {
  const payload = dataTransfer.getData(AGENDA_DRAG_MIME);

  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(payload) as { appointmentId?: string };

    return parsed.appointmentId ?? null;
  } catch {
    return null;
  }
}

export function setDraggedAppointmentId(
  dataTransfer: DataTransfer,
  appointmentId: string
) {
  dataTransfer.setData(
    AGENDA_DRAG_MIME,
    JSON.stringify({ appointmentId })
  );
  dataTransfer.effectAllowed = "move";
}
