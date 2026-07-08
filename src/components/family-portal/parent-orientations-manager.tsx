"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Loader2,
  Lightbulb,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  deleteParentOrientationAction,
  listParentOrientationsAction,
  saveParentOrientationAction,
} from "@/app/actions/parent-orientation-actions";
import { RichTextEditor } from "@/components/clinical-evolution/rich-text-editor";
import { useAppToast } from "@/hooks/use-app-toast";
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
import type { ClinicalPatient } from "@/lib/clinical-evolution-data";
import type { ParentOrientationRow } from "@/lib/supabase/database.types";

type ParentOrientationsManagerProps = {
  patients: ClinicalPatient[];
};

type OrientationFormState = {
  id: string | null;
  title: string;
  contentHtml: string;
  peiUrl: string;
  peiLabel: string;
  isPublished: boolean;
};

const EMPTY_FORM: OrientationFormState = {
  id: null,
  title: "",
  contentHtml: "",
  peiUrl: "",
  peiLabel: "",
  isPublished: true,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function ParentOrientationsManager({
  patients,
}: ParentOrientationsManagerProps) {
  const toast = useAppToast();

  const activePatients = patients.filter((patient) => patient.id);
  const patientSelectItems = activePatients.map((patient) => ({
    label: patient.name,
    value: patient.id,
  }));

  const [patientId, setPatientId] = useState(activePatients[0]?.id ?? "");
  const [orientations, setOrientations] = useState<ParentOrientationRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<OrientationFormState>(EMPTY_FORM);

  const loadOrientations = useCallback(async () => {
    if (!patientId) {
      setOrientations([]);
      return;
    }

    setIsLoading(true);
    const result = await listParentOrientationsAction(patientId);
    setIsLoading(false);

    if (!result.success) {
      toast.error({
        title: "Falha ao carregar",
        description: result.error ?? "Não foi possível carregar as orientações.",
      });
      return;
    }

    setOrientations(result.orientations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  useEffect(() => {
    void loadOrientations();
  }, [loadOrientations]);

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function editOrientation(row: ParentOrientationRow) {
    setForm({
      id: row.id,
      title: row.title,
      contentHtml: row.content_html,
      peiUrl: row.pei_url ?? "",
      peiLabel: row.pei_label ?? "",
      isPublished: row.is_published,
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSave() {
    if (!patientId) {
      toast.warning({
        title: "Selecione o paciente",
        description: "Escolha um aprendiz para publicar a orientação.",
      });
      return;
    }

    if (!form.title.trim()) {
      toast.warning({
        title: "Título obrigatório",
        description: "Informe um título para a orientação.",
      });
      return;
    }

    setIsSaving(true);
    const result = await saveParentOrientationAction({
      id: form.id ?? undefined,
      patientId,
      title: form.title.trim(),
      contentHtml: form.contentHtml,
      peiUrl: form.peiUrl.trim() || null,
      peiLabel: form.peiLabel.trim() || null,
      isPublished: form.isPublished,
    });
    setIsSaving(false);

    if (!result.success) {
      toast.error({
        title: "Falha ao salvar",
        description: result.error ?? "Não foi possível salvar a orientação.",
      });
      return;
    }

    toast.success({
      title: form.id ? "Orientação atualizada" : "Orientação publicada",
      description: "O conteúdo está disponível para a família.",
    });
    resetForm();
    void loadOrientations();
  }

  async function handleDelete(id: string) {
    const result = await deleteParentOrientationAction(id);

    if (!result.success) {
      toast.error({
        title: "Falha ao remover",
        description: result.error ?? "Não foi possível remover a orientação.",
      });
      return;
    }

    toast.success({
      title: "Orientação removida",
      description: "O conteúdo não está mais visível para a família.",
    });

    if (form.id === id) {
      resetForm();
    }
    void loadOrientations();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="orientation-patient">Aprendiz</Label>
          {activePatients.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
              Nenhum aprendiz cadastrado.
            </p>
          ) : (
            <Select
              value={patientId}
              items={patientSelectItems}
              onValueChange={(value) => {
                setPatientId(value as string);
                resetForm();
              }}
            >
              <SelectTrigger id="orientation-patient" className="h-10 w-full">
                <SelectValue placeholder="Selecione o aprendiz" />
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
      </section>

      <section className="space-y-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold">
            {form.id ? "Editar orientação" : "Nova orientação para a família"}
          </h2>
          {form.id ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto h-8 gap-1 text-muted-foreground"
              onClick={resetForm}
            >
              <X className="size-3.5" aria-hidden />
              Cancelar edição
            </Button>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="orientation-title">Título</Label>
          <Input
            id="orientation-title"
            className="h-10"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Ex.: Estratégias para reforçar em casa"
          />
        </div>

        <div className="space-y-2">
          <Label>Conteúdo</Label>
          <RichTextEditor
            value={form.contentHtml}
            onChange={(html) =>
              setForm((current) => ({ ...current, contentHtml: html }))
            }
            placeholder="Descreva orientações, demandas e objetivos a reforçar no ambiente familiar..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="orientation-pei-url">Link do PEI (opcional)</Label>
            <Input
              id="orientation-pei-url"
              className="h-10"
              value={form.peiUrl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  peiUrl: event.target.value,
                }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orientation-pei-label">Rótulo do PEI (opcional)</Label>
            <Input
              id="orientation-pei-label"
              className="h-10"
              value={form.peiLabel}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  peiLabel: event.target.value,
                }))
              }
              placeholder="Ex.: PEI 2026 - 1º semestre"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            className="size-4 rounded border-border accent-primary"
            checked={form.isPublished}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isPublished: event.target.checked,
              }))
            }
          />
          Visível para a família (publicado)
        </label>

        <div className="flex justify-end">
          <Button
            type="button"
            className="h-11 gap-2"
            onClick={() => void handleSave()}
            disabled={isSaving || !patientId}
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : form.id ? (
              <Save className="size-4" aria-hidden />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
            {form.id ? "Salvar alterações" : "Publicar orientação"}
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Orientações publicadas</h2>
          {orientations.length > 0 ? (
            <Badge variant="secondary">{orientations.length}</Badge>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Carregando...
          </div>
        ) : orientations.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/15 px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma orientação cadastrada para este aprendiz.
          </p>
        ) : (
          <ul className="space-y-3">
            {orientations.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-border/70 bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {row.title}
                      </h3>
                      {row.is_published ? (
                        <Badge
                          variant="secondary"
                          className="bg-clinical-success/12 text-clinical-success"
                        >
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="outline">Rascunho</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {row.author_name} · {formatDate(row.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => editOrientation(row)}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
                      onClick={() => void handleDelete(row.id)}
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Remover
                    </Button>
                  </div>
                </div>

                {row.content_html ? (
                  <div
                    className="prose prose-sm mt-3 max-w-none text-foreground/85 prose-p:my-1.5"
                    dangerouslySetInnerHTML={{ __html: row.content_html }}
                  />
                ) : null}

                {row.pei_url ? (
                  <a
                    href={row.pei_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <FileText className="size-4" aria-hidden />
                    {row.pei_label?.trim() || "Abrir PEI"}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
