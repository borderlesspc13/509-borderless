"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { CheckCircle2, Loader2, UserPlus, Users } from "lucide-react";

import {
  createTeamMemberAction,
  listTeamMembersAction,
  type TeamMember,
} from "@/app/actions/team-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { ProtectedComponent } from "@/components/auth/protected-component";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserRole } from "@/hooks/use-user-role";
import { userProfileOptions } from "@/lib/auth";
import type { UserProfile } from "@/lib/auth";
import { PROFESSIONAL_ROLES } from "@/lib/professionals-data";
import { PERMISSIONS, ROLES } from "@/lib/rbac";

const profileSelectItems = userProfileOptions.map((option) => ({
  label: option.label,
  value: option.value,
}));

const professionalRoleItems = PROFESSIONAL_ROLES.map((role) => ({
  label: role,
  value: role,
}));

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

function isClinicalProfile(profile: UserProfile) {
  return (
    profile === ROLES.AT1 ||
    profile === ROLES.AT2 ||
    profile === ROLES.SUPERVISOR
  );
}

export function TeamManagement() {
  const { hasPermission } = useUserRole();
  const toast = useAppToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile>(
    ROLES.RECEPCAO
  );
  const [selectedProfessionalRole, setSelectedProfessionalRole] = useState("");
  const [isSubmitting, startSubmitTransition] = useTransition();

  const canManageTeam = hasPermission(PERMISSIONS.TEAM_MANAGE);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await listTeamMembersAction();

    if (!result.success) {
      setError(result.error);
      toast.error({
        title: "Falha ao carregar",
        description: result.error ?? "Não foi possível carregar a equipe.",
      });
      setMembers([]);
    } else {
      setMembers(result.data?.members ?? []);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startSubmitTransition(async () => {
      const result = await createTeamMemberAction({
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        profile: selectedProfile,
        professionalRole: selectedProfessionalRole as
          | (typeof PROFESSIONAL_ROLES)[number]
          | "",
        professionalCouncil: String(formData.get("professionalCouncil") ?? ""),
      });

      if (!result.success) {
        setFormError(result.error);
        toast.error({
          title: "Falha no cadastro",
          description: result.error ?? "Não foi possível cadastrar o funcionário.",
        });
        return;
      }

      if (result.data?.member) {
        setMembers((current) =>
          [...current, result.data!.member].sort((a, b) =>
            a.fullName.localeCompare(b.fullName, "pt-BR")
          )
        );
      }

      const successText =
        "Funcionário cadastrado. Compartilhe o e-mail e a senha provisória para o primeiro acesso.";
      setSuccessMessage(successText);
      toast.success({
        title: "Funcionário cadastrado",
        description: successText,
      });
      form.reset();
      setSelectedProfile(ROLES.RECEPCAO);
      setSelectedProfessionalRole("");
    });
  }

  return (
    <div className="space-y-6">
      <ProtectedComponent permission={PERMISSIONS.TEAM_MANAGE}>
        <section className="rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-5 space-y-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <UserPlus className="size-5 text-primary" />
              Cadastrar funcionário
            </h2>
            <p className="text-sm text-muted-foreground">
              Crie contas da equipe com perfil de acesso (RBAC) e cargo clínico
              quando aplicável.
            </p>
          </div>

          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="team-full-name">Nome completo</Label>
              <Input
                id="team-full-name"
                name="fullName"
                required
                className="h-11"
                placeholder="Maria Silva Santos"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-email">E-mail</Label>
              <Input
                id="team-email"
                name="email"
                type="email"
                required
                className="h-11"
                placeholder="funcionario@clinica.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-password">Senha provisória</Label>
              <Input
                id="team-password"
                name="password"
                type="password"
                required
                minLength={8}
                className="h-11"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-profile">Perfil de acesso</Label>
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
                <SelectTrigger id="team-profile" className="h-11 w-full">
                  <SelectValue />
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
            </div>

            {isClinicalProfile(selectedProfile) ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="team-professional-role">
                    Cargo / Especialidade
                  </Label>
                  <Select
                    value={selectedProfessionalRole}
                    items={professionalRoleItems}
                    onValueChange={(value) =>
                      setSelectedProfessionalRole(value as string)
                    }
                  >
                    <SelectTrigger
                      id="team-professional-role"
                      className="h-11 w-full"
                    >
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
                  <Label htmlFor="team-council">Registro profissional</Label>
                  <Input
                    id="team-council"
                    name="professionalCouncil"
                    className="h-11"
                    placeholder="Ex.: CRP 06/12345"
                  />
                </div>
              </>
            ) : null}

            {formError ? (
              <p className="text-sm text-destructive sm:col-span-2">
                {formError}
              </p>
            ) : null}

            {successMessage ? (
              <p className="flex items-center gap-2 text-sm text-[oklch(0.42_0.1_155)] sm:col-span-2">
                <CheckCircle2 className="size-4" />
                {successMessage}
              </p>
            ) : null}

            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="h-11 w-full gap-2 sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {isSubmitting ? "Cadastrando..." : "Cadastrar funcionário"}
              </Button>
            </div>
          </form>
        </section>
      </ProtectedComponent>

      <section className="rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Users className="size-5 text-primary" />
              Equipe cadastrada
            </h2>
            <p className="text-sm text-muted-foreground">
              {canManageTeam
                ? "Gerencie os acessos da clínica."
                : "Visualização da equipe clínica."}
            </p>
          </div>
          <Badge variant="secondary">{members.length} membro(s)</Badge>
        </div>

        {isLoading ? (
          <p className="px-4 py-8 text-sm text-muted-foreground sm:px-6">
            Carregando equipe...
          </p>
        ) : error ? (
          <p className="px-4 py-8 text-sm text-destructive sm:px-6">{error}</p>
        ) : members.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground sm:px-6">
            Nenhum funcionário cadastrado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto px-4 py-4 sm:px-6 sm:py-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-3 sm:px-4">Nome</TableHead>
                  <TableHead className="hidden px-3 sm:table-cell sm:px-4">
                    E-mail
                  </TableHead>
                  <TableHead className="px-3 sm:px-4">Perfil</TableHead>
                  <TableHead className="hidden px-3 md:table-cell sm:px-4">
                    Cargo
                  </TableHead>
                  <TableHead className="hidden px-3 lg:table-cell sm:px-4">
                    Registro
                  </TableHead>
                  <TableHead className="hidden px-3 sm:table-cell sm:px-4">
                    Desde
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="px-3 py-3 font-medium sm:px-4">
                    <div className="flex items-center gap-2">
                      {member.fullName}
                      {member.isMaster ? (
                        <Badge variant="outline" className="text-[0.65rem]">
                          Master
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                    <TableCell className="hidden px-3 py-3 sm:table-cell sm:px-4">
                      {member.email ?? "—"}
                    </TableCell>
                    <TableCell className="px-3 py-3 sm:px-4">
                      {member.profileLabel}
                    </TableCell>
                    <TableCell className="hidden px-3 py-3 md:table-cell sm:px-4">
                      {member.professionalRole ?? "—"}
                    </TableCell>
                    <TableCell className="hidden px-3 py-3 lg:table-cell sm:px-4">
                      {member.professionalCouncil ?? "—"}
                    </TableCell>
                    <TableCell className="hidden px-3 py-3 sm:table-cell sm:px-4">
                      {formatDate(member.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
