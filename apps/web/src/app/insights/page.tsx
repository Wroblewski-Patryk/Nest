"use client";

import { useEffect, useMemo, useState } from "react";
import type { AiBriefingItem, InsightsTrendResponse, LifeAreaBalanceResponse, UiAsyncState } from "@nest/shared-types";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";
import { insightsSnapshot } from "@/lib/mvp-snapshot";
import { STATE_LABELS } from "@/lib/ux-contract";

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
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState("Loading life-area balance and trends...");
  const [balance, setBalance] = useState<LifeAreaBalanceResponse>(EMPTY_BALANCE);
  const [taskTrend, setTaskTrend] = useState<InsightsTrendResponse>(EMPTY_TREND);
  const [habitTrend, setHabitTrend] = useState<InsightsTrendResponse>(EMPTY_TREND);
  const [goalTrend, setGoalTrend] = useState<InsightsTrendResponse>(EMPTY_TREND);
  const [briefing, setBriefing] = useState<AiBriefingItem | null>(null);

  useEffect(() => {
    let mounted = true;
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const briefingId = params?.get("briefing_id");
    const briefingRequest = briefingId
      ? nestApiClient.getAiBriefing(briefingId).then((response) => response.data).catch(() => null)
      : nestApiClient
          .getAiBriefings({ per_page: 1 })
          .then((response) => response.data[0] ?? null)
          .catch(() => null);

    Promise.all([
      nestApiClient.getLifeAreaBalance({ window_days: 30 }),
      nestApiClient.getInsightsTrends("tasks", { period: "weekly", points: 6 }),
      nestApiClient.getInsightsTrends("habits", { period: "weekly", points: 6 }),
      nestApiClient.getInsightsTrends("goals", { period: "weekly", points: 6 }),
      briefingRequest,
    ])
      .then(([balanceResponse, tasksResponse, habitsResponse, goalsResponse, briefingResponse]) => {
        if (!mounted) return;

        setBalance(balanceResponse);
        setTaskTrend(tasksResponse);
        setHabitTrend(habitsResponse);
        setGoalTrend(goalsResponse);
        setBriefing(briefingResponse);
        setState("success");
        setDetail("Insights API calls succeeded.");
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
        setDetail(`Insights API calls failed (HTTP ${status}). Showing fallback snapshot.`);
      });

    return () => {
      mounted = false;
    };
  }, []);

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

  return (
    <WorkspaceShell
      title="Insights"
      subtitle="Track life-area balance and weekly behavioral trends across core modules."
      module="insights"
    >
      <div className="stack">
        <MetricCard label="Balance score" value={`${activeBalance.meta.global_balance_score.toFixed(1)} / 100`} />
        <MetricCard label="Window" value={`${activeBalance.meta.window_days} days`} />
        <MetricCard
          label="Trend events"
          value={String(trends.reduce((sum, trend) => sum + trend.total, 0))}
        />
      </div>

      <Panel title="API Status">
        <div className="panel-content">
          <span className={`pill state-${state}`}>{STATE_LABELS[state]}</span>
          <p className="callout">{detail}</p>
        </div>
      </Panel>

      <Panel title="Life-Area Balance">
        <ul className="list">
          {activeBalance.data.map((row) => (
            <li className="list-row" key={row.name}>
              <div>
                <strong>{row.name}</strong>
                <p>
                  Target {Math.round(row.target_share * 100)}% vs actual {Math.round(row.actual_share * 100)}%
                </p>
              </div>
              <span className="pill">{row.balance_score.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Weekly Trends (6 buckets)"
        actions={(
          <>
            <button type="button" className="btn-primary">Refresh Trends</button>
            <button type="button" className="btn-secondary">Export Snapshot</button>
          </>
        )}
      >
        <ul className="list">
          {trends.map((trend) => (
            <li className="list-row" key={trend.module}>
              <div>
                <strong>{trend.module}</strong>
                <p>Total events in selected range</p>
              </div>
              <span className="pill">{trend.total}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="AI Briefing">
        {briefing ? (
          <div className="panel-content">
            <p className="callout">{briefing.summary}</p>
            <p className="mono-note">
              {briefing.cadence} | {briefing.generated_at ? new Date(briefing.generated_at).toLocaleString() : "n/a"}
            </p>
          </div>
        ) : (
          <p className="callout">No generated briefing yet. Trigger one from copilot flow.</p>
        )}
      </Panel>
    </WorkspaceShell>
  );
}
