"use client";

import { useEffect, useState, useTransition } from "react";
import {
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  Send,
} from "lucide-react";

import {
  generateAppointmentPaymentLinkAction,
  sendAppointmentPaymentLinkAction,
  updateAppointmentPaymentStatusAction,
  updateAppointmentSessionAmountAction,
} from "@/app/actions/agenda-financial-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildPaymentLinkMessage,
  formatSessionAmount,
  parseSessionAmountInput,
  paymentStatusLabels,
} from "@/lib/agenda-financial";
import type { DailyAppointment, PaymentStatus } from "@/lib/agenda-types";
import { PERMISSIONS } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type AppointmentFinancialSectionProps = {
  appointment: DailyAppointment;
  onAppointmentUpdate: (appointment: DailyAppointment) => void;
};

const paymentStatusItems = (
  Object.entries(paymentStatusLabels) as [PaymentStatus, string][]
).map(([value, label]) => ({ value, label }));

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "pago" &&
          "border-clinical-success/30 bg-clinical-success/10 text-clinical-success",
        status === "pendente" &&
          "border-clinical-warning/30 bg-clinical-warning/10 text-[oklch(0.42_0.12_75)]",
        status === "cancelado" &&
          "border-destructive/30 bg-destructive/10 text-destructive"
      )}
    >
      {paymentStatusLabels[status]}
    </Badge>
  );
}

export function AppointmentFinancialSection({
  appointment,
  onAppointmentUpdate,
}: AppointmentFinancialSectionProps) {
  const [sessionAmountInput, setSessionAmountInput] = useState(
    appointment.sessionAmount != null
      ? appointment.sessionAmount.toFixed(2).replace(".", ",")
      : ""
  );
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    appointment.paymentStatus ?? "pendente"
  );
  const [paymentLinkUrl, setPaymentLinkUrl] = useState(
    appointment.paymentLinkUrl ?? ""
  );
  const [messagePreview, setMessagePreview] = useState("");
  const toast = useAppToast();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSessionAmountInput(
      appointment.sessionAmount != null
        ? appointment.sessionAmount.toFixed(2).replace(".", ",")
        : ""
    );
    setPaymentStatus(appointment.paymentStatus ?? "pendente");
    setPaymentLinkUrl(appointment.paymentLinkUrl ?? "");
  }, [appointment]);

  useEffect(() => {
    if (!paymentLinkUrl) {
      setMessagePreview("");
      return;
    }

    setMessagePreview(
      buildPaymentLinkMessage(
        {
          ...appointment,
          sessionAmount: parseSessionAmountInput(sessionAmountInput),
          paymentLinkUrl,
        },
        paymentLinkUrl
      )
    );
  }, [appointment, paymentLinkUrl, sessionAmountInput]);

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    if (type === "success") {
      toast.success({ title: "Operação concluída", description: message });
    } else {
      toast.error({ title: "Falha na operação", description: message });
    }
  }

  function handleCopyLink() {
    if (!paymentLinkUrl) {
      return;
    }

    void navigator.clipboard.writeText(paymentLinkUrl);
    toast.info({
      title: "Link copiado",
      description: "O link foi copiado para a área de transferência.",
    });
    setFeedback({
      type: "success",
      message: "Link copiado para a área de transferência.",
    });
  }

  function handleSaveAmount() {
    const amount = parseSessionAmountInput(sessionAmountInput);

    if (!amount || amount <= 0) {
      toast.warning({
        title: "Valor inválido",
        description: "Informe um valor válido para a sessão.",
      });
      showFeedback("error", "Informe um valor válido para a sessão.");
      return;
    }

    startTransition(async () => {
      setFeedback(null);

      const result = await updateAppointmentSessionAmountAction({
        appointmentId: appointment.id,
        sessionAmount: amount,
      });

      if (!result.success) {
        showFeedback(
          "error",
          result.error ?? "Não foi possível salvar o valor."
        );
        return;
      }

      if (!result.data?.appointment) {
        showFeedback("error", "Não foi possível salvar o valor.");
        return;
      }

      onAppointmentUpdate(result.data.appointment);
      showFeedback("success", "Valor da sessão atualizado.");
    });
  }

  function handleGenerateLink() {
    const amount = parseSessionAmountInput(sessionAmountInput);

    startTransition(async () => {
      setFeedback(null);

      const result = await generateAppointmentPaymentLinkAction({
        appointmentId: appointment.id,
        sessionAmount: amount ?? undefined,
      });

      if (!result.success) {
        showFeedback(
          "error",
          result.error ?? "Não foi possível gerar o link."
        );
        return;
      }

      if (!result.data) {
        showFeedback("error", "Não foi possível gerar o link.");
        return;
      }

      onAppointmentUpdate(result.data.appointment);
      setPaymentLinkUrl(result.data.paymentLinkUrl);
      toast.success({
        title: "Link criado",
        description: "Link de pagamento gerado com sucesso.",
      });
      showFeedback("success", "Link de pagamento gerado com sucesso.");
    });
  }

  function handlePaymentStatusChange(nextStatus: PaymentStatus) {
    startTransition(async () => {
      setFeedback(null);

      const result = await updateAppointmentPaymentStatusAction({
        appointmentId: appointment.id,
        paymentStatus: nextStatus,
      });

      if (!result.success) {
        showFeedback(
          "error",
          result.error ?? "Não foi possível atualizar o status."
        );
        return;
      }

      if (!result.data?.appointment) {
        showFeedback("error", "Não foi possível atualizar o status.");
        return;
      }

      onAppointmentUpdate(result.data.appointment);
      setPaymentStatus(nextStatus);
      showFeedback("success", "Status de pagamento atualizado.");
    });
  }

  function handleSendLink() {
    startTransition(async () => {
      setFeedback(null);

      const result = await sendAppointmentPaymentLinkAction({
        appointmentId: appointment.id,
        messagePreview,
      });

      if (!result.success) {
        showFeedback(
          "error",
          result.error ?? "Não foi possível enviar a mensagem."
        );
        return;
      }

      if (!result.data) {
        showFeedback("error", "Não foi possível enviar a mensagem.");
        return;
      }

      toast.success({
        title: "Link enviado",
        description: `Enviado para ${result.data.receiverName} via chat interno.`,
      });
      showFeedback(
        "success",
        `Link enviado para ${result.data.receiverName} via chat interno.`
      );
    });
  }

  return (
    <PermissionGate permission={PERMISSIONS.FINANCE_MANAGE}>
      <section className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-primary" aria-hidden />
          <h3 className="text-sm font-semibold">Financeiro</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="session-amount">Valor da sessão</Label>
            <div className="flex gap-2">
              <Input
                id="session-amount"
                value={sessionAmountInput}
                onChange={(event) => setSessionAmountInput(event.target.value)}
                placeholder="150,00"
                className="h-10"
              />
              <Button
                type="button"
                variant="outline"
                className="h-10 shrink-0"
                onClick={handleSaveAmount}
                disabled={isPending}
              >
                Salvar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Valor atual:{" "}
              {formatSessionAmount(parseSessionAmountInput(sessionAmountInput))}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-status">Status do pagamento</Label>
            <Select
              value={paymentStatus}
              items={paymentStatusItems}
              onValueChange={(value) =>
                handlePaymentStatusChange(value as PaymentStatus)
              }
            >
              <SelectTrigger id="payment-status" className="h-10 w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {paymentStatusItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <PaymentStatusBadge status={paymentStatus} />
          </div>
        </div>

        {paymentStatus === "pendente" && !paymentLinkUrl ? (
          <Button
            type="button"
            className="h-10 gap-2"
            onClick={handleGenerateLink}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <CreditCard className="size-4" aria-hidden />
            )}
            Gerar link de pagamento
          </Button>
        ) : null}

        {paymentLinkUrl ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="payment-link">Link de pagamento</Label>
              <Input
                id="payment-link"
                value={paymentLinkUrl}
                readOnly
                className="h-10 bg-background"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2"
                onClick={handleCopyLink}
              >
                <Copy className="size-4" aria-hidden />
                Copiar link
              </Button>
              <Button
                type="button"
                className="h-10 gap-2"
                onClick={handleSendLink}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-4" aria-hidden />
                )}
                Enviar link
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-message-preview">
                Prévia da mensagem (chat interno)
              </Label>
              <textarea
                id="payment-message-preview"
                value={messagePreview}
                onChange={(event) => setMessagePreview(event.target.value)}
                className="min-h-28 w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <p className="text-xs text-muted-foreground">
                A mensagem será enviada ao profissional responsável pela sessão.
                Edite a prévia antes de enviar, se necessário.
              </p>
            </div>
          </div>
        ) : null}

        {feedback ? (
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg border p-3 text-sm",
              feedback.type === "success"
                ? "border-clinical-success/20 bg-clinical-success/10 text-[oklch(0.42_0.1_155)]"
                : "border-destructive/20 bg-destructive/5 text-destructive"
            )}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            ) : null}
            <p>{feedback.message}</p>
          </div>
        ) : null}
      </section>
    </PermissionGate>
  );
}
