export const SLOT_DURATION_OPTIONS = [
  5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60,
] as const;

export type SlotDurationMinutes = (typeof SLOT_DURATION_OPTIONS)[number];

export const DEFAULT_SLOT_DURATION_MINUTES: SlotDurationMinutes = 60;

/** 0 = domingo … 6 = sábado (igual a Date.getDay()). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: "Dom.",
  1: "Seg.",
  2: "Ter.",
  3: "Qua.",
  4: "Qui.",
  5: "Sex.",
  6: "Sáb.",
};

export const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

export type AvailabilityWindow = {
  id: string;
  startTime: string;
  endTime: string;
};

export type DayAvailability = {
  weekday: Weekday;
  windows: AvailabilityWindow[];
};

export type ProfessionalWorkloadSettings = {
  slotDurationMinutes: SlotDurationMinutes;
  days: DayAvailability[];
};

export type ProfessionalAvailabilityRow = {
  weekday: number;
  startTime: string;
  endTime: string;
};

export function isSlotDurationMinutes(
  value: number
): value is SlotDurationMinutes {
  return (SLOT_DURATION_OPTIONS as readonly number[]).includes(value);
}

export function createEmptyWorkloadSettings(
  slotDurationMinutes: SlotDurationMinutes = DEFAULT_SLOT_DURATION_MINUTES
): ProfessionalWorkloadSettings {
  return {
    slotDurationMinutes,
    days: WEEKDAYS.map((weekday) => ({ weekday, windows: [] })),
  };
}

export function createAvailabilityWindowId() {
  return `win-${crypto.randomUUID()}`;
}

export function normalizeTimeValue(value: string) {
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(trimmed);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function timeToMinutes(time: string) {
  const normalized = normalizeTimeValue(time);

  if (!normalized) {
    return null;
  }

  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function compareTime(a: string, b: string) {
  return a.localeCompare(b);
}

export function isValidAvailabilityWindow(startTime: string, endTime: string) {
  const start = normalizeTimeValue(startTime);
  const end = normalizeTimeValue(endTime);

  if (!start || !end) {
    return false;
  }

  return compareTime(start, end) < 0;
}

export function mapRowsToWorkloadSettings(
  slotDurationMinutes: number,
  rows: ProfessionalAvailabilityRow[]
): ProfessionalWorkloadSettings {
  const duration = isSlotDurationMinutes(slotDurationMinutes)
    ? slotDurationMinutes
    : DEFAULT_SLOT_DURATION_MINUTES;

  const days = createEmptyWorkloadSettings(duration).days.map((day) => {
    const windows = rows
      .filter((row) => row.weekday === day.weekday)
      .map((row) => ({
        id: createAvailabilityWindowId(),
        startTime: normalizeTimeValue(row.startTime) ?? row.startTime.slice(0, 5),
        endTime: normalizeTimeValue(row.endTime) ?? row.endTime.slice(0, 5),
      }))
      .sort((left, right) => compareTime(left.startTime, right.startTime));

    return { ...day, windows };
  });

  return { slotDurationMinutes: duration, days };
}

export function validateWorkloadSettings(
  settings: ProfessionalWorkloadSettings
): string | null {
  if (!isSlotDurationMinutes(settings.slotDurationMinutes)) {
    return "Selecione uma duração válida entre 5 e 60 minutos.";
  }

  for (const day of settings.days) {
    for (const window of day.windows) {
      if (!isValidAvailabilityWindow(window.startTime, window.endTime)) {
        return `Intervalo inválido em ${WEEKDAY_LABELS[day.weekday]}.`;
      }
    }

    const sorted = [...day.windows].sort((left, right) =>
      compareTime(left.startTime, right.startTime)
    );

    for (let index = 1; index < sorted.length; index += 1) {
      const previous = sorted[index - 1];
      const current = sorted[index];

      if (compareTime(previous.endTime, current.startTime) > 0) {
        return `Há intervalos sobrepostos em ${WEEKDAY_LABELS[day.weekday]}.`;
      }
    }
  }

  return null;
}

export function getWeekdayFromDateKey(dateKey: string): Weekday {
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = new Date(year, month - 1, day).getDay();

  return weekday as Weekday;
}

export type GeneratedTimeSlot = {
  time: string;
  endTime: string;
};

export function generateSlotsFromWindows(
  windows: Array<{ startTime: string; endTime: string }>,
  durationMinutes: number
): GeneratedTimeSlot[] {
  if (!isSlotDurationMinutes(durationMinutes) || windows.length === 0) {
    return [];
  }

  const slots: GeneratedTimeSlot[] = [];

  for (const window of windows) {
    const startMinutes = timeToMinutes(window.startTime);
    const endMinutes = timeToMinutes(window.endTime);

    if (startMinutes === null || endMinutes === null) {
      continue;
    }

    for (
      let cursor = startMinutes;
      cursor + durationMinutes <= endMinutes;
      cursor += durationMinutes
    ) {
      slots.push({
        time: minutesToTime(cursor),
        endTime: minutesToTime(cursor + durationMinutes),
      });
    }
  }

  return slots.sort((left, right) => compareTime(left.time, right.time));
}

export function isTimeRangeWithinWindows(
  range: { startTime: string; endTime: string },
  windows: Array<{ startTime: string; endTime: string }>
) {
  if (windows.length === 0) {
    return true;
  }

  return windows.some(
    (window) =>
      compareTime(range.startTime, window.startTime) >= 0 &&
      compareTime(range.endTime, window.endTime) <= 0
  );
}
