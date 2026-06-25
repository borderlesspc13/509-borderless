"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { listAgendaEventsAction } from "@/app/actions/agenda-events-actions";
import { mergeAppointments } from "@/lib/agenda-events";
import type { DailyAppointment } from "@/lib/agenda-types";

export function useAgendaEvents() {
  const pathname = usePathname();
  const [appointments, setAppointments] = useState<DailyAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    const result = await listAgendaEventsAction();

    if (result.success && result.data) {
      setAppointments(result.data.appointments);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch, pathname]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && pathname === "/dashboard") {
        void refetch();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname, refetch]);

  const addAppointment = useCallback((appointment: DailyAppointment) => {
    setAppointments((current) => mergeAppointments(current, appointment));
  }, []);

  return {
    appointments,
    setAppointments,
    isLoading,
    refetch,
    addAppointment,
  };
}
