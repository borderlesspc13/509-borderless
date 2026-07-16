"use client";

import { Construction } from "lucide-react";

export function CompanyAccreditationTab() {
  return (
    <section className="flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Construction className="size-8" aria-hidden />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">
        Módulo de Credenciamento
      </h3>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
        Nenhum dado disponível no momento.
      </p>
    </section>
  );
}
