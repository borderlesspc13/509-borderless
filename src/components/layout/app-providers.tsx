"use client";

import { ToastProvider } from "@/contexts/toast-context";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>;
}
