"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { IntegrationConflictItem, UiAsyncState } from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";
import { STATE_LABELS } from "@/lib/ux-contract";

export function ConflictQueueCard() {
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState("Loading open sync conflicts...");
  const [items, setItems] = useState<IntegrationConflictItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const stateClass = useMemo(() => `pill state-${state}`, [state]);

  const loadConflicts = useCallback(async () => {
    setState("loading");
    setDetail("Loading open sync conflicts...");

    try {
      const response = await nestApiClient.getIntegrationConflicts({
        provider: "google_calendar",
        per_page: 10,
      });

      const conflicts = response.data ?? [];
      setItems(conflicts);
      setState(conflicts.length > 0 ? "success" : "empty");
      setDetail(
        conflicts.length > 0
          ? `Found ${conflicts.length} open conflict queue item(s).`
          : "No open conflicts in queue."
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
      setDetail(`Failed to load conflicts (HTTP ${status}).`);
    }
  }, []);

  useEffect(() => {
    void loadConflicts();
  }, [loadConflicts]);

  const resolveConflict = useCallback(
    async (conflictId: string, action: "accept" | "override") => {
      setBusyId(conflictId);
      try {
        await nestApiClient.resolveIntegrationConflict(
          conflictId,
          action,
          action === "override" ? { strategy: "keep_internal" } : undefined
        );
        await loadConflicts();
      } finally {
        setBusyId(null);
      }
    },
    [loadConflicts]
  );

  return (
    <article className="panel">
      <h2>Conflict Queue</h2>
      <div className="panel-content">
        <span className={stateClass}>{STATE_LABELS[state]}</span>
        <p className="callout">{detail}</p>
        {items.length > 0 ? (
          <ul className="list">
            {items.map((conflict) => (
              <li className="list-row" key={conflict.id}>
                <div>
                  <strong>{conflict.provider}</strong>
                  <p>
                    {conflict.internal_entity_type} • fields: {conflict.conflict_fields.join(", ")}
                  </p>
                </div>
                <div className="row-inline">
                  <button
                    type="button"
                    className="pill-link"
                    onClick={() => void resolveConflict(conflict.id, "accept")}
                    disabled={busyId === conflict.id}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="pill-link"
                    onClick={() => void resolveConflict(conflict.id, "override")}
                    disabled={busyId === conflict.id}
                  >
                    Override
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
