export type AppointmentStatus =
  | "confirmado"
  | "agendado"
  | "em_espera"
  | "chamado"
  | "cancelado";

export type PaymentStatus = "pendente" | "pago" | "cancelado";

export type DailyAppointment = {
  id: string;
  date: string;
  time: string;
  endTime: string;
  patient: string;
  professional: string;
  status: AppointmentStatus;
  sessionAmount?: number | null;
  paymentStatus?: PaymentStatus;
  paymentLinkUrl?: string | null;
  professionalUserId?: string | null;
  patientId?: string | null;
  queueNumber?: number | null;
  roomName?: string | null;
  calledAt?: string | null;
};
