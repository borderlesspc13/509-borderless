"use client";

import { EntityAvatarField } from "@/components/shared/entity-avatar-field";
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
  healthPlanItems,
  supportLevelItems,
  type PatientFormState,
} from "@/lib/patient-form";
import { cn } from "@/lib/utils";

export const patientInputClassName = "h-11 w-full";
export const patientTextareaClassName =
  "min-h-32 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type PatientFormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function PatientFormField({
  id,
  label,
  required,
  children,
  className,
}: PatientFormFieldProps) {
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

export function PatientFormColumns({
  left,
  right,
  footer,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-2">
        <div className="space-y-6">{left}</div>
        <div className="space-y-6">{right}</div>
      </div>
      {footer ? <div className="pt-2">{footer}</div> : null}
    </div>
  );
}

type PatientFormSectionsProps = {
  values: PatientFormState;
  onChange: <K extends keyof PatientFormState>(
    field: K,
    value: PatientFormState[K]
  ) => void;
  showAvatar?: boolean;
  avatarUrl?: string | null;
  onAvatarFileSelected?: (file: File | null) => void;
  onAvatarRemove?: () => void;
  isAvatarUploading?: boolean;
  requireFullName?: boolean;
};

export function PatientGeralSection({
  values,
  onChange,
  showAvatar = false,
  avatarUrl = null,
  onAvatarFileSelected,
  onAvatarRemove,
  isAvatarUploading = false,
  requireFullName = false,
}: PatientFormSectionsProps) {
  return (
    <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
      {showAvatar ? (
        <EntityAvatarField
          avatarUrl={avatarUrl}
          onFileSelected={onAvatarFileSelected}
          onRemove={onAvatarRemove}
          isUploading={isAvatarUploading}
          className="mx-auto xl:mx-0"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <PatientFormColumns
          left={
            <>
              <PatientFormField
                id="full-name"
                label="Nome"
                required={requireFullName}
              >
                <Input
                  id="full-name"
                  value={values.fullName}
                  onChange={(event) => onChange("fullName", event.target.value)}
                  className={patientInputClassName}
                  required={requireFullName}
                />
              </PatientFormField>
              <PatientFormField id="guardian-name" label="Nome do Responsável 1">
                <Input
                  id="guardian-name"
                  value={values.guardianName}
                  onChange={(event) =>
                    onChange("guardianName", event.target.value)
                  }
                  className={patientInputClassName}
                />
              </PatientFormField>
              <PatientFormField id="diagnosis" label="Diagnóstico">
                <Input
                  id="diagnosis"
                  value={values.diagnosis}
                  onChange={(event) => onChange("diagnosis", event.target.value)}
                  className={patientInputClassName}
                  placeholder="Ex.: TEA — Nível 2"
                />
              </PatientFormField>
              <PatientFormField id="health-plan" label="Convênio Saúde">
                <Select
                  items={healthPlanItems}
                  value={values.healthPlan || null}
                  onValueChange={(value) =>
                    onChange("healthPlan", value ?? "")
                  }
                >
                  <SelectTrigger id="health-plan" className={patientInputClassName}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {healthPlanItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </PatientFormField>
            </>
          }
          right={
            <>
              <PatientFormField id="cpf" label="CPF">
                <Input
                  id="cpf"
                  value={values.cpf}
                  onChange={(event) => onChange("cpf", event.target.value)}
                  className={patientInputClassName}
                  placeholder="000.000.000-00"
                />
              </PatientFormField>
              <PatientFormField id="guardian-name-2" label="Nome do Responsável 2">
                <Input
                  id="guardian-name-2"
                  value={values.guardianName2}
                  onChange={(event) =>
                    onChange("guardianName2", event.target.value)
                  }
                  className={patientInputClassName}
                />
              </PatientFormField>
              <PatientFormField id="support-level" label="Nível de Suporte">
                <Select
                  items={supportLevelItems}
                  value={values.supportLevel || null}
                  onValueChange={(value) =>
                    onChange("supportLevel", value ?? "")
                  }
                >
                  <SelectTrigger id="support-level" className={patientInputClassName}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {supportLevelItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </PatientFormField>
              <PatientFormField
                id="health-plan-id"
                label="Identificador Convênio"
              >
                <Input
                  id="health-plan-id"
                  value={values.healthPlanIdentifier}
                  onChange={(event) =>
                    onChange("healthPlanIdentifier", event.target.value)
                  }
                  className={patientInputClassName}
                />
              </PatientFormField>
            </>
          }
        />
      </div>
    </div>
  );
}

export function PatientAdicionaisSection({
  values,
  onChange,
}: PatientFormSectionsProps) {
  return (
    <PatientFormColumns
      left={
        <>
          <PatientFormField id="birth-date" label="Data Nascimento">
            <Input
              id="birth-date"
              type="date"
              value={values.birthDate}
              onChange={(event) => onChange("birthDate", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
          <PatientFormField id="marital-status" label="Estado Civil">
            <Input
              id="marital-status"
              value={values.maritalStatus}
              onChange={(event) =>
                onChange("maritalStatus", event.target.value)
              }
              className={patientInputClassName}
            />
          </PatientFormField>
          <PatientFormField id="email" label="E-mail do responsável">
            <Input
              id="email"
              type="email"
              value={values.guardianEmail}
              onChange={(event) =>
                onChange("guardianEmail", event.target.value)
              }
              className={patientInputClassName}
              placeholder="responsavel@email.com"
            />
          </PatientFormField>
          <PatientFormField id="phone-2" label="Telefone 2">
            <Input
              id="phone-2"
              value={values.guardianPhone}
              onChange={(event) =>
                onChange("guardianPhone", event.target.value)
              }
              className={patientInputClassName}
              placeholder="(00) 00000-0000"
            />
          </PatientFormField>
          <PatientFormField id="profession" label="Profissão">
            <Input
              id="profession"
              value={values.profession}
              onChange={(event) => onChange("profession", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
          <PatientFormField id="website" label="Site">
            <Input
              id="website"
              value={values.website}
              onChange={(event) => onChange("website", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
        </>
      }
      right={
        <>
          <PatientFormField id="gender" label="Sexo">
            <Input
              id="gender"
              value={values.gender}
              onChange={(event) => onChange("gender", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
          <PatientFormField id="rg" label="RG">
            <Input
              id="rg"
              value={values.rg}
              onChange={(event) => onChange("rg", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
          <PatientFormField id="rg-issuer" label="Órgão Emissor">
            <Input
              id="rg-issuer"
              value={values.rgIssuer}
              onChange={(event) => onChange("rgIssuer", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
          <PatientFormField id="phone-1" label="Telefone 1">
            <Input
              id="phone-1"
              value={values.phone}
              onChange={(event) => onChange("phone", event.target.value)}
              className={patientInputClassName}
              placeholder="(00) 00000-0000"
            />
          </PatientFormField>
          <PatientFormField id="birthplace" label="Naturalidade">
            <Input
              id="birthplace"
              value={values.birthplace}
              onChange={(event) => onChange("birthplace", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
          <PatientFormField id="contact" label="Contato">
            <Input
              id="contact"
              value={values.contact}
              onChange={(event) => onChange("contact", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
        </>
      }
      footer={
        <PatientFormField id="notes" label="Observações">
          <textarea
            id="notes"
            value={values.notes}
            onChange={(event) => onChange("notes", event.target.value)}
            className={patientTextareaClassName}
            placeholder="Informações complementares sobre o aprendiz"
          />
        </PatientFormField>
      }
    />
  );
}

export function PatientEnderecoSection({
  values,
  onChange,
}: PatientFormSectionsProps) {
  return (
    <PatientFormColumns
      left={
        <>
          <PatientFormField id="zip-code" label="CEP">
            <Input
              id="zip-code"
              value={values.zipCode}
              onChange={(event) => onChange("zipCode", event.target.value)}
              className={patientInputClassName}
              placeholder="00000-000"
            />
          </PatientFormField>
          <PatientFormField id="city" label="Cidade">
            <Input
              id="city"
              value={values.city}
              onChange={(event) => onChange("city", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
          <PatientFormField id="district" label="Bairro">
            <Input
              id="district"
              value={values.neighborhood}
              onChange={(event) => onChange("neighborhood", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
        </>
      }
      right={
        <>
          <PatientFormField id="state" label="Estado">
            <Input
              id="state"
              value={values.state}
              onChange={(event) => onChange("state", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
          <PatientFormField id="street" label="Logradouro">
            <Input
              id="street"
              value={values.street}
              onChange={(event) => onChange("street", event.target.value)}
              className={patientInputClassName}
            />
          </PatientFormField>
          <PatientFormField id="complement" label="Complemento">
            <Input
              id="complement"
              value={values.addressComplement}
              onChange={(event) =>
                onChange("addressComplement", event.target.value)
              }
              className={patientInputClassName}
            />
          </PatientFormField>
        </>
      }
    />
  );
}

function formStateToActionInput(values: PatientFormState) {
  return {
    fullName: values.fullName,
    cpf: values.cpf,
    guardianName: values.guardianName,
    guardianName2: values.guardianName2,
    guardianPhone: values.guardianPhone,
    guardianEmail: values.guardianEmail,
    diagnosis: values.diagnosis,
    birthDate: values.birthDate,
    notes: values.notes,
    zipCode: values.zipCode,
    state: values.state,
    city: values.city,
    street: values.street,
    neighborhood: values.neighborhood,
    addressComplement: values.addressComplement,
    gender: values.gender,
    maritalStatus: values.maritalStatus,
    rg: values.rg,
    rgIssuer: values.rgIssuer,
    profession: values.profession,
    website: values.website,
    birthplace: values.birthplace,
    contact: values.contact,
    phone: values.phone,
    healthPlan: values.healthPlan,
    healthPlanIdentifier: values.healthPlanIdentifier,
    supportLevel: values.supportLevel,
  };
}

export { formStateToActionInput };
