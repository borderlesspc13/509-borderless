"use client";

import { MessageSquare, X } from "lucide-react";

import type { ToastInput } from "@/contexts/toast-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToastViewportProps = {
  toasts: Array<ToastInput & { id: string }>;
  onDismiss: (id: string) => void;
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
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "pointer-events-auto overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-lg",
            toast.onClick && "cursor-pointer"
          )}
          onClick={() => {
            toast.onClick?.();
            onDismiss(toast.id);
          }}
        >
          <div className="flex items-start gap-3 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageSquare className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {toast.title}
              </p>
              {toast.description ? (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {toast.description}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
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
      ))}
    </div>
  );
}
