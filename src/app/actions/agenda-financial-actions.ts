"use server";

import { persistAuditLogsAction } from "@/app/actions/audit-log-actions";
import { sendDirectChatMessageToUserAction } from "@/app/actions/chat-actions";
import { requirePermission } from "@/lib/auth-guard";
import { requireServerUserSession } from "@/lib/auth-server";
import { mapAgendaEventToDailyAppointment } from "@/lib/agenda-events";
import {
  buildPaymentLinkGeneratedLog,
  buildPaymentLinkSentLog,
  buildPaymentStatusChangeLog,
} from "@/lib/audit-log";
import { buildPaymentLinkMessage } from "@/lib/agenda-financial";
import { getDefaultSessionAmount } from "@/lib/payment/env";
import { PERMISSIONS } from "@/lib/rbac";
import { createPaymentLink } from "@/services/payment";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DailyAppointment, PaymentStatus } from "@/lib/agenda-types";
import type { AgendaEventRow } from "@/lib/supabase/database.types";

type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function getAuditActor() {
  const session = await requireServerUserSession();

  return {
    userName: session.fullName,
    userProfile: session.profile,
    displayRole: session.displayRole,
  };
}

async function persistFinancialAuditLogs(
  logs: Parameters<typeof persistAuditLogsAction>[1]
) {
  if (logs.length === 0) {
    return;
  }

  const actor = await getAuditActor();
  await persistAuditLogsAction(actor, logs);
}

async function resolveProfessionalUserId(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  professionalName: string,
  professionalUserId?: string | null
) {
  if (professionalUserId) {
    return professionalUserId;
  }

  const { data } = await supabase
    .from("user_profiles")
    .select("id")
    .ilike("full_name", professionalName)
    .maybeSingle();

  return data?.id ?? null;
}

function mapRowToAppointment(row: AgendaEventRow): DailyAppointment {
  return mapAgendaEventToDailyAppointment(row);
}

export async function getAppointmentFinancialAction(
  appointmentId: string
): Promise<ActionResult<{ appointment: DailyAppointment }>> {
  await requirePermission(PERMISSIONS.FINANCE_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("agenda_events")
    .select("*")
    .eq("id", appointmentId)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data) {
    return { success: false, error: "Agendamento não encontrado." };
  }

  return {
    success: true,
    data: { appointment: mapRowToAppointment(data) },
  };
}

export async function updateAppointmentSessionAmountAction(input: {
  appointmentId: string;
  sessionAmount: number;
}): Promise<ActionResult<{ appointment: DailyAppointment }>> {
  await requirePermission(PERMISSIONS.FINANCE_MANAGE);

  if (input.sessionAmount <= 0) {
    return { success: false, error: "Informe um valor válido para a sessão." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("agenda_events")
    .update({
      valor_sessao: input.sessionAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.appointmentId)
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "Não foi possível atualizar o valor da sessão.",
    };
  }

  return {
    success: true,
    data: { appointment: mapRowToAppointment(data) },
  };
}

export async function generateAppointmentPaymentLinkAction(input: {
  appointmentId: string;
  sessionAmount?: number;
}): Promise<ActionResult<{ appointment: DailyAppointment; paymentLinkUrl: string }>> {
  await requirePermission(PERMISSIONS.FINANCE_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: current, error: fetchError } = await supabase
    .from("agenda_events")
    .select("*")
    .eq("id", input.appointmentId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!current) {
    return { success: false, error: "Agendamento não encontrado." };
  }

  const appointment = mapRowToAppointment(current);
  const amount =
    input.sessionAmount ??
    current.valor_sessao ??
    appointment.sessionAmount ??
    getDefaultSessionAmount();

  if (amount <= 0) {
    return {
      success: false,
      error: "Defina o valor da sessão antes de gerar o link.",
    };
  }

  if (current.payment_status === "pago") {
    return { success: false, error: "Esta sessão já está marcada como paga." };
  }

  if (current.payment_status === "cancelado") {
    return {
      success: false,
      error: "Não é possível gerar link para pagamento cancelado.",
    };
  }

  try {
    const paymentLink = await createPaymentLink({
      amount,
      description: `Sessão — ${current.patient_name} (${current.event_date} ${current.start_time})`,
      metadata: {
        appointment_id: current.id,
        patient_name: current.patient_name,
        professional_name: current.professional_name,
      },
    });

    const { data, error } = await supabase
      .from("agenda_events")
      .update({
        valor_sessao: amount,
        payment_link_url: paymentLink.url,
        payment_status: "pendente",
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.appointmentId)
      .select("*")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "Falha ao salvar o link de pagamento.",
      };
    }

    const updatedAppointment = mapRowToAppointment(data);

    await persistFinancialAuditLogs([
      buildPaymentLinkGeneratedLog(updatedAppointment, paymentLink.url, amount),
    ]);

    return {
      success: true,
      data: {
        appointment: updatedAppointment,
        paymentLinkUrl: paymentLink.url,
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o link de pagamento.",
    };
  }
}

export async function updateAppointmentPaymentStatusAction(input: {
  appointmentId: string;
  paymentStatus: PaymentStatus;
}): Promise<ActionResult<{ appointment: DailyAppointment }>> {
  await requirePermission(PERMISSIONS.FINANCE_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: current, error: fetchError } = await supabase
    .from("agenda_events")
    .select("*")
    .eq("id", input.appointmentId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!current) {
    return { success: false, error: "Agendamento não encontrado." };
  }

  const previousStatus = current.payment_status;

  if (previousStatus === input.paymentStatus) {
    return {
      success: true,
      data: { appointment: mapRowToAppointment(current) },
    };
  }

  const { data, error } = await supabase
    .from("agenda_events")
    .update({
      payment_status: input.paymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.appointmentId)
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message ?? "Não foi possível atualizar o pagamento.",
    };
  }

  const updatedAppointment = mapRowToAppointment(data);

  await persistFinancialAuditLogs([
    buildPaymentStatusChangeLog(
      updatedAppointment,
      previousStatus,
      input.paymentStatus
    ),
  ]);

  return {
    success: true,
    data: { appointment: updatedAppointment },
  };
}

export async function sendAppointmentPaymentLinkAction(input: {
  appointmentId: string;
  receiverId?: string;
  messagePreview?: string;
}): Promise<ActionResult<{ messageId: string; receiverName: string }>> {
  await requirePermission(PERMISSIONS.FINANCE_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: current, error: fetchError } = await supabase
    .from("agenda_events")
    .select("*")
    .eq("id", input.appointmentId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!current?.payment_link_url) {
    return {
      success: false,
      error: "Gere o link de pagamento antes de enviar a mensagem.",
    };
  }

  const appointment = mapRowToAppointment(current);
  const receiverId =
    input.receiverId ??
    (await resolveProfessionalUserId(
      supabase,
      current.professional_name,
      current.professional_user_id
    ));

  if (!receiverId) {
    return {
      success: false,
      error:
        "Não foi possível identificar o profissional responsável para envio da mensagem.",
    };
  }

  const { data: receiverProfile } = await supabase
    .from("user_profiles")
    .select("full_name")
    .eq("id", receiverId)
    .maybeSingle();

  const content =
    input.messagePreview?.trim() ||
    buildPaymentLinkMessage(appointment, current.payment_link_url);

  const messageResult = await sendDirectChatMessageToUserAction(
    receiverId,
    content
  );

  if (!messageResult.success) {
    return {
      success: false,
      error: messageResult.error ?? "Falha ao enviar mensagem interna.",
    };
  }

  if (!messageResult.data?.message) {
    return {
      success: false,
      error: "Falha ao enviar mensagem interna.",
    };
  }

  const receiverName = receiverProfile?.full_name ?? "profissional responsável";

  await persistFinancialAuditLogs([
    buildPaymentLinkSentLog(appointment, receiverName),
  ]);

  return {
    success: true,
    data: {
      messageId: messageResult.data.message.id,
      receiverName,
    },
  };
}
