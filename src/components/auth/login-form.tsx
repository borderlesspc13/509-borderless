"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { signInAction } from "@/app/actions/auth-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { AuthCard } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { LogoutButton } from "@/components/layout/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const searchParams = useSearchParams();
  const isPendingProfile = searchParams.get("erro") === "perfil-pendente";
  const toast = useAppToast();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await signInAction(formData);

      if (result?.error) {
        setError(result.error);
        toast.error({
          title: "Não foi possível entrar",
          description: result.error,
        });
      }
    });
  }

  return (
    <AuthCard
      title="Entrar na plataforma"
      description="Acesse sua conta para gerenciar sessões, pacientes e programas ABA com segurança."
      footer={
        <>
          <Button
            type="submit"
            form="login-form"
            className="h-11 w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </>
      }
    >
      <form id="login-form" className="space-y-4" onSubmit={handleSubmit}>
        {isPendingProfile ? (
          <div className="space-y-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-950 dark:text-amber-100">
            <p className="font-medium">Perfil ainda não configurado</p>
            <p className="text-muted-foreground">
              Você está autenticado, mas o perfil não foi encontrado. Execute a
              migration <code>20250608140000_user_profiles.sql</code> no Supabase
              e tente novamente.
            </p>
            <LogoutButton variant="outline" />
          </div>
        ) : null}

        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{error}</p>
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

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/esqueci-senha"
              className="text-xs font-medium text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            required
            disabled={isPending}
            placeholder="Digite sua senha"
          />
        </div>
      </form>
    </AuthCard>
  );
}
