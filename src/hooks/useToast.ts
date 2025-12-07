"use client";

import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      options?: { showRetry?: boolean; onRetry?: () => void; duration?: number }
    ) => {
      const id = Math.random().toString(36).substring(7);
      const toast: Toast = {
        id,
        message,
        type,
        showRetry: options?.showRetry,
        onRetry: options?.onRetry,
      };

      setToasts((prev) => [...prev, toast]);

      // Auto remove after duration (default 5 seconds, or 0 for no auto-remove)
      const duration = options?.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showError = useCallback(
    (
      message: string,
      options?: { showRetry?: boolean; onRetry?: () => void }
    ) => {
      return showToast(message, "error", options);
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string) => {
      return showToast(message, "success");
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    showError,
    showSuccess,
    removeToast,
  };
};
