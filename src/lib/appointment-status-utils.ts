import type { AppointmentStatus, DailyAppointment } from "@/lib/agenda-types";
import { toDateKey } from "@/lib/calendar-utils";

export type BulkStatus = Extract<AppointmentStatus, "confirmado" | "cancelado">;

export function requiresBulkConfirmation(
  status: AppointmentStatus
): status is BulkStatus {
  return status === "confirmado" || status === "cancelado";
}

export function getPatientAppointmentsToday(
  appointments: DailyAppointment[],
  patientName: string
) {
  const todayKey = toDateKey(new Date());

  return appointments.filter(
    (appointment) =>
      appointment.patient === patientName && appointment.date === todayKey
  );
}

export function applyStatusUpdate(
  appointments: DailyAppointment[],
  appointmentId: string,
  newStatus: AppointmentStatus,
  applyToAllPatientToday: boolean
): DailyAppointment[] {
  const target = appointments.find(
    (appointment) => appointment.id === appointmentId
  );

  if (!target) {
    return appointments;
  }

  if (applyToAllPatientToday) {
    const todayKey = toDateKey(new Date());

    return appointments.map((appointment) =>
      appointment.patient === target.patient &&
      appointment.date === todayKey
        ? { ...appointment, status: newStatus }
        : appointment
    );
  }

  return appointments.map((appointment) =>
    appointment.id === appointmentId
      ? { ...appointment, status: newStatus }
      : appointment
  );
}
