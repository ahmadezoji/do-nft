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
  } as const;

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

  return (
    <div className="app-alerts" aria-live="polite" aria-atomic="false">
      {alerts.map((alert) => (
        <section
          key={alert.id}
          className={`app-alert app-alert-${alert.tone}`}
          role={alert.tone === "error" ? "alert" : "status"}
        >
          <div className="app-alert-body">
            <strong>{alert.title ?? alertTitles[alert.tone]}</strong>
            <p>{alert.message}</p>
          </div>
          <button
            type="button"
            className="app-alert-close"
            onClick={() => dismissAlert(alert.id)}
            aria-label={t("dismissAlert")}
          >
            ×
          </button>
        </section>
      ))}
    </div>
  );
};
