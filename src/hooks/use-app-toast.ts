"use client";

import { useCallback } from "react";

import { useToast, type ToastInput, type ToastVariant } from "@/contexts/toast-context";

type ToastMessage = {
  title: string;
  description?: string;
  duration?: number;
  onClick?: () => void;
};

function withVariant(
  variant: ToastVariant,
  message: ToastMessage
): ToastInput {
  return { ...message, variant };
}

export function useAppToast() {
  const { showToast, dismissToast } = useToast();

  const success = useCallback(
    (message: ToastMessage) => showToast(withVariant("success", message)),
    [showToast]
  );

  const error = useCallback(
    (message: ToastMessage) => showToast(withVariant("error", message)),
    [showToast]
  );

  const warning = useCallback(
    (message: ToastMessage) => showToast(withVariant("warning", message)),
    [showToast]
  );

  const info = useCallback(
    (message: ToastMessage) => showToast(withVariant("info", message)),
    [showToast]
  );

  return {
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  };
}
