"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { AppointmentStatus } from "@/lib/agenda-types";
import { PROFESSIONAL_ROLES } from "@/lib/professionals-data";
import { cn } from "@/lib/utils";

type AgendaFiltersProps = {
  filters: AgendaFilters;
  onFiltersChange: (filters: AgendaFilters) => void;
  locations: string[];
  className?: string;
};

const availabilityOptions: Array<{
  value: AgendaAvailabilityFilter;
  label: string;
}> = [
  { value: "all", label: "Todos os horários" },
  { value: "vacant", label: "Apenas horários vagos" },
];

export function AgendaFilters({
  filters,
  onFiltersChange,
  locations,
  className,
}: AgendaFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<AgendaFilters>(filters);

  useEffect(() => {
    if (isOpen) {
      setDraft(filters);
    }
  }, [filters, isOpen]);

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

  function applyDraft() {
    onFiltersChange(draft);
    setIsOpen(false);
  }

  function clearDraft() {
    setDraft(DEFAULT_AGENDA_FILTERS);
    onFiltersChange(DEFAULT_AGENDA_FILTERS);
    setIsOpen(false);
  }

  return (
    <div className={cn("relative flex flex-wrap items-end gap-3", className)}>
      <div className="min-w-[11rem] flex-1 space-y-2 sm:max-w-[14rem]">
        <Label htmlFor="agenda-event-type-filter">Tipo de Evento</Label>
        <Select
          value={filters.appointmentType}
          items={appointmentTypeItems}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              appointmentType: (value ?? "all") as AgendaAppointmentType | "all",
            })
          }
        >
          <SelectTrigger id="agenda-event-type-filter" className="h-10 w-full">
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

      <div className="relative">
        <Button
          type="button"
          variant={hasActiveFilters ? "default" : "outline"}
          className="h-10 gap-2"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
        >
          <Filter className="size-4" aria-hidden />
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

        {isOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Fechar filtros"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-4 shadow-lg">
              <div className="mb-3 border-b border-border/70 pb-2">
                <h3 className="text-sm font-semibold">Filtros</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="agenda-appointment-type-filter">
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
                      className="h-10 w-full"
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

                <div className="space-y-2">
                  <Label htmlFor="agenda-specialty-filter">Especialidade</Label>
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
                      className="h-10 w-full"
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

                <div className="space-y-2">
                  <Label htmlFor="agenda-location-filter">
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
                      className="h-10 w-full"
                    >
                      <SelectValue placeholder="Busque o local do agendamento" />
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

                <div className="space-y-2">
                  <Label htmlFor="agenda-status-filter">Situação</Label>
                  <Select
                    value={draft.status}
                    items={statusItems}
                    onValueChange={(value) =>
                      setDraft((current) => ({
                        ...current,
                        status: (value ?? "all") as AppointmentStatus | "all",
                      }))
                    }
                  >
                    <SelectTrigger
                      id="agenda-status-filter"
                      className="h-10 w-full"
                    >
                      <SelectValue placeholder="Insira a situação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">Todas</SelectItem>
                        {AGENDA_STATUS_FILTER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agenda-availability-filter">
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
                      className="h-10 w-full"
                    >
                      <SelectValue placeholder="Todos os horários" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {availabilityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
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
                  className="h-9 px-2"
                  onClick={clearDraft}
                >
                  Limpar
                </Button>
                <Button type="button" className="h-9" onClick={applyDraft}>
                  Aplicar
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
