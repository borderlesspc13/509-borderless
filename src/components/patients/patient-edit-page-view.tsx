"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Flag,
  Pencil,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

import { updatePatientAction } from "@/app/actions/patient-record-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { useAiEntityContext } from "@/features/ai/presentation/hooks/use-ai-entity-context";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPatientRegistrationStatus } from "@/lib/patient-format";
import type { PatientRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type PatientEditPageViewProps = {
  patient: PatientRow;
};

const supportLevelItems = [
  { label: "Nível 1", value: "1" },
  { label: "Nível 2", value: "2" },
  { label: "Nível 3", value: "3" },
];

const healthPlanItems = [
  { label: "Particular", value: "particular" },
  { label: "TRINO SAÚDE", value: "trino" },
];

const quickLinks = [
  { title: "Equipe Terapêutica", icon: Users },
  { title: "Reforçadores", icon: Flag },
  { title: "Comportamentos Interferentes", icon: BookOpen },
  { title: "Parâmetros de Evolução", icon: Settings },
] as const;

const inputClassName = "h-11 w-full";
const textareaClassName =
  "min-h-32 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

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

function QuickLinkCard({
  title,
  icon: Icon,
}: {
  title: string;
  icon: (typeof quickLinks)[number]["icon"];
}) {
  return (
    <button
      type="button"
      disabled
      title={`${title} em breve`}
      className="flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-3 rounded-xl border border-border/70 bg-card px-5 py-6 text-center shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <span className="text-sm font-semibold leading-snug text-foreground">
        {title}
      </span>
    </button>
  );
}

export function PatientEditPageView({ patient }: PatientEditPageViewProps) {
  const [fullName, setFullName] = useState(patient.full_name);
  const [cpf, setCpf] = useState(patient.cpf ?? "");
  const [guardianName, setGuardianName] = useState(patient.guardian_name ?? "");
  const [guardianPhone, setGuardianPhone] = useState(patient.guardian_phone ?? "");
  const [guardianEmail, setGuardianEmail] = useState(patient.guardian_email ?? "");
  const [diagnosis, setDiagnosis] = useState(patient.diagnosis ?? "");
  const [birthDate, setBirthDate] = useState(patient.birth_date ?? "");
  const [notes, setNotes] = useState(patient.notes ?? "");
  const toast = useAppToast();
  const [defineAccess, setDefineAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useAiEntityContext({
    entityId: patient.id,
    entityLabel: patient.full_name,
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await updatePatientAction({
        patientId: patient.id,
        fullName,
        cpf,
        guardianName,
        guardianPhone,
        guardianEmail,
        diagnosis,
        birthDate,
        notes,
      });

      if (!result.success) {
        const message = result.error ?? "Não foi possível salvar o aprendiz.";
        setError(message);
        toast.error({ title: "Falha ao salvar", description: message });
        return;
      }

      setSuccessMessage("Dados do aprendiz salvos com sucesso.");
      toast.success({
        title: "Dados salvos",
        description: "As informações do aprendiz foram atualizadas.",
      });
    });
  }

  return (
    <PageContainer size="wide" className="space-y-8">
      <DashboardPageHeader
        title="Editar Aprendiz"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Aprendizes", href: "/dashboard/pacientes" },
          { label: "Editar" },
        ]}
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/pacientes" />}
          >
            Voltar
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {quickLinks.map((link) => (
          <QuickLinkCard key={link.title} {...link} />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <Tabs defaultValue="geral" className="gap-0">
            <div className="border-b border-border/60 bg-muted/25 px-6 py-4 sm:px-8">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-4">
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
                <TabsTrigger
                  value="endereco"
                  className="rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground sm:text-sm"
                >
                  Endereço
                </TabsTrigger>
                <TabsTrigger
                  value="anexos"
                  className="rounded-lg border border-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground data-active:border-transparent data-active:bg-primary data-active:text-primary-foreground sm:text-sm"
                >
                  Anexos
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="geral" className="mt-0 px-6 py-8 sm:px-8">
              <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
                <div className="relative mx-auto shrink-0 xl:mx-0">
                  <div className="flex size-32 items-center justify-center rounded-full border border-border/70 bg-muted/30 text-muted-foreground">
                    <UserRound className="size-14" aria-hidden />
                  </div>
                  <div className="absolute right-1 bottom-1 flex size-8 items-center justify-center rounded-full border border-border/70 bg-clinical-warning text-foreground shadow-sm">
                    <Pencil className="size-3.5" aria-hidden />
                  </div>
                </div>

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
                        <FormField id="guardian-name" label="Nome do Responsável 1">
                          <Input
                            id="guardian-name"
                            value={guardianName}
                            onChange={(event) =>
                              setGuardianName(event.target.value)
                            }
                            className={inputClassName}
                          />
                        </FormField>
                        <FormField id="diagnosis" label="Diagnóstico">
                          <Input
                            id="diagnosis"
                            value={diagnosis}
                            onChange={(event) => setDiagnosis(event.target.value)}
                            className={inputClassName}
                          />
                        </FormField>
                        <FormField id="health-plan" label="Convênio Saúde">
                          <Select items={healthPlanItems} disabled>
                            <SelectTrigger id="health-plan" className={inputClassName}>
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
                        <FormField id="guardian-name-2" label="Nome do Responsável 2">
                          <Input
                            id="guardian-name-2"
                            disabled
                            className={inputClassName}
                          />
                        </FormField>
                        <FormField id="support-level" label="Nível de Suporte">
                          <Select items={supportLevelItems} disabled>
                            <SelectTrigger id="support-level" className={inputClassName}>
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
                        </FormField>
                        <FormField id="health-plan-id" label="Identificador Convênio">
                          <Input
                            id="health-plan-id"
                            disabled
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
                  {formatPatientRegistrationStatus(
                    patient.status,
                    patient.created_at
                  )}
                </span>
              </div>

              <div className="mt-8 space-y-4 border-t border-border/60 pt-8">
                <h3 className="text-base font-semibold text-foreground">Acesso</h3>
                <label className="flex items-start gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={defineAccess}
                    onChange={(event) => setDefineAccess(event.target.checked)}
                    className="mt-0.5 size-4 rounded border-input accent-primary"
                  />
                  <span>Definir dados de acesso para essa conta</span>
                </label>
              </div>
            </TabsContent>

            <TabsContent value="adicionais" className="mt-0 px-6 py-8 sm:px-8">
              <FormColumns
                left={
                  <>
                    <FormField id="birth-date" label="Data Nascimento">
                      <Input
                        id="birth-date"
                        type="date"
                        value={birthDate}
                        onChange={(event) => setBirthDate(event.target.value)}
                        className={inputClassName}
                      />
                    </FormField>
                    <FormField id="marital-status" label="Estado Civil">
                      <Input id="marital-status" disabled className={inputClassName} />
                    </FormField>
                    <FormField id="email" label="E-mail">
                      <Input
                        id="email"
                        type="email"
                        value={guardianEmail}
                        onChange={(event) => setGuardianEmail(event.target.value)}
                        className={inputClassName}
                      />
                    </FormField>
                    <FormField id="phone-2" label="Telefone 2">
                      <Input
                        id="phone-2"
                        value={guardianPhone}
                        onChange={(event) => setGuardianPhone(event.target.value)}
                        className={inputClassName}
                      />
                    </FormField>
                  </>
                }
                right={
                  <>
                    <FormField id="gender" label="Sexo">
                      <Input id="gender" disabled className={inputClassName} />
                    </FormField>
                    <FormField id="rg" label="RG">
                      <Input id="rg" disabled className={inputClassName} />
                    </FormField>
                    <FormField id="phone-1" label="Telefone 1">
                      <Input id="phone-1" disabled className={inputClassName} />
                    </FormField>
                  </>
                }
                footer={
                  <FormField id="notes" label="Observações">
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className={textareaClassName}
                    />
                  </FormField>
                }
              />
            </TabsContent>

            <TabsContent value="endereco" className="mt-0 px-6 py-8 sm:px-8">
              <FormColumns
                left={
                  <>
                    <FormField id="zip-code" label="CEP">
                      <Input id="zip-code" disabled className={inputClassName} />
                    </FormField>
                    <FormField id="city" label="Cidade">
                      <Input id="city" disabled className={inputClassName} />
                    </FormField>
                    <FormField id="district" label="Bairro">
                      <Input id="district" disabled className={inputClassName} />
                    </FormField>
                  </>
                }
                right={
                  <>
                    <FormField id="state" label="Estado">
                      <Input id="state" disabled className={inputClassName} />
                    </FormField>
                    <FormField id="street" label="Logradouro">
                      <Input id="street" disabled className={inputClassName} />
                    </FormField>
                    <FormField id="complement" label="Complemento">
                      <Input id="complement" disabled className={inputClassName} />
                    </FormField>
                  </>
                }
              />
              <p className="mt-6 text-sm text-muted-foreground">
                Campos de endereço serão habilitados em uma próxima versão.
              </p>
            </TabsContent>

            <TabsContent value="anexos" className="mt-0 px-6 py-8 sm:px-8">
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
                <p className="text-sm font-medium text-foreground">
                  Nenhum anexo cadastrado
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Os documentos do aprendiz podem ser gerenciados no prontuário.
                </p>
                <Button
                  className="mt-5"
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={`/paciente/${patient.id}/prontuario`} />}
                >
                  Abrir prontuário
                </Button>
              </div>
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
                render={<Link href="/dashboard/pacientes" />}
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
