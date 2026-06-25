import { toDateKey } from "@/lib/calendar-utils";
import type { DailyAppointment } from "@/lib/agenda-types";

export type ReceptionPanelCall = {
  id: string;
  queueNumber: number;
  professionalName: string;
  roomName: string;
  calledAt: string;
};

export type ReceptionPanelWaiting = {
  id: string;
  queueNumber: number;
  professionalName: string;
};

export type ReceptionPanelData = {
  currentCall: ReceptionPanelCall | null;
  recentCalls: ReceptionPanelCall[];
  waitingQueue: ReceptionPanelWaiting[];
  updatedAt: string;
};

export function formatQueueNumber(queueNumber: number) {
  return String(queueNumber).padStart(3, "0");
}

export function mapAppointmentToPanelCall(
  appointment: DailyAppointment
): ReceptionPanelCall | null {
  if (
    appointment.status !== "chamado" ||
    !appointment.queueNumber ||
    !appointment.roomName ||
    !appointment.calledAt
  ) {
    return null;
  }

  return {
    id: appointment.id,
    queueNumber: appointment.queueNumber,
    professionalName: appointment.professional,
    roomName: appointment.roomName,
    calledAt: appointment.calledAt,
  };
}

export function buildReceptionPanelData(
  appointments: DailyAppointment[],
  dateKey = toDateKey(new Date())
): ReceptionPanelData {
  const todayAppointments = appointments.filter(
    (appointment) => appointment.date === dateKey
  );

  const calledToday = todayAppointments
    .map(mapAppointmentToPanelCall)
    .filter((call): call is ReceptionPanelCall => call !== null)
    .sort((left, right) => right.calledAt.localeCompare(left.calledAt));

  const currentCall = calledToday[0] ?? null;
  const recentCalls = calledToday.slice(1, 6);

  const waitingQueue = todayAppointments
    .filter(
      (appointment) =>
        appointment.status === "em_espera" && appointment.queueNumber
    )
    .sort(
      (left, right) => (left.queueNumber ?? 0) - (right.queueNumber ?? 0)
    )
    .map((appointment) => ({
      id: appointment.id,
      queueNumber: appointment.queueNumber!,
      professionalName: appointment.professional,
    }));

  return {
    currentCall,
    recentCalls,
    waitingQueue,
    updatedAt: new Date().toISOString(),
  };
}
