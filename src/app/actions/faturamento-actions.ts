"use server";

import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type FaturamentoMensal = {
  mes: string;
  totalConsultas: number;
  valorTotalFaturado: number;
  consultasPagas: number;
  valorPago: number;
  consultasPendentes: number;
  valorPendente: number;
};

export async function getFaturamentoMensalAction(
  ano: number,
  mes: number
): Promise<FaturamentoMensal | null> {
  await requirePermission(PERMISSIONS.REPORTS_VIEW);

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const startDate = new Date(ano, mes - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(ano, mes, 0).toISOString().split("T")[0]; // Último dia do mês

  const { data, error } = await supabase
    .from("agenda_events")
    .select("id, valor_sessao, payment_status, status")
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .neq("status", "cancelado"); // Ignorar cancelados no faturamento

  if (error || !data) {
    return null;
  }

  let totalConsultas = 0;
  let valorTotalFaturado = 0;
  let consultasPagas = 0;
  let valorPago = 0;
  let consultasPendentes = 0;
  let valorPendente = 0;

  for (const event of data) {
    totalConsultas++;
    const valor = event.valor_sessao || 0;
    valorTotalFaturado += valor;

    if (event.payment_status === "pago") {
      consultasPagas++;
      valorPago += valor;
    } else {
      consultasPendentes++;
      valorPendente += valor;
    }
  }

  return {
    mes: `${mes.toString().padStart(2, "0")}/${ano}`,
    totalConsultas,
    valorTotalFaturado,
    consultasPagas,
    valorPago,
    consultasPendentes,
    valorPendente,
  };
}
