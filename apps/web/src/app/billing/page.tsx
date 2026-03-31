"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BillingEventItem, BillingSubscriptionItem, UiAsyncState } from "@nest/shared-types";
import { formatLocalizedDateTime, resolveLanguage } from "@nest/shared-types";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";
import { STATE_LABELS } from "@/lib/ux-contract";

export default function BillingPage() {
  const language = resolveLanguage(process.env.NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE);
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState("Loading billing subscription and invoices...");
  const [subscription, setSubscription] = useState<BillingSubscriptionItem | null>(null);
  const [events, setEvents] = useState<BillingEventItem[]>([]);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [subscriptionResponse, eventResponse] = await Promise.all([
      nestApiClient.getBillingSubscription(),
      nestApiClient.getBillingEvents({ per_page: 15 }),
    ]);
    setSubscription(subscriptionResponse.data);
    setEvents(eventResponse.data ?? []);
  }, []);

  useEffect(() => {
    let mounted = true;

    loadData()
      .then(() => {
        if (!mounted) return;
        setState("success");
        setDetail("Billing API calls succeeded.");
      })
      .catch((error) => {
        if (!mounted) return;

        const status =
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          typeof (error as { status?: unknown }).status === "number"
            ? String((error as { status: number }).status)
            : "n/a";

        setState("error");
        setDetail(`Billing API calls failed (HTTP ${status}).`);
      });

    return () => {
      mounted = false;
    };
  }, [loadData]);

  const runAction = useCallback(
    async (action: "trial" | "activate" | "past_due" | "cancel") => {
      setBusyAction(action);
      try {
        if (action === "trial") await nestApiClient.startBillingTrial("plus");
        if (action === "activate") await nestApiClient.activateBillingSubscription();
        if (action === "past_due") await nestApiClient.markBillingSubscriptionPastDue();
        if (action === "cancel") await nestApiClient.cancelBillingSubscription();
        await loadData();
        setState("success");
        setDetail("Subscription state updated.");
      } catch (error) {
        const status =
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          typeof (error as { status?: unknown }).status === "number"
            ? String((error as { status: number }).status)
            : "n/a";
        setState("error");
        setDetail(`Subscription action failed (HTTP ${status}).`);
      } finally {
        setBusyAction(null);
      }
    },
    [loadData]
  );

  const metrics = useMemo(
    () => [
      { label: "Status", value: subscription?.status ?? "none" },
      { label: "Plan", value: subscription?.plan?.plan_code ?? "none" },
      { label: "Events", value: String(events.length) },
    ],
    [events.length, subscription?.plan?.plan_code, subscription?.status]
  );

  return (
    <WorkspaceShell
      title="Billing"
      subtitle="Manage subscription lifecycle and inspect billing event history."
      module="billing"
    >
      <div className="stack">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <Panel title="Subscription Actions">
        <div className="panel-content">
          <p className="callout">Run baseline lifecycle transitions for plan management.</p>
          <div className="row-inline">
            <button className="btn-primary" onClick={() => runAction("trial")} disabled={busyAction !== null}>
              {busyAction === "trial" ? "Starting..." : "Start Trial (plus)"}
            </button>
            <button className="btn-secondary" onClick={() => runAction("activate")} disabled={busyAction !== null}>
              {busyAction === "activate" ? "Activating..." : "Activate"}
            </button>
            <button className="btn-secondary" onClick={() => runAction("past_due")} disabled={busyAction !== null}>
              {busyAction === "past_due" ? "Marking..." : "Mark Past Due"}
            </button>
            <button className="btn-secondary" onClick={() => runAction("cancel")} disabled={busyAction !== null}>
              {busyAction === "cancel" ? "Canceling..." : "Cancel"}
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="Billing Events">
        <ul className="list">
          {events.map((event) => (
            <li className="list-row" key={event.id}>
              <div>
                <strong>{event.event_name}</strong>
                <p>{event.provider}</p>
              </div>
              <span className="pill">{formatLocalizedDateTime(event.occurred_at, language)}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Billing API Status">
        <div className="panel-content">
          <span className={`pill state-${state}`}>{STATE_LABELS[state]}</span>
          <p className="callout">{detail}</p>
        </div>
      </Panel>
    </WorkspaceShell>
  );
}
