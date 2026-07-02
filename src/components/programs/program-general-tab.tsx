"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { saveProgramGeneralAction } from "@/app/actions/program-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  ProgramFormField,
  programInputClassName,
} from "@/components/programs/program-form-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  programProtocols,
  programQuantityOptions,
  programSpecialties,
  programTeachingTypes,
  type ProgramDetails,
} from "@/lib/program-format";
import type { PatientRow } from "@/lib/supabase/database.types";

type ProgramGeneralTabProps = {
  details?: ProgramDetails;
  patients: PatientRow[];
  onSaved?: (details: ProgramDetails) => void;
};

const registrationTypeOptions = [
  { label: "Catálogo de Programas", value: "catalog" },
  { label: "Programa de Aprendiz", value: "learner" },
] as const;

const protocolItems = programProtocols.map((value) => ({ label: value, value }));
const specialtyItems = [
  { label: "—", value: "" },
  ...programSpecialties.map((value) => ({ label: value, value })),
];
const teachingTypeItems = programTeachingTypes.map((value) => ({
  label: value,
  value,
}));
const quantityItems = programQuantityOptions.map((value) => ({
  label: value,
  value,
}));

export function ProgramGeneralTab({
  details,
  patients,
  onSaved,
}: ProgramGeneralTabProps) {
  const router = useRouter();
  const toast = useAppToast();
  const program = details?.program;
  const [registrationType, setRegistrationType] = useState<
    "catalog" | "learner"
  >(program?.registration_type ?? "catalog");
  const [name, setName] = useState(program?.name ?? "");
  const [protocol, setProtocol] = useState(program?.protocol ?? "");
  const [specialty, setSpecialty] = useState(program?.specialty ?? "");
  const [skill, setSkill] = useState(program?.skill ?? "");
  const [milestoneCoding, setMilestoneCoding] = useState(
    program?.milestone_coding ?? ""
  );
  const [teachingType, setTeachingType] = useState(program?.teaching_type ?? "");
  const [targetsPerSession, setTargetsPerSession] = useState(
    String(program?.targets_per_session ?? 1)
  );
  const [attemptsPerTarget, setAttemptsPerTarget] = useState(
    String(program?.attempts_per_target ?? 1)
  );
  const [patientId, setPatientId] = useState(program?.patient_id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const patientItems = [
    { label: "Selecione o aprendiz", value: "" },
    ...patients.map((patient) => ({
      label: patient.full_name,
      value: patient.id,
    })),
  ];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveProgramGeneralAction({
        programId: program?.id,
        name,
        registrationType,
        protocol,
        specialty,
        skill,
        milestoneCoding,
        teachingType,
        targetsPerSession: Number.parseInt(targetsPerSession, 10),
        attemptsPerTarget: Number.parseInt(attemptsPerTarget, 10),
        patientId: patientId || undefined,
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar o programa.";
        setError(message);
        toast.error({ title: "Falha ao salvar", description: message });
        return;
      }

      toast.success({
        title: program ? "Programa atualizado" : "Programa criado",
        description: result.message,
      });

      if (!program && result.data?.program) {
        router.push(`/dashboard/programas/${result.data.program.id}/editar`);
        router.refresh();
        return;
      }

      if (result.data?.program && onSaved && details) {
        onSaved({
          ...details,
          program: result.data.program,
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-muted-foreground">
              Tipo de Cadastro *
            </legend>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
              {registrationTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="radio"
                    name="registration-type"
                    checked={registrationType === option.value}
                    onChange={() => setRegistrationType(option.value)}
                    className="size-4 accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <ProgramFormField id="protocol" label="Protocolo">
            <Select
              value={protocol || null}
              items={protocolItems}
              onValueChange={(value) => setProtocol(value ?? "")}
            >
              <SelectTrigger id="protocol" className={programInputClassName}>
                <SelectValue placeholder="Selecione um protocolo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {protocolItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </ProgramFormField>

          <ProgramFormField id="program-name" label="Nome" required>
            <Input
              id="program-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={programInputClassName}
              placeholder="Digite o nome do programa a ser utilizado"
              required
            />
          </ProgramFormField>

          <ProgramFormField id="teaching-type" label="Tipo Ensino" required>
            <Select
              value={teachingType || null}
              items={teachingTypeItems}
              onValueChange={(value) => setTeachingType(value ?? "")}
            >
              <SelectTrigger id="teaching-type" className={programInputClassName}>
                <SelectValue placeholder="Selecione um tipo de ensino." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {teachingTypeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </ProgramFormField>

          {registrationType === "learner" ? (
            <ProgramFormField id="patient-id" label="Aprendiz" required>
              <Select
                value={patientId || null}
                items={patientItems}
                onValueChange={(value) => setPatientId(value ?? "")}
              >
                <SelectTrigger id="patient-id" className={programInputClassName}>
                  <SelectValue placeholder="Selecione o aprendiz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {patientItems.map((item) => (
                      <SelectItem key={item.value || "empty"} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </ProgramFormField>
          ) : null}
        </div>

        <div className="space-y-6">
          <ProgramFormField id="specialty" label="Especialidade">
            <Select
              value={specialty || null}
              items={specialtyItems}
              onValueChange={(value) => setSpecialty(value ?? "")}
            >
              <SelectTrigger id="specialty" className={programInputClassName}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {specialtyItems.map((item) => (
                    <SelectItem key={item.value || "empty"} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </ProgramFormField>

          <ProgramFormField id="skill" label="Habilidade">
            <Input
              id="skill"
              value={skill}
              onChange={(event) => setSkill(event.target.value)}
              className={programInputClassName}
              placeholder="Selecione uma habilidade"
            />
          </ProgramFormField>

          <ProgramFormField
            id="milestone-coding"
            label="Marco/Codificação"
            hint="Codificação utilizada no marco do programa."
          >
            <Input
              id="milestone-coding"
              value={milestoneCoding}
              onChange={(event) => setMilestoneCoding(event.target.value)}
              className={programInputClassName}
              placeholder="Digite o marco/codificação do programa a ser utilizado"
            />
          </ProgramFormField>

          <ProgramFormField id="targets-per-session" label="Qtde alvos por sessão" required>
            <Select
              value={targetsPerSession}
              items={quantityItems}
              onValueChange={(value) => setTargetsPerSession(value ?? "1")}
            >
              <SelectTrigger id="targets-per-session" className={programInputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {quantityItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </ProgramFormField>

          <ProgramFormField
            id="attempts-per-target"
            label="Qnt tentativas cada alvo"
            required
          >
            <Select
              value={attemptsPerTarget}
              items={quantityItems}
              onValueChange={(value) => setAttemptsPerTarget(value ?? "1")}
            >
              <SelectTrigger id="attempts-per-target" className={programInputClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {quantityItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </ProgramFormField>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-border/60 pt-5">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          {isPending ? "Salvando..." : "Salvar"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          nativeButton={false}
          render={<Link href="/dashboard/programas" />}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
