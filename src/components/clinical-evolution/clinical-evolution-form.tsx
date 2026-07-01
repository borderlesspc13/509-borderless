"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileDown,
  Loader2,
  Save,
} from "lucide-react";

import {
  loadClinicalEvolutionAction,
  listClinicalEvolutionDraftsAction,
  saveClinicalEvolutionAction,
} from "@/app/actions/clinical-evolution-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { ProtectedComponent } from "@/components/auth/protected-component";
import {
  RichTextEditor,
  buildDocumentTemplateVariables,
} from "@/components/clinical-evolution/rich-text-editor";
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
import { useUserRole } from "@/hooks/use-user-role";
import { PERMISSIONS } from "@/lib/rbac";
import {
  getClinicalPatient,
  type ClinicalPatient,
} from "@/lib/clinical-evolution-data";
import { generateClinicalEvolutionPdf } from "@/lib/clinical-evolution-pdf";
import { toDateKey } from "@/lib/calendar-utils";
import type { ClinicalEvolutionRecordRow } from "@/lib/supabase/database.types";

type ClinicalEvolutionFormProps = {
  patients: ClinicalPatient[];
};

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ClinicalEvolutionForm({ patients }: ClinicalEvolutionFormProps) {
  const { userName, displayRole, professionalCouncil, hasPermission } =
    useUserRole();

  const canManageClinicalEvolution = hasPermission(
    PERMISSIONS.CLINICAL_EVOLUTION_MANAGE
  );

  const activePatients = patients.filter((patient) => patient.id);
  const patientSelectItems = activePatients.map((patient) => ({
    label: patient.name,
    value: patient.id,
  }));

  const [patientId, setPatientId] = useState(activePatients[0]?.id ?? "");
  const [sessionDate, setSessionDate] = useState(toDateKey(new Date()));
  const [contentHtml, setContentHtml] = useState("");
  const [drafts, setDrafts] = useState<ClinicalEvolutionRecordRow[]>([]);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const toast = useAppToast();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const selectedPatient = getClinicalPatient(activePatients, patientId);

  const templateVariables = buildDocumentTemplateVariables({
    patientName: selectedPatient?.name,
    sessionDate,
    professionalName: userName,
    professionalRole: displayRole,
    professionalCouncil: professionalCouncil ?? undefined,
    diagnosis: selectedPatient?.diagnosis,
    guardianName: selectedPatient?.guardian,
  });

  const loadDrafts = useCallback(async () => {
    const result = await listClinicalEvolutionDraftsAction(userName);

    if (result.success) {
      setDrafts(result.drafts);
    }
  }, [userName]);

  const loadCurrentRecord = useCallback(async () => {
    if (!patientId) {
      return;
    }

    setIsLoadingDraft(true);
    setFeedback(null);

    const result = await loadClinicalEvolutionAction(
      patientId,
      sessionDate,
      userName
    );

    if (!result.success) {
      const message = result.error ?? "Não foi possível carregar o rascunho.";
      setFeedback({ type: "error", message });
      toast.error({ title: "Falha ao carregar", description: message });
      setIsLoadingDraft(false);
      return;
    }

    setContentHtml(result.record?.content_html ?? "");
    setLastSavedAt(result.record?.updated_at ?? null);
    setIsLoadingDraft(false);
  }, [patientId, sessionDate, userName]);

  useEffect(() => {
    void loadDrafts();
  }, [loadDrafts]);

  useEffect(() => {
    void loadCurrentRecord();
  }, [loadCurrentRecord]);

  async function handleSaveDraft() {
    if (!selectedPatient || !canManageClinicalEvolution) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const result = await saveClinicalEvolutionAction({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      sessionDate,
      contentHtml,
      professionalName: userName,
      professionalRole: displayRole,
      professionalCouncil: professionalCouncil ?? undefined,
      status: "draft",
    });

    setIsSaving(false);

    if (!result.success) {
      const message = result.error ?? "Não foi possível salvar o rascunho.";
      setFeedback({ type: "error", message });
      toast.error({ title: "Falha ao salvar", description: message });
      return;
    }

    setLastSavedAt(result.record?.updated_at ?? new Date().toISOString());
    const successMessage =
      "Rascunho salvo. Você pode retomar este relatório a qualquer momento.";
    setFeedback({ type: "success", message: successMessage });
    toast.success({ title: "Rascunho salvo", description: successMessage });
    void loadDrafts();
  }

  async function handleGeneratePdf() {
    if (!selectedPatient) {
      return;
    }

    if (!contentHtml.trim() || contentHtml === "<br>") {
      const message = "Escreva a evolução clínica antes de gerar o PDF.";
      setFeedback({ type: "error", message });
      toast.warning({ title: "Conteúdo vazio", description: message });
      return;
    }

    setIsGeneratingPdf(true);
    setFeedback(null);

    try {
      await generateClinicalEvolutionPdf({
        patient: selectedPatient,
        sessionDate,
        contentHtml,
        professionalName: userName,
        professionalRole: displayRole,
        professionalCouncil: professionalCouncil ?? undefined,
      });
    } catch (error) {
      console.error("[evolucao-pdf]", error);
      setFeedback({
        type: "error",
        message: "Não foi possível gerar o PDF do relatório.",
      });
      toast.error({
        title: "Falha ao gerar PDF",
        description: "Não foi possível gerar o PDF do relatório.",
      });
      setIsGeneratingPdf(false);
      return;
    }

    const saveResult = await saveClinicalEvolutionAction({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      sessionDate,
      contentHtml,
      professionalName: userName,
      professionalRole: displayRole,
      professionalCouncil: professionalCouncil ?? undefined,
      status: "finalized",
    });

    if (!saveResult.success) {
      const message =
        "PDF gerado com sucesso, mas não foi possível marcar o relatório como finalizado no banco.";
      setFeedback({ type: "success", message });
      toast.warning({ title: "PDF gerado parcialmente", description: message });
    } else {
      setFeedback({
        type: "success",
        message: "PDF gerado com sucesso.",
      });
      toast.success({
        title: "PDF gerado",
        description: "O relatório foi exportado com sucesso.",
      });
    }

    void loadDrafts();
    setIsGeneratingPdf(false);
  }

  function resumeDraft(draft: ClinicalEvolutionRecordRow) {
    setPatientId(draft.patient_id);
    setSessionDate(draft.session_date);
    setContentHtml(draft.content_html);
    setLastSavedAt(draft.updated_at);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="evolution-patient">Paciente</Label>
          {activePatients.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
              Nenhum paciente cadastrado. Cadastre um aprendiz em Aprendizes.
            </p>
          ) : (
            <Select
              value={patientId}
              items={patientSelectItems}
              onValueChange={(value) => setPatientId(value as string)}
            >
              <SelectTrigger id="evolution-patient" className="h-10 w-full">
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {activePatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>

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
            <p className="font-medium">{userName}</p>
            <p className="text-muted-foreground">
              {displayRole} · {professionalCouncil}
            </p>
          </div>
        </div>
      </section>

      {selectedPatient ? (
        <section className="rounded-xl border border-border/80 bg-muted/20 p-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <p>
              <span className="text-muted-foreground">Responsável:</span>{" "}
              {selectedPatient.guardian}
            </p>
            <p>
              <span className="text-muted-foreground">Diagnóstico:</span>{" "}
              {selectedPatient.diagnosis}
            </p>
            {lastSavedAt ? (
              <p className="sm:col-span-2">
                <span className="text-muted-foreground">Último salvamento:</span>{" "}
                {formatUpdatedAt(lastSavedAt)}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {drafts.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Rascunhos recentes</h2>
            <Badge variant="secondary">{drafts.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {drafts.map((draft) => (
              <Button
                key={draft.id}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto flex-col items-start gap-0.5 px-3 py-2 text-left"
                onClick={() => resumeDraft(draft)}
              >
                <span className="font-medium">{draft.patient_name}</span>
                <span className="text-xs text-muted-foreground">
                  {draft.session_date} · {formatUpdatedAt(draft.updated_at)}
                </span>
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Relatório narrativo da sessão</h2>
          <p className="text-sm text-muted-foreground">
            Redija a evolução de forma descritiva, incluindo observações
            comportamentais, intervenções realizadas e recomendações.
          </p>
        </div>

        {isLoadingDraft ? (
          <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Carregando rascunho...
          </div>
        ) : (
          <RichTextEditor
            value={contentHtml}
            onChange={setContentHtml}
            disabled={!canManageClinicalEvolution}
            enableTemplateInsert={canManageClinicalEvolution}
            templateVariables={templateVariables}
          />
        )}
      </section>

      {feedback ? (
        <div
          className={
            feedback.type === "success"
              ? "flex items-start gap-2 rounded-xl border border-clinical-success/20 bg-clinical-success/10 p-4 text-sm text-[oklch(0.42_0.1_155)]"
              : "flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
          }
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
        <section className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2"
            onClick={() => void handleSaveDraft()}
            disabled={isSaving || isLoadingDraft || !selectedPatient}
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
            onClick={() => void handleGeneratePdf()}
            disabled={isGeneratingPdf || isLoadingDraft || !selectedPatient}
          >
            {isGeneratingPdf ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <FileDown className="size-4" aria-hidden />
            )}
            Gerar PDF do relatório
          </Button>
        </section>
      </ProtectedComponent>
    </div>
  );
}
