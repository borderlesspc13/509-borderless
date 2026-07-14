"use client";

import { useState, useTransition } from "react";
import { Calculator, DollarSign, Calendar, ChevronLeft, ChevronRight, Activity } from "lucide-react";

import { getFaturamentoMensalAction, type FaturamentoMensal } from "@/app/actions/faturamento-actions";
import { Button } from "@/components/ui/button";

export function FaturamentoReportClient({ initialData, initialMes, initialAno }: { initialData: FaturamentoMensal | null, initialMes: number, initialAno: number }) {
  const [data, setData] = useState<FaturamentoMensal | null>(initialData);
  const [mes, setMes] = useState(initialMes);
  const [ano, setAno] = useState(initialAno);
  const [isPending, startTransition] = useTransition();

  const handlePrevMonth = () => {
    let nextMes = mes - 1;
    let nextAno = ano;
    if (nextMes < 1) {
      nextMes = 12;
      nextAno = ano - 1;
    }
    loadData(nextMes, nextAno);
  };

  const handleNextMonth = () => {
    let nextMes = mes + 1;
    let nextAno = ano;
    if (nextMes > 12) {
      nextMes = 1;
      nextAno = ano + 1;
    }
    loadData(nextMes, nextAno);
  };

  const loadData = (m: number, a: number) => {
    setMes(m);
    setAno(a);
    startTransition(async () => {
      const newData = await getFaturamentoMensalAction(a, m);
      setData(newData);
    });
  };

  const mesLabels = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} disabled={isPending}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-32 text-center text-lg font-semibold text-foreground">
            {mesLabels[mes - 1]} {ano}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={isPending}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {isPending ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-border/80 bg-card">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : !data ? (
        <div className="flex h-40 items-center justify-center rounded-xl border border-border/80 bg-card">
          <p className="text-muted-foreground">Nenhum dado encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Activity className="size-5" />
              </div>
              <h3 className="font-medium">Total de Consultas</h3>
            </div>
            <p className="mt-4 text-3xl font-bold text-foreground">{data.totalConsultas}</p>
            <p className="mt-1 text-sm text-muted-foreground">Realizadas no período</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="rounded-md bg-clinical-success/10 p-2 text-clinical-success">
                <DollarSign className="size-5" />
              </div>
              <h3 className="font-medium">Valor Total Estimado</h3>
            </div>
            <p className="mt-4 text-3xl font-bold text-foreground">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valorTotalFaturado)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Faturamento projetado</p>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="rounded-md bg-clinical-warning/10 p-2 text-clinical-warning">
                <Calculator className="size-5" />
              </div>
              <h3 className="font-medium">Resumo de Pagamentos</h3>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between border-b border-border/50 pb-2 text-sm">
                <span className="text-muted-foreground">Pagas ({data.consultasPagas}):</span>
                <span className="font-semibold text-clinical-success">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valorPago)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pendentes ({data.consultasPendentes}):</span>
                <span className="font-semibold text-clinical-warning">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.valorPendente)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
