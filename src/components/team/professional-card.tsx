import Link from "next/link";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  ToggleLeft,
  UserRound,
  Users,
} from "lucide-react";

import type { TeamMember } from "@/app/actions/team-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  calculateProfessionalAge,
  formatProfessionalDate,
  formatProfessionalDisplayValue,
  getProfessionalDisplaySubtitle,
  getProfessionalRoleLabel,
  getProfessionalToggleActionLabel,
  isProfessionalSupervisor,
  professionalStatusLabels,
} from "@/lib/professional-format";
import { cn } from "@/lib/utils";

type ProfessionalCardProps = {
  professional: TeamMember;
  onView?: (professional: TeamMember) => void;
  onToggleStatus?: (professional: TeamMember) => void;
  onManageTeam?: (professional: TeamMember) => void;
};

function ProfessionalStatusBadge({
  status,
}: {
  status: TeamMember["status"];
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide",
        status === "active" &&
          "border-clinical-success/30 bg-clinical-success/10 text-clinical-success",
        status === "inactive" &&
          "border-destructive/30 bg-destructive/10 text-destructive"
      )}
    >
      {professionalStatusLabels[status]}
    </Badge>
  );
}

function ProfessionalDetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

const cardActionClassName =
  "h-auto min-h-14 w-full flex-col gap-1 rounded-none px-2 py-2.5 text-[0.65rem] font-semibold uppercase leading-tight tracking-wide text-muted-foreground hover:bg-muted/40 hover:text-foreground";

export function ProfessionalCard({
  professional,
  onView,
  onToggleStatus,
  onManageTeam,
}: ProfessionalCardProps) {
  const subtitle = getProfessionalDisplaySubtitle(
    professional.cpf,
    professional.professionalCouncil
  );
  const editHref = `/dashboard/profissionais/${professional.id}/editar`;
  const toggleLabel = getProfessionalToggleActionLabel(professional.status);
  const roleLabel = getProfessionalRoleLabel(
    professional.professionalRole,
    professional.profileLabel
  );

  return (
    <article className="min-w-[17.5rem] overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-background text-muted-foreground">
            {professional.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={professional.avatarUrl}
                alt=""
                className="size-full object-cover rounded-full"
              />
            ) : (
              <UserRound className="size-6" aria-hidden />
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {professional.fullName}
            </h3>
            {subtitle ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <ProfessionalStatusBadge status={professional.status} />
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
        <ProfessionalDetailField
          label="Data Nascimento"
          value={formatProfessionalDate(professional.birthDate)}
        />
        <ProfessionalDetailField
          label="Idade"
          value={calculateProfessionalAge(professional.birthDate)}
        />
        <ProfessionalDetailField label="Cargo" value={roleLabel} />
        <ProfessionalDetailField
          label="E-mail"
          value={formatProfessionalDisplayValue(professional.email)}
        />
      </div>

      <div className="border-t border-border/60 bg-muted/20">
        <div className="grid grid-cols-3 divide-x divide-border/60">
          <Button
            variant="ghost"
            className={cardActionClassName}
            onClick={() => onView?.(professional)}
          >
            <Eye className="size-4 shrink-0" aria-hidden />
            <span className="text-center">Visualizar</span>
          </Button>
          <Button
            variant="ghost"
            nativeButton={false}
            className={cardActionClassName}
            render={<Link href={editHref} />}
          >
            <Pencil className="size-4 shrink-0" aria-hidden />
            <span className="text-center">Editar</span>
          </Button>
          <Button
            variant="ghost"
            disabled={professional.isMaster}
            className={cn(cardActionClassName, "disabled:opacity-50")}
            title={
              professional.isMaster
                ? "Não é possível alterar o status do master"
                : undefined
            }
            onClick={() => onToggleStatus?.(professional)}
          >
            <ToggleLeft className="size-4 shrink-0" aria-hidden />
            <span className="text-center">{toggleLabel}</span>
          </Button>
        </div>

        <div className="grid grid-cols-3 divide-x divide-border/60 border-t border-border/60">
          <Button
            variant="ghost"
            className={cn(cardActionClassName, "col-span-2")}
            onClick={() => onManageTeam?.(professional)}
          >
            <Users className="size-4 shrink-0" aria-hidden />
            <span className="text-center">Gerenciar Equipe</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className={cardActionClassName} />
              }
            >
              <MoreHorizontal className="size-4 shrink-0" aria-hidden />
              <span className="text-center">Mais</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={editHref} />}>
                Editar profissional
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Exportar dados</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}

export function ProfessionalListRow({
  professional,
  onView,
  onToggleStatus,
  onManageTeam,
}: ProfessionalCardProps) {
  const subtitle = getProfessionalDisplaySubtitle(
    professional.cpf,
    professional.professionalCouncil
  );
  const editHref = `/dashboard/profissionais/${professional.id}/editar`;
  const toggleLabel = getProfessionalToggleActionLabel(professional.status);
  const roleLabel = getProfessionalRoleLabel(
    professional.professionalRole,
    professional.profileLabel
  );

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">
              {professional.fullName}
            </p>
            <ProfessionalStatusBadge status={professional.status} />
          </div>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Cargo: {roleLabel}</span>
            {professional.email ? (
              <span>E-mail: {professional.email}</span>
            ) : null}
            <span>
              Supervisor:{" "}
              {isProfessionalSupervisor(professional.profile) ? "Sim" : "Não"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onView?.(professional)}>
          <Eye className="size-4" aria-hidden />
          Visualizar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onManageTeam?.(professional)}
        >
          <Users className="size-4" aria-hidden />
          Gerenciar Equipe
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          nativeButton={false}
          render={<Link href={editHref} />}
        >
          <Pencil className="size-4" aria-hidden />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={professional.isMaster}
          onClick={() => onToggleStatus?.(professional)}
        >
          <ToggleLeft className="size-4" aria-hidden />
          {toggleLabel}
        </Button>
      </div>
    </div>
  );
}
