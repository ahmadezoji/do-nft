import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

type AlertTone = "success" | "info" | "warning" | "error";

type AlertItem = {
  id: string;
  tone: AlertTone;
  title?: string;
  message: string;
  durationMs: number;
};

type AlertInput = {
  title?: string;
  message: string;
  durationMs?: number;
};

type AlertContextValue = {
  alerts: AlertItem[];
  dismissAlert: (id: string) => void;
  showAlert: (tone: AlertTone, input: AlertInput) => string;
  success: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

const defaultDurations: Record<AlertTone, number> = {
  success: 3600,
  info: 3600,
  warning: 5200,
  error: 7000
};

const buildAlertId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  const dismissAlert = useCallback((id: string) => {
    const timeoutId = timeoutsRef.current.get(id);

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }

    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback(
    (tone: AlertTone, input: AlertInput) => {
      const id = buildAlertId();
      const durationMs = input.durationMs ?? defaultDurations[tone];
      const alert: AlertItem = {
        id,
        tone,
        title: input.title,
        message: input.message,
        durationMs
      };

      setAlerts((current) => [...current, alert]);

      const timeoutId = window.setTimeout(() => {
        dismissAlert(id);
      }, durationMs);

      timeoutsRef.current.set(id, timeoutId);

      return id;
    },
    [dismissAlert]
  );

  const value = useMemo<AlertContextValue>(
    () => ({
      alerts,
      dismissAlert,
      showAlert,
      success: (message, title) => showAlert("success", { message, title }),
      info: (message, title) => showAlert("info", { message, title }),
      warning: (message, title) => showAlert("warning", { message, title }),
      error: (message, title) => showAlert("error", { message, title })
    }),
    [alerts, dismissAlert, showAlert]
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

export const useAlerts = () => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlerts must be used within AlertProvider");
  }

  return context;
};
