"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, Plus, Search, X } from "lucide-react";

import {
  searchAgendaPatientsAction,
  searchAgendaProfessionalsAction,
  type AgendaSearchPatient,
  type AgendaSearchProfessional,
} from "@/app/actions/agenda-search-actions";
import { Badge } from "@/components/ui/badge";
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
import {
  AGENDA_APPOINTMENT_TYPE_LABELS,
  AGENDA_APPOINTMENT_TYPES,
  AGENDA_STATUS_FILTER_OPTIONS,
  countActiveFilters,
  DEFAULT_AGENDA_FILTERS,
  type AgendaAppointmentType,
  type AgendaAvailabilityFilter,
  type AgendaFilters,
} from "@/lib/agenda-filter-utils";
import type { AgendaPersonFilters } from "@/lib/agenda-individual-filter";
import type { AppointmentStatus } from "@/lib/agenda-types";
import { PROFESSIONAL_ROLES } from "@/lib/professionals-data";
import { cn } from "@/lib/utils";

const controlHeightClass = "h-9";

type AgendaToolbarProps = {
  personFilters: AgendaPersonFilters;
  onPersonFiltersChange: (filters: AgendaPersonFilters) => void;
  filters: AgendaFilters;
  onFiltersChange: (filters: AgendaFilters) => void;
  locations: string[];
  canCreateAppointment?: boolean;
  onCreateAppointment?: () => void;
  className?: string;
};

function getProfessionalLabel(professional: AgendaSearchProfessional) {
  if (professional.professionalRole) {
    return `${professional.fullName} · ${professional.professionalRole}`;
  }

  return professional.fullName;
}

const availabilityOptions: Array<{
  value: AgendaAvailabilityFilter;
  label: string;
}> = [
  { value: "all", label: "Todos os horários" },
  { value: "vacant", label: "Apenas horários vagos" },
];

export function AgendaToolbar({
  personFilters,
  onPersonFiltersChange,
  filters,
  onFiltersChange,
  locations,
  canCreateAppointment = false,
  onCreateAppointment,
  className,
}: AgendaToolbarProps) {
  const [patientInput, setPatientInput] = useState(
    personFilters.patient?.name ?? ""
  );
  const [professionalInput, setProfessionalInput] = useState(
    personFilters.professional?.name ?? ""
  );
  const [patientItems, setPatientItems] = useState<AgendaSearchPatient[]>([]);
  const [professionalItems, setProfessionalItems] = useState<
    AgendaSearchProfessional[]
  >([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [isSearchingProfessionals, setIsSearchingProfessionals] =
    useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<AgendaFilters>(filters);

  useEffect(() => {
    setPatientInput(personFilters.patient?.name ?? "");
  }, [personFilters.patient]);

  useEffect(() => {
    setProfessionalInput(personFilters.professional?.name ?? "");
  }, [personFilters.professional]);

  useEffect(() => {
    if (isFiltersOpen) {
      setDraft(filters);
    }
  }, [filters, isFiltersOpen]);

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
    if (personFilters.patient) return;
    const timeoutId = window.setTimeout(() => {
      void searchPatients(patientInput);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [personFilters.patient, patientInput, searchPatients]);

  useEffect(() => {
    if (personFilters.professional) return;
    const timeoutId = window.setTimeout(() => {
      void searchProfessionals(professionalInput);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [personFilters.professional, professionalInput, searchProfessionals]);

  const activeFilterCount = countActiveFilters(filters);
  const hasActiveFilters = activeFilterCount > 0;

  const appointmentTypeItems = useMemo(
    () => [
      { label: "Todos", value: "all" },
      ...AGENDA_APPOINTMENT_TYPES.map((type) => ({
        label: AGENDA_APPOINTMENT_TYPE_LABELS[type],
        value: type,
      })),
    ],
    []
  );

  const roleItems = useMemo(
    () => [
      { label: "Todos", value: "all" },
      ...PROFESSIONAL_ROLES.map((role) => ({ label: role, value: role })),
    ],
    []
  );

  const locationItems = useMemo(
    () => [
      { label: "Todos", value: "all" },
      ...locations.map((location) => ({ label: location, value: location })),
    ],
    [locations]
  );

  const statusItems = useMemo(
    () => [
      { label: "Todas", value: "all" },
      ...AGENDA_STATUS_FILTER_OPTIONS.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    ],
    []
  );

  const availabilityItems = availabilityOptions.map((option) => ({
    label: option.label,
    value: option.value,
  }));

  const patientValue =
    personFilters.patient != null
      ? { id: personFilters.patient.id, fullName: personFilters.patient.name }
      : null;

  const professionalValue =
    personFilters.professional != null
      ? {
          id: personFilters.professional.id,
          fullName: personFilters.professional.name,
          professionalRole: null as string | null,
        }
      : null;

  function applyDraft() {
    onFiltersChange(draft);
    setIsFiltersOpen(false);
  }

  function clearDraft() {
    setDraft(DEFAULT_AGENDA_FILTERS);
    onFiltersChange(DEFAULT_AGENDA_FILTERS);
    setIsFiltersOpen(false);
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-border/80 bg-card p-3 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="agenda-event-type-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Tipo de Evento
            </Label>
            <Select
              value={filters.appointmentType}
              items={appointmentTypeItems}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  appointmentType: (value ??
                    "all") as AgendaAppointmentType | "all",
                })
              }
            >
              <SelectTrigger
                id="agenda-event-type-filter"
                className={cn(controlHeightClass, "w-full")}
              >
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Todos</SelectItem>
                  {AGENDA_APPOINTMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {AGENDA_APPOINTMENT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="agenda-aprendiz-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Aprendiz
            </Label>
            <div className="flex items-center gap-1.5">
              <Combobox
                items={patientItems}
                value={patientValue}
                inputValue={patientInput}
                onInputValueChange={setPatientInput}
                onValueChange={(value) => {
                  if (!value) {
                    onPersonFiltersChange({
                      ...personFilters,
                      patient: null,
                    });
                    return;
                  }
                  onPersonFiltersChange({
                    ...personFilters,
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
                  className={cn(controlHeightClass, "min-w-0 flex-1")}
                >
                  <InputGroupAddon align="inline-start">
                    <Search className="size-3.5" aria-hidden />
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
              {personFilters.patient ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(controlHeightClass, "w-9 shrink-0")}
                  onClick={() => {
                    setPatientInput("");
                    setPatientItems([]);
                    onPersonFiltersChange({
                      ...personFilters,
                      patient: null,
                    });
                  }}
                  aria-label="Limpar filtro de aprendiz"
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="agenda-profissional-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Profissional
            </Label>
            <div className="flex items-center gap-1.5">
              <Combobox
                items={professionalItems}
                value={professionalValue}
                inputValue={professionalInput}
                onInputValueChange={setProfessionalInput}
                onValueChange={(value) => {
                  if (!value) {
                    onPersonFiltersChange({
                      ...personFilters,
                      professional: null,
                    });
                    return;
                  }
                  onPersonFiltersChange({
                    ...personFilters,
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
                  className={cn(controlHeightClass, "min-w-0 flex-1")}
                >
                  <InputGroupAddon align="inline-start">
                    <Search className="size-3.5" aria-hidden />
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
              {personFilters.professional ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(controlHeightClass, "w-9 shrink-0")}
                  onClick={() => {
                    setProfessionalInput("");
                    setProfessionalItems([]);
                    onPersonFiltersChange({
                      ...personFilters,
                      professional: null,
                    });
                  }}
                  aria-label="Limpar filtro de profissional"
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="relative space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Mais filtros
            </Label>
            <Button
              type="button"
              variant={hasActiveFilters ? "default" : "outline"}
              className={cn(controlHeightClass, "w-full gap-2")}
              onClick={() => setIsFiltersOpen((current) => !current)}
              aria-expanded={isFiltersOpen}
            >
              <Filter className="size-3.5" aria-hidden />
              Filtros
              {hasActiveFilters ? (
                <Badge
                  variant="secondary"
                  className="size-5 justify-center px-0 text-[0.65rem]"
                >
                  {activeFilterCount}
                </Badge>
              ) : null}
            </Button>

            {isFiltersOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Fechar filtros"
                  onClick={() => setIsFiltersOpen(false)}
                />
                <div className="absolute left-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-4 shadow-lg xl:left-auto xl:right-0">
                  <div className="mb-3 border-b border-border/70 pb-2">
                    <h3 className="text-sm font-semibold">Filtros</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="agenda-appointment-type-filter"
                        className="text-xs"
                      >
                        Tipo Agendamento
                      </Label>
                      <Select
                        value={draft.appointmentType}
                        items={appointmentTypeItems}
                        onValueChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            appointmentType: (value ??
                              "all") as AgendaAppointmentType | "all",
                          }))
                        }
                      >
                        <SelectTrigger
                          id="agenda-appointment-type-filter"
                          className={cn(controlHeightClass, "w-full")}
                        >
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">Todos</SelectItem>
                            {AGENDA_APPOINTMENT_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {AGENDA_APPOINTMENT_TYPE_LABELS[type]}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="agenda-specialty-filter"
                        className="text-xs"
                      >
                        Especialidade
                      </Label>
                      <Select
                        value={draft.role}
                        items={roleItems}
                        onValueChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            role: (value ?? "all") as AgendaFilters["role"],
                          }))
                        }
                      >
                        <SelectTrigger
                          id="agenda-specialty-filter"
                          className={cn(controlHeightClass, "w-full")}
                        >
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">Todos</SelectItem>
                            {PROFESSIONAL_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="agenda-location-filter"
                        className="text-xs"
                      >
                        Local Agendamento
                      </Label>
                      <Select
                        value={draft.location}
                        items={locationItems}
                        onValueChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            location: value ?? "all",
                          }))
                        }
                      >
                        <SelectTrigger
                          id="agenda-location-filter"
                          className={cn(controlHeightClass, "w-full")}
                        >
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">Todos</SelectItem>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="agenda-status-filter" className="text-xs">
                        Situação
                      </Label>
                      <Select
                        value={draft.status}
                        items={statusItems}
                        onValueChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            status: (value ??
                              "all") as AppointmentStatus | "all",
                          }))
                        }
                      >
                        <SelectTrigger
                          id="agenda-status-filter"
                          className={cn(controlHeightClass, "w-full")}
                        >
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">Todas</SelectItem>
                            {AGENDA_STATUS_FILTER_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="agenda-availability-filter"
                        className="text-xs"
                      >
                        Disponibilidade
                      </Label>
                      <Select
                        value={draft.availability}
                        items={availabilityItems}
                        onValueChange={(value) =>
                          setDraft((current) => ({
                            ...current,
                            availability: (value ??
                              "all") as AgendaAvailabilityFilter,
                          }))
                        }
                      >
                        <SelectTrigger
                          id="agenda-availability-filter"
                          className={cn(controlHeightClass, "w-full")}
                        >
                          <SelectValue placeholder="Todos os horários" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {availabilityOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={clearDraft}
                    >
                      Limpar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8"
                      onClick={applyDraft}
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {canCreateAppointment && onCreateAppointment ? (
          <Button
            type="button"
            className={cn(controlHeightClass, "w-full shrink-0 gap-1.5 xl:w-auto")}
            onClick={onCreateAppointment}
          >
            <Plus className="size-3.5" aria-hidden />
            Novo agendamento
          </Button>
        ) : null}
      </div>
    </section>
  );
}
