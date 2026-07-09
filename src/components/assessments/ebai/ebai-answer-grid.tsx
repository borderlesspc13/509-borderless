"use client";

import {
  EBAI_LIKERT_LABELS,
  getEbaiDomainGroups,
  type EbaiLikert,
} from "@/lib/ebai";
import { cn } from "@/lib/utils";

type EbaiAnswerGridProps = {
  items: Record<string, EbaiLikert>;
  onChange: (itemId: string, value: EbaiLikert) => void;
  onAllAnswered?: () => void;
  disabled?: boolean;
};

const LIKERT_VALUES = [1, 2, 3, 4, 5, 6, 7] as const;

export function EbaiAnswerGrid({
  items,
  onChange,
  onAllAnswered,
  disabled = false,
}: EbaiAnswerGridProps) {
  const domains = getEbaiDomainGroups();

  function handleChange(itemId: string, value: EbaiLikert) {
    onChange(itemId, value);
    onAllAnswered?.();
  }

  return (
    <section className="space-y-5">
      {domains.map((group) => (
        <div
          key={group.domain}
          className="rounded-xl border border-border/60 bg-muted/15 p-4"
        >
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            {group.domain}
          </h4>
          <div className="space-y-3">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border/50 bg-background p-3"
              >
                <p className="mb-2 text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {LIKERT_VALUES.map((value) => {
                    const isSelected = (items[item.id] ?? 4) === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={disabled}
                        title={EBAI_LIKERT_LABELS[value]}
                        onClick={() => handleChange(item.id, value)}
                        className={cn(
                          "min-w-[2rem] rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors",
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
