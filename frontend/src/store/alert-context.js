import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
const AlertContext = createContext(undefined);
const defaultDurations = {
    success: 3600,
    info: 3600,
    warning: 5200,
    error: 7000
};
const buildAlertId = () => typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);
    const timeoutsRef = useRef(new Map());
    const dismissAlert = useCallback((id) => {
        const timeoutId = timeoutsRef.current.get(id);
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutsRef.current.delete(id);
        }
        setAlerts((current) => current.filter((alert) => alert.id !== id));
    }, []);
    const showAlert = useCallback((tone, input) => {
        const id = buildAlertId();
        const durationMs = input.durationMs ?? defaultDurations[tone];
        const alert = {
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
    }, [dismissAlert]);
    const value = useMemo(() => ({
        alerts,
        dismissAlert,
        showAlert,
        success: (message, title) => showAlert("success", { message, title }),
        info: (message, title) => showAlert("info", { message, title }),
        warning: (message, title) => showAlert("warning", { message, title }),
        error: (message, title) => showAlert("error", { message, title })
    }), [alerts, dismissAlert, showAlert]);
    return _jsx(AlertContext.Provider, { value: value, children: children });
};
export const useAlerts = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error("useAlerts must be used within AlertProvider");
    }
    return context;
};
