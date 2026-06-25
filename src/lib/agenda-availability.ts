import { CLINIC_TIME_SLOTS } from "@/lib/agenda-filter-utils";
import type { ProfessionalRole } from "@/lib/professionals-data";

export type AvailabilitySearchParams = {
  role: ProfessionalRole;
  date: string;
  startTime: string;
  endTime: string;
};

export type AvailableProfessional = {
  id: string;
  fullName: string;
  role: ProfessionalRole;
  source: "database" | "catalog";
};

export type TimeRange = {
  startTime: string;
  endTime: string;
};

export function compareTime(a: string, b: string) {
  return a.localeCompare(b);
}

export function doTimeRangesOverlap(
  first: TimeRange,
  second: TimeRange
) {
  return (
    compareTime(first.startTime, second.endTime) < 0 &&
    compareTime(second.startTime, first.endTime) < 0
  );
}

export function isValidTimeRange(startTime: string, endTime: string) {
  return compareTime(startTime, endTime) < 0;
}

export function getTimeSlotOptions() {
  return CLINIC_TIME_SLOTS.map((slot) => ({
    value: slot.time,
    label: slot.time,
    endTime: slot.endTime,
  }));
}

export function getEndTimeOptions(startTime: string) {
  const startIndex = CLINIC_TIME_SLOTS.findIndex(
    (slot) => slot.time === startTime
  );

  if (startIndex === -1) {
    return [];
  }

  return CLINIC_TIME_SLOTS.slice(startIndex + 1).map((slot) => ({
    value: slot.endTime,
    label: slot.endTime,
  }));
}

export function resolveDefaultEndTime(startTime: string) {
  const slot = CLINIC_TIME_SLOTS.find((item) => item.time === startTime);
  return slot?.endTime ?? startTime;
}

type BusyEvent = {
  professionalName: string;
  professionalUserId: string | null;
  startTime: string;
  endTime: string;
};

export function filterAvailableProfessionals(
  professionals: AvailableProfessional[],
  busyEvents: BusyEvent[],
  range: TimeRange
) {
  return professionals.filter((professional) => {
    const professionalEvents = busyEvents.filter(
      (event) =>
        event.professionalUserId === professional.id ||
        event.professionalName.localeCompare(professional.fullName, "pt-BR", {
          sensitivity: "accent",
        }) === 0
    );

    return !professionalEvents.some((event) =>
      doTimeRangesOverlap(range, {
        startTime: event.startTime,
        endTime: event.endTime,
      })
    );
  });
}

export function getTodayDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
