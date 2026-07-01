"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

import {
  fetchAuditLogsAction,
  type AuditLogFilters,
} from "@/app/actions/audit-log-actions";
import { useAppToast } from "@/hooks/use-app-toast";
import { AuditLogFiltersBar } from "@/components/dashboard/audit-log-filters";
import { AuditLogTable } from "@/components/dashboard/audit-log-table";
import type { AgendaAuditLogRow } from "@/lib/supabase/database.types";

export function AuditLogPage() {
  const toast = useAppToast();
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [logs, setLogs] = useState<AgendaAuditLogRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async (nextFilters: AuditLogFilters) => {
    setIsLoading(true);
    setError(null);

    const result = await fetchAuditLogsAction(nextFilters);

    if (!result.success) {
      const message =
        result.error ?? "Não foi possível carregar o log de auditoria.";
      setError(message);
      toast.error({ title: "Falha ao carregar", description: message });
      setLogs([]);
      setIsLoading(false);
      return;
    }

    setLogs(result.logs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadLogs({});
  }, [loadLogs]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Log de Auditoria"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Auditoria" },
        ]}
      />

      <p className="text-sm leading-relaxed text-muted-foreground">
        Consulte o histórico de remanejamentos, cancelamentos e mudanças de
        situação registrados automaticamente na agenda.
      </p>

      <AuditLogFiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={() => void loadLogs(filters)}
        onClear={() => {
          setFilters({});
          void loadLogs({});
        }}
        isLoading={isLoading}
      />

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-medium">Erro ao consultar auditoria</p>
            <p className="mt-1 text-destructive/90">{error}</p>
          </div>
        </div>
      ) : null}

      <AuditLogTable logs={logs} isLoading={isLoading} />
    </div>
  );
}
