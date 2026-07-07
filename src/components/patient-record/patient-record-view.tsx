"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  FolderOpen,
  Loader2,
  Save,
  UserRound,
} from "lucide-react";

import {
  loadPatientEvolutionAction,
  savePatientEvolutionAction,
  type PatientRecordData,
} from "@/app/actions/patient-record-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { ProtectedComponent } from "@/components/auth/protected-component";
import {
  RichTextEditor,
  buildDocumentTemplateVariables,
} from "@/components/clinical-evolution/rich-text-editor";
import { HomeActivitiesPanel } from "@/components/home-activities/home-activities-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/hooks/use-user-role";
import {
  appointmentStatusLabels,
  formatPatientDate,
  formatPatientDateTime,
  patientStatusLabels,
} from "@/lib/patient-format";
import { PERMISSIONS } from "@/lib/rbac";
import { toDateKey } from "@/lib/calendar-utils";
import type { ClinicalEvolutionRecordRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type PatientRecordViewProps = {
  record: PatientRecordData;
};

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function EvolutionStatusBadge({ status }: { status: ClinicalEvolutionRecordRow["status"] }) {
  return (
    <Badge variant={status === "finalized" ? "default" : "secondary"}>
      {status === "finalized" ? "Finalizada" : "Rascunho"}
    </Badge>
  );
}

export function PatientRecordView({ record }: PatientRecordViewProps) {
  const { patient } = record;
  const { hasPermission, userName, displayRole, professionalCouncil } =
    useUserRole();
  const canManageEvolution = hasPermission(PERMISSIONS.CLINICAL_EVOLUTION_MANAGE);

  const toast = useAppToast();
  const [sessionDate, setSessionDate] = useState(toDateKey(new Date()));
  const [contentHtml, setContentHtml] = useState("");
  const [isLoadingEvolution, setIsLoadingEvolution] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [evolutions, setEvolutions] = useState(record.evolutions);

  const templateVariables = buildDocumentTemplateVariables({
    patientName: patient.full_name,
    sessionDate,
    professionalName: userName,
    professionalRole: displayRole,
    professionalCouncil: professionalCouncil ?? undefined,
    diagnosis: patient.diagnosis ?? undefined,
    guardianName: patient.guardian_name ?? undefined,
  });

  const loadEvolutionForDate = useCallback(async () => {
    setIsLoadingEvolution(true);
    setFeedback(null);

    const result = await loadPatientEvolutionAction(patient.id, sessionDate);

    if (!result.success) {
      const message = result.error ?? "Não foi possível carregar a evolução.";
      setFeedback({ type: "error", message });
      toast.error({ title: "Falha ao carregar", description: message });
      setContentHtml("");
      setIsLoadingEvolution(false);
      return;
    }

    setContentHtml(result.data?.record?.content_html ?? "");
    setIsLoadingEvolution(false);
  }, [patient.id, sessionDate]);

  useEffect(() => {
    void loadEvolutionForDate();
  }, [loadEvolutionForDate]);

  async function handleSaveEvolution(status: "draft" | "finalized" = "draft") {
    if (!canManageEvolution) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const result = await savePatientEvolutionAction({
      patientId: patient.id,
      patientName: patient.full_name,
      sessionDate,
      contentHtml,
      status,
    });

    setIsSaving(false);

    if (!result.success || !result.data?.record) {
      const message = result.error ?? "Não foi possível salvar a evolução.";
      setFeedback({ type: "error", message });
      toast.error({ title: "Falha ao salvar", description: message });
      return;
    }

    setEvolutions((current) => {
      const withoutCurrent = current.filter(
        (item) => item.id !== result.data!.record.id
      );
      return [result.data!.record, ...withoutCurrent].sort((left, right) =>
        right.session_date.localeCompare(left.session_date)
      );
    });

    const successMessage =
      status === "finalized"
        ? "Evolução finalizada e registrada no prontuário."
        : "Rascunho salvo com sucesso.";

    setFeedback({ type: "success", message: successMessage });
    toast.success({
      title: status === "finalized" ? "Evolução registrada" : "Rascunho salvo",
      description: successMessage,
    });
  }

  function openEvolution(entry: ClinicalEvolutionRecordRow) {
    setSessionDate(entry.session_date);
    setContentHtml(entry.content_html);
  }

  return (
    <div className="space-y-7">
      <div className="space-y-4 border-b border-border/60 pb-5">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-8 gap-1.5 text-muted-foreground"
          nativeButton={false}
          render={<Link href="/prontuario" />}
        >
          <ArrowLeft className="size-4" />
          Voltar para aprendizes
        </Button>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <UserRound className="size-6 text-primary" aria-hidden />
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              {patient.full_name}
            </h1>
            <Badge variant="outline">
              {patientStatusLabels[patient.status]}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Prontuário individual — registro clínico conforme exigências do
            conselho profissional.
          </p>
        </div>
      </div>

      <Tabs defaultValue="cadastro" className="w-full gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 p-1 sm:w-fit">
          <TabsTrigger value="cadastro">Dados Cadastrais</TabsTrigger>
          <TabsTrigger value="atendimentos">Histórico de Atendimentos</TabsTrigger>
          <TabsTrigger value="evolucoes">Evoluções</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="atividades-casa">Atividades para Casa</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="cadastro">
          <Card>
            <CardHeader>
              <CardTitle>Dados cadastrais</CardTitle>
              <CardDescription>
                Informações de identificação e responsável legal.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoField label="Nome completo" value={patient.full_name} />
              <InfoField
                label="Data de nascimento"
                value={formatPatientDate(patient.birth_date)}
              />
              <InfoField label="CPF" value={patient.cpf} />
              <InfoField label="Diagnóstico" value={patient.diagnosis} />
              <InfoField
                label="Responsável legal"
                value={patient.guardian_name}
              />
              <InfoField
                label="Telefone do responsável"
                value={patient.guardian_phone}
              />
              <InfoField
                label="E-mail do responsável"
                value={patient.guardian_email}
              />
              <InfoField
                label="Cadastrado em"
                value={formatPatientDateTime(patient.created_at)}
              />
              {patient.notes ? (
                <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Observações
                  </p>
                  <p className="text-sm leading-relaxed">{patient.notes}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atendimentos">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de atendimentos</CardTitle>
              <CardDescription>
                Sessões registradas na agenda vinculadas a este paciente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {record.attendances.length === 0 ? (
                <EmptyState message="Nenhum atendimento vinculado a este paciente." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {record.attendances.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell>
                          {formatPatientDate(attendance.event_date)}
                        </TableCell>
                        <TableCell>
                          {attendance.start_time} – {attendance.end_time}
                        </TableCell>
                        <TableCell>{attendance.professional_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {appointmentStatusLabels[attendance.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolucoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registro de evolução clínica</CardTitle>
              <CardDescription>
                Redação narrativa descritiva da sessão, conforme exigência do
                conselho profissional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="evolution-session-date">Data da sessão</Label>
                  <Input
                    id="evolution-session-date"
                    type="date"
                    value={sessionDate}
                    onChange={(event) => setSessionDate(event.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profissional responsável</Label>
                  <div className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2.5 text-sm">
                    Registro vinculado ao profissional autenticado na sessão.
                  </div>
                </div>
              </div>

              {isLoadingEvolution ? (
                <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Carregando evolução...
                </div>
              ) : (
                <RichTextEditor
                  value={contentHtml}
                  onChange={setContentHtml}
                  disabled={!canManageEvolution}
                  enableTemplateInsert={canManageEvolution}
                  templateVariables={templateVariables}
                  placeholder="Descreva objetivos da sessão, observações comportamentais, intervenções realizadas, resposta do aprendiz e encaminhamentos..."
                />
              )}

              {feedback ? (
                <div
                  className={cn(
                    "flex items-start gap-2 rounded-xl border p-4 text-sm",
                    feedback.type === "success"
                      ? "border-clinical-success/20 bg-clinical-success/10 text-[oklch(0.42_0.1_155)]"
                      : "border-destructive/20 bg-destructive/5 text-destructive"
                  )}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                  ) : (
                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                  )}
                  <p>{feedback.message}</p>
                </div>
              ) : null}

              <ProtectedComponent permission={PERMISSIONS.CLINICAL_EVOLUTION_MANAGE}>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 gap-2"
                    onClick={() => void handleSaveEvolution("draft")}
                    disabled={isSaving || isLoadingEvolution}
                  >
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Save className="size-4" aria-hidden />
                    )}
                    Salvar rascunho
                  </Button>
                  <Button
                    type="button"
                    className="h-11 gap-2"
                    onClick={() => void handleSaveEvolution("finalized")}
                    disabled={isSaving || isLoadingEvolution}
                  >
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <FileText className="size-4" aria-hidden />
                    )}
                    Finalizar evolução
                  </Button>
                </div>
              </ProtectedComponent>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Evoluções registradas</CardTitle>
              <CardDescription>
                Histórico completo de evoluções clínicas deste paciente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evolutions.length === 0 ? (
                <EmptyState message="Nenhuma evolução registrada para este paciente." />
              ) : (
                <div className="space-y-3">
                  {evolutions.map((evolution) => (
                    <button
                      key={evolution.id}
                      type="button"
                      onClick={() => openEvolution(evolution)}
                      className="flex w-full flex-col gap-2 rounded-xl border border-border/80 bg-card p-4 text-left transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          Sessão de {formatPatientDate(evolution.session_date)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {evolution.professional_name} · {evolution.professional_role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <EvolutionStatusBadge status={evolution.status} />
                        <span className="text-xs text-muted-foreground">
                          {formatPatientDateTime(evolution.updated_at)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                Evoluções finalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evolutions.filter((item) => item.status === "finalized").length === 0 ? (
                <EmptyState message="Nenhum relatório de evolução finalizado." />
              ) : (
                <div className="space-y-4">
                  {evolutions
                    .filter((item) => item.status === "finalized")
                    .map((evolution) => (
                      <article
                        key={evolution.id}
                        className="rounded-xl border border-border/80 p-4"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">
                            {formatPatientDate(evolution.session_date)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {evolution.professional_name}
                          </p>
                        </div>
                        <div
                          className="prose prose-sm max-w-none text-sm leading-relaxed dark:prose-invert"
                          dangerouslySetInnerHTML={{
                            __html: evolution.content_html,
                          }}
                        />
                      </article>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="size-5 text-primary" />
                Planos terapêuticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {record.therapeuticPlans.length === 0 ? (
                <EmptyState message="Nenhum plano terapêutico cadastrado." />
              ) : (
                <div className="space-y-4">
                  {record.therapeuticPlans.map((plan) => (
                    <article
                      key={plan.id}
                      className="rounded-xl border border-border/80 p-4"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{plan.title}</p>
                        <Badge variant="outline">{plan.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatPatientDate(plan.start_date)}
                        {plan.end_date
                          ? ` — ${formatPatientDate(plan.end_date)}`
                          : ""}{" "}
                        · {plan.professional_name}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              {record.evaluations.length === 0 ? (
                <EmptyState message="Nenhuma avaliação registrada." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Instrumento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Profissional</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {record.evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell>{evaluation.title}</TableCell>
                        <TableCell>{evaluation.instrument ?? "—"}</TableCell>
                        <TableCell>
                          {formatPatientDate(evaluation.evaluation_date)}
                        </TableCell>
                        <TableCell>{evaluation.professional_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{evaluation.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atividades-casa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                Atividades para casa
              </CardTitle>
              <CardDescription>
                Orientações e exercícios publicados pela psicopedagoga para
                acompanhamento familiar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HomeActivitiesPanel
                patientId={patient.id}
                patientName={patient.full_name}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="size-5 text-primary" />
                Documentos do prontuário
              </CardTitle>
              <CardDescription>
                Laudos, termos de consentimento e anexos clínicos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {record.documents.length === 0 ? (
                <EmptyState message="Nenhum documento anexado a este prontuário." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Enviado por</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {record.documents.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>{document.title}</TableCell>
                        <TableCell>{document.document_type}</TableCell>
                        <TableCell>{document.uploaded_by}</TableCell>
                        <TableCell>
                          {formatPatientDateTime(document.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
