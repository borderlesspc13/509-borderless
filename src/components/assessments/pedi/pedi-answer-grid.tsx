"use client";

import { PEDI_AREA_LABELS, getPediDomainGroups, type PediArea, type PediCapability } from "@/lib/pedi";
import { cn } from "@/lib/utils";

type PediAnswerGridProps = {
  area: PediArea;
  items: Record<string, PediCapability>;
  onChange: (itemId: string, value: PediCapability) => void;
  disabled?: boolean;
};

export function PediAnswerGrid({
  area,
  items,
  onChange,
  disabled = false,
}: PediAnswerGridProps) {
  const domains = getPediDomainGroups(area);

  return (
    <section className="space-y-4" aria-label={`Folha — ${PEDI_AREA_LABELS[area]}`}>
      {domains.map((domain) => (
        <div
          key={domain.domainCode}
          className="rounded-lg border border-border/60 bg-muted/20 p-3"
        >
          <p className="mb-2 text-xs font-semibold text-foreground">
            {domain.domainCode}. {domain.domainLabel}
          </p>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {domain.items.map((item) => {
              const value = items[item.id] ?? 0;
              const isCapable = value === 1;

              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(item.id, isCapable ? 0 : 1)}
                  title={`${item.label}: ${isCapable ? "capaz (1)" : "incapaz (0)"}`}
                  className={cn(
                    "flex h-9 flex-col items-center justify-center rounded-md border text-[0.6rem] font-semibold transition-colors",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                    isCapable
                      ? "border-clinical-success/40 bg-clinical-success/15 text-[oklch(0.42_0.1_155)]"
                      : "border-border/70 bg-background text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <span>{item.label.replace(/^[A-Z]+-/, "")}</span>
                  <span className="text-[0.55rem] opacity-70">
                    {isCapable ? "1" : "0"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
