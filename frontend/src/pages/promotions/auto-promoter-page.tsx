import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Card } from "../../components/common/card";
import { LoadingSpinner } from "../../components/common/loading-spinner";
import { FormField } from "../../components/forms/form-field";
import { autoPromoterService } from "../../services/auto-promoter-service";
import { collectionsService } from "../../services/collections-service";
import { useAlerts } from "../../store/alert-context";
import { useLanguage } from "../../store/language-context";
import { getErrorMessage } from "../../utils/get-error-message";
import type { AutoPromoterLogEntry, Collection } from "../../types/api";

const LOG_ICON: Record<string, string> = {
  ACTION: "✅",
  INFO: "ℹ️",
  DISCOVERY: "🔍",
  SUGGESTION: "💡",
  ERROR: "❌"
};

const LOG_CLASS: Record<string, string> = {
  ACTION: "is-success",
  INFO: "is-info",
  DISCOVERY: "is-info",
  SUGGESTION: "is-info",
  ERROR: "is-error"
};

function formatTs(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const AutoPromoterPage = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [logs, setLogs] = useState<AutoPromoterLogEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actingLogId, setActingLogId] = useState("");
  const { success, error } = useAlerts();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    enabled: false,
    collectionId: "",
    keywords: "",
    targetHandles: "",
    intervalMinutes: 720
  });

  const load = async () => {
    const [settings, collectionData, logData] = await Promise.all([
      autoPromoterService.getSettings(),
      collectionsService.list(),
      autoPromoterService.listLogs()
    ]);

    setForm({
      enabled: settings.enabled,
      collectionId: settings.collectionId ?? "",
      keywords: settings.keywords.join(", "),
      targetHandles: settings.targetHandles.join(", "),
      intervalMinutes: settings.intervalMinutes
    });
    setCollections(collectionData);
    setLogs(logData);
  };

  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      void autoPromoterService.listLogs().then(setLogs);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await autoPromoterService.updateSettings({
        enabled: form.enabled,
        collectionId: form.collectionId || undefined,
        keywords: form.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        targetHandles: form.targetHandles
          .split(",")
          .map((h) => h.trim().replace(/^@/, ""))
          .filter(Boolean)
          .slice(0, 5),
        intervalMinutes: form.intervalMinutes
      });
      await load();
      success(t("settingsUpdated"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setIsSubmitting(false);
    }
  };

  const act = async (logId: string, action: "approve" | "dismiss") => {
    setActingLogId(logId);

    try {
      if (action === "approve") {
        await autoPromoterService.approveLog(logId);
        success(t("actionApproved"));
      } else {
        await autoPromoterService.dismissLog(logId);
        success(t("actionDismissed"));
      }

      const logData = await autoPromoterService.listLogs();
      setLogs(logData);
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setActingLogId("");
    }
  };

  return (
    <div className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Amplification</p>
          <h1>{t("autoPromoterTitle")}</h1>
        </div>
      </header>

      <div className="grid split-grid">
        <Card>
          <h3>{t("autoPromoterTitle")}</h3>
          <p className="muted">{t("autoPromoterDescription")}</p>
          <form className="stack compact" onSubmit={submit}>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))}
              />
              <span>{t("autoPromoterEnabled")}</span>
            </label>
            <FormField label={t("autoPromoterCollection")}>
              <select
                value={form.collectionId}
                onChange={(event) => setForm((current) => ({ ...current, collectionId: event.target.value }))}
              >
                <option value="">{t("noCollectionOption")}</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t("autoPromoterKeywords")}>
              <input
                value={form.keywords}
                onChange={(event) => setForm((current) => ({ ...current, keywords: event.target.value }))}
                placeholder="NFT collector, digital art buyer"
              />
            </FormField>
            <FormField label={t("autoPromoterHandles")}>
              <input
                value={form.targetHandles}
                onChange={(event) => setForm((current) => ({ ...current, targetHandles: event.target.value }))}
                placeholder="@nftcollector, @artbuyer (max 5)"
              />
              <p className="muted" style={{ fontSize: "0.8em" }}>{t("autoPromoterHandlesHint")}</p>
            </FormField>
            <FormField label={t("autoPromoterInterval")}>
              <input
                type="number"
                min={15}
                max={1440}
                value={form.intervalMinutes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, intervalMinutes: Number(event.target.value) }))
                }
              />
            </FormField>
            <button type="submit" disabled={isSubmitting}>
              <span className="button-label">
                {isSubmitting ? <LoadingSpinner size="sm" /> : null}
                {t("saveAutoPromoterSettings")}
              </span>
            </button>
          </form>
        </Card>

        <Card>
          <div className="stack compact">
            <h3>{t("activityLog")}</h3>
            <p className="muted" style={{ fontSize: "0.8em" }}>{t("activityLogHint")}</p>

            <div className="console-log">
              {logs.length ? (
                logs.map((log) => (
                  <div key={log.id} className="console-log-line">
                    <span className="console-ts">[{formatTs(log.createdAt)}]</span>
                    <span className={`console-msg ${LOG_CLASS[log.type] ?? ""}`}>
                      {LOG_ICON[log.type] ?? "•"}{" "}
                      {log.targetHandle ? <strong>@{log.targetHandle}</strong> : null}
                      {log.targetHandle ? " — " : null}
                      {log.message}
                      {log.targetUrl ? (
                        <>
                          {" "}
                          <a href={log.targetUrl} target="_blank" rel="noreferrer" style={{ color: "inherit", opacity: 0.7 }}>
                            [view]
                          </a>
                        </>
                      ) : null}
                      {log.status === "PENDING" ? (
                        <span style={{ marginLeft: "0.5rem" }}>
                          <button
                            type="button"
                            style={{ fontSize: "0.75rem", padding: "0.1rem 0.4rem" }}
                            onClick={() => act(log.id, "approve")}
                            disabled={actingLogId === log.id}
                          >
                            {t("approve")}
                          </button>
                          {" "}
                          <button
                            type="button"
                            style={{ fontSize: "0.75rem", padding: "0.1rem 0.4rem" }}
                            onClick={() => act(log.id, "dismiss")}
                            disabled={actingLogId === log.id}
                          >
                            {t("dismiss")}
                          </button>
                        </span>
                      ) : null}
                    </span>
                  </div>
                ))
              ) : (
                <span className="console-msg is-info">ℹ️ {t("noActivityYet")}</span>
              )}
            </div>

            <div className="cost-info">
              <strong>{t("xApiCostTitle")}</strong><br />
              {t("xApiCostPerRun")}<br />
              <span style={{ opacity: 0.6 }}>{t("xApiCostNote")}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
