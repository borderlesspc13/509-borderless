"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatPatientBirthWithAge,
  formatPatientDisplayValue,
  formatPatientFullName,
  getPatientDisplayId,
} from "@/lib/patient-format";
import {
  getHealthPlanLabel,
  getSupportLevelLabel,
} from "@/lib/patient-form";
import type { PatientRow } from "@/lib/supabase/database.types";

type PatientViewDialogProps = {
  patient: PatientRow | null;
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
        {formatPatientDisplayValue(value)}
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

export function PatientViewDialog({
  patient,
  open,
  onOpenChange,
}: PatientViewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {patient ? (
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle className="text-lg font-semibold">
            Informações #{getPatientDisplayId(patient.id)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 px-6 py-5 lg:grid-cols-2">
          <div className="space-y-4">
            <InfoSection title="Geral">
              <InfoField
                label="Nome"
                value={formatPatientFullName(
                  patient.full_name,
                  patient.diagnosis
                )}
                className="sm:col-span-2"
              />
              <InfoField label="CPF" value={patient.cpf} />
              <InfoField
                label="E-mail do responsável"
                value={patient.guardian_email}
              />
              <InfoField
                label="Nome do Responsável 1"
                value={patient.guardian_name}
              />
              <InfoField
                label="Nome do Responsável 2"
                value={patient.guardian_name_2}
              />
              <InfoField
                label="Convênio Saúde"
                value={getHealthPlanLabel(patient.health_plan)}
              />
              <InfoField
                label="Nível de Suporte"
                value={getSupportLevelLabel(patient.support_level)}
              />
              <InfoField
                label="Identificador Convênio"
                value={patient.health_plan_identifier}
              />
              <InfoField label="Usuário" value={null} />
              <InfoField label="Perfil" value={null} />
            </InfoSection>

            <InfoSection title="Endereço">
              <InfoField label="CEP" value={patient.zip_code} />
              <InfoField label="Estado" value={patient.state} />
              <InfoField label="Cidade" value={patient.city} />
              <InfoField label="Logradouro" value={patient.street} />
              <InfoField label="Bairro" value={patient.neighborhood} />
              <InfoField
                label="Complemento"
                value={patient.address_complement}
              />
            </InfoSection>
          </div>

          <InfoSection title="Info. Adicionais" className="h-fit lg:h-full">
            <InfoField
              label="Data Nascimento"
              value={formatPatientBirthWithAge(patient.birth_date)}
            />
            <InfoField label="Sexo" value={patient.gender} />
            <InfoField label="Estado Civil" value={patient.marital_status} />
            <InfoField label="RG" value={patient.rg} />
            <InfoField label="Órgão Emissor" value={patient.rg_issuer} />
            <InfoField label="Profissão" value={patient.profession} />
            <InfoField label="Site" value={patient.website} />
            <InfoField label="Naturalidade" value={patient.birthplace} />
            <InfoField label="Contato" value={patient.contact} />
            <InfoField label="Telefone 1" value={patient.phone} />
            <InfoField label="Telefone 2" value={patient.guardian_phone} />
            <InfoField
              label="Observações"
              value={patient.notes}
              className="sm:col-span-2"
            />
          </InfoSection>
        </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
