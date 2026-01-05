import { createContext, useContext } from "react";

export type ToastContextValue = {
  addToast: (options: {
    message: string;
    title?: string;
    variant?:
      | "primary"
      | "secondary"
      | "success"
      | "danger"
      | "warning"
      | "info"
      | "light"
      | "dark";
    delay?: number;
  }) => number;
  removeToast: (id: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToasts must be used within a ToastProvider");
  }
  return ctx;
}
