import Link from "next/link";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  ToggleLeft,
  UserRound,
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
  calculatePatientAge,
  formatPatientDate,
  getPatientDisplaySubtitle,
  getPatientToggleActionLabel,
  patientStatusLabels,
} from "@/lib/patient-format";
import type { PatientRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type PatientCardProps = {
  patient: PatientRow;
  onView?: (patient: PatientRow) => void;
  onToggleStatus?: (patient: PatientRow) => void;
};

function PatientStatusBadge({ status }: { status: PatientRow["status"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide",
        status === "active" &&
          "border-clinical-success/30 bg-clinical-success/10 text-clinical-success",
        status === "inactive" &&
          "border-destructive/30 bg-destructive/10 text-destructive",
        status === "discharged" &&
          "border-muted-foreground/30 bg-muted text-muted-foreground"
      )}
    >
      {patientStatusLabels[status]}
    </Badge>
  );
}

function PatientDetailField({
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

export function PatientCard({ patient, onView, onToggleStatus }: PatientCardProps) {
  const subtitle = getPatientDisplaySubtitle(patient.diagnosis, patient.cpf);
  const recordHref = `/paciente/${patient.id}/prontuario`;
  const editHref = `/dashboard/pacientes/${patient.id}/editar`;
  const toggleLabel = getPatientToggleActionLabel(patient.status);

  return (
    <article className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-muted/30 px-4 py-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground">
            <UserRound className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {patient.full_name}
              {subtitle ? (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  - {subtitle}
                </span>
              ) : null}
            </h3>
          </div>
        </div>
        <PatientStatusBadge status={patient.status} />
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
        <PatientDetailField
          label="Data Nascimento"
          value={formatPatientDate(patient.birth_date)}
        />
        <PatientDetailField
          label="Idade"
          value={calculatePatientAge(patient.birth_date)}
        />
        <PatientDetailField
          label="Telefone"
          value={patient.guardian_phone ?? "—"}
        />
        <PatientDetailField
          label="Celular"
          value={patient.guardian_phone ?? "—"}
        />
      </div>

      <div className="grid grid-cols-2 border-t border-border/60 bg-muted/20 sm:grid-cols-4">
        <Button
          variant="ghost"
          className="h-auto flex-col gap-1.5 rounded-none border-r border-border/60 px-2 py-3 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          onClick={() => onView?.(patient)}
        >
          <Eye className="size-4" aria-hidden />
          Visualizar
        </Button>
        <Button
          variant="ghost"
          nativeButton={false}
          className="h-auto flex-col gap-1.5 rounded-none border-r border-border/60 px-2 py-3 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          render={<Link href={editHref} />}
        >
          <Pencil className="size-4" aria-hidden />
          Editar
        </Button>
        <Button
          variant="ghost"
          className="h-auto flex-col gap-1.5 rounded-none border-r border-border/60 px-2 py-3 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          onClick={() => onToggleStatus?.(patient)}
        >
          <ToggleLeft className="size-4" aria-hidden />
          {toggleLabel}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-auto w-full flex-col gap-1.5 rounded-none px-2 py-3 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              />
            }
          >
            <MoreHorizontal className="size-4" aria-hidden />
            Mais
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={editHref} />}>
              Editar aprendiz
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={recordHref} />}>
              Abrir prontuário
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Exportar dados</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

export function PatientListRow({
  patient,
  onView,
  onToggleStatus,
}: PatientCardProps) {
  const subtitle = getPatientDisplaySubtitle(patient.diagnosis, patient.cpf);
  const recordHref = `/paciente/${patient.id}/prontuario`;
  const editHref = `/dashboard/pacientes/${patient.id}/editar`;
  const toggleLabel = getPatientToggleActionLabel(patient.status);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{patient.full_name}</p>
            <PatientStatusBadge status={patient.status} />
          </div>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Nasc.: {formatPatientDate(patient.birth_date)}</span>
            <span>Idade: {calculatePatientAge(patient.birth_date)}</span>
            {patient.guardian_name ? (
              <span>Responsável: {patient.guardian_name}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onView?.(patient)}
        >
          <Eye className="size-4" aria-hidden />
          Visualizar
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
          onClick={() => onToggleStatus?.(patient)}
        >
          <ToggleLeft className="size-4" aria-hidden />
          {toggleLabel}
        </Button>
        <Button variant="outline" size="icon-sm" disabled title="Mais opções em breve">
          <MoreHorizontal className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
