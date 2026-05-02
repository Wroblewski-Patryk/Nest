"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  AiBriefingItem,
  AnalyticsLoopDecisionDashboardResponse,
  InsightsTrendResponse,
  LifeAreaBalanceResponse,
  UiAsyncState,
} from "@nest/shared-types";
import { resolveLanguage, translate } from "@nest/shared-types";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";
import { insightsSnapshot } from "@/lib/mvp-snapshot";
import { describeApiIssue, STATE_LABELS } from "@/lib/ux-contract";

const EMPTY_BALANCE: LifeAreaBalanceResponse = {
  data: [],
  meta: {
    window_days: 30,
    window_start: new Date().toISOString(),
    window_end: new Date().toISOString(),
    global_balance_score: 0,
  },
};

const EMPTY_TREND: InsightsTrendResponse = {
  data: [],
  meta: {
    module: "tasks",
    period: "weekly",
    points: 6,
    window_start: new Date().toISOString(),
    window_end: new Date().toISOString(),
    total: 0,
  },
};

export default function InsightsPage() {
  const language = resolveLanguage(process.env.NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE);
  const t = useCallback((key: string, fallback: string) => translate(key, language, fallback), [language]);
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState(t("insights.loading", "Loading your balance view, activity trends, and latest briefing..."));
  const [balance, setBalance] = useState<LifeAreaBalanceResponse>(EMPTY_BALANCE);
  const [taskTrend, setTaskTrend] = useState<InsightsTrendResponse>(EMPTY_TREND);
  const [habitTrend, setHabitTrend] = useState<InsightsTrendResponse>(EMPTY_TREND);
  const [goalTrend, setGoalTrend] = useState<InsightsTrendResponse>(EMPTY_TREND);
  const [briefing, setBriefing] = useState<AiBriefingItem | null>(null);
  const [growthLoops, setGrowthLoops] = useState<AnalyticsLoopDecisionDashboardResponse["data"] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeBalance = useMemo(
    () =>
      state === "success"
        ? balance
        : {
            data: insightsSnapshot.balance.rows.map((row) => ({
              life_area_id: row.name.toLowerCase(),
              name: row.name,
              weight: row.target,
              target_share: row.target / 100,
              actual_share: row.actual / 100,
              journal_entries: 0,
              completed_tasks: 0,
              habit_logs: 0,
              activity_count: 0,
              alignment_score: 0,
              journal_score: 0,
              task_score: 0,
              balance_score: row.score,
            })),
            meta: {
              window_days: insightsSnapshot.balance.windowDays,
              window_start: new Date().toISOString(),
              window_end: new Date().toISOString(),
              global_balance_score: insightsSnapshot.balance.globalScore,
            },
          },
    [state, balance]
  );

  const trends = useMemo(() => {
    if (state === "success") {
      return [
        { module: "tasks", total: taskTrend.meta.total },
        { module: "habits", total: habitTrend.meta.total },
        { module: "goals", total: goalTrend.meta.total },
      ];
    }

    return insightsSnapshot.trends;
  }, [state, taskTrend.meta.total, habitTrend.meta.total, goalTrend.meta.total]);

  const loadInsights = useCallback(async () => {
    setIsRefreshing(true);
    setState("loading");
    setDetail(t("insights.refreshing", "Refreshing your latest insights..."));

    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const briefingId = params?.get("briefing_id");
    const briefingRequest = briefingId
      ? nestApiClient.getAiBriefing(briefingId).then((response) => response.data).catch(() => null)
      : nestApiClient
          .getAiBriefings({ per_page: 1 })
          .then((response) => response.data[0] ?? null)
          .catch(() => null);

    try {
      const [balanceResponse, tasksResponse, habitsResponse, goalsResponse, dashboardResponse, briefingResponse] =
        await Promise.all([
          nestApiClient.getLifeAreaBalance({ window_days: 30 }),
          nestApiClient.getInsightsTrends("tasks", { period: "weekly", points: 6 }),
          nestApiClient.getInsightsTrends("habits", { period: "weekly", points: 6 }),
          nestApiClient.getInsightsTrends("goals", { period: "weekly", points: 6 }),
          nestApiClient.getAnalyticsDecisionDashboard({ window_days: 28 }),
          briefingRequest,
        ]);

      setBalance(balanceResponse);
      setTaskTrend(tasksResponse);
      setHabitTrend(habitsResponse);
      setGoalTrend(goalsResponse);
      setGrowthLoops(dashboardResponse.data);
      setBriefing(briefingResponse);
      setState("success");
      setDetail(t("insights.ready", "Insights are ready."));
    } catch (error) {
      setState("error");
      setDetail(`${t("insights.error.refresh", "We couldn't refresh insights right now.")} ${describeApiIssue(error)} ${t("insights.error.fallback_suffix", "Showing your fallback snapshot instead.")}`);
    } finally {
      setIsRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  function exportSnapshot() {
    const payload = {
      generated_at: new Date().toISOString(),
      state,
      balance: activeBalance,
      trends,
      growthLoops,
      briefing,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nest-insights-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <WorkspaceShell
      title={t("insights.title", "Insights")}
      subtitle={t("insights.subtitle", "Track life-area balance and weekly behavioral trends across core modules.")}
      module="insights"
      shellTone="dashboard-canonical"
      hideRailFooterActions
    >
      <div className="stack">
        <MetricCard label={t("insights.metric.balance_score", "Balance score")} value={`${activeBalance.meta.global_balance_score.toFixed(1)} / 100`} />
        <MetricCard label={t("insights.metric.window", "Window")} value={`${activeBalance.meta.window_days} ${t("insights.metric.days", "days")}`} />
        <MetricCard
          label={t("insights.metric.trend_events", "Trend events")}
          value={String(trends.reduce((sum, trend) => sum + trend.total, 0))}
        />
        <MetricCard
          label={t("insights.metric.retention", "7d retention")}
          value={growthLoops ? `${growthLoops.retention.retention_rate_percent.toFixed(1)}%` : "n/a"}
        />
      </div>

      <Panel title={t("insights.panel.context", "Where insights fit")} className="daily-system-panel daily-system-context">
        <p className="daily-system-context-copy">
          {t("insights.context.copy", "Insights should explain the system, not become another daily workspace. Use them to decide what Planning, Journal, or Life Areas should change next.")}
        </p>
        <div className="daily-system-context-links">
          <Link href="/tasks">{t("insights.context.planning", "Open Planning")}</Link>
          <Link href="/journal?action=create-entry">{t("insights.context.journal", "Reflect")}</Link>
          <Link href="/life-areas">{t("insights.context.life_areas", "Tune Life Areas")}</Link>
        </div>
      </Panel>

      <Panel title={t("insights.panel.status", "API status")}>
        <div className="panel-content">
          <span className={`pill state-${state}`}>{STATE_LABELS[state]}</span>
          <p className="callout">{detail}</p>
        </div>
      </Panel>

      <Panel title={t("insights.panel.balance", "Life-area balance")}>
        <ul className="list">
          {activeBalance.data.map((row) => (
            <li className="list-row" key={row.name}>
              <div>
                <strong>{row.name}</strong>
                <p>
                  {t("insights.balance.target_vs_actual", "Target {target}% vs actual {actual}%")
                    .replace("{target}", String(Math.round(row.target_share * 100)))
                    .replace("{actual}", String(Math.round(row.actual_share * 100)))}
                </p>
              </div>
              <span className="pill">{row.balance_score.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title={t("insights.panel.trends", "Weekly trends (6 buckets)")}
        actions={
          <>
            <button type="button" className="btn-primary" onClick={() => void loadInsights()} disabled={isRefreshing}>
              {isRefreshing ? t("insights.action.refreshing", "Refreshing...") : t("insights.action.refresh", "Refresh trends")}
            </button>
            <button type="button" className="btn-secondary" onClick={exportSnapshot}>
              {t("insights.action.export", "Export snapshot")}
            </button>
          </>
        }
      >
        <ul className="list">
          {trends.map((trend) => (
            <li className="list-row" key={trend.module}>
              <div>
                <strong>{trend.module}</strong>
                <p>{t("insights.trend.total", "Total events in selected range")}</p>
              </div>
              <span className="pill">{trend.total}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={t("insights.panel.growth", "Growth loops dashboard")}>
        {growthLoops ? (
          <div className="panel-content">
            <p className="callout">
              {t("insights.growth.funnel", "Funnel")}: {growthLoops.funnel.signups} {t("insights.growth.signups", "signups")},{" "}
              {growthLoops.funnel.onboarding_completed} {t("insights.growth.onboarding", "onboarding complete")},{" "}
              {growthLoops.funnel.trial_started} {t("insights.growth.trials", "trials")},{" "}
              {growthLoops.funnel.activated} {t("insights.growth.activations", "activations")}.
            </p>
            <p className="callout">
              {t("insights.growth.retention", "Retention")}: {growthLoops.retention.retained_users}/
              {growthLoops.retention.previous_active_users} {t("insights.growth.retained_users", "retained users")} (
              {growthLoops.retention.retention_rate_percent.toFixed(1)}%).
            </p>
            <p className="callout">
              {t("insights.growth.monetization", "Monetization")}: MRR {(growthLoops.monetization.estimated_mrr_minor / 100).toFixed(2)} with
              {" "}
              {growthLoops.monetization.active_subscriptions} {t("insights.growth.active_subscriptions", "active subscriptions")}.
            </p>
            <ul className="list">
              {growthLoops.weekly_actions.map((action) => (
                <li key={action} className="list-row">
                  <div>
                    <strong>{t("insights.growth.weekly_action", "Weekly action")}</strong>
                    <p>{action}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="callout">{t("insights.growth.empty", "Growth dashboard is not available right now. Your core insights view is still available.")}</p>
        )}
      </Panel>

      <Panel title={t("insights.panel.briefing", "AI briefing")}>
        {briefing ? (
          <div className="panel-content">
            <p className="callout">{briefing.summary}</p>
            <p className="mono-note">
              {briefing.cadence} | {briefing.generated_at ? new Date(briefing.generated_at).toLocaleString() : "n/a"}
            </p>
          </div>
        ) : (
          <p className="callout">{t("insights.briefing.empty", "No briefing is ready yet. Once one is generated, it will appear here.")}</p>
        )}
      </Panel>
    </WorkspaceShell>
  );
}
