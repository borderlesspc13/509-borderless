"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { resetPasswordAction } from "@/app/actions/auth-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const toast = useAppToast();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await resetPasswordAction(formData);

      if (result?.error) {
        setError(result.error);
        toast.error({
          title: "Não foi possível enviar",
          description: result.error,
        });
        return;
      }

      if (result?.message) {
        setSuccessMessage(result.message);
        toast.success({
          title: "E-mail enviado",
          description: result.message,
        });
      }
    });
  }

  return (
    <AuthCard
      title="Recuperar senha"
      description="Informe seu e-mail corporativo. Enviaremos instruções para redefinir sua senha."
      footer={
        <>
          <Button
            type="submit"
            form="forgot-password-form"
            className="h-11 w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? "Enviando..." : "Enviar instruções"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Lembrou a senha?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Voltar para entrar
            </Link>
          </p>
        </>
      }
    >
      <form
        id="forgot-password-form"
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{error}</p>
          </div>
        ) : null}

        {successMessage ? (
          <div className="flex items-start gap-2 rounded-lg border border-clinical-success/20 bg-clinical-success/10 p-3 text-sm text-[oklch(0.42_0.1_155)]">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{successMessage}</p>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu.email@clinica.com"
            autoComplete="email"
            inputMode="email"
            required
            disabled={isPending}
            className="h-11"
          />
        </div>
      </form>
    </AuthCard>
  );
}
