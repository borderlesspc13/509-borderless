"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import {
  searchAgendaPatientsAction,
  searchAgendaProfessionalsAction,
  type AgendaSearchPatient,
  type AgendaSearchProfessional,
} from "@/app/actions/agenda-search-actions";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AgendaIndividualFilter,
  AgendaIndividualFilterType,
} from "@/lib/agenda-individual-filter";
import { cn } from "@/lib/utils";

type AgendaIndividualFilterProps = {
  filter: AgendaIndividualFilter | null;
  onFilterChange: (filter: AgendaIndividualFilter | null) => void;
  className?: string;
};

const filterTypeItems = [
  { label: "Paciente", value: "patient" },
  { label: "Profissional", value: "professional" },
] as const;

function getProfessionalLabel(professional: AgendaSearchProfessional) {
  if (professional.professionalRole) {
    return `${professional.fullName} · ${professional.professionalRole}`;
  }

  return professional.fullName;
}

export function AgendaIndividualFilter({
  filter,
  onFilterChange,
  className,
}: AgendaIndividualFilterProps) {
  const [filterType, setFilterType] =
    useState<AgendaIndividualFilterType>("patient");
  const [inputValue, setInputValue] = useState("");
  const [patientItems, setPatientItems] = useState<AgendaSearchPatient[]>([]);
  const [professionalItems, setProfessionalItems] = useState<
    AgendaSearchProfessional[]
  >([]);
  const [selectedPatient, setSelectedPatient] =
    useState<AgendaSearchPatient | null>(null);
  const [selectedProfessional, setSelectedProfessional] =
    useState<AgendaSearchProfessional | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const searchPlaceholder =
    filterType === "patient"
      ? "Buscar paciente por nome..."
      : "Buscar profissional por nome...";

  const runSearch = useCallback(
    async (query: string, type: AgendaIndividualFilterType) => {
      const trimmed = query.trim();

      if (trimmed.length < 2) {
        setPatientItems([]);
        setProfessionalItems([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      if (type === "patient") {
        const result = await searchAgendaPatientsAction(trimmed);
        setPatientItems(result.success && result.data ? result.data.patients : []);
      } else {
        const result = await searchAgendaProfessionalsAction(trimmed);
        setProfessionalItems(
          result.success && result.data ? result.data.professionals : []
        );
      }

      setIsSearching(false);
    },
    []
  );

  useEffect(() => {
    if (filter) {
      setFilterType(filter.type);
      setInputValue(filter.name);
      return;
    }

    setInputValue("");
    setSelectedPatient(null);
    setSelectedProfessional(null);
    setPatientItems([]);
    setProfessionalItems([]);
  }, [filter]);

  useEffect(() => {
    if (filter) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void runSearch(inputValue, filterType);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [filter, filterType, inputValue, runSearch]);

  function handleFilterTypeChange(value: AgendaIndividualFilterType) {
    setFilterType(value);
    setInputValue("");
    setPatientItems([]);
    setProfessionalItems([]);
    setSelectedPatient(null);
    setSelectedProfessional(null);
    onFilterChange(null);
  }

  function handlePatientChange(value: AgendaSearchPatient | null) {
    if (!value) {
      setSelectedPatient(null);
      onFilterChange(null);
      return;
    }

    setSelectedPatient(value);
    setInputValue(value.fullName);
    onFilterChange({ type: "patient", id: value.id, name: value.fullName });
  }

  function handleProfessionalChange(value: AgendaSearchProfessional | null) {
    if (!value) {
      setSelectedProfessional(null);
      onFilterChange(null);
      return;
    }

    setSelectedProfessional(value);
    setInputValue(value.fullName);
    onFilterChange({
      type: "professional",
      id: value.id,
      name: value.fullName,
    });
  }

  function handleClearFilter() {
    setInputValue("");
    setPatientItems([]);
    setProfessionalItems([]);
    setSelectedPatient(null);
    setSelectedProfessional(null);
    onFilterChange(null);
  }

  const emptyMessage = isSearching
    ? "Buscando..."
    : inputValue.trim().length < 2
      ? "Digite ao menos 2 caracteres"
      : "Nenhum resultado encontrado";

  const patientValue =
    selectedPatient ??
    (filter?.type === "patient"
      ? { id: filter.id, fullName: filter.name }
      : null);

  const professionalValue =
    selectedProfessional ??
    (filter?.type === "professional"
      ? { id: filter.id, fullName: filter.name, professionalRole: null }
      : null);

  return (
    <section
      className={cn(
        "rounded-xl border border-border/80 bg-card p-3 shadow-sm sm:p-4",
        className
      )}
      aria-label="Filtro individual da agenda"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="space-y-2 lg:w-44">
          <Label htmlFor="agenda-individual-filter-type">Buscar por</Label>
          <Select
            value={filterType}
            items={filterTypeItems.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
            onValueChange={(value) =>
              handleFilterTypeChange(value as AgendaIndividualFilterType)
            }
          >
            <SelectTrigger
              id="agenda-individual-filter-type"
              className="h-10 w-full"
              size="default"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {filterTypeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="agenda-individual-filter-search">
            Filtro individual
          </Label>
          <div className="flex items-center gap-2">
            {filterType === "patient" ? (
              <Combobox
                items={patientItems}
                value={patientValue}
                inputValue={inputValue}
                onInputValueChange={setInputValue}
                onValueChange={handlePatientChange}
                itemToStringValue={(patient) => patient.fullName}
                isItemEqualToValue={(item, value) => item.id === value.id}
              >
                <ComboboxInput
                  id="agenda-individual-filter-search"
                  placeholder={searchPlaceholder}
                  showTrigger={false}
                  className="h-10 min-w-0 flex-1"
                >
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" aria-hidden />
                  </InputGroupAddon>
                </ComboboxInput>
                <ComboboxContent className="w-[var(--anchor-width)]">
                  <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                  <ComboboxList>
                    {(patient) => (
                      <ComboboxItem key={patient.id} value={patient}>
                        {patient.fullName}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            ) : (
              <Combobox
                items={professionalItems}
                value={professionalValue}
                inputValue={inputValue}
                onInputValueChange={setInputValue}
                onValueChange={handleProfessionalChange}
                itemToStringValue={(professional) => professional.fullName}
                isItemEqualToValue={(item, value) => item.id === value.id}
              >
                <ComboboxInput
                  id="agenda-individual-filter-search"
                  placeholder={searchPlaceholder}
                  showTrigger={false}
                  className="h-10 min-w-0 flex-1"
                >
                  <InputGroupAddon align="inline-start">
                    <Search className="size-4" aria-hidden />
                  </InputGroupAddon>
                </ComboboxInput>
                <ComboboxContent className="w-[var(--anchor-width)]">
                  <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
                  <ComboboxList>
                    {(professional) => (
                      <ComboboxItem key={professional.id} value={professional}>
                        {getProfessionalLabel(professional)}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}

            {filter ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 shrink-0"
                onClick={handleClearFilter}
                aria-label="Limpar filtro"
              >
                <X className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
