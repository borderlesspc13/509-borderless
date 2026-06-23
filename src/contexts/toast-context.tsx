"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { ToastViewport } from "@/components/ui/toast-viewport";

export type ToastInput = {
  title: string;
  description?: string;
  duration?: number;
  onClick?: () => void;
};

type ToastItem = ToastInput & {
  id: string;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current.get(id);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      const id = crypto.randomUUID();

      setToasts((current) => {
        const next = [{ ...toast, id }, ...current];
        return next.slice(0, 4);
      });

      const timeoutId = window.setTimeout(() => {
        dismissToast(id);
      }, toast.duration ?? 6_000);

      timeoutsRef.current.set(id, timeoutId);

      return id;
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider.");
  }

  return context;
}
