"use client";

import {
  SENSORY_LIKERT_LABELS,
  SENSORY_QUADRANT_LABELS,
  getSensoryQuadrantGroups,
  type SensoryLikert,
  type SensorySection,
} from "@/lib/sensory-profile";
import { cn } from "@/lib/utils";

type SensoryAnswerGridProps = {
  section: SensorySection;
  items: Record<string, SensoryLikert>;
  onChange: (itemId: string, value: SensoryLikert) => void;
  disabled?: boolean;
};

const LIKERT_VALUES = [1, 2, 3, 4, 5] as const;

export function SensoryAnswerGrid({
  section,
  items,
  onChange,
  disabled = false,
}: SensoryAnswerGridProps) {
  const groups = getSensoryQuadrantGroups(section);

  return (
    <section className="space-y-5">
      {groups.map((group) => (
        <div
          key={group.quadrant}
          className="rounded-xl border border-border/60 bg-muted/15 p-4"
        >
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            {SENSORY_QUADRANT_LABELS[group.quadrant]}
          </h4>
          <div className="space-y-3">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border/50 bg-background p-3"
              >
                <div className="mb-2 space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {LIKERT_VALUES.map((value) => {
                    const isSelected = (items[item.id] ?? 3) === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={disabled}
                        title={SENSORY_LIKERT_LABELS[value]}
                        onClick={() => onChange(item.id, value)}
                        className={cn(
                          "min-w-[2.25rem] rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                          isSelected
                            ? "border-primary/50 bg-primary/15 text-primary"
                            : "border-border/70 bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
