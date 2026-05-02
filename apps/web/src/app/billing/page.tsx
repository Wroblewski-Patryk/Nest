"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  BillingAuditReconciliationItem,
  BillingDunningAttemptItem,
  BillingEventItem,
  BillingSelfServeSessionItem,
  BillingSubscriptionItem,
  UiAsyncState,
} from "@nest/shared-types";
import { formatLocalizedDateTime, resolveLanguage, translate } from "@nest/shared-types";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";
import { describeApiIssue, STATE_LABELS } from "@/lib/ux-contract";

type BillingAction = "trial" | "activate" | "past_due" | "cancel" | "recover" | "checkout" | "portal";

export default function BillingPage() {
  const language = resolveLanguage(process.env.NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE);
  const t = useCallback((key: string, fallback: string) => translate(key, language, fallback), [language]);
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState(t("billing.loading", "Loading billing status, recovery activity, and self-serve sessions..."));
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
        setDetail(t("billing.ready", "Billing status and recovery activity are up to date."));
      })
      .catch((error) => {
        if (!mounted) return;

        setState("error");
        setDetail(`${t("billing.error.load", "We couldn't load billing details right now.")} ${describeApiIssue(error)}`);
      });

    return () => {
      mounted = false;
    };
  }, [loadData, pricingExperiment.experimentKey, pricingExperiment.variantKey, t]);

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
        setDetail(t("billing.action.completed", "Billing action completed and the latest status has been refreshed."));
      } catch (error) {
        setState("error");
        setDetail(`${t("billing.error.action", "We couldn't complete that billing action.")} ${describeApiIssue(error)}`);
      } finally {
        setBusyAction(null);
      }
    },
    [loadData, pricingExperiment.experimentKey, pricingExperiment.variantKey, subscription?.plan?.plan_code, t]
  );

  const metrics = useMemo(
    () => [
      { label: t("billing.metric.status", "Status"), value: subscription?.status ?? "none" },
      { label: t("billing.metric.plan", "Plan"), value: subscription?.plan?.plan_code ?? "none" },
      { label: t("billing.metric.events", "Events"), value: String(events.length) },
      { label: t("billing.metric.dunning", "Dunning"), value: String(dunningAttempts.length) },
      { label: t("billing.metric.reconciled", "Reconciled"), value: reconciliation?.is_reconciled ? t("billing.reconciled.yes", "yes") : t("billing.reconciled.no", "no") },
    ],
    [dunningAttempts.length, events.length, reconciliation?.is_reconciled, subscription?.plan?.plan_code, subscription?.status, t]
  );

  return (
    <WorkspaceShell
      title={t("billing.title", "Billing")}
      subtitle={t("billing.subtitle", "Run self-serve checkout and portal flows while monitoring automated recovery.")}
      module="billing"
      shellTone="dashboard-canonical"
      hideRailFooterActions
    >
      <div className="stack">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <Panel title={t("billing.panel.context", "Where billing fits")} className="daily-system-panel daily-system-context">
        <p className="daily-system-context-copy">
          {t("billing.context.copy", "Billing is an advanced account surface. Keep money actions explicit, auditable, and visually separate from daily planning work.")}
        </p>
        <div className="daily-system-context-links">
          <Link href="/settings">{t("billing.context.settings", "Account settings")}</Link>
          <Link href="/dashboard">{t("billing.context.dashboard", "Return to Dashboard")}</Link>
        </div>
      </Panel>

      <Panel title={t("billing.panel.self_serve", "Self-serve actions")}>
        <div className="panel-content">
          <p className="callout">
            {t("billing.self_serve.callout", "Checkout and portal sessions are generated on demand and logged in tenant billing events.")}
          </p>
          <div className="row-inline">
            <button className="btn-primary" onClick={() => runAction("checkout")} disabled={busyAction !== null}>
              {busyAction === "checkout" ? t("billing.action.checkout_busy", "Opening...") : t("billing.action.checkout", "Create checkout session")}
            </button>
            <button className="btn-secondary" onClick={() => runAction("portal")} disabled={busyAction !== null}>
              {busyAction === "portal" ? t("billing.action.portal_busy", "Opening...") : t("billing.action.portal", "Create portal session")}
            </button>
            <button className="btn-secondary" onClick={() => runAction("recover")} disabled={busyAction !== null}>
              {busyAction === "recover" ? t("billing.action.recover_busy", "Recovering...") : t("billing.action.recover", "Recover past due")}
            </button>
          </div>
        </div>
      </Panel>

      <Panel title={t("billing.panel.lifecycle", "Lifecycle controls")}>
        <div className="panel-content">
          <div className="row-inline">
            <button className="btn-primary" onClick={() => runAction("trial")} disabled={busyAction !== null}>
              {busyAction === "trial" ? t("billing.action.trial_busy", "Starting...") : t("billing.action.trial", "Start trial (plus)")}
            </button>
            <button className="btn-secondary" onClick={() => runAction("activate")} disabled={busyAction !== null}>
              {busyAction === "activate" ? t("billing.action.activate_busy", "Activating...") : t("billing.action.activate", "Activate")}
            </button>
            <button className="btn-secondary" onClick={() => runAction("past_due")} disabled={busyAction !== null}>
              {busyAction === "past_due" ? t("billing.action.past_due_busy", "Marking...") : t("billing.action.past_due", "Mark past due")}
            </button>
            <button className="btn-secondary" onClick={() => runAction("cancel")} disabled={busyAction !== null}>
              {busyAction === "cancel" ? t("billing.action.cancel_busy", "Canceling...") : t("billing.action.cancel", "Cancel")}
            </button>
          </div>
        </div>
      </Panel>

      <Panel title={t("billing.panel.sessions", "Recent sessions")}>
        <ul className="list">
          {sessions.length === 0 ? (
            <li className="list-row">
              <div>
                <strong>{t("billing.empty.sessions.title", "No local session actions yet")}</strong>
                <p>{t("billing.empty.sessions.body", "Run checkout or portal action to create self-serve session records.")}</p>
              </div>
              <span className="pill">{t("billing.empty.badge", "empty")}</span>
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

      <Panel title={t("billing.panel.dunning", "Dunning attempts")}>
        <ul className="list">
          {dunningAttempts.length === 0 ? (
            <li className="list-row">
              <div>
                <strong>{t("billing.empty.dunning.title", "No dunning attempts")}</strong>
                <p>{t("billing.empty.dunning.body", "Attempts appear when past-due subscriptions are processed.")}</p>
              </div>
              <span className="pill">{t("billing.clear.badge", "clear")}</span>
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

      <Panel title={t("billing.panel.events", "Billing events")}>
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

      <Panel title={t("billing.panel.audit", "Audit reconciliation")}>
        <div className="panel-content">
          <span className="pill">
            {reconciliation?.is_reconciled
              ? t("billing.audit.reconciled", "reconciled")
              : t("billing.audit.needs_review", "needs review")}
          </span>
          <p className="callout">
            {t("billing.audit.expected_status", "Expected status event")}: {reconciliation?.events.status_event_expected ?? "n/a"} | {t("billing.audit.present", "Present")}:
            {" "}
            {reconciliation?.events.status_event_present ? t("billing.reconciled.yes", "yes") : t("billing.reconciled.no", "no")}
          </p>
          <p className="mono-note">
            {t("billing.audit.dunning_without_event", "Dunning attempts without event link")}: {reconciliation?.dunning.attempts_without_event_link ?? 0}
          </p>
        </div>
      </Panel>

      <Panel title={t("billing.panel.status", "Billing API status")}>
        <div className="panel-content">
          <span className={`pill state-${state}`}>{STATE_LABELS[state]}</span>
          <p className="callout">{detail}</p>
        </div>
      </Panel>
    </WorkspaceShell>
  );
}
