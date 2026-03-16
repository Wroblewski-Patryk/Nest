"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { IntegrationConnectionItem, UiAsyncState } from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";
import { STATE_LABELS } from "@/lib/ux-contract";

const supportedProviders = [
  "trello",
  "google_tasks",
  "todoist",
  "google_calendar",
  "obsidian",
] as const;

type SupportedProvider = (typeof supportedProviders)[number];

const providerLabels: Record<string, string> = {
  trello: "Trello",
  google_tasks: "Google Tasks",
  todoist: "Todoist",
  google_calendar: "Google Calendar",
  obsidian: "Obsidian",
};

const providerScopes: Record<string, string[]> = {
  trello: ["read", "write"],
  google_tasks: ["tasks.readonly"],
  todoist: ["data:read_write"],
  google_calendar: ["calendar.events"],
  obsidian: ["vault:read_write"],
};

function asProvider(provider: string): SupportedProvider | null {
  if ((supportedProviders as readonly string[]).includes(provider)) {
    return provider as SupportedProvider;
  }

  return null;
}

export function ProviderConnectionsCard() {
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState("Loading provider connections...");
  const [connections, setConnections] = useState<IntegrationConnectionItem[]>([]);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const stateClass = useMemo(() => `pill state-${state}`, [state]);

  const loadConnections = useCallback(async () => {
    setState("loading");
    setDetail("Loading provider connections...");

    try {
      const response = await nestApiClient.getIntegrationConnections();
      const items = response.data ?? [];
      setConnections(items);
      setState(items.length > 0 ? "success" : "empty");
      setDetail(
        items.length > 0
          ? "Connect, reconnect, or revoke providers."
          : "No providers available."
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
      setDetail(`Failed to load provider connections (HTTP ${status}).`);
    }
  }, []);

  useEffect(() => {
    void loadConnections();
  }, [loadConnections]);

  const connectProvider = useCallback(
    async (provider: string) => {
      const typedProvider = asProvider(provider);
      if (typedProvider === null) return;

      setBusyProvider(provider);
      try {
        await nestApiClient.upsertIntegrationConnection(typedProvider, {
          access_token: `manual-token-${provider}-${Date.now()}`,
          scopes: providerScopes[provider] ?? [],
        });
        await loadConnections();
      } finally {
        setBusyProvider(null);
      }
    },
    [loadConnections]
  );

  const revokeProvider = useCallback(
    async (provider: string) => {
      const typedProvider = asProvider(provider);
      if (typedProvider === null) return;

      setBusyProvider(provider);
      try {
        await nestApiClient.revokeIntegrationConnection(typedProvider);
        await loadConnections();
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
            {connections.map((connection) => (
              <li className="list-row" key={connection.provider}>
                <div>
                  <strong>{providerLabels[connection.provider] ?? connection.provider}</strong>
                  <p>Status: {connection.status}</p>
                </div>
                <div className="row-inline">
                  <button
                    type="button"
                    className="pill-link"
                    onClick={() => void connectProvider(connection.provider)}
                    disabled={busyProvider === connection.provider}
                  >
                    {connection.status === "connected" ? "Reconnect" : "Connect"}
                  </button>
                  <button
                    type="button"
                    className="pill-link"
                    onClick={() => void revokeProvider(connection.provider)}
                    disabled={busyProvider === connection.provider}
                  >
                    Revoke
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
