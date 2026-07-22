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
import { BodyMapCanvas } from "@/components/patients/body-map-3d/body-map-canvas";
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
  getBodyMarkTypeColorClass,
  getBodyMarkTypeLabel,
  getBodyViewSideLabel,
  type BodyMarkType,
  type BodyViewSide,
} from "@/lib/body-map-format";
import {
  encodeNotesWith3D,
  parseNotes3D,
  type BodyModelType,
} from "@/lib/body-map-3d/proportions";
import type { PatientBodyMarkRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

export type DraftBodyMark = BodyMarkInput & {
  localId: string;
  bodyPart?: string | null;
  position3d?: { x: number; y: number; z: number } | null;
  modelType?: BodyModelType;
};

type PatientBodyMapPanelProps = {
  patientId?: string;
  draftMarks?: DraftBodyMark[];
  onDraftMarksChange?: (marks: DraftBodyMark[]) => void;
  readOnly?: boolean;
  /** Default do manequim (adulto/criança). */
  defaultModelType?: BodyModelType;
};

type PendingPoint = {
  viewSide: BodyViewSide;
  xPct: number;
  yPct: number;
  bodyPart: string;
  position3d: { x: number; y: number; z: number };
} | null;

const markTypeItems = BODY_MARK_TYPES.map((item) => ({
  label: item.label,
  value: item.value,
}));

function severityTone(severity: number) {
  if (severity <= 3) return "text-amber-600";
  if (severity <= 6) return "text-orange-600";
  return "text-red-600";
}

function rowToDraft(row: PatientBodyMarkRow): DraftBodyMark {
  const { meta, userNotes } = parseNotes3D(row.notes);
  return {
    localId: row.id,
    viewSide: row.view_side,
    xPct: Number(row.x_pct),
    yPct: Number(row.y_pct),
    markType: row.mark_type,
    severity: row.severity,
    notes: userNotes || null,
    isActive: row.is_active,
    bodyPart: meta?.part ?? null,
    position3d: meta
      ? { x: meta.x, y: meta.y, z: meta.z }
      : null,
    modelType: meta?.model ?? "child",
  };
}

function persistNotes(mark: {
  notes?: string | null;
  bodyPart?: string | null;
  position3d?: { x: number; y: number; z: number } | null;
  modelType?: BodyModelType;
}) {
  if (mark.position3d && mark.bodyPart) {
    return encodeNotesWith3D(mark.notes, {
      x: Number(mark.position3d.x.toFixed(4)),
      y: Number(mark.position3d.y.toFixed(4)),
      z: Number(mark.position3d.z.toFixed(4)),
      part: mark.bodyPart,
      model: mark.modelType ?? "child",
    });
  }
  return mark.notes?.trim() || null;
}

export function PatientBodyMapPanel({
  patientId,
  draftMarks = [],
  onDraftMarksChange,
  readOnly = false,
  defaultModelType = "child",
}: PatientBodyMapPanelProps) {
  const toast = useAppToast();
  const [modelType, setModelType] = useState<BodyModelType>(defaultModelType);
  const [marks, setMarks] = useState<DraftBodyMark[]>(draftMarks);
  const [isLoading, setIsLoading] = useState(Boolean(patientId));
  const [pendingPoint, setPendingPoint] = useState<PendingPoint>(null);
  const [editingMarkId, setEditingMarkId] = useState<string | null>(null);
  const [markType, setMarkType] = useState<BodyMarkType>("pain");
  const [severity, setSeverity] = useState(5);
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
        severity: mark.severity,
        position3d: mark.position3d,
      })),
    [marks]
  );

  const editingMark = marks.find((mark) => mark.localId === editingMarkId);

  function openCreateDialog(payload: NonNullable<PendingPoint>) {
    if (readOnly) return;
    setPendingPoint(payload);
    setEditingMarkId(null);
    setMarkType("pain");
    setSeverity(5);
    setNotes("");
  }

  function openEditDialog(markId: string) {
    const mark = marks.find((item) => item.localId === markId);
    if (!mark) return;

    setPendingPoint(null);
    setEditingMarkId(markId);
    setMarkType(mark.markType);
    setSeverity(mark.severity != null ? mark.severity : 5);
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
    const severityValue = markType === "pain" ? severity : null;

    startTransition(async () => {
      if (editingMark) {
        const nextNotes = notes.trim() || null;

        if (isDraftMode) {
          syncDraft(
            marks.map((mark) =>
              mark.localId === editingMark.localId
                ? {
                    ...mark,
                    markType,
                    severity: severityValue,
                    notes: nextNotes,
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
            notes: persistNotes({
              notes: nextNotes,
              bodyPart: editingMark.bodyPart,
              position3d: editingMark.position3d,
              modelType: editingMark.modelType ?? modelType,
            }),
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

      const inputBase = {
        viewSide: pendingPoint.viewSide,
        xPct: pendingPoint.xPct,
        yPct: pendingPoint.yPct,
        markType,
        severity: severityValue,
        notes: notes.trim() || null,
        bodyPart: pendingPoint.bodyPart,
        position3d: pendingPoint.position3d,
        modelType,
      };

      if (isDraftMode) {
        syncDraft([
          ...marks,
          {
            ...inputBase,
            localId: crypto.randomUUID(),
          },
        ]);
        closeDialog();
        return;
      }

      const result = await createPatientBodyMarkAction(patientId!, {
        viewSide: inputBase.viewSide,
        xPct: inputBase.xPct,
        yPct: inputBase.yPct,
        markType: inputBase.markType,
        severity: inputBase.severity,
        notes: persistNotes(inputBase),
      });

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
          Mapa corporal 3D
        </h3>
        <p className="text-sm text-muted-foreground">
          {readOnly
            ? "Marcações clínicas no manequim (dor, lesão e outras observações)."
            : "Toque no manequim para marcar. Arraste para orbitar; use a lista para editar notas e intensidade."}
        </p>
        {isDraftMode && !readOnly ? (
          <p className="text-xs text-muted-foreground">
            As marcações serão salvas ao cadastrar o aprendiz.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={modelType === "child" ? "default" : "outline"}
          onClick={() => setModelType("child")}
        >
          Criança
        </Button>
        <Button
          type="button"
          size="sm"
          variant={modelType === "adult" ? "default" : "outline"}
          onClick={() => setModelType("adult")}
        >
          Adulto
        </Button>
      </div>

      {/* Legenda de tipos (também no canvas) */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
        {BODY_MARK_TYPES.map((item) => (
          <span
            key={item.value}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <span
              className={cn("size-2.5 rounded-full", getBodyMarkTypeColorClass(item.value))}
              aria-hidden
            />
            {item.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          Dor: intensidade 0–10 (cor do pin)
        </span>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
          Carregando mapa corporal...
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <BodyMapCanvas
            modelType={modelType}
            marks={displayMarks}
            selectedMarkId={editingMarkId}
            readOnly={readOnly}
            onBodyClick={(payload) => openCreateDialog(payload)}
            onMarkClick={openEditDialog}
          />

          <div className="order-first space-y-3 lg:order-none">
            <p className="text-sm font-medium text-foreground">
              Marcações ({marks.length})
            </p>
            {marks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                Nenhuma marcação registrada. Toque no manequim para começar.
              </div>
            ) : (
              <ul className="max-h-[min(50vh,24rem)] space-y-2 overflow-y-auto lg:max-h-[32rem]">
                {marks.map((mark) => {
                  const { userNotes } = parseNotes3D(mark.notes);
                  return (
                    <li key={mark.localId}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full min-h-11 items-start gap-3 rounded-xl border border-border/70 bg-card px-3 py-3 text-left transition-colors hover:bg-muted/30",
                          editingMarkId === mark.localId &&
                            "border-primary/40 bg-primary/5"
                        )}
                        onClick={() => openEditDialog(mark.localId)}
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
                            {mark.markType === "pain" && mark.severity != null ? (
                              <span className={cn("ml-1", severityTone(mark.severity))}>
                                · {mark.severity}/10
                              </span>
                            ) : null}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {mark.bodyPart
                              ? `${mark.bodyPart} · `
                              : ""}
                            {getBodyViewSideLabel(mark.viewSide)}
                            {userNotes || mark.notes
                              ? ` — ${userNotes || mark.notes}`
                              : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
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
                ? `${editingMark.bodyPart ? `${editingMark.bodyPart} · ` : ""}${getBodyViewSideLabel(editingMark.viewSide)}`
                : pendingPoint
                  ? `${pendingPoint.bodyPart} · ${getBodyViewSideLabel(pendingPoint.viewSide)}`
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
                <SelectTrigger id="body-mark-type" className="h-11">
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
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="body-mark-severity">Intensidade</Label>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      severityTone(severity)
                    )}
                  >
                    {severity}/10
                  </span>
                </div>
                <input
                  id="body-mark-severity"
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={severity}
                  onChange={(event) =>
                    setSeverity(Number.parseInt(event.target.value, 10) || 0)
                  }
                  className="h-11 w-full accent-amber-500"
                />
                <div className="flex justify-between text-[0.65rem] text-muted-foreground">
                  <span>Leve</span>
                  <span>Moderada</span>
                  <span>Intensa</span>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="body-mark-notes">Observações</Label>
              <Textarea
                id="body-mark-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ex.: dor ao movimento, cicatriz cirúrgica..."
                rows={3}
                className="min-h-[5.5rem]"
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
