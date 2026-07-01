"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  MessageSquare,
  X,
  XCircle,
} from "lucide-react";

import type { ToastInput, ToastVariant } from "@/contexts/toast-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastViewportProps = {
  toasts: Array<ToastInput & { id: string }>;
  onDismiss: (id: string) => void;
};

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: React.ReactNode }
> = {
  success: {
    container: "border-emerald-500/30 bg-emerald-600 text-white",
    icon: <CheckCircle2 className="size-4" aria-hidden />,
  },
  error: {
    container: "border-red-500/30 bg-red-500 text-white",
    icon: <XCircle className="size-4" aria-hidden />,
  },
  warning: {
    container: "border-amber-500/30 bg-amber-500 text-white",
    icon: <AlertTriangle className="size-4" aria-hidden />,
  },
  info: {
    container: "border-blue-500/30 bg-blue-500 text-white",
    icon: <Info className="size-4" aria-hidden />,
  },
};

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[min(100vw-2rem,24rem)] flex-col gap-2"
    >
      {toasts.map((toast) => {
        const variant = toast.variant ?? "info";
        const styles = variantStyles[variant];
        const isSolid = variant !== undefined;

        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto overflow-hidden rounded-xl border shadow-lg transition-all duration-300",
              isSolid
                ? styles.container
                : "border-border/80 bg-card text-card-foreground",
              toast.onClick && "cursor-pointer"
            )}
            onClick={() => {
              toast.onClick?.();
              onDismiss(toast.id);
            }}
          >
            <div className="flex items-start gap-3 p-4">
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  isSolid
                    ? "bg-white/20 text-white"
                    : "bg-primary/10 text-primary"
                )}
              >
                {isSolid ? (
                  styles.icon
                ) : (
                  <MessageSquare className="size-4" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isSolid ? "text-white" : "text-foreground"
                  )}
                >
                  {toast.title}
                </p>
                {toast.description ? (
                  <p
                    className={cn(
                      "mt-1 line-clamp-2 text-xs leading-relaxed",
                      isSolid ? "text-white/90" : "text-muted-foreground"
                    )}
                  >
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "shrink-0",
                  isSolid && "text-white hover:bg-white/20 hover:text-white"
                )}
                aria-label="Fechar notificação"
                onClick={(event) => {
                  event.stopPropagation();
                  onDismiss(toast.id);
                }}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
