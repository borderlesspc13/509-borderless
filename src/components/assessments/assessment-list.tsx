"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Download,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import {
  AssessmentCard,
  AssessmentListRow,
} from "@/components/assessments/assessment-card";
import { AssessmentStatusDialog } from "@/components/assessments/assessment-status-dialog";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  assessmentStatusLabels,
  assessmentTypeLabels,
} from "@/lib/assessment-format";
import { APPLICABLE_ASSESSMENTS } from "@/lib/assessment-apply-routes";
import type { AssessmentTemplateRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type AssessmentListProps = {
  templates: AssessmentTemplateRow[];
};

type ViewMode = "grid" | "list";
type StatusFilter = "all" | AssessmentTemplateRow["status"];
type TypeFilter = "all" | AssessmentTemplateRow["evaluation_type"];

const statusFilterItems = [
  { label: "Todos os status", value: "all" },
  ...Object.entries(assessmentStatusLabels).map(([value, label]) => ({
    label,
    value,
  })),
];

const typeFilterItems = [
  { label: "Todos os tipos", value: "all" },
  ...Object.entries(assessmentTypeLabels).map(([value, label]) => ({
    label,
    value,
  })),
];

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function matchesAssessmentSearch(template: AssessmentTemplateRow, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    template.name,
    template.description,
    assessmentTypeLabels[template.evaluation_type],
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function exportAssessmentsToCsv(templates: AssessmentTemplateRow[]) {
  const headers = ["Nome", "Status", "Tipo", "Descrição", "Atualizado em"];

  const rows = templates.map((template) => [
    template.name,
    assessmentStatusLabels[template.status],
    assessmentTypeLabels[template.evaluation_type],
    template.description ?? "",
    template.updated_at,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(";")
    )
    .join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `avaliacoes-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AssessmentList({ templates }: AssessmentListProps) {
  const [templateItems, setTemplateItems] = useState(templates);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [statusToggleTemplate, setStatusToggleTemplate] =
    useState<AssessmentTemplateRow | null>(null);

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);

    return templateItems.filter((template) => {
      const matchesStatus =
        statusFilter === "all" || template.status === statusFilter;
      const matchesType =
        typeFilter === "all" || template.evaluation_type === typeFilter;

      return (
        matchesStatus &&
        matchesType &&
        matchesAssessmentSearch(template, normalizedQuery)
      );
    });
  }, [templateItems, searchQuery, statusFilter, typeFilter]);

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all";

  function handleToggleStatusTemplate(template: AssessmentTemplateRow) {
    setStatusToggleTemplate(template);
  }

  function handleStatusDialogOpenChange(open: boolean) {
    if (!open) {
      setStatusToggleTemplate(null);
    }
  }

  function handleTemplateStatusChanged(updatedTemplate: AssessmentTemplateRow) {
    setTemplateItems((current) =>
      current.map((template) =>
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    );
  }

  return (
    <div className="space-y-5">
      <AssessmentStatusDialog
        template={statusToggleTemplate}
        open={statusToggleTemplate !== null}
        onOpenChange={handleStatusDialogOpenChange}
        onStatusChanged={handleTemplateStatusChanged}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/dashboard/avaliacoes/novo" />}
          >
            <Plus className="size-4" aria-hidden />
            Nova Avaliação
          </Button>
          {APPLICABLE_ASSESSMENTS.map((instrument) => (
            <Button
              key={instrument.name}
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href={instrument.href} />}
            >
              {instrument.buttonLabel}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto">
          <Button
            type="button"
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon-sm"
            aria-label="Visualização em grade"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon-sm"
            aria-label="Visualização em lista"
            onClick={() => setViewMode("list")}
          >
            <List className="size-4" aria-hidden />
          </Button>
        </div>
      </div>

      <section className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Busque por avaliações..."
              className="h-10 pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2 lg:shrink-0">
            <Button
              type="button"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => exportAssessmentsToCsv(filteredTemplates)}
              disabled={filteredTemplates.length === 0}
            >
              <Download className="size-4" aria-hidden />
              Exportar Excel
            </Button>

            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "border-primary/30 text-primary hover:bg-primary/5 hover:text-primary",
                      hasActiveFilters && "bg-primary/5"
                    )}
                  />
                }
              >
                <SlidersHorizontal className="size-4" aria-hidden />
                Filtros
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2rem,24rem)]">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Refine a listagem de avaliações.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 pb-6">
                  <div className="space-y-2">
                    <Label htmlFor="assessment-status-filter">Status</Label>
                    <Select
                      value={statusFilter}
                      items={statusFilterItems}
                      onValueChange={(value) =>
                        setStatusFilter(value as StatusFilter)
                      }
                    >
                      <SelectTrigger
                        id="assessment-status-filter"
                        className="h-10"
                      >
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {statusFilterItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assessment-type-filter">Tipo</Label>
                    <Select
                      value={typeFilter}
                      items={typeFilterItems}
                      onValueChange={(value) =>
                        setTypeFilter(value as TypeFilter)
                      }
                    >
                      <SelectTrigger id="assessment-type-filter" className="h-10">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {typeFilterItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStatusFilter("all");
                        setTypeFilter("all");
                        setSearchQuery("");
                      }}
                    >
                      Limpar
                    </Button>
                    <Button
                      type="button"
                      className="flex-1"
                      onClick={() => setIsFiltersOpen(false)}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {filteredTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
          <p className="text-sm font-medium text-foreground">
            Nenhuma avaliação encontrada
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {templateItems.length === 0
              ? "Ainda não há avaliações cadastradas."
              : "Ajuste a busca ou os filtros para ver outros resultados."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <AssessmentCard
              key={template.id}
              template={template}
              onToggleStatus={handleToggleStatusTemplate}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTemplates.map((template) => (
            <AssessmentListRow
              key={template.id}
              template={template}
              onToggleStatus={handleToggleStatusTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
