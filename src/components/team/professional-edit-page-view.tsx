"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import {
  removeProfessionalAvatarAction,
  uploadProfessionalAvatarAction,
} from "@/app/actions/entity-avatar-actions";
import {
  updateProfessionalAction,
  type TeamMember,
} from "@/app/actions/team-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { EntityAvatarField } from "@/components/shared/entity-avatar-field";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userProfileOptions } from "@/lib/auth";
import type { UserProfile } from "@/lib/auth";
import {
  formatProfessionalDisplayValue,
  formatProfessionalRegistrationStatus,
  getProfessionalRoleLabel,
  isProfessionalSupervisor,
} from "@/lib/professional-format";
import { PROFESSIONAL_ROLES } from "@/lib/professionals-data";
import { cn } from "@/lib/utils";

type ProfessionalEditPageViewProps = {
  professional: TeamMember;
};

const inputClassName = "h-11 w-full";

const profileSelectItems = userProfileOptions.map((option) => ({
  label: option.label,
  value: option.value,
}));

const roleSelectItems = PROFESSIONAL_ROLES.map((role) => ({
  label: role,
  value: role,
}));

function FormField({
  id,
  label,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </Label>
      {children}
    </div>
  );
}

function FormColumns({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
      <div className="space-y-6">{left}</div>
      <div className="space-y-6">{right}</div>
    </div>
  );
}

export function ProfessionalEditPageView({
  professional,
}: ProfessionalEditPageViewProps) {
  const [fullName, setFullName] = useState(professional.fullName);
  const [cpf, setCpf] = useState(professional.cpf ?? "");
  const [birthDate, setBirthDate] = useState(professional.birthDate ?? "");
  const [professionalRole, setProfessionalRole] = useState(
    professional.professionalRole ?? ""
  );
  const [professionalCouncil, setProfessionalCouncil] = useState(
    professional.professionalCouncil ?? ""
  );
  const toast = useAppToast();
  const [profile, setProfile] = useState<UserProfile>(professional.profile);
  const [avatarUrl, setAvatarUrl] = useState(professional.avatarUrl);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleAvatarSelected(file: File | null) {
    if (!file) {
      return;
    }

    setIsAvatarUploading(true);
    const formData = new FormData();
    formData.set("avatar", file);
    const result = await uploadProfessionalAvatarAction(professional.id, formData);
    setIsAvatarUploading(false);

    if (!result.success || !result.data) {
      toast.error({
        title: "Falha no upload da foto",
        description: result.success ? undefined : result.error,
      });
      return;
    }

    setAvatarUrl(result.data.avatarUrl);
    toast.success({ title: "Foto atualizada" });
  }

  async function handleAvatarRemove() {
    setIsAvatarUploading(true);
    const result = await removeProfessionalAvatarAction(professional.id);
    setIsAvatarUploading(false);

    if (!result.success) {
      toast.error({
        title: "Não foi possível remover a foto",
        description: result.error,
      });
      return;
    }

    setAvatarUrl(null);
    toast.success({ title: "Foto removida" });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await updateProfessionalAction({
        professionalId: professional.id,
        fullName,
        cpf,
        birthDate,
        professionalRole,
        professionalCouncil,
        profile,
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar o profissional.";
        setError(message);
        toast.error({ title: "Falha ao salvar", description: message });
        return;
      }

      setSuccessMessage("Dados do profissional salvos com sucesso.");
      toast.success({
        title: "Dados salvos",
        description: "As informações do profissional foram atualizadas.",
      });
    });
  }

  return (
    <PageContainer size="wide" className="space-y-8">
      <DashboardPageHeader
        title="Editar Profissional"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Profissionais", href: "/dashboard/profissionais" },
          { label: "Editar" },
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

      <form onSubmit={handleSubmit}>
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <Tabs defaultValue="geral" className="gap-0">
            <div className="border-b border-border/60 bg-muted/25 px-6 py-4 sm:px-8">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="geral"
                  className="rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground sm:text-sm"
                >
                  Geral
                </TabsTrigger>
                <TabsTrigger
                  value="adicionais"
                  className="rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground sm:text-sm"
                >
                  Info. Adicionais
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="geral" className="mt-0 px-6 py-8 sm:px-8">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
                <EntityAvatarField
                  avatarUrl={avatarUrl}
                  onFileSelected={handleAvatarSelected}
                  onRemove={handleAvatarRemove}
                  isUploading={isAvatarUploading}
                  className="mx-auto xl:mx-0"
                />

                <div className="min-w-0 flex-1">
                  <FormColumns
                    left={
                      <>
                        <FormField id="full-name" label="Nome" required>
                          <Input
                            id="full-name"
                            value={fullName}
                            onChange={(event) => setFullName(event.target.value)}
                            className={inputClassName}
                            required
                          />
                        </FormField>
                        <FormField id="email" label="E-mail">
                          <Input
                            id="email"
                            value={formatProfessionalDisplayValue(professional.email)}
                            className={inputClassName}
                            readOnly
                            disabled
                          />
                        </FormField>
                        <FormField id="role" label="Cargo">
                          <Select
                            value={professionalRole}
                            items={roleSelectItems}
                            onValueChange={(value) =>
                              setProfessionalRole(value as string)
                            }
                          >
                            <SelectTrigger id="role" className={inputClassName}>
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
                        </FormField>
                        <FormField id="profile" label="Perfil de acesso" required>
                          <Select
                            value={profile}
                            items={profileSelectItems}
                            onValueChange={(value) =>
                              setProfile(value as UserProfile)
                            }
                          >
                            <SelectTrigger id="profile" className={inputClassName}>
                              <SelectValue placeholder="Selecione o perfil" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {userProfileOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormField>
                      </>
                    }
                    right={
                      <>
                        <FormField id="cpf" label="CPF">
                          <Input
                            id="cpf"
                            value={cpf}
                            onChange={(event) => setCpf(event.target.value)}
                            className={inputClassName}
                          />
                        </FormField>
                        <FormField id="council" label="Conselho profissional">
                          <Input
                            id="council"
                            value={professionalCouncil}
                            onChange={(event) =>
                              setProfessionalCouncil(event.target.value)
                            }
                            className={inputClassName}
                          />
                        </FormField>
                        <FormField id="supervisor" label="Supervisor">
                          <Input
                            id="supervisor"
                            disabled
                            value={
                              isProfessionalSupervisor(profile) ? "Sim" : "Não"
                            }
                            className={inputClassName}
                          />
                        </FormField>
                      </>
                    }
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2.5 text-sm text-clinical-success">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden />
                <span>
                  {formatProfessionalRegistrationStatus(
                    professional.status,
                    professional.createdAt
                  )}
                </span>
              </div>
            </TabsContent>

            <TabsContent value="adicionais" className="mt-0 px-6 py-8 sm:px-8">
              <FormColumns
                left={
                  <FormField id="birth-date" label="Data Nascimento">
                    <Input
                      id="birth-date"
                      type="date"
                      value={birthDate}
                      onChange={(event) => setBirthDate(event.target.value)}
                      className={inputClassName}
                    />
                  </FormField>
                }
                right={
                  <FormField id="current-role" label="Cargo atual">
                    <Input
                      id="current-role"
                      disabled
                      value={getProfessionalRoleLabel(
                        professionalRole,
                        professional.profileLabel
                      )}
                      className={inputClassName}
                    />
                  </FormField>
                }
              />
            </TabsContent>

            {(error || successMessage) && (
              <div className="space-y-3 border-t border-border/60 px-6 py-4 sm:px-8">
                {error ? (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                ) : null}
                {successMessage ? (
                  <div className="rounded-lg border border-clinical-success/20 bg-clinical-success/5 px-4 py-3 text-sm text-clinical-success">
                    {successMessage}
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 border-t border-border/60 px-6 py-5 sm:px-8">
              <Button
                type="button"
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<Link href="/dashboard/profissionais" />}
              >
                Cancelar
              </Button>
              <Button type="submit" size="lg" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </Tabs>
        </section>
      </form>
    </PageContainer>
  );
}
