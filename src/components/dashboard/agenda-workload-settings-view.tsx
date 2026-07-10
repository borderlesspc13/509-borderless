"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Check,
  Clock3,
  Copy,
  Hourglass,
  Loader2,
  Plus,
  X,
} from "lucide-react";

import {
  getMyWorkloadSettingsAction,
  saveMyWorkloadSettingsAction,
} from "@/app/actions/professional-availability-actions";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
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
import { useAppToast } from "@/hooks/use-app-toast";
import {
  createAvailabilityWindowId,
  createEmptyWorkloadSettings,
  SLOT_DURATION_OPTIONS,
  WEEKDAY_LABELS,
  WEEKDAYS,
  type DayAvailability,
  type ProfessionalWorkloadSettings,
  type SlotDurationMinutes,
  type Weekday,
} from "@/lib/professional-availability";
import { cn } from "@/lib/utils";

const durationSelectItems = SLOT_DURATION_OPTIONS.map((minutes) => ({
  label: `${minutes} Minutos`,
  value: String(minutes),
}));

function updateDayWindows(
  settings: ProfessionalWorkloadSettings,
  weekday: Weekday,
  updater: (windows: DayAvailability["windows"]) => DayAvailability["windows"]
): ProfessionalWorkloadSettings {
  return {
    ...settings,
    days: settings.days.map((day) =>
      day.weekday === weekday
        ? { ...day, windows: updater(day.windows) }
        : day
    ),
  };
}

export function AgendaWorkloadSettingsView() {
  const { success: showSuccess, error: showError } = useAppToast();
  const [settings, setSettings] = useState<ProfessionalWorkloadSettings>(
    createEmptyWorkloadSettings()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    const result = await getMyWorkloadSettingsAction();

    if (result.success && result.data) {
      setSettings(result.data);
    } else if (!result.success) {
      showError({
        title: "Não foi possível carregar a disponibilidade",
        description: result.error,
      });
    }

    setIsLoading(false);
  }, [showError]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  function handleDurationChange(value: string | null) {
    if (!value) {
      return;
    }

    const minutes = Number(value) as SlotDurationMinutes;
    setSettings((current) => ({
      ...current,
      slotDurationMinutes: minutes,
    }));
  }

  function addWindow(weekday: Weekday) {
    setSettings((current) =>
      updateDayWindows(current, weekday, (windows) => [
        ...windows,
        {
          id: createAvailabilityWindowId(),
          startTime: "08:00",
          endTime: "18:00",
        },
      ])
    );
  }

  function removeWindow(weekday: Weekday, windowId: string) {
    setSettings((current) =>
      updateDayWindows(current, weekday, (windows) =>
        windows.filter((window) => window.id !== windowId)
      )
    );
  }

  function updateWindowTime(
    weekday: Weekday,
    windowId: string,
    field: "startTime" | "endTime",
    value: string
  ) {
    setSettings((current) =>
      updateDayWindows(current, weekday, (windows) =>
        windows.map((window) =>
          window.id === windowId ? { ...window, [field]: value } : window
        )
      )
    );
  }

  function copyDayToOthers(weekday: Weekday) {
    setSettings((current) => {
      const source = current.days.find((day) => day.weekday === weekday);

      if (!source || source.windows.length === 0) {
        return current;
      }

      const clonedWindows = source.windows.map((window) => ({
        ...window,
        id: createAvailabilityWindowId(),
      }));

      return {
        ...current,
        days: current.days.map((day) =>
          day.weekday === weekday
            ? day
            : {
                ...day,
                windows: clonedWindows.map((window) => ({
                  ...window,
                  id: createAvailabilityWindowId(),
                })),
              }
        ),
      };
    });

    showSuccess({
      title: "Disponibilidade copiada",
      description: `Os horários de ${WEEKDAY_LABELS[weekday]} foram aplicados aos demais dias.`,
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveMyWorkloadSettingsAction(settings);

      if (!result.success) {
        showError({
          title: "Não foi possível salvar",
          description: result.error,
        });
        return;
      }

      showSuccess({
        title: "Configurações salvas",
        description: "Sua carga de trabalho foi atualizada.",
      });
    });
  }

  return (
    <PageContainer>
      <DashboardPageHeader
        title="Configurações"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Agenda", href: "/agenda" },
          { label: "Configurações" },
        ]}
        actions={
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isPending}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Check className="size-4" aria-hidden />
            )}
            Salvar
          </Button>
        }
      />

      <section className="rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="space-y-8 p-5 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Hourglass className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1">
                <h2 className="text-base font-semibold tracking-tight">
                  Duração dos Horários
                </h2>
                <p className="text-sm text-muted-foreground">
                  Defina aqui a duração de cada horário de atendimento
                </p>
              </div>
            </div>

            <div className="max-w-xs space-y-2 pl-0 sm:pl-12">
              <Label htmlFor="slot-duration" className="sr-only">
                Duração dos horários
              </Label>
              <Select
                value={String(settings.slotDurationMinutes)}
                items={durationSelectItems}
                onValueChange={handleDurationChange}
                disabled={isLoading || isPending}
              >
                <SelectTrigger id="slot-duration" className="h-10 w-full">
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SLOT_DURATION_OPTIONS.map((minutes) => (
                      <SelectItem key={minutes} value={String(minutes)}>
                        {minutes} Minutos
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 border-t border-border/70 pt-8">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Clock3 className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1">
                <h2 className="text-base font-semibold tracking-tight">
                  Disponibilidade Geral
                </h2>
                <p className="text-sm text-muted-foreground">
                  Defina aqui os períodos em que você está disponível para
                  agendamentos
                </p>
              </div>
            </div>

            <div className="space-y-2 pl-0 sm:pl-12">
              {isLoading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Carregando disponibilidade...
                </div>
              ) : (
                WEEKDAYS.map((weekday) => {
                  const day = settings.days.find(
                    (item) => item.weekday === weekday
                  ) ?? { weekday, windows: [] };
                  const hasWindows = day.windows.length > 0;

                  return (
                    <div
                      key={weekday}
                      className={cn(
                        "rounded-lg border border-border/70 bg-background/60 px-3 py-3",
                        "sm:px-4"
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                          <span className="w-12 shrink-0 text-sm font-medium">
                            {WEEKDAY_LABELS[weekday]}
                          </span>

                          {hasWindows ? (
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              {day.windows.map((window) => (
                                <div
                                  key={window.id}
                                  className="flex flex-wrap items-center gap-2"
                                >
                                  <Input
                                    type="time"
                                    value={window.startTime}
                                    onChange={(event) =>
                                      updateWindowTime(
                                        weekday,
                                        window.id,
                                        "startTime",
                                        event.target.value
                                      )
                                    }
                                    disabled={isPending}
                                    className="h-9 w-[7.5rem]"
                                    aria-label={`Início ${WEEKDAY_LABELS[weekday]}`}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    até
                                  </span>
                                  <Input
                                    type="time"
                                    value={window.endTime}
                                    onChange={(event) =>
                                      updateWindowTime(
                                        weekday,
                                        window.id,
                                        "endTime",
                                        event.target.value
                                      )
                                    }
                                    disabled={isPending}
                                    className="h-9 w-[7.5rem]"
                                    aria-label={`Fim ${WEEKDAY_LABELS[weekday]}`}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground"
                                    onClick={() =>
                                      removeWindow(weekday, window.id)
                                    }
                                    disabled={isPending}
                                    aria-label="Remover intervalo"
                                  >
                                    <X className="size-4" aria-hidden />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Indisponível
                            </span>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1 self-end sm:self-start">
                          {hasWindows ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-8 text-muted-foreground"
                              onClick={() => copyDayToOthers(weekday)}
                              disabled={isPending}
                              aria-label={`Copiar horários de ${WEEKDAY_LABELS[weekday]}`}
                              title="Copiar para os demais dias"
                            >
                              <Copy className="size-4" aria-hidden />
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-full"
                            onClick={() => addWindow(weekday)}
                            disabled={isPending}
                            aria-label={`Adicionar horário em ${WEEKDAY_LABELS[weekday]}`}
                          >
                            <Plus className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
