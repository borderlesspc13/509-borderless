import Link from "next/link";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  ToggleLeft,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatProgramDisplayValue,
  getProgramInitials,
  getProgramToggleActionLabel,
  programRegistrationTypeLabels,
  programStatusLabels,
  type ProgramListItem,
} from "@/lib/program-format";
import { cn } from "@/lib/utils";

type ProgramCardProps = {
  program: ProgramListItem;
  onToggleStatus?: (program: ProgramListItem) => void;
};

function ProgramStatusBadge({ status }: { status: ProgramListItem["status"] }) {
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
      {programStatusLabels[status]}
    </Badge>
  );
}

function ProgramDetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function ProgramCard({ program, onToggleStatus }: ProgramCardProps) {
  const editHref = `/dashboard/programas/${program.id}/editar`;
  const toggleLabel = getProgramToggleActionLabel(program.status);
  const initials = getProgramInitials(program.name);

  return (
    <article className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-sm font-semibold text-muted-foreground">
            {initials}
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
              {program.name}
            </h3>
            <p className="text-xs text-muted-foreground">{program.teaching_type}</p>
          </div>
        </div>
        <ProgramStatusBadge status={program.status} />
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
        <ProgramDetailField label="Nome" value={program.name} />
        <ProgramDetailField
          label="Aprendiz"
          value={formatProgramDisplayValue(program.patientName)}
        />
        <ProgramDetailField
          label="Qnt Alvos Sessão"
          value={String(program.targets_per_session)}
        />
        <ProgramDetailField
          label="Qnt Tent. por alvos"
          value={String(program.attempts_per_target)}
        />
        <ProgramDetailField
          label="Tipo Cadastro"
          value={programRegistrationTypeLabels[program.registration_type]}
        />
      </div>

      <div className="grid grid-cols-4 border-t border-border/60 bg-muted/15">
        <Button
          variant="ghost"
          className="h-auto rounded-none py-3 text-xs font-medium"
          nativeButton={false}
          render={<Link href={editHref} />}
        >
          <Eye className="size-4" />
          Visualizar
        </Button>
        <Button
          variant="ghost"
          className="h-auto rounded-none border-l border-border/60 py-3 text-xs font-medium"
          nativeButton={false}
          render={<Link href={editHref} />}
        >
          <Pencil className="size-4" />
          Editar
        </Button>
        <Button
          variant="ghost"
          className="h-auto rounded-none border-l border-border/60 py-3 text-xs font-medium"
          onClick={() => onToggleStatus?.(program)}
        >
          <ToggleLeft className="size-4" />
          {toggleLabel}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-auto w-full rounded-none border-l border-border/60 py-3 text-xs font-medium"
              >
                <MoreHorizontal className="size-4" />
                Mais
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={editHref} />}>
              Abrir programa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

export function ProgramListRow({
  program,
  onToggleStatus,
}: ProgramCardProps) {
  const editHref = `/dashboard/programas/${program.id}/editar`;
  const toggleLabel = getProgramToggleActionLabel(program.status);

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card px-4 py-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-foreground">{program.name}</h3>
          <ProgramStatusBadge status={program.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {program.teaching_type} ·{" "}
          {programRegistrationTypeLabels[program.registration_type]}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={editHref} />}
        >
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus?.(program)}
        >
          {toggleLabel}
        </Button>
      </div>
    </article>
  );
}
