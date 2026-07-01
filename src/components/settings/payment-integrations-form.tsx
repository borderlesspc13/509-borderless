"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";

import { upsertPaymentSettingsAction } from "@/app/actions/clinic-settings-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClinicSettingsPublic } from "@/lib/clinic-settings";

type PaymentIntegrationsFormProps = {
  settings: ClinicSettingsPublic;
  onSettingsChange: (settings: ClinicSettingsPublic) => void;
};

const inputClassName = "h-11 w-full";

export function PaymentIntegrationsForm({
  settings,
  onSettingsChange,
}: PaymentIntegrationsFormProps) {
  const toast = useAppToast();
  const [stripeApiKey, setStripeApiKey] = useState("");
  const [mercadoPagoApiKey, setMercadoPagoApiKey] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, startSaveTransition] = useTransition();

  function handleSave() {
    startSaveTransition(async () => {
      const result = await upsertPaymentSettingsAction({
        stripeApiKey: stripeApiKey || undefined,
        mercadoPagoApiKey: mercadoPagoApiKey || undefined,
      });

      if (!result.success) {
        setFeedback({ type: "error", message: result.error });
        toast.error({
          title: "Falha ao salvar",
          description: result.error,
        });
        return;
      }

      if (result.data) {
        onSettingsChange(result.data);
      }

      setStripeApiKey("");
      setMercadoPagoApiKey("");

      const message = result.message ?? "Chaves salvas com sucesso.";
      setFeedback({ type: "success", message });
      toast.success({
        title: "Integrações salvas",
        description: "Chaves de pagamento atualizadas.",
      });
    });
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="size-5" aria-hidden />
          </div>
          <div className="space-y-1">
            <CardTitle>Integrações de Pagamento</CardTitle>
            <CardDescription>
              Chaves secretas usadas na geração de links de pagamento da agenda.
              Deixe em branco para manter a chave já cadastrada.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stripe-api-key">Stripe Secret Key</Label>
            <Input
              id="stripe-api-key"
              type="password"
              className={inputClassName}
              value={stripeApiKey}
              onChange={(event) => setStripeApiKey(event.target.value)}
              placeholder={
                settings.hasStripeApiKey
                  ? settings.stripeApiKeyMasked ?? "••••••••"
                  : "sk_live_..."
              }
              autoComplete="off"
            />
            {settings.hasStripeApiKey ? (
              <p className="text-xs text-muted-foreground">
                Chave configurada: {settings.stripeApiKeyMasked}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Nenhuma chave Stripe cadastrada.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mercado-pago-api-key">
              Mercado Pago Access Token
            </Label>
            <Input
              id="mercado-pago-api-key"
              type="password"
              className={inputClassName}
              value={mercadoPagoApiKey}
              onChange={(event) => setMercadoPagoApiKey(event.target.value)}
              placeholder={
                settings.hasMercadoPagoApiKey
                  ? settings.mercadoPagoApiKeyMasked ?? "••••••••"
                  : "APP_USR-..."
              }
              autoComplete="off"
            />
            {settings.hasMercadoPagoApiKey ? (
              <p className="text-xs text-muted-foreground">
                Chave configurada: {settings.mercadoPagoApiKeyMasked}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Nenhuma chave Mercado Pago cadastrada.
              </p>
            )}
          </div>
        </div>

        {feedback ? (
          <div
            className={
              feedback.type === "success"
                ? "flex items-center gap-2 rounded-xl border border-clinical-success/30 bg-clinical-success/10 px-4 py-3 text-sm text-clinical-success"
                : "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            }
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            ) : null}
            <span>{feedback.message}</span>
          </div>
        ) : null}

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            {isSaving ? "Salvando..." : "Salvar integrações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
