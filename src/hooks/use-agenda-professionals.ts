"use client";

import { useCallback, useEffect, useState } from "react";

import { listAgendaProfessionalsAction } from "@/app/actions/dashboard-analytics-actions";
import type { AgendaProfessional } from "@/lib/agenda-professionals";
import { mapAgendaProfessionalOption } from "@/lib/agenda-professionals";

export function useAgendaProfessionals() {
  const [professionals, setProfessionals] = useState<AgendaProfessional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    const result = await listAgendaProfessionalsAction();

    if (result.success && result.data) {
      setProfessionals(
        result.data.professionals.map(mapAgendaProfessionalOption)
      );
      setError(null);
    } else {
      setProfessionals([]);
      setError(result.success ? null : result.error);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { professionals, isLoading, error, refetch };
}
