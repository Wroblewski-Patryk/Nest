"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BillingAuditReconciliationItem,
  BillingDunningAttemptItem,
  BillingEventItem,
  BillingSelfServeSessionItem,
  BillingSubscriptionItem,
  UiAsyncState,
} from "@nest/shared-types";
import { formatLocalizedDateTime, resolveLanguage } from "@nest/shared-types";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";
import { STATE_LABELS } from "@/lib/ux-contract";

type BillingAction = "trial" | "activate" | "past_due" | "cancel" | "recover" | "checkout" | "portal";

export default function BillingPage() {
  const language = resolveLanguage(process.env.NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE);
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState("Loading billing subscription, sessions, and dunning data...");
  const [subscription, setSubscription] = useState<BillingSubscriptionItem | null>(null);
  const [events, setEvents] = useState<BillingEventItem[]>([]);
  const [dunningAttempts, setDunningAttempts] = useState<BillingDunningAttemptItem[]>([]);
  const [reconciliation, setReconciliation] = useState<BillingAuditReconciliationItem | null>(null);
  const [sessions, setSessions] = useState<BillingSelfServeSessionItem[]>([]);
  const [busyAction, setBusyAction] = useState<BillingAction | null>(null);
  const pricingExperiment = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        experimentKey: "pricing-paywall-v3",
        variantKey: "control",
      };
    }

    const query = new URLSearchParams(window.location.search);

    return {
      experimentKey: query.get("pricing_experiment") ?? "pricing-paywall-v3",
      variantKey: query.get("pricing_variant") ?? "control",
    };
  }, []);

  const loadData = useCallback(async () => {
    const [subscriptionResponse, eventResponse, dunningResponse, reconciliationResponse] = await Promise.all([
      nestApiClient.getBillingSubscription(),
      nestApiClient.getBillingEvents({ per_page: 15 }),
      nestApiClient.getBillingDunningAttempts({ per_page: 10 }),
      nestApiClient.getBillingAuditReconciliation(),
    ]);

    setSubscription(subscriptionResponse.data);
    setEvents(eventResponse.data ?? []);
    setDunningAttempts(dunningResponse.data ?? []);
    setReconciliation(reconciliationResponse.data ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;

    void nestApiClient.trackAnalyticsExperimentHook({
      context: "pricing",
      action: "exposed",
      experiment_key: pricingExperiment.experimentKey,
      variant_key: pricingExperiment.variantKey,
      platform: "web",
      properties: {
        surface: "billing_page",
      },
    }).catch(() => undefined);

    loadData()
      .then(() => {
        if (!mounted) return;
        setState("success");
        setDetail("Billing self-serve and dunning APIs are healthy.");
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
  }, [loadData, pricingExperiment.experimentKey, pricingExperiment.variantKey]);

  const runAction = useCallback(
    async (action: BillingAction) => {
      setBusyAction(action);

      try {
        if (action === "trial") await nestApiClient.startBillingTrial("plus");
        if (action === "activate") await nestApiClient.activateBillingSubscription();
        if (action === "past_due") await nestApiClient.markBillingSubscriptionPastDue();
        if (action === "cancel") await nestApiClient.cancelBillingSubscription();
        if (action === "recover") await nestApiClient.recoverBillingSubscription();
        if (action === "checkout") {
          const response = await nestApiClient.createBillingCheckoutSession({
            plan_code: subscription?.plan?.plan_code ?? "plus",
            success_url: "https://nest.local/billing/success",
            cancel_url: "https://nest.local/billing/cancel",
          });
          void nestApiClient.trackAnalyticsExperimentHook({
            context: "pricing",
            action: "converted",
            experiment_key: pricingExperiment.experimentKey,
            variant_key: pricingExperiment.variantKey,
            platform: "web",
            properties: {
              surface: "billing_page",
              event: "checkout_session_created",
            },
          }).catch(() => undefined);
          setSessions((current) => [response.data, ...current].slice(0, 6));
        }
        if (action === "portal") {
          const response = await nestApiClient.createBillingPortalSession({
            return_url: "https://nest.local/billing",
          });
          setSessions((current) => [response.data, ...current].slice(0, 6));
        }

        await loadData();
        setState("success");
        setDetail("Billing action completed.");
      } catch (error) {
        const status =
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          typeof (error as { status?: unknown }).status === "number"
            ? String((error as { status: number }).status)
            : "n/a";

        setState("error");
        setDetail(`Billing action failed (HTTP ${status}).`);
      } finally {
        setBusyAction(null);
      }
    },
    [loadData, pricingExperiment.experimentKey, pricingExperiment.variantKey, subscription?.plan?.plan_code]
  );

  const metrics = useMemo(
    () => [
      { label: "Status", value: subscription?.status ?? "none" },
      { label: "Plan", value: subscription?.plan?.plan_code ?? "none" },
      { label: "Events", value: String(events.length) },
      { label: "Dunning", value: String(dunningAttempts.length) },
      { label: "Reconciled", value: reconciliation?.is_reconciled ? "yes" : "no" },
    ],
    [dunningAttempts.length, events.length, reconciliation?.is_reconciled, subscription?.plan?.plan_code, subscription?.status]
  );

  return (
    <WorkspaceShell
      title="Billing"
      subtitle="Run self-serve checkout/portal flows and monitor automated dunning recovery."
      module="billing"
    >
      <div className="stack">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <Panel title="Self-Serve Actions">
        <div className="panel-content">
          <p className="callout">
            Checkout and portal sessions are generated on demand and logged in tenant billing events.
          </p>
          <div className="row-inline">
            <button className="btn-primary" onClick={() => runAction("checkout")} disabled={busyAction !== null}>
              {busyAction === "checkout" ? "Opening..." : "Create Checkout Session"}
            </button>
            <button className="btn-secondary" onClick={() => runAction("portal")} disabled={busyAction !== null}>
              {busyAction === "portal" ? "Opening..." : "Create Portal Session"}
            </button>
            <button className="btn-secondary" onClick={() => runAction("recover")} disabled={busyAction !== null}>
              {busyAction === "recover" ? "Recovering..." : "Recover Past Due"}
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="Lifecycle Controls">
        <div className="panel-content">
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

      <Panel title="Recent Sessions">
        <ul className="list">
          {sessions.length === 0 ? (
            <li className="list-row">
              <div>
                <strong>No local session actions yet</strong>
                <p>Run checkout or portal action to create self-serve session records.</p>
              </div>
              <span className="pill">empty</span>
            </li>
          ) : (
            sessions.map((session) => (
              <li className="list-row" key={session.id}>
                <div>
                  <strong>{session.session_type}</strong>
                  <p>{session.provider_session_id}</p>
                </div>
                <span className="pill">{session.status}</span>
              </li>
            ))
          )}
        </ul>
      </Panel>

      <Panel title="Dunning Attempts">
        <ul className="list">
          {dunningAttempts.length === 0 ? (
            <li className="list-row">
              <div>
                <strong>No dunning attempts</strong>
                <p>Attempts appear when past_due subscriptions are processed.</p>
              </div>
              <span className="pill">clear</span>
            </li>
          ) : (
            dunningAttempts.map((attempt) => (
              <li className="list-row" key={attempt.id}>
                <div>
                  <strong>Attempt #{attempt.attempt_number}</strong>
                  <p>{attempt.channel}</p>
                </div>
                <span className="pill">{attempt.status}</span>
              </li>
            ))
          )}
        </ul>
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

      <Panel title="Audit Reconciliation">
        <div className="panel-content">
          <span className="pill">{reconciliation?.is_reconciled ? "reconciled" : "needs review"}</span>
          <p className="callout">
            Expected status event: {reconciliation?.events.status_event_expected ?? "n/a"} | Present:
            {" "}
            {reconciliation?.events.status_event_present ? "yes" : "no"}
          </p>
          <p className="mono-note">
            Dunning attempts without event link: {reconciliation?.dunning.attempts_without_event_link ?? 0}
          </p>
        </div>
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
