"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Crown } from "lucide-react";

import {
  getBootstrapStatusAction,
  signUpAction,
} from "@/app/actions/auth-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { AuthCard } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
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
import { userProfileOptions } from "@/lib/auth";

const profileSelectItems = userProfileOptions.map((option) => ({
  label: option.label,
  value: option.value,
}));

export function RegisterForm() {
  const toast = useAppToast();
  const [hasMaster, setHasMaster] = useState<boolean | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void getBootstrapStatusAction().then((status) => {
      setHasMaster(status.hasMaster);
    });
  }, []);

  const isBootstrap = hasMaster === false;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);

    if (!isBootstrap) {
      if (!selectedProfile) {
        const message = "Selecione um perfil válido.";
        setError(message);
        toast.warning({ title: "Perfil obrigatório", description: message });
        return;
      }

      formData.set("profile", selectedProfile);
    }

    startTransition(async () => {
      const result = await signUpAction(formData);

      if (result?.error) {
        setError(result.error);
        toast.error({
          title: "Falha no cadastro",
          description: result.error,
        });
        return;
      }

      if (result?.message) {
        setSuccessMessage(result.message);
        toast.success({
          title: "Conta criada",
          description: result.message,
        });
      }
    });
  }

  if (hasMaster) {
    return (
      <AuthCard
        title="Cadastro restrito"
        description="Novos funcionários são cadastrados pelo administrador da clínica."
        footer={
          <p className="text-center text-sm text-muted-foreground">
            Já possui conta?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Entrar
            </Link>
          </p>
        }
      >
        <div className="rounded-lg border border-border/80 bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>
            Peça ao administrador para criar seu acesso em{" "}
            <strong>Profissionais e equipe</strong> no painel interno.
          </p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={isBootstrap ? "Configurar conta master" : "Criar sua conta"}
      description="Este é o primeiro acesso à plataforma. O cadastro inicial será o usuário master com permissões completas de administração."
      footer={
        <>
          <Button
            type="submit"
            form="register-form"
            className="h-11 w-full"
            size="lg"
            disabled={isPending || hasMaster === null}
          >
            {isPending ? "Criando conta..." : "Criar conta master"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Já possui conta?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Entrar
            </Link>
          </p>
        </>
      }
    >
      <form id="register-form" className="space-y-4" onSubmit={handleSubmit}>
        {isBootstrap ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-medium text-primary">
              <Crown className="size-4" aria-hidden />
              Primeiro cadastro da plataforma
            </div>
            <p className="text-muted-foreground">
              O usuário criado agora será o <strong>master</strong> da clínica,
              com perfil de Administração e acesso total ao sistema.
            </p>
          </div>
        ) : null}

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
          <Label htmlFor="fullName">Nome completo</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Maria Silva Santos"
            autoComplete="name"
            required
            disabled={isPending}
            className="h-11"
          />
        </div>

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
          <Label htmlFor="password">Senha</Label>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
            disabled={isPending}
            placeholder="Mínimo de 8 caracteres"
            minLength={8}
          />
        </div>

        {isBootstrap ? (
          <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5 text-sm">
            <Badge variant="secondary">Perfil automático</Badge>
            <span>Administração · Master da plataforma</span>
          </div>
        ) : hasMaster ? (
          <div className="space-y-2">
            <Label htmlFor="profile">Cargo / Perfil</Label>
            <Select
              value={selectedProfile}
              items={profileSelectItems}
              onValueChange={(value) => setSelectedProfile(value as string)}
              disabled={isPending}
            >
              <SelectTrigger id="profile" className="h-11 w-full">
                <SelectValue placeholder="Selecione seu perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {userProfileOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              O perfil define suas permissões e a experiência no sistema.
            </p>
          </div>
        ) : null}
      </form>
    </AuthCard>
  );
}
