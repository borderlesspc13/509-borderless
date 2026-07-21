"use client";

import { useMemo, useState } from "react";
import { Download, ListChecks, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  derivePediSuggestedObjectives,
  downloadSuggestedObjectivesCsv,
  PEDI_AREA_LABELS,
  PEDI_AREAS,
  type PediCapability,
  type PediScoreResult,
} from "@/lib/pedi";
import { cn } from "@/lib/utils";

type PediSuggestedObjectivesProps = {
  items: Record<string, PediCapability>;
  scores: PediScoreResult;
  patientName?: string;
  className?: string;
};

export function PediSuggestedObjectives({
  items,
  scores,
  patientName,
  className,
}: PediSuggestedObjectivesProps) {
  const [open, setOpen] = useState(false);

  const objectives = useMemo(
    () => derivePediSuggestedObjectives(items, scores),
    [items, scores]
  );

  const countsByArea = useMemo(() => {
    return Object.fromEntries(
      PEDI_AREAS.map((area) => [
        area,
        objectives.filter((objective) => objective.area === area).length,
      ])
    ) as Record<(typeof PEDI_AREAS)[number], number>;
  }, [objectives]);

  function handleExportCsv() {
    const slug = (patientName ?? "paciente")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    const date = new Date().toISOString().slice(0, 10);
    downloadSuggestedObjectivesCsv(
      objectives,
      `pedi-objetivos-${slug || "paciente"}-${date}.csv`
    );
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border/70 bg-card print:border-black",
        className
      )}
    >
      <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between print:bg-white">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="size-4 text-muted-foreground" aria-hidden />
            Objetivos sugeridos (itens gap)
          </h3>
          <p className="text-xs text-muted-foreground">
            Itens com resposta 0 à esquerda da linha de capacidade (dificuldade
            provisória ≤ escore contínuo
            {scores.areas.some((area) => area.continuousStandardError != null)
              ? " + EP"
              : ""}
            ). Calibração Rasch oficial entra na Fase 3.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpen(true)}
            disabled={objectives.length === 0}
          >
            <ListChecks className="size-4" aria-hidden />
            Ver lista ({objectives.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            disabled={objectives.length === 0}
          >
            <Download className="size-4" aria-hidden />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-2 px-4 py-3 sm:grid-cols-3">
        {PEDI_AREAS.map((area) => (
          <div
            key={area}
            className="rounded-lg border border-border/50 bg-muted/15 px-3 py-2"
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
              {PEDI_AREA_LABELS[area]}
            </p>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {countsByArea[area]}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                objetivo{countsByArea[area] === 1 ? "" : "s"}
              </span>
            </p>
          </div>
        ))}
      </div>

      {objectives.length === 0 ? (
        <p className="border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
          Nenhum gap identificado com a capacidade atual — todos os itens à
          esquerda da linha estão marcados como 1.
        </p>
      ) : (
        <div className="hidden print:block">
          <ObjectivesTable objectives={objectives} />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[min(90vh,52rem)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
          <DialogHeader className="shrink-0 border-b border-border/60 px-4 py-4 pr-12">
            <DialogTitle>Objetivos sugeridos — PEDI</DialogTitle>
            <DialogDescription>
              {objectives.length} item
              {objectives.length === 1 ? "" : "s"} gap
              {patientName ? ` · ${patientName}` : ""}. Use como base para o
              plano terapêutico (ABA+).
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
            {objectives.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum objetivo sugerido no momento.
              </p>
            ) : (
              <ObjectivesTable objectives={objectives} />
            )}
          </div>

          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleExportCsv}
              disabled={objectives.length === 0}
            >
              <Download className="size-4" aria-hidden />
              Exportar CSV
            </Button>
            <Button type="button" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ObjectivesTable({
  objectives,
}: {
  objectives: ReturnType<typeof derivePediSuggestedObjectives>;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/20 text-[0.7rem] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-semibold">Área</th>
            <th className="px-3 py-2 font-semibold">Domínio</th>
            <th className="px-3 py-2 font-semibold">Item</th>
            <th className="px-3 py-2 font-semibold">Objetivo</th>
            <th className="px-3 py-2 font-semibold">Dif.</th>
            <th className="px-3 py-2 font-semibold">Cap.</th>
          </tr>
        </thead>
        <tbody>
          {objectives.map((objective) => (
            <tr
              key={objective.itemId}
              className="border-b border-border/40 last:border-0 align-top"
            >
              <td className="px-3 py-2.5 text-xs text-muted-foreground">
                {objective.areaLabel}
              </td>
              <td className="px-3 py-2.5 text-xs text-muted-foreground">
                {objective.domainCode}. {objective.domainLabel}
              </td>
              <td className="px-3 py-2.5 font-medium tabular-nums text-foreground">
                {objective.sortOrder}
                <span className="ml-1 text-[0.65rem] font-normal text-muted-foreground">
                  ({objective.itemLabel})
                </span>
              </td>
              <td className="px-3 py-2.5 text-foreground">
                {objective.objectiveText}
              </td>
              <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                {objective.provisionalDifficulty.toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })}
              </td>
              <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                {objective.abilityScore.toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
