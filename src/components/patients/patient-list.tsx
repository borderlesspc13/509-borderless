"use client";

import { useMemo, useState } from "react";
import {
  Download,
  LayoutGrid,
  List,
  Plus,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import { PatientCard, PatientListRow } from "@/components/patients/patient-card";
import { PatientStatsRow } from "@/components/patients/patient-stats-row";
import { PatientStatusDialog } from "@/components/patients/patient-status-dialog";
import { PatientViewDialog } from "@/components/patients/patient-view-dialog";
import { AppSearchField } from "@/components/ui/app-search-field";
import { EmptyState } from "@/components/ui/empty-state";
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
import { patientStatusLabels } from "@/lib/patient-format";
import type { PatientRow } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type PatientListProps = {
  patients: PatientRow[];
};

type ViewMode = "grid" | "list";
type StatusFilter = "all" | PatientRow["status"];

const statusFilterItems = [
  { label: "Todos os status", value: "all" },
  ...Object.entries(patientStatusLabels).map(([value, label]) => ({
    label,
    value,
  })),
];

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

function matchesPatientSearch(patient: PatientRow, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    patient.full_name,
    patient.diagnosis,
    patient.guardian_name,
    patient.guardian_phone,
    patient.cpf,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function exportPatientsToCsv(patients: PatientRow[]) {
  const headers = [
    "Nome",
    "Status",
    "Data de nascimento",
    "Responsável",
    "Telefone",
    "Diagnóstico",
    "CPF",
  ];

  const rows = patients.map((patient) => [
    patient.full_name,
    patientStatusLabels[patient.status],
    patient.birth_date ?? "",
    patient.guardian_name ?? "",
    patient.guardian_phone ?? "",
    patient.diagnosis ?? "",
    patient.cpf ?? "",
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
  link.download = `aprendizes-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function PatientList({ patients }: PatientListProps) {
  const [patientItems, setPatientItems] = useState(patients);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState<PatientRow | null>(null);
  const [statusTogglePatient, setStatusTogglePatient] =
    useState<PatientRow | null>(null);

  const filteredPatients = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery);

    return patientItems.filter((patient) => {
      const matchesStatus =
        statusFilter === "all" || patient.status === statusFilter;

      return matchesStatus && matchesPatientSearch(patient, normalizedQuery);
    });
  }, [patientItems, searchQuery, statusFilter]);

  const hasActiveFilters = statusFilter !== "all";

  function handleViewPatient(patient: PatientRow) {
    setViewingPatient(patient);
  }

  function handleViewDialogOpenChange(open: boolean) {
    if (!open) {
      setViewingPatient(null);
    }
  }

  function handleToggleStatusPatient(patient: PatientRow) {
    setStatusTogglePatient(patient);
  }

  function handleStatusDialogOpenChange(open: boolean) {
    if (!open) {
      setStatusTogglePatient(null);
    }
  }

  function handlePatientStatusChanged(updatedPatient: PatientRow) {
    setPatientItems((current) =>
      current.map((patient) =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      )
    );
  }

  return (
    <div className="space-y-5">
      <PatientViewDialog
        patient={viewingPatient}
        open={viewingPatient !== null}
        onOpenChange={handleViewDialogOpenChange}
      />

      <PatientStatusDialog
        patient={statusTogglePatient}
        open={statusTogglePatient !== null}
        onOpenChange={handleStatusDialogOpenChange}
        onStatusChanged={handlePatientStatusChanged}
      />

      <PatientStatsRow patients={patientItems} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button size="lg" disabled title="Cadastro de aprendiz em breve">
          <Plus className="size-4" aria-hidden />
          Novo Aprendiz
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

      <section className="app-surface-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <AppSearchField
            id="patient-search"
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Busque por aprendizes..."
            className="min-w-0 flex-1"
          />

          <div className="flex flex-wrap gap-2 lg:shrink-0">
            <Button
              type="button"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => exportPatientsToCsv(filteredPatients)}
              disabled={filteredPatients.length === 0}
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
                    Refine a listagem de aprendizes.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4 px-4 pb-6">
                  <div className="space-y-2">
                    <Label htmlFor="patient-status-filter">Status</Label>
                    <Select
                      value={statusFilter}
                      items={statusFilterItems}
                      onValueChange={(value) =>
                        setStatusFilter(value as StatusFilter)
                      }
                    >
                      <SelectTrigger id="patient-status-filter" className="h-10">
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

      {filteredPatients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum aprendiz encontrado"
          description={
            patientItems.length === 0
              ? "Ainda não há aprendizes cadastrados."
              : "Ajuste a busca ou os filtros para ver outros resultados."
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onView={handleViewPatient}
              onToggleStatus={handleToggleStatusPatient}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredPatients.map((patient) => (
            <PatientListRow
              key={patient.id}
              patient={patient}
              onView={handleViewPatient}
              onToggleStatus={handleToggleStatusPatient}
            />
          ))}
        </div>
      )}
    </div>
  );
}
