"use client";

import {
  PEDI_AREA_LABELS,
  getPediDomainGroups,
  type PediArea,
  type PediCapability,
} from "@/lib/pedi";
import { cn } from "@/lib/utils";

type PediAnswerGridProps = {
  area: PediArea;
  items: Record<string, PediCapability>;
  onChange: (itemId: string, value: PediCapability) => void;
  disabled?: boolean;
};

function ScoreButton({
  value,
  selected,
  disabled,
  onSelect,
}: {
  value: PediCapability;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border/80 bg-background text-muted-foreground hover:bg-muted/50"
      )}
    >
      {value}
    </button>
  );
}

export function PediAnswerGrid({
  area,
  items,
  onChange,
  disabled = false,
}: PediAnswerGridProps) {
  const domains = getPediDomainGroups(area);

  return (
    <section className="space-y-4" aria-label={`Folha — ${PEDI_AREA_LABELS[area]}`}>
      <div className="rounded-xl border border-sky-200/80 bg-sky-50/80 px-4 py-3 text-sm text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100">
        <p className="font-medium">
          <span className="mr-4">0 — Não realiza</span>
          <span>1 — Realiza</span>
        </p>
      </div>

      {domains.map((domain) => (
        <div
          key={domain.domainCode}
          className="overflow-hidden rounded-xl border border-border/70 bg-card"
        >
          <header className="border-b border-border/60 bg-muted/30 px-4 py-2.5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              {domain.domainCode}: {domain.domainLabel}
            </h3>
          </header>

          <ul className="divide-y divide-border/50">
            {domain.items.map((item) => {
              const value = items[item.id] ?? 0;

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="mr-2 font-semibold tabular-nums text-muted-foreground">
                        {item.sortOrder}.
                      </span>
                      {item.text}
                    </p>
                  </div>

                  <div
                    className="flex shrink-0 items-center gap-2"
                    role="group"
                    aria-label={`Pontuação item ${item.sortOrder}`}
                  >
                    <ScoreButton
                      value={0}
                      selected={value === 0}
                      disabled={disabled}
                      onSelect={() => onChange(item.id, 0)}
                    />
                    <ScoreButton
                      value={1}
                      selected={value === 1}
                      disabled={disabled}
                      onSelect={() => onChange(item.id, 1)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
