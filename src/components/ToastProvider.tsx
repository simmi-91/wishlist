import { useCallback, useMemo, useState, type ReactNode } from "react";

import { Toast, ToastContainer } from "react-bootstrap";

import { ToastContext } from "./toastContext";

type ToastVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "light"
  | "dark";

type ToastOptions = {
  message: string;
  title?: string;
  variant?: ToastVariant;
  delay?: number;
};

type ToastEntry = ToastOptions & { id: number };

const DEFAULT_DELAY_MS = 5_000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ delay = DEFAULT_DELAY_MS, ...options }: ToastOptions) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, delay, ...options }]);
      return id;
    },
    []
  );

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
    }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer position="top-end" className="p-3">
        {toasts.map(({ id, title, message, variant, delay }) => (
          <Toast
            key={id}
            bg={variant}
            onClose={() => removeToast(id)}
            show
            delay={delay}
            autohide
          >
            <Toast.Header closeButton={true}>
              <strong className="me-auto">{title ?? "Notification"}</strong>
            </Toast.Header>
            <Toast.Body>{message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}
