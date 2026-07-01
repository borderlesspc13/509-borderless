"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  CalendarSearch,
  CalendarPlus,
  Clock,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";

import { searchAvailableProfessionalsAction } from "@/app/actions/agenda-availability-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  NewAppointmentDialog,
  type NewAppointmentDefaults,
} from "@/components/dashboard/new-appointment-dialog";
import { Badge } from "@/components/ui/badge";
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
  getEndTimeOptions,
  getTimeSlotOptions,
  getTodayDateKey,
  resolveDefaultEndTime,
  type AvailableProfessional,
} from "@/lib/agenda-availability";
import { PROFESSIONAL_ROLES, type ProfessionalRole } from "@/lib/professionals-data";
import { formatFullDate } from "@/lib/calendar-utils";

const roleSelectItems = PROFESSIONAL_ROLES.map((role) => ({
  label: role,
  value: role,
}));

export function AvailableAgendaSearch() {
  const searchParams = useSearchParams();
  const toast = useAppToast();
  const initialDate = searchParams.get("date") ?? getTodayDateKey();
  const [role, setRole] = useState<ProfessionalRole>("Psicólogo");
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [results, setResults] = useState<AvailableProfessional[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [appointmentDefaults, setAppointmentDefaults] =
    useState<NewAppointmentDefaults | null>(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isSearching, startSearchTransition] = useTransition();

  const startTimeOptions = useMemo(() => getTimeSlotOptions(), []);
  const endTimeOptions = useMemo(
    () => getEndTimeOptions(startTime),
    [startTime]
  );

  function handleStartTimeChange(value: string) {
    setStartTime(value);
    setEndTime(resolveDefaultEndTime(value));
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchError(null);

    startSearchTransition(async () => {
      const result = await searchAvailableProfessionalsAction({
        role,
        date,
        startTime,
        endTime,
      });

      setHasSearched(true);

      if (!result.success) {
        setSearchError(result.error);
        toast.error({
          title: "Falha na busca",
          description: result.error ?? "Não foi possível buscar horários.",
        });
        setResults([]);
        return;
      }

      const professionals = result.data?.professionals ?? [];
      setResults(professionals);

      if (professionals.length === 0) {
        toast.info({
          title: "Nenhum horário encontrado",
          description: "Tente outro horário ou profissional.",
        });
      }
    });
  }

  function handleSchedule(professional: AvailableProfessional) {
    setAppointmentDefaults({
      professionalName: professional.fullName,
      professionalUserId:
        professional.source === "database" ? professional.id : null,
      professionalRole: professional.role,
      eventDate: date,
      startTime,
      endTime,
    });
    setIsAppointmentDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-6">
        <div className="mb-5 space-y-1">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CalendarSearch className="size-5 text-primary" />
            Busca de agenda disponível
          </h2>
          <p className="text-sm text-muted-foreground">
            Encontre profissionais livres por cargo, data e faixa de horário.
          </p>
        </div>

        <form
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          onSubmit={handleSearch}
        >
          <div className="space-y-2 sm:col-span-2 xl:col-span-1">
            <Label htmlFor="availability-role">Cargo / Especialidade</Label>
            <Select
              value={role}
              items={roleSelectItems}
              onValueChange={(value) => setRole(value as ProfessionalRole)}
            >
              <SelectTrigger id="availability-role" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {PROFESSIONAL_ROLES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability-date">Data</Label>
            <Input
              id="availability-date"
              type="date"
              className="h-11"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability-start">Início</Label>
            <Select
              value={startTime}
              items={startTimeOptions}
              onValueChange={(value) => handleStartTimeChange(value as string)}
            >
              <SelectTrigger id="availability-start" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {startTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability-end">Fim</Label>
            <Select
              value={endTime}
              items={endTimeOptions}
              onValueChange={(value) => setEndTime(value as string)}
            >
              <SelectTrigger id="availability-end" className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {endTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2 xl:col-span-4">
            <Button
              type="submit"
              className="h-11 w-full gap-2 sm:w-auto"
              disabled={isSearching || endTimeOptions.length === 0}
            >
              {isSearching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              {isSearching ? "Buscando..." : "Buscar disponibilidade"}
            </Button>
          </div>
        </form>
      </section>

      {searchError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {searchError}
        </p>
      ) : null}

      {hasSearched ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold">Resultados</h3>
              <p className="text-sm text-muted-foreground">
                {formatFullDate(date)} · {startTime} – {endTime} · {role}
              </p>
            </div>
            <Badge variant="secondary">
              {results.length} profissional{results.length === 1 ? "" : "is"}{" "}
              disponível{results.length === 1 ? "" : "eis"}
            </Badge>
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                Nenhum profissional disponível neste intervalo.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente outra data, cargo ou faixa de horário.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((professional) => (
                <article
                  key={professional.id}
                  className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <UserRound className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {professional.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {professional.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4 shrink-0" />
                    <span>
                      Livre das {startTime} às {endTime}
                    </span>
                  </div>

                  <Button
                    type="button"
                    className="mt-auto h-10 w-full gap-2"
                    onClick={() => handleSchedule(professional)}
                  >
                    <CalendarPlus className="size-4" />
                    Agendar
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}

      <NewAppointmentDialog
        open={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
        defaults={appointmentDefaults}
      />
    </div>
  );
}
