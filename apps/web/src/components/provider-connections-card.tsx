"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { IntegrationConnectionItem, UiAsyncState } from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";
import { describeApiIssue, STATE_LABELS } from "@/lib/ux-contract";

const supportedProviders = [
  "trello",
  "google_tasks",
  "todoist",
  "clickup",
  "microsoft_todo",
  "google_calendar",
  "obsidian",
] as const;

type SupportedProvider = (typeof supportedProviders)[number];

const providerLabels: Record<string, string> = {
  trello: "Trello",
  google_tasks: "Google Tasks",
  todoist: "Todoist",
  clickup: "ClickUp",
  microsoft_todo: "Microsoft To Do",
  google_calendar: "Google Calendar",
  obsidian: "Obsidian",
};

const providerScopes: Record<string, string[]> = {
  trello: ["read", "write"],
  google_tasks: ["tasks.readonly"],
  todoist: ["data:read_write"],
  clickup: ["task:read", "task:write"],
  microsoft_todo: ["Tasks.ReadWrite"],
  google_calendar: ["calendar.events"],
  obsidian: ["vault:read_write"],
};

type ScopeReview = {
  level: "ok" | "warn";
  message: string;
};

function asProvider(provider: string): SupportedProvider | null {
  if ((supportedProviders as readonly string[]).includes(provider)) {
    return provider as SupportedProvider;
  }

  return null;
}

function reviewScopes(provider: string, grantedScopes: string[]): ScopeReview {
  const required = providerScopes[provider] ?? [];
  const granted = Array.from(new Set(grantedScopes));
  const extras = granted.filter((scope) => !required.includes(scope));
  const missing = required.filter((scope) => !granted.includes(scope));

  if (granted.length === 0) {
    return {
      level: "warn",
      message: "No granted scopes found. Connection may not work as expected.",
    };
  }

  if (extras.length > 0) {
    return {
      level: "warn",
      message: `Least-privilege warning: extra scopes detected (${extras.join(", ")}).`,
    };
  }

  if (missing.length > 0) {
    return {
      level: "warn",
      message: `Missing required scopes: ${missing.join(", ")}.`,
    };
  }

  return {
    level: "ok",
    message: "Scope set matches least-privilege baseline.",
  };
}

export function ProviderConnectionsCard() {
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState("Loading your connected providers...");
  const [connections, setConnections] = useState<IntegrationConnectionItem[]>([]);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const stateClass = useMemo(() => `pill state-${state}`, [state]);

  const loadConnections = useCallback(async () => {
    setState("loading");
    setDetail("Loading your connected providers...");

    try {
      const response = await nestApiClient.getIntegrationConnections();
      const items = response.data ?? [];
      setConnections(items);
      setState(items.length > 0 ? "success" : "empty");
      setDetail(
        items.length > 0
          ? "Review or revoke provider connections. New provider auth is outside the V1 founder-ready scope."
          : "No provider connections are available yet."
      );
    } catch (error) {
      setState("error");
      setDetail(`We couldn't load provider connections right now. ${describeApiIssue(error)}`);
    }
  }, []);

  useEffect(() => {
    void loadConnections();
  }, [loadConnections]);

  const revokeProvider = useCallback(
    async (provider: string) => {
      const typedProvider = asProvider(provider);
      if (typedProvider === null) return;

      setBusyProvider(provider);
      try {
        await nestApiClient.revokeIntegrationConnection(typedProvider);
        await loadConnections();
        setState("success");
        setDetail(`${providerLabels[provider] ?? provider} has been disconnected.`);
      } catch (error) {
        setState("error");
        setDetail(`We couldn't disconnect ${providerLabels[provider] ?? provider} right now. ${describeApiIssue(error)}`);
      } finally {
        setBusyProvider(null);
      }
    },
    [loadConnections]
  );

  return (
    <article className="panel">
      <h2>Provider Connections</h2>
      <div className="panel-content">
        <span className={stateClass}>{STATE_LABELS[state]}</span>
        <p className="callout">{detail}</p>
        {connections.length > 0 ? (
          <ul className="list">
            {connections.map((connection) => {
              const scopeReview = reviewScopes(connection.provider, connection.scopes);

              return (
                <li className="list-row" key={connection.provider}>
                  <div className="panel-content">
                    <strong>{providerLabels[connection.provider] ?? connection.provider}</strong>
                    <p>Status: {connection.status}</p>
                    <p className="mono-note">
                      Granted: {connection.scopes.length > 0 ? connection.scopes.join(", ") : "none"}
                    </p>
                    {connection.status === "connected" ? (
                      <p className={`mono-note ${scopeReview.level === "warn" ? "scope-warn" : "scope-ok"}`}>
                        {scopeReview.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="row-inline">
                    {connection.status !== "connected" ? (
                      <span className="pill state-empty">Connect outside V1</span>
                    ) : null}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => void revokeProvider(connection.provider)}
                      disabled={busyProvider === connection.provider}
                    >
                      Revoke
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
