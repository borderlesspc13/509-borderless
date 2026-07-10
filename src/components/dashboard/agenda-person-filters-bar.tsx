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
import type { AgendaPersonFilters } from "@/lib/agenda-individual-filter";
import { cn } from "@/lib/utils";

type AgendaPersonFiltersBarProps = {
  filters: AgendaPersonFilters;
  onFiltersChange: (filters: AgendaPersonFilters) => void;
  className?: string;
};

function getProfessionalLabel(professional: AgendaSearchProfessional) {
  if (professional.professionalRole) {
    return `${professional.fullName} · ${professional.professionalRole}`;
  }

  return professional.fullName;
}

export function AgendaPersonFiltersBar({
  filters,
  onFiltersChange,
  className,
}: AgendaPersonFiltersBarProps) {
  const [patientInput, setPatientInput] = useState(filters.patient?.name ?? "");
  const [professionalInput, setProfessionalInput] = useState(
    filters.professional?.name ?? ""
  );
  const [patientItems, setPatientItems] = useState<AgendaSearchPatient[]>([]);
  const [professionalItems, setProfessionalItems] = useState<
    AgendaSearchProfessional[]
  >([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [isSearchingProfessionals, setIsSearchingProfessionals] =
    useState(false);

  useEffect(() => {
    setPatientInput(filters.patient?.name ?? "");
  }, [filters.patient]);

  useEffect(() => {
    setProfessionalInput(filters.professional?.name ?? "");
  }, [filters.professional]);

  const searchPatients = useCallback(async (query: string) => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setPatientItems([]);
      setIsSearchingPatients(false);
      return;
    }

    setIsSearchingPatients(true);
    const result = await searchAgendaPatientsAction(trimmed);
    setPatientItems(result.success && result.data ? result.data.patients : []);
    setIsSearchingPatients(false);
  }, []);

  const searchProfessionals = useCallback(async (query: string) => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setProfessionalItems([]);
      setIsSearchingProfessionals(false);
      return;
    }

    setIsSearchingProfessionals(true);
    const result = await searchAgendaProfessionalsAction(trimmed);
    setProfessionalItems(
      result.success && result.data ? result.data.professionals : []
    );
    setIsSearchingProfessionals(false);
  }, []);

  useEffect(() => {
    if (filters.patient) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void searchPatients(patientInput);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filters.patient, patientInput, searchPatients]);

  useEffect(() => {
    if (filters.professional) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void searchProfessionals(professionalInput);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filters.professional, professionalInput, searchProfessionals]);

  const patientValue =
    filters.patient != null
      ? { id: filters.patient.id, fullName: filters.patient.name }
      : null;

  const professionalValue =
    filters.professional != null
      ? {
          id: filters.professional.id,
          fullName: filters.professional.name,
          professionalRole: null as string | null,
        }
      : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end",
        className
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <Label htmlFor="agenda-aprendiz-filter">Aprendiz</Label>
        <div className="flex items-center gap-2">
          <Combobox
            items={patientItems}
            value={patientValue}
            inputValue={patientInput}
            onInputValueChange={setPatientInput}
            onValueChange={(value) => {
              if (!value) {
                onFiltersChange({ ...filters, patient: null });
                return;
              }

              onFiltersChange({
                ...filters,
                patient: { id: value.id, name: value.fullName },
              });
            }}
            itemToStringValue={(patient) => patient.fullName}
            isItemEqualToValue={(item, value) => item.id === value.id}
          >
            <ComboboxInput
              id="agenda-aprendiz-filter"
              placeholder="Busque pelo aprendiz..."
              showTrigger={false}
              className="h-10 min-w-0 flex-1"
            >
              <InputGroupAddon align="inline-start">
                <Search className="size-4" aria-hidden />
              </InputGroupAddon>
            </ComboboxInput>
            <ComboboxContent className="w-[var(--anchor-width)]">
              <ComboboxEmpty>
                {isSearchingPatients
                  ? "Buscando..."
                  : patientInput.trim().length < 2
                    ? "Digite ao menos 2 caracteres"
                    : "Nenhum aprendiz encontrado"}
              </ComboboxEmpty>
              <ComboboxList>
                {(patient) => (
                  <ComboboxItem key={patient.id} value={patient}>
                    {patient.fullName}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          {filters.patient ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => {
                setPatientInput("");
                setPatientItems([]);
                onFiltersChange({ ...filters, patient: null });
              }}
              aria-label="Limpar filtro de aprendiz"
            >
              <X className="size-4" aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <Label htmlFor="agenda-profissional-filter">Profissional</Label>
        <div className="flex items-center gap-2">
          <Combobox
            items={professionalItems}
            value={professionalValue}
            inputValue={professionalInput}
            onInputValueChange={setProfessionalInput}
            onValueChange={(value) => {
              if (!value) {
                onFiltersChange({ ...filters, professional: null });
                return;
              }

              onFiltersChange({
                ...filters,
                professional: { id: value.id, name: value.fullName },
              });
            }}
            itemToStringValue={(professional) => professional.fullName}
            isItemEqualToValue={(item, value) => item.id === value.id}
          >
            <ComboboxInput
              id="agenda-profissional-filter"
              placeholder="Busque pelo profissional..."
              showTrigger={false}
              className="h-10 min-w-0 flex-1"
            >
              <InputGroupAddon align="inline-start">
                <Search className="size-4" aria-hidden />
              </InputGroupAddon>
            </ComboboxInput>
            <ComboboxContent className="w-[var(--anchor-width)]">
              <ComboboxEmpty>
                {isSearchingProfessionals
                  ? "Buscando..."
                  : professionalInput.trim().length < 2
                    ? "Digite ao menos 2 caracteres"
                    : "Nenhum profissional encontrado"}
              </ComboboxEmpty>
              <ComboboxList>
                {(professional) => (
                  <ComboboxItem key={professional.id} value={professional}>
                    {getProfessionalLabel(professional)}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          {filters.professional ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => {
                setProfessionalInput("");
                setProfessionalItems([]);
                onFiltersChange({ ...filters, professional: null });
              }}
              aria-label="Limpar filtro de profissional"
            >
              <X className="size-4" aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
