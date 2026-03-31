"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  IntegrationHealthProviderItem,
  IntegrationHealthRemediationResult,
  UiAsyncState,
} from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";
import { STATE_LABELS } from "@/lib/ux-contract";

type HealthMeta = {
  total: number;
  healthy: number;
  degraded: number;
  disconnected: number;
  window_hours: number;
};

const remediationActionLabel: Record<string, string> = {
  replay_latest_failure: "Replay Latest Failure",
  reconnect_provider: "Reconnect Provider",
};

const healthProviders = [
  "trello",
  "google_tasks",
  "todoist",
  "clickup",
  "microsoft_todo",
  "google_calendar",
  "obsidian",
] as const;

type HealthProvider = (typeof healthProviders)[number];

function asHealthProvider(provider: string): HealthProvider | null {
  if ((healthProviders as readonly string[]).includes(provider)) {
    return provider as HealthProvider;
  }

  return null;
}

export function IntegrationHealthCenterCard() {
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState("Loading integration health center...");
  const [items, setItems] = useState<IntegrationHealthProviderItem[]>([]);
  const [meta, setMeta] = useState<HealthMeta>({
    total: 0,
    healthy: 0,
    degraded: 0,
    disconnected: 0,
    window_hours: 24,
  });
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [remediationMessage, setRemediationMessage] = useState<string | null>(null);
  const stateClass = useMemo(() => `pill state-${state}`, [state]);

  const loadHealth = useCallback(async () => {
    setState("loading");
    setDetail("Loading integration health center...");

    try {
      const response = await nestApiClient.getIntegrationHealth({ window_hours: 24 });
      const data = response.data ?? [];
      const nextMeta = response.meta ?? meta;

      setItems(data);
      setMeta({
        total: Number(nextMeta.total ?? 0),
        healthy: Number(nextMeta.healthy ?? 0),
        degraded: Number(nextMeta.degraded ?? 0),
        disconnected: Number(nextMeta.disconnected ?? 0),
        window_hours: Number(nextMeta.window_hours ?? 24),
      });
      setState(data.length > 0 ? "success" : "empty");
      setDetail(
        data.length > 0
          ? `Health summary for last ${Number(nextMeta.window_hours ?? 24)}h.`
          : "No provider health data available."
      );
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status?: unknown }).status === "number"
          ? String((error as { status: number }).status)
          : "n/a";

      setState("error");
      setDetail(`Failed to load integration health center (HTTP ${status}).`);
    }
  }, [meta]);

  useEffect(() => {
    void loadHealth();
  }, [loadHealth]);

  const runRemediation = useCallback(
    async (provider: string, action: "replay_latest_failure" | "reconnect_provider") => {
      const typedProvider = asHealthProvider(provider);
      if (typedProvider === null) {
        return;
      }

      const key = `${provider}:${action}`;
      setBusyKey(key);
      setRemediationMessage(null);

      try {
        const response = await nestApiClient.remediateIntegrationHealth(typedProvider, action);
        const result = response.data as IntegrationHealthRemediationResult;
        setRemediationMessage(
          `${provider}: ${result.message} (${result.status})`
        );
        await loadHealth();
      } catch (error) {
        const status =
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          typeof (error as { status?: unknown }).status === "number"
            ? String((error as { status: number }).status)
            : "n/a";
        setRemediationMessage(`${provider}: remediation failed (HTTP ${status}).`);
      } finally {
        setBusyKey(null);
      }
    },
    [loadHealth]
  );

  return (
    <article className="panel">
      <h2>Integration Health Center</h2>
      <div className="panel-content">
        <span className={stateClass}>{STATE_LABELS[state]}</span>
        <p className="callout">{detail}</p>
        <p className="mono-note">
          Healthy: {meta.healthy} | Degraded: {meta.degraded} | Disconnected: {meta.disconnected}
        </p>
        {remediationMessage ? <p className="mono-note">{remediationMessage}</p> : null}

        {items.length > 0 ? (
          <ul className="list">
            {items.map((item) => (
              <li key={item.provider} className="list-row">
                <div className="panel-content">
                  <strong>{item.display_name}</strong>
                  <p>Health: {item.health.status}</p>
                  <p className="mono-note">Connection: {item.connection.status}</p>
                  <p className="mono-note">
                    Sync success: {item.sync_window.success_rate_percent}% ({item.sync_window.success_count}/
                    {item.sync_window.success_count + item.sync_window.failed_count})
                  </p>
                  <p className="mono-note">
                    Events dropped: {item.events.dropped_count}/{item.events.received_count}
                    {" "}
                    ({item.events.drop_rate_percent}%)
                  </p>
                  <p className="mono-note">Runbook: {item.remediation.runbook_ref}</p>
                </div>
                <div className="row-inline">
                  {item.remediation.one_click_actions.map((action) => {
                    const key = `${item.provider}:${action.action}`;
                    return (
                      <button
                        key={key}
                        type="button"
                        className="btn-secondary"
                        disabled={!action.enabled || busyKey === key}
                        onClick={() => void runRemediation(item.provider, action.action)}
                      >
                        {remediationActionLabel[action.action] ?? action.label}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
