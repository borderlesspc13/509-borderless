"use client";

import {
  DEMUCA_RATING_LABELS,
  getDemucaDomainGroups,
  type DemucaRating,
} from "@/lib/demuca";
import { cn } from "@/lib/utils";

type DemucaAnswerGridProps = {
  items: Record<string, DemucaRating | undefined>;
  onChange: (itemId: string, value: DemucaRating) => void;
  disabled?: boolean;
};

const RATING_VALUES = ["N", "P", "M"] as const;

export function DemucaAnswerGrid({
  items,
  onChange,
  disabled = false,
}: DemucaAnswerGridProps) {
  const domains = getDemucaDomainGroups();

  return (
    <section className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Escala de classificação:{" "}
        <strong className="text-foreground">N</strong> = Não ·{" "}
        <strong className="text-foreground">P</strong> = Pouco ·{" "}
        <strong className="text-foreground">M</strong> = Muito
      </p>

      {domains.map((group) => (
        <div
          key={group.domainId}
          className="rounded-xl border border-border/60 bg-muted/15 p-4"
        >
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            {group.domainLabel}
          </h4>
          <div className="space-y-3">
            {group.items.map((item) => {
              const selected = items[item.id];
              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/50 bg-background p-3"
                >
                  <div className="mb-2 flex flex-wrap items-baseline gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    {item.weight === 2 ? (
                      <span className="rounded border border-border/70 bg-muted/40 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        x2
                      </span>
                    ) : null}
                    {item.inverted ? (
                      <span
                        className="text-[0.65rem] text-muted-foreground"
                        title="Escala invertida: N=2, P=1, M=0"
                      >
                        (invertido)
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {RATING_VALUES.map((value) => {
                      const isSelected = selected === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={disabled}
                          title={DEMUCA_RATING_LABELS[value]}
                          onClick={() => onChange(item.id, value)}
                          className={cn(
                            "min-w-[3.25rem] rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            isSelected
                              ? "border-primary/50 bg-primary/15 text-primary"
                              : "border-border/70 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          {value}
                          <span className="ml-1 font-normal opacity-70">
                            {DEMUCA_RATING_LABELS[value]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
