"use client";

import {
  PEDI_AREA_LABELS,
  PEDI_CAREGIVER_ITEMS_BY_AREA,
  PEDI_CAREGIVER_LEVEL_LABELS,
  type PediArea,
  type PediCaregiverLevel,
} from "@/lib/pedi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PediCaregiverGridProps = {
  area: PediArea;
  items: Record<string, PediCaregiverLevel | null>;
  onChange: (itemId: string, value: PediCaregiverLevel) => void;
  className?: string;
};

const LEVELS: PediCaregiverLevel[] = [0, 1, 2, 3, 4, 5];

export function PediCaregiverGrid({
  area,
  items,
  onChange,
  className,
}: PediCaregiverGridProps) {
  const catalog = PEDI_CAREGIVER_ITEMS_BY_AREA[area];

  return (
    <section
      className={cn("space-y-4", className)}
      aria-label={`Assistência do cuidador — ${PEDI_AREA_LABELS[area]}`}
    >
      <header className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          Parte II — Assistência do cuidador · {PEDI_AREA_LABELS[area]}
        </h3>
        <p className="text-xs text-muted-foreground">
          Escala 0–5:{" "}
          {LEVELS.map((level) => (
            <span key={level} className="mr-2 inline-block">
              <strong>{level}</strong> {PEDI_CAREGIVER_LEVEL_LABELS[level]}
              {level < 5 ? ";" : "."}
            </span>
          ))}
        </p>
      </header>

      <ul className="space-y-3">
        {catalog.map((item) => {
          const value = items[item.id];

          return (
            <li
              key={item.id}
              className="rounded-xl border border-border/70 bg-card p-3 sm:p-4"
            >
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  <span className="mr-2 text-xs font-semibold text-muted-foreground">
                    {item.sortOrder}.
                  </span>
                  {item.text}
                </p>
                <span className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map((level) => (
                  <Button
                    key={level}
                    type="button"
                    size="sm"
                    variant={value === level ? "default" : "outline"}
                    className="min-w-10"
                    title={PEDI_CAREGIVER_LEVEL_LABELS[level]}
                    onClick={() => onChange(item.id, level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>

              {value != null ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Selecionado: {PEDI_CAREGIVER_LEVEL_LABELS[value]}
                </p>
              ) : (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                  Não respondido
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
