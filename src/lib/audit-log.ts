import type { AppointmentStatus, DailyAppointment } from "@/lib/dashboard-mock-data";

export type AuditActor = {
  userName: string;
  userProfile: string;
  displayRole: string;
};

export type CreateAuditLogInput = {
  actionLabel: string;
  patientName: string;
  fromDescription: string;
  toDescription: string;
  appointmentId?: string;
  metadata?: Record<string, unknown>;
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  em_espera: "Em espera",
  cancelado: "Cancelado",
};

export function formatAgendaContext(
  professional: string,
  date: string,
  time?: string
) {
  const formattedDate = formatAuditDate(date);

  return time
    ? `Agenda do Profissional ${professional} · ${formattedDate} · ${time}`
    : `Agenda do Profissional ${professional} · ${formattedDate}`;
}

function formatAuditDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function buildStatusChangeLog(
  appointment: DailyAppointment,
  previousStatus: AppointmentStatus,
  nextStatus: AppointmentStatus,
  options?: { isBulk?: boolean }
): CreateAuditLogInput {
  const context = formatAgendaContext(
    appointment.professional,
    appointment.date,
    appointment.time
  );

  const isCancellation = nextStatus === "cancelado";

  return {
    actionLabel: isCancellation
      ? "Cancelamento"
      : options?.isBulk
        ? "Mudança de situação em massa"
        : "Mudança de situação",
    patientName: appointment.patient,
    fromDescription: `${context} · ${STATUS_LABELS[previousStatus]}`,
    toDescription: `${context} · ${STATUS_LABELS[nextStatus]}`,
    appointmentId: appointment.id,
    metadata: {
      previousStatus,
      nextStatus,
      isBulk: options?.isBulk ?? false,
    },
  };
}

export function buildDateMoveLog(
  appointment: DailyAppointment,
  nextDate: string
): CreateAuditLogInput {
  return {
    actionLabel: "Remanejamento",
    patientName: appointment.patient,
    fromDescription: formatAgendaContext(
      appointment.professional,
      appointment.date,
      appointment.time
    ),
    toDescription: formatAgendaContext(
      appointment.professional,
      nextDate,
      appointment.time
    ),
    appointmentId: appointment.id,
    metadata: {
      previousDate: appointment.date,
      nextDate,
    },
  };
}

export function buildProfessionalMoveLog(
  appointment: DailyAppointment,
  nextProfessional: string
): CreateAuditLogInput {
  return {
    actionLabel: "Remanejamento",
    patientName: appointment.patient,
    fromDescription: formatAgendaContext(
      appointment.professional,
      appointment.date,
      appointment.time
    ),
    toDescription: formatAgendaContext(
      nextProfessional,
      appointment.date,
      appointment.time
    ),
    appointmentId: appointment.id,
    metadata: {
      previousProfessional: appointment.professional,
      nextProfessional,
    },
  };
}

export function collectStatusChangeLogs(
  previousAppointments: DailyAppointment[],
  nextAppointments: DailyAppointment[],
  appointmentIds: string[],
  options?: { isBulk?: boolean }
) {
  const logs: CreateAuditLogInput[] = [];

  appointmentIds.forEach((appointmentId) => {
    const previous = previousAppointments.find(
      (appointment) => appointment.id === appointmentId
    );
    const next = nextAppointments.find(
      (appointment) => appointment.id === appointmentId
    );

    if (!previous || !next || previous.status === next.status) {
      return;
    }

    logs.push(
      buildStatusChangeLog(previous, previous.status, next.status, options)
    );
  });

  return logs;
}

export function collectChangedAppointmentIds(
  previousAppointments: DailyAppointment[],
  nextAppointments: DailyAppointment[]
) {
  return nextAppointments
    .filter((next) => {
      const previous = previousAppointments.find(
        (appointment) => appointment.id === next.id
      );

      return (
        previous &&
        (previous.status !== next.status ||
          previous.date !== next.date ||
          previous.professional !== next.professional ||
          previous.paymentStatus !== next.paymentStatus ||
          previous.paymentLinkUrl !== next.paymentLinkUrl ||
          previous.sessionAmount !== next.sessionAmount)
      );
    })
    .map((appointment) => appointment.id);
}

const PAYMENT_STATUS_LABELS = {
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
} as const;

export function buildPaymentLinkGeneratedLog(
  appointment: DailyAppointment,
  linkUrl: string,
  amount: number
): CreateAuditLogInput {
  const context = formatAgendaContext(
    appointment.professional,
    appointment.date,
    appointment.time
  );

  return {
    actionLabel: "Link de pagamento gerado",
    patientName: appointment.patient,
    fromDescription: `${context} · Sem link`,
    toDescription: `${context} · Link gerado (${amount.toFixed(2)} BRL)`,
    appointmentId: appointment.id,
    metadata: {
      paymentLinkUrl: linkUrl,
      sessionAmount: amount,
    },
  };
}

export function buildPaymentStatusChangeLog(
  appointment: DailyAppointment,
  previousStatus: keyof typeof PAYMENT_STATUS_LABELS,
  nextStatus: keyof typeof PAYMENT_STATUS_LABELS
): CreateAuditLogInput {
  const context = formatAgendaContext(
    appointment.professional,
    appointment.date,
    appointment.time
  );

  return {
    actionLabel: "Atualização financeira",
    patientName: appointment.patient,
    fromDescription: `${context} · ${PAYMENT_STATUS_LABELS[previousStatus]}`,
    toDescription: `${context} · ${PAYMENT_STATUS_LABELS[nextStatus]}`,
    appointmentId: appointment.id,
    metadata: {
      previousPaymentStatus: previousStatus,
      nextPaymentStatus: nextStatus,
    },
  };
}

export function buildPaymentLinkSentLog(
  appointment: DailyAppointment,
  receiverLabel: string
): CreateAuditLogInput {
  const context = formatAgendaContext(
    appointment.professional,
    appointment.date,
    appointment.time
  );

  return {
    actionLabel: "Link de pagamento enviado",
    patientName: appointment.patient,
    fromDescription: `${context} · Link não enviado`,
    toDescription: `${context} · Enviado para ${receiverLabel}`,
    appointmentId: appointment.id,
    metadata: {
      paymentLinkUrl: appointment.paymentLinkUrl,
      receiverLabel,
    },
  };
}
