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
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isRunningNow, setIsRunningNow] = useState(false);
  const [actingLogId, setActingLogId] = useState("");
  const [aiTargets, setAiTargets] = useState<{ keywords: string[]; handles: string[] } | null>(null);
  const { success, error } = useAlerts();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    enabled: false,
    collectionId: "",
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
      intervalMinutes: settings.intervalMinutes
    });
    if (settings.keywords.length || settings.targetHandles.length) {
      setAiTargets({ keywords: settings.keywords, handles: settings.targetHandles });
    }
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

  const askAi = async () => {
    setIsSuggesting(true);

    try {
      const suggestions = await autoPromoterService.aiSuggest();
      setAiTargets(suggestions);
      await autoPromoterService.updateSettings({
        enabled: form.enabled,
        collectionId: form.collectionId || undefined,
        keywords: suggestions.keywords,
        targetHandles: suggestions.handles,
        intervalMinutes: form.intervalMinutes
      });
      success(t("aiTargetsUpdated"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setIsSuggesting(false);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await autoPromoterService.updateSettings({
        enabled: form.enabled,
        collectionId: form.collectionId || undefined,
        keywords: aiTargets?.keywords ?? [],
        targetHandles: aiTargets?.handles ?? [],
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

  const stopPromoter = async () => {
    setIsStopping(true);

    try {
      await autoPromoterService.stop();
      setForm((current) => ({ ...current, enabled: false }));
      const logData = await autoPromoterService.listLogs();
      setLogs(logData);
      success(t("autoPromoterStopped"));
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setIsStopping(false);
    }
  };

  const runNowHandler = async () => {
    setIsRunningNow(true);

    try {
      const logData = await autoPromoterService.runNow();
      setLogs(logData);
    } catch (caughtError) {
      error(getErrorMessage(caughtError, t("somethingWentWrong")));
    } finally {
      setIsRunningNow(false);
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
            <div className="stack compact">
              <button type="button" onClick={() => void askAi()} disabled={isSuggesting}>
                <span className="button-label">
                  {isSuggesting ? <LoadingSpinner size="sm" /> : null}
                  {t("findCollectorsWithAi")}
                </span>
              </button>
              {aiTargets ? (
                <div className="cost-info">
                  <strong>{t("aiTargetsLabel")}</strong><br />
                  <span className="muted" style={{ fontSize: "0.8em" }}>
                    {t("aiTargetsHandles")}: {aiTargets.handles.map((h) => `@${h}`).join(", ")}
                  </span><br />
                  <span className="muted" style={{ fontSize: "0.8em" }}>
                    {t("aiTargetsKeywords")}: {aiTargets.keywords.join(", ")}
                  </span>
                </div>
              ) : (
                <p className="muted" style={{ fontSize: "0.8em" }}>{t("aiTargetsHint")}</p>
              )}
            </div>
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
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => void runNowHandler()}
                disabled={isRunningNow}
                style={{ flex: 1 }}
              >
                <span className="button-label">
                  {isRunningNow ? <LoadingSpinner size="sm" /> : null}
                  {isRunningNow ? t("running") : t("runNow")}
                </span>
              </button>
              {form.enabled ? (
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => void stopPromoter()}
                  disabled={isStopping}
                  style={{ flex: 1 }}
                >
                  <span className="button-label">
                    {isStopping ? <LoadingSpinner size="sm" /> : null}
                    {t("stopAutoPromoter")}
                  </span>
                </button>
              ) : null}
            </div>
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

          </div>
        </Card>
      </div>
    </div>
  );
};
