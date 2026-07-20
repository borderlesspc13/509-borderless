"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { MapPin, Trash2 } from "lucide-react";

import {
  createPatientBodyMarkAction,
  deletePatientBodyMarkAction,
  listPatientBodyMarksAction,
  updatePatientBodyMarkAction,
  type BodyMarkInput,
} from "@/app/actions/body-map-actions";
import { BodySilhouette } from "@/components/patients/body-silhouette";
import { useAppToast } from "@/hooks/use-app-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  BODY_MARK_TYPES,
  BODY_VIEW_SIDES,
  getBodyMarkTypeColorClass,
  getBodyMarkTypeLabel,
  getBodyViewSideLabel,
  type BodyMarkType,
  type BodyViewSide,
} from "@/lib/body-map-format";
import type { PatientBodyMarkRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

export type DraftBodyMark = BodyMarkInput & { localId: string };

type PatientBodyMapPanelProps = {
  /** Quando informado, persiste no banco. Sem patientId = modo rascunho no cadastro. */
  patientId?: string;
  draftMarks?: DraftBodyMark[];
  onDraftMarksChange?: (marks: DraftBodyMark[]) => void;
  readOnly?: boolean;
};

type PendingPoint = {
  viewSide: BodyViewSide;
  xPct: number;
  yPct: number;
} | null;

const markTypeItems = BODY_MARK_TYPES.map((item) => ({
  label: item.label,
  value: item.value,
}));

function rowToDraft(row: PatientBodyMarkRow): DraftBodyMark {
  return {
    localId: row.id,
    viewSide: row.view_side,
    xPct: Number(row.x_pct),
    yPct: Number(row.y_pct),
    markType: row.mark_type,
    severity: row.severity,
    notes: row.notes,
    isActive: row.is_active,
  };
}

export function PatientBodyMapPanel({
  patientId,
  draftMarks = [],
  onDraftMarksChange,
  readOnly = false,
}: PatientBodyMapPanelProps) {
  const toast = useAppToast();
  const [activeSide, setActiveSide] = useState<BodyViewSide>("front");
  const [marks, setMarks] = useState<DraftBodyMark[]>(draftMarks);
  const [isLoading, setIsLoading] = useState(Boolean(patientId));
  const [pendingPoint, setPendingPoint] = useState<PendingPoint>(null);
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [markType, setMarkType] = useState<BodyMarkType>("pain");
  const [severity, setSeverity] = useState("5");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const isDraftMode = !patientId;

  useEffect(() => {
    if (!patientId) {
      setMarks(draftMarks);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const result = await listPatientBodyMarksAction(patientId!);
      if (cancelled) return;

      if (!result.success) {
        toast.error({
          title: "Falha ao carregar mapa",
          description: result.error,
        });
        setMarks([]);
      } else {
        setMarks((result.data?.marks ?? []).map(rowToDraft));
      }
      setIsLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  useEffect(() => {
    if (isDraftMode) {
      setMarks(draftMarks);
    }
  }, [draftMarks, isDraftMode]);

  const displayMarks = useMemo(
    () =>
      marks.map((mark) => ({
        id: mark.localId,
        viewSide: mark.viewSide,
        xPct: mark.xPct,
        yPct: mark.yPct,
        markType: mark.markType,
      })),
    [marks]
  );

  const editingMark = marks.find((mark) => mark.localId === editingMarkId);

  function openCreateDialog(viewSide: BodyViewSide, xPct: number, yPct: number) {
    if (readOnly) return;
    setPendingPoint({ viewSide, xPct, yPct });
    setEditingMarkId(null);
    setMarkType("pain");
    setSeverity("5");
    setNotes("");
  }

  function openEditDialog(markId: string) {
    const mark = marks.find((item) => item.localId === markId);
    if (!mark) return;

    setPendingPoint(null);
    setEditingMarkId(markId);
    setMarkType(mark.markType);
    setSeverity(mark.severity != null ? String(mark.severity) : "5");
    setNotes(mark.notes ?? "");
  }

  function closeDialog() {
    setPendingPoint(null);
    setEditingMarkId(null);
  }

  function syncDraft(next: DraftBodyMark[]) {
    setMarks(next);
    onDraftMarksChange?.(next);
  }

  function handleSaveMark() {
    const severityValue =
      markType === "pain" ? Number.parseInt(severity, 10) || 0 : null;

    startTransition(async () => {
      if (editingMark) {
        if (isDraftMode) {
          syncDraft(
            marks.map((mark) =>
              mark.localId === editingMark.localId
                ? {
                    ...mark,
                    markType,
                    severity: severityValue,
                    notes: notes.trim() || null,
                  }
                : mark
            )
          );
          closeDialog();
          return;
        }

        const result = await updatePatientBodyMarkAction(
          editingMark.localId,
          patientId!,
          {
            markType,
            severity: severityValue,
            notes: notes.trim() || null,
          }
        );

        if (!result.success || !result.data) {
          toast.error({
            title: "Falha ao atualizar",
            description: result.error,
          });
          return;
        }

        setMarks((current) =>
          current.map((mark) =>
            mark.localId === editingMark.localId
              ? rowToDraft(result.data!.mark)
              : mark
          )
        );
        toast.success({ title: "Marcação atualizada" });
        closeDialog();
        return;
      }

      if (!pendingPoint) return;

      const input: BodyMarkInput = {
        viewSide: pendingPoint.viewSide,
        xPct: pendingPoint.xPct,
        yPct: pendingPoint.yPct,
        markType,
        severity: severityValue,
        notes: notes.trim() || null,
      };

      if (isDraftMode) {
        syncDraft([
          ...marks,
          {
            ...input,
            localId: crypto.randomUUID(),
          },
        ]);
        closeDialog();
        return;
      }

      const result = await createPatientBodyMarkAction(patientId!, input);
      if (!result.success || !result.data) {
        toast.error({
          title: "Falha ao salvar",
          description: result.error,
        });
        return;
      }

      setMarks((current) => [rowToDraft(result.data!.mark), ...current]);
      toast.success({ title: "Marcação adicionada" });
      closeDialog();
    });
  }

  function handleDeleteMark(markId: string) {
    startTransition(async () => {
      if (isDraftMode) {
        syncDraft(marks.filter((mark) => mark.localId !== markId));
        closeDialog();
        return;
      }

      const result = await deletePatientBodyMarkAction(markId, patientId!);
      if (!result.success) {
        toast.error({
          title: "Falha ao remover",
          description: result.error,
        });
        return;
      }

      setMarks((current) => current.filter((mark) => mark.localId !== markId));
      toast.success({ title: "Marcação removida" });
      closeDialog();
    });
  }

  const dialogOpen = pendingPoint !== null || editingMarkId !== null;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <MapPin className="size-4 text-primary" aria-hidden />
          Mapa corporal
        </h3>
        <p className="text-sm text-muted-foreground">
          {readOnly
            ? "Marcações de dor, lesão e outras informações clínicas do aprendiz."
            : "Clique na silhueta (frente ou verso) para marcar dor, lesão, ausência de membro ou outras observações."}
        </p>
        {isDraftMode && !readOnly ? (
          <p className="text-xs text-muted-foreground">
            As marcações serão salvas ao cadastrar o aprendiz.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {BODY_VIEW_SIDES.map((side) => (
          <Button
            key={side.value}
            type="button"
            size="sm"
            variant={activeSide === side.value ? "default" : "outline"}
            onClick={() => setActiveSide(side.value)}
          >
            {side.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
          Carregando mapa corporal...
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {getBodyViewSideLabel(activeSide)}
            </p>
            <BodySilhouette
              side={activeSide}
              marks={displayMarks}
              selectedMarkId={editingMarkId}
              readOnly={readOnly}
              onCanvasClick={(xPct, yPct) =>
                openCreateDialog(activeSide, xPct, yPct)
              }
              onMarkClick={openEditDialog}
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Marcações ({marks.length})
            </p>
            {marks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhuma marcação registrada.
              </div>
            ) : (
              <ul className="space-y-2">
                {marks.map((mark) => (
                  <li key={mark.localId}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border border-border/70 bg-card px-3 py-3 text-left transition-colors hover:bg-muted/30",
                        editingMarkId === mark.localId && "border-primary/40 bg-primary/5"
                      )}
                      onClick={() => {
                        setActiveSide(mark.viewSide);
                        openEditDialog(mark.localId);
                      }}
                    >
                      <span
                        className={cn(
                          "mt-1 size-2.5 shrink-0 rounded-full",
                          getBodyMarkTypeColorClass(mark.markType)
                        )}
                      />
                      <span className="min-w-0 flex-1 space-y-0.5">
                        <span className="block text-sm font-medium text-foreground">
                          {getBodyMarkTypeLabel(mark.markType)}
                          {mark.markType === "pain" && mark.severity != null
                            ? ` · intensidade ${mark.severity}/10`
                            : ""}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {getBodyViewSideLabel(mark.viewSide)}
                          {mark.notes ? ` — ${mark.notes}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMark ? "Editar marcação" : "Nova marcação"}
            </DialogTitle>
            <DialogDescription>
              {editingMark
                ? `${getBodyViewSideLabel(editingMark.viewSide)} — ajuste tipo e observações.`
                : pendingPoint
                  ? `${getBodyViewSideLabel(pendingPoint.viewSide)} — descreva o achado clínico.`
                  : "Preencha os dados da marcação."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="body-mark-type">Tipo</Label>
              <Select
                value={markType}
                items={markTypeItems}
                onValueChange={(value) =>
                  setMarkType((value as BodyMarkType) ?? "pain")
                }
              >
                <SelectTrigger id="body-mark-type" className="h-10">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {BODY_MARK_TYPES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {markType === "pain" ? (
              <div className="space-y-2">
                <Label htmlFor="body-mark-severity">Intensidade (0–10)</Label>
                <Input
                  id="body-mark-severity"
                  type="number"
                  min={0}
                  max={10}
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                  className="h-10"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="body-mark-notes">Observações</Label>
              <Textarea
                id="body-mark-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ex.: dor ao movimento, cicatriz cirúrgica, amelia parcial..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            {editingMark && !readOnly ? (
              <Button
                type="button"
                variant="outline"
                className="text-destructive"
                disabled={isPending}
                onClick={() => handleDeleteMark(editingMark.localId)}
              >
                <Trash2 className="size-4" aria-hidden />
                Remover
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              {!readOnly ? (
                <Button type="button" disabled={isPending} onClick={handleSaveMark}>
                  {isPending ? "Salvando..." : "Salvar"}
                </Button>
              ) : null}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
