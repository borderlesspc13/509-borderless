"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Copy,
  Download,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { toggleProgramStatusAction } from "@/app/actions/program-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  ProgramCard,
  ProgramListRow,
} from "@/components/programs/program-card";
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
  programStatusLabels,
  programVisibilityLabels,
  type ProgramListItem,
} from "@/lib/program-format";
import { cn } from "@/lib/utils";

type ProgramListProps = {
  programs: ProgramListItem[];
};

type ViewMode = "grid" | "list";
type StatusFilter = "all" | ProgramListItem["status"];
type VisibilityFilter = "all" | ProgramListItem["visibility"];

const statusFilterItems = [
  { label: "Todos os status", value: "all" },
  ...Object.entries(programStatusLabels).map(([value, label]) => ({
    label,
    value,
  })),
];

const visibilityFilterItems = [
  { label: "Todos os tipos", value: "all" },
  ...Object.entries(programVisibilityLabels).map(([value, label]) => ({
    label,
    value,
  })),
];

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function matchesProgramSearch(program: ProgramListItem, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    program.name,
    program.teaching_type,
    program.protocol,
    program.patientName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function ProgramList({ programs: initialPrograms }: ProgramListProps) {
  const toast = useAppToast();
  const [programs, setPrograms] = useState(initialPrograms);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("private");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const filteredPrograms = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);

    return programs.filter((program) => {
      const matchesStatus =
        statusFilter === "all" || program.status === statusFilter;
      const matchesVisibility =
        visibilityFilter === "all" || program.visibility === visibilityFilter;

      return (
        matchesStatus &&
        matchesVisibility &&
        matchesProgramSearch(program, normalizedQuery)
      );
    });
  }, [programs, searchQuery, statusFilter, visibilityFilter]);

  const hasActiveFilters = statusFilter !== "all";

  async function handleToggleStatus(program: ProgramListItem) {
    const result = await toggleProgramStatusAction(program.id);

    if (!result.success) {
      toast.error({
        title: "Falha ao alterar status",
        description: result.error ?? "Não foi possível alterar o programa.",
      });
      return;
    }

    if (result.data?.program) {
      setPrograms((current) =>
        current.map((item) =>
          item.id === program.id ? { ...item, ...result.data!.program } : item
        )
      );
    }

    toast.success({
      title: "Status atualizado",
      description: "O status do programa foi alterado.",
    });
  }



  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Button nativeButton={false} render={<Link href="/dashboard/programas/novo" />}>
          <Plus className="size-4" />
          Novo Programa
        </Button>
      </div>

      <section className="rounded-xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Busque por programas..."
                className="h-11 pl-9"
              />
            </div>
            <Select
              value={visibilityFilter}
              items={visibilityFilterItems}
              onValueChange={(value) =>
                setVisibilityFilter(value as VisibilityFilter)
              }
            >
              <SelectTrigger className="h-11 w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {visibilityFilterItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" className="h-11">
                    <SlidersHorizontal className="size-4" />
                    Filtros
                  </Button>
                }
              />
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>Refine a listagem de programas.</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 px-4 pb-6">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={statusFilter}
                      items={statusFilterItems}
                      onValueChange={(value) =>
                        setStatusFilter(value as StatusFilter)
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
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
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex rounded-lg border border-border/70 p-1">
              <Button
                type="button"
                size="icon"
                variant={viewMode === "grid" ? "default" : "ghost"}
                className="size-9"
                onClick={() => setViewMode("grid")}
                aria-label="Visualização em grade"
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant={viewMode === "list" ? "default" : "ghost"}
                className="size-9"
                onClick={() => setViewMode("list")}
                aria-label="Visualização em lista"
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {hasActiveFilters ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Filtros ativos aplicados à listagem.
          </p>
        ) : null}

        <div
          className={cn(
            "mt-5",
            viewMode === "grid"
              ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
              : "space-y-3"
          )}
        >
          {filteredPrograms.length > 0 ? (
            filteredPrograms.map((program) =>
              viewMode === "grid" ? (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onToggleStatus={handleToggleStatus}
                />
              ) : (
                <ProgramListRow
                  key={program.id}
                  program={program}
                  onToggleStatus={handleToggleStatus}
                />
              )
            )
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
              <p className="text-sm font-medium text-foreground">
                Nenhum programa encontrado
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Ajuste os filtros ou cadastre um novo programa.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
