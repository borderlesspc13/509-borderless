import type { DailyAppointment } from "@/lib/dashboard-mock-data";

export type PaymentStatus = "pendente" | "pago" | "cancelado";

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
};

export function formatSessionAmount(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function parseSessionAmountInput(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number.parseFloat(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

export function buildPaymentLinkMessage(appointment: DailyAppointment, linkUrl: string) {
  return [
    `Link de pagamento — ${appointment.patient}`,
    `Sessão em ${formatAppointmentDate(appointment.date)} às ${appointment.time}.`,
    `Profissional: ${appointment.professional}.`,
    `Valor: ${formatSessionAmount(appointment.sessionAmount ?? null)}.`,
    "",
    linkUrl,
  ].join("\n");
}

function formatAppointmentDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function mergeAppointmentFinancial(
  appointment: DailyAppointment,
  financial: Partial<
    Pick<
      DailyAppointment,
      "sessionAmount" | "paymentStatus" | "paymentLinkUrl" | "professionalUserId"
    >
  >
): DailyAppointment {
  return {
    ...appointment,
    ...financial,
  };
}
