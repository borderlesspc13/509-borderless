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

import type { TeamMember } from "@/app/actions/team-actions";
import {
  ProfessionalCard,
  ProfessionalListRow,
} from "@/components/team/professional-card";
import { ProfessionalStatsRow } from "@/components/team/professional-stats-row";
import { ProfessionalStatusDialog } from "@/components/team/professional-status-dialog";
import { ProfessionalTeamDialog } from "@/components/team/professional-team-dialog";
import { ProfessionalViewDialog } from "@/components/team/professional-view-dialog";
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
import { professionalStatusLabels } from "@/lib/professional-format";
import { cn } from "@/lib/utils";

type ProfessionalListProps = {
  professionals: TeamMember[];
};

type ViewMode = "grid" | "list";
type StatusFilter = "all" | TeamMember["status"];

const statusFilterItems = [
  { label: "Todos os status", value: "all" },
  ...Object.entries(professionalStatusLabels).map(([value, label]) => ({
    label,
    value,
  })),
];

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function matchesProfessionalSearch(professional: TeamMember, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    professional.fullName,
    professional.email,
    professional.cpf,
    professional.professionalCouncil,
    professional.professionalRole,
    professional.profileLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function exportProfessionalsToCsv(professionals: TeamMember[]) {
  const headers = [
    "Nome",
    "E-mail",
    "Status",
    "Cargo",
    "Perfil",
    "CPF",
    "Conselho",
    "Data de nascimento",
  ];

  const rows = professionals.map((professional) => [
    professional.fullName,
    professional.email ?? "",
    professionalStatusLabels[professional.status],
    professional.professionalRole ?? professional.profileLabel,
    professional.profileLabel,
    professional.cpf ?? "",
    professional.professionalCouncil ?? "",
    professional.birthDate ?? "",
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
  link.download = `profissionais-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function ProfessionalList({ professionals }: ProfessionalListProps) {
  const [professionalItems, setProfessionalItems] = useState(professionals);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewingProfessional, setViewingProfessional] =
    useState<TeamMember | null>(null);
  const [statusToggleProfessional, setStatusToggleProfessional] =
    useState<TeamMember | null>(null);
  const [teamManageProfessional, setTeamManageProfessional] =
    useState<TeamMember | null>(null);

  const filteredProfessionals = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);

    return professionalItems.filter((professional) => {
      const matchesStatus =
        statusFilter === "all" || professional.status === statusFilter;

      return (
        matchesStatus && matchesProfessionalSearch(professional, normalizedQuery)
      );
    });
  }, [professionalItems, searchQuery, statusFilter]);

  const hasActiveFilters = statusFilter !== "all";

  function handleViewProfessional(professional: TeamMember) {
    setViewingProfessional(professional);
  }

  function handleViewDialogOpenChange(open: boolean) {
    if (!open) {
      setViewingProfessional(null);
    }
  }

  function handleToggleStatusProfessional(professional: TeamMember) {
    setStatusToggleProfessional(professional);
  }

  function handleStatusDialogOpenChange(open: boolean) {
    if (!open) {
      setStatusToggleProfessional(null);
    }
  }

  function handleManageTeamProfessional(professional: TeamMember) {
    setTeamManageProfessional(professional);
  }

  function handleTeamDialogOpenChange(open: boolean) {
    if (!open) {
      setTeamManageProfessional(null);
    }
  }

  function handleProfessionalStatusChanged(updatedProfessional: TeamMember) {
    setProfessionalItems((current) =>
      current.map((professional) =>
        professional.id === updatedProfessional.id
          ? updatedProfessional
          : professional
      )
    );
  }

  return (
    <div className="space-y-5">
      <ProfessionalViewDialog
        professional={viewingProfessional}
        open={viewingProfessional !== null}
        onOpenChange={handleViewDialogOpenChange}
      />

      <ProfessionalStatusDialog
        professional={statusToggleProfessional}
        open={statusToggleProfessional !== null}
        onOpenChange={handleStatusDialogOpenChange}
        onStatusChanged={handleProfessionalStatusChanged}
      />

      <ProfessionalTeamDialog
        professional={teamManageProfessional}
        open={teamManageProfessional !== null}
        onOpenChange={handleTeamDialogOpenChange}
      />

      <ProfessionalStatsRow professionals={professionalItems} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/dashboard/profissionais/novo" />}
        >
          <Plus className="size-4" aria-hidden />
          Novo Profissional
        </Button>

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
              placeholder="Busque por profissionais..."
              className="h-10 pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2 lg:shrink-0">
            <Button
              type="button"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => exportProfessionalsToCsv(filteredProfessionals)}
              disabled={filteredProfessionals.length === 0}
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
                    Refine a listagem de profissionais.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 pb-6">
                  <div className="space-y-2">
                    <Label htmlFor="professional-status-filter">Status</Label>
                    <Select
                      value={statusFilter}
                      items={statusFilterItems}
                      onValueChange={(value) =>
                        setStatusFilter(value as StatusFilter)
                      }
                    >
                      <SelectTrigger
                        id="professional-status-filter"
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

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStatusFilter("all");
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

      {filteredProfessionals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-12 text-center">
          <p className="text-sm font-medium text-foreground">
            Nenhum profissional encontrado
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {professionalItems.length === 0
              ? "Ainda não há profissionais cadastrados."
              : "Ajuste a busca ou os filtros para ver outros resultados."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredProfessionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onView={handleViewProfessional}
              onToggleStatus={handleToggleStatusProfessional}
              onManageTeam={handleManageTeamProfessional}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredProfessionals.map((professional) => (
            <ProfessionalListRow
              key={professional.id}
              professional={professional}
              onView={handleViewProfessional}
              onToggleStatus={handleToggleStatusProfessional}
              onManageTeam={handleManageTeamProfessional}
            />
          ))}
        </div>
      )}
    </div>
  );
}
