"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { createTeamMemberAction } from "@/app/actions/team-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
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
import type { UserProfile } from "@/lib/auth";
import { PROFESSIONAL_ROLES } from "@/lib/professionals-data";
import { ROLES } from "@/lib/rbac";

const inputClassName = "h-11 w-full";

const profileSelectItems = userProfileOptions
  .filter((option) => option.value !== ROLES.RECEPCAO)
  .map((option) => ({
    label: option.label,
    value: option.value,
  }));

const roleSelectItems = PROFESSIONAL_ROLES.map((role) => ({
  label: role,
  value: role,
}));

function isClinicalProfile(profile: UserProfile) {
  return (
    profile === ROLES.AT1 ||
    profile === ROLES.AT2 ||
    profile === ROLES.SUPERVISOR
  );
}

export function ProfessionalCreatePageView() {
  const router = useRouter();
  const toast = useAppToast();
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>(ROLES.AT1);
  const [selectedProfessionalRole, setSelectedProfessionalRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createTeamMemberAction({
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        profile: selectedProfile,
        professionalRole: selectedProfessionalRole as
          | (typeof PROFESSIONAL_ROLES)[number]
          | "",
        professionalCouncil: String(formData.get("professionalCouncil") ?? ""),
        cpf: String(formData.get("cpf") ?? ""),
        birthDate: String(formData.get("birthDate") ?? ""),
      });

      if (!result.success) {
        setError(result.error);
        toast.error({
          title: "Falha no cadastro",
          description: result.error ?? "Não foi possível cadastrar o profissional.",
        });
        return;
      }

      const fullName = String(formData.get("fullName") ?? "");
      toast.success({
        title: "Profissional cadastrado",
        description: fullName
          ? `${fullName} foi adicionado à equipe.`
          : "O profissional foi adicionado à equipe.",
      });

      router.push("/dashboard/profissionais");
      router.refresh();
    });
  }

  return (
    <PageContainer size="wide" className="space-y-8">
      <DashboardPageHeader
        title="Novo Profissional"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Profissionais", href: "/dashboard/profissionais" },
          { label: "Novo" },
        ]}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/profissionais" />}
          >
            Voltar
          </Button>
        }
      />

      <section className="rounded-xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 space-y-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <UserPlus className="size-5 text-primary" aria-hidden />
            Cadastrar profissional
          </h2>
          <p className="text-sm text-muted-foreground">
            Crie o acesso do profissional com perfil RBAC e cargo clínico.
          </p>
        </div>

        <form className="grid gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="full-name">Nome completo *</Label>
            <Input
              id="full-name"
              name="fullName"
              required
              className={inputClassName}
              placeholder="Maria Silva Santos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className={inputClassName}
              placeholder="profissional@clinica.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha provisória *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className={inputClassName}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile">Perfil de acesso *</Label>
            <Select
              value={selectedProfile}
              items={profileSelectItems}
              onValueChange={(value) => {
                setSelectedProfile(value as UserProfile);
                if (!isClinicalProfile(value as UserProfile)) {
                  setSelectedProfessionalRole("");
                }
              }}
            >
              <SelectTrigger id="profile" className={inputClassName}>
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {profileSelectItems.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="professional-role">Cargo clínico</Label>
            <Select
              value={selectedProfessionalRole}
              items={roleSelectItems}
              disabled={!isClinicalProfile(selectedProfile)}
              onValueChange={(value) =>
                setSelectedProfessionalRole(value as string)
              }
            >
              <SelectTrigger id="professional-role" className={inputClassName}>
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PROFESSIONAL_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              className={inputClassName}
              placeholder="000.000.000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth-date">Data de nascimento</Label>
            <Input
              id="birth-date"
              name="birthDate"
              type="date"
              className={inputClassName}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="professional-council">Conselho profissional</Label>
            <Input
              id="professional-council"
              name="professionalCouncil"
              className={inputClassName}
              placeholder="CRP 00/00000"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive sm:col-span-2">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              nativeButton={false}
              render={<Link href="/dashboard/profissionais" />}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Cadastrando..." : "Cadastrar profissional"}
            </Button>
          </div>
        </form>
      </section>
    </PageContainer>
  );
}
