import type { DailyAppointment } from "@/lib/agenda-types";
import type { AgendaEventRow } from "@/lib/supabase/database.types";

export function mapAgendaEventToDailyAppointment(
  event: AgendaEventRow
): DailyAppointment {
  return {
    id: event.id,
    date: event.event_date,
    time: event.start_time,
    endTime: event.end_time,
    patient: event.patient_name,
    professional: event.professional_name,
    status: event.status,
    sessionAmount: event.valor_sessao,
    paymentStatus: event.payment_status,
    paymentLinkUrl: event.payment_link_url,
    professionalUserId: event.professional_user_id,
    patientId: event.patient_id,
    queueNumber: event.queue_number,
    roomName: event.room_name,
    calledAt: event.called_at,
  };
}

export function sortAppointments(appointments: DailyAppointment[]) {
  return [...appointments].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return a.time.localeCompare(b.time);
  });
}

export function mergeAppointments(
  current: DailyAppointment[],
  incoming: DailyAppointment
) {
  const withoutDuplicate = current.filter(
    (appointment) => appointment.id !== incoming.id
  );

  return sortAppointments([...withoutDuplicate, incoming]);
}
