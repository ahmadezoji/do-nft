import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useAlerts } from "../../store/alert-context";
import { useLanguage } from "../../store/language-context";
export const AppAlerts = () => {
    const { alerts, dismissAlert } = useAlerts();
    const { t } = useLanguage();
    const alertTitles = {
        success: t("successLabel"),
        info: t("infoLabel"),
        warning: t("warningLabel"),
        error: t("errorLabel")
    };
    useEffect(() => {
        if (alerts.length === 0) {
            return;
        }
        const latestAlert = alerts[alerts.length - 1];
        if (latestAlert.tone === "error" || latestAlert.tone === "warning") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [alerts]);
    if (alerts.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "app-alerts", "aria-live": "polite", "aria-atomic": "false", children: alerts.map((alert) => (_jsxs("section", { className: `app-alert app-alert-${alert.tone}`, role: alert.tone === "error" ? "alert" : "status", children: [_jsxs("div", { className: "app-alert-body", children: [_jsx("strong", { children: alert.title ?? alertTitles[alert.tone] }), _jsx("p", { children: alert.message })] }), _jsx("button", { type: "button", className: "app-alert-close", onClick: () => dismissAlert(alert.id), "aria-label": t("dismissAlert"), children: "\u00D7" })] }, alert.id))) }));
};
