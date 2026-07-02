"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TeamMember } from "@/app/actions/team-actions";
import {
  calculateProfessionalAge,
  formatProfessionalDate,
  formatProfessionalDisplayValue,
  getProfessionalRoleLabel,
  isProfessionalSupervisor,
  professionalStatusLabels,
} from "@/lib/professional-format";

type ProfessionalViewDialogProps = {
  professional: TeamMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function InfoField({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">
        {formatProfessionalDisplayValue(value)}
      </p>
    </div>
  );
}

function InfoSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-border/70 bg-card ${className ?? ""}`}
    >
      <div className="border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function ProfessionalViewDialog({
  professional,
  open,
  onOpenChange,
}: ProfessionalViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {professional ? (
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-0 sm:max-w-5xl">
          <DialogHeader className="border-b border-border/60 px-6 py-4">
            <DialogTitle className="text-lg font-semibold">
              {professional.fullName}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 px-6 py-5 lg:grid-cols-2">
            <div className="space-y-4">
              <InfoSection title="Geral">
                <InfoField
                  label="Nome"
                  value={professional.fullName}
                  className="sm:col-span-2"
                />
                <InfoField label="CPF" value={professional.cpf} />
                <InfoField label="E-mail" value={professional.email} />
                <InfoField
                  label="Cargo"
                  value={getProfessionalRoleLabel(
                    professional.professionalRole,
                    professional.profileLabel
                  )}
                />
                <InfoField
                  label="Perfil de acesso"
                  value={professional.profileLabel}
                />
                <InfoField
                  label="Conselho"
                  value={professional.professionalCouncil}
                />
                <InfoField
                  label="Status"
                  value={professionalStatusLabels[professional.status]}
                />
              </InfoSection>
            </div>

            <InfoSection title="Info. Adicionais" className="h-fit lg:h-full">
              <InfoField
                label="Data Nascimento"
                value={
                  professional.birthDate
                    ? `${formatProfessionalDate(professional.birthDate)} - ${calculateProfessionalAge(professional.birthDate)}`
                    : null
                }
              />
              <InfoField
                label="Supervisor"
                value={
                  isProfessionalSupervisor(professional.profile) ? "Sim" : "Não"
                }
              />
              <InfoField
                label="Cadastrado em"
                value={new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }).format(new Date(professional.createdAt))}
                className="sm:col-span-2"
              />
            </InfoSection>
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
