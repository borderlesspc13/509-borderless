import { cn } from "@/lib/utils";

type DashboardBarChartItem = {
  label: string;
  value: number;
};

type DashboardBarChartProps = {
  items: DashboardBarChartItem[];
  className?: string;
  variant?: "vertical" | "horizontal";
  valueSuffix?: string;
  barClassName?: string;
};

export function DashboardBarChart({
  items,
  className,
  variant = "horizontal",
  valueSuffix,
  barClassName = "bg-primary",
}: DashboardBarChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  function formatValue(value: number) {
    if (valueSuffix) {
      return `${value}${valueSuffix}`;
    }

    return String(value);
  }

  if (variant === "vertical") {
    return (
      <div
        className={cn(
          "grid h-72 grid-cols-5 items-end gap-3 border-b border-border px-2 pb-4 sm:gap-4 sm:px-4",
          className
        )}
      >
        {items.map((item) => (
          <div
            key={item.label}
            className="flex min-w-0 flex-col items-center gap-2"
          >
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {formatValue(item.value)}
            </span>
            <div
              className={cn(
                "w-full max-w-16 rounded-t-md transition-all sm:max-w-20",
                barClassName
              )}
              style={{
                height: `${Math.max((item.value / maxValue) * 160, 12)}px`,
              }}
              title={`${item.label}: ${formatValue(item.value)}`}
            />
            <span className="line-clamp-2 min-h-8 w-full text-center text-[0.7rem] leading-tight text-muted-foreground sm:text-xs">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      {items.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">{item.label}</span>
            <span className="shrink-0 font-semibold text-foreground">
              {formatValue(item.value)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted/80">
            <div
              className={cn("h-full rounded-full transition-all", barClassName)}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
