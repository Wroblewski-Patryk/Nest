import { useEffect, useMemo, useState } from 'react';
import type { AiBriefingItem, AnalyticsLoopDecisionDashboardResponse, LifeAreaBalanceResponse, UiAsyncState } from '@nest/shared-types';
import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { nestApiClient } from '@/constants/apiClient';
import { insightsData } from '@/constants/mvpData';

function getApiErrorStatus(error: unknown): number | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
  ) {
    return (error as { status: number }).status;
  }

  return null;
}

function describeApiIssue(error: unknown): string {
  const status = getApiErrorStatus(error);

  if (status === 401) {
    return 'Please sign in again and retry.';
  }

  if (status === 404) {
    return 'Some insight data is not available yet.';
  }

  if (status === 429) {
    return 'Too many requests were sent at once. Please try again in a moment.';
  }

  if (status !== null && status >= 500) {
    return 'Nest is having trouble refreshing insights right now. Please try again shortly.';
  }

  return 'Please try again in a moment.';
}

const emptyBalance: LifeAreaBalanceResponse = {
  data: [],
  meta: {
    window_days: 30,
    window_start: new Date().toISOString(),
    window_end: new Date().toISOString(),
    global_balance_score: 0,
  },
};

export default function InsightsScreen() {
  const [apiState, setApiState] = useState<UiAsyncState>('loading');
  const [apiDetail, setApiDetail] = useState('Loading your balance view, trends, and latest briefing...');
  const [metrics, setMetrics] = useState(insightsData.metrics);
  const [rows, setRows] = useState(insightsData.rows);
  const [briefing, setBriefing] = useState<AiBriefingItem | null>(null);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      nestApiClient.getLifeAreaBalance({ window_days: 30 }),
      nestApiClient.getInsightsTrends('tasks', { period: 'weekly', points: 6 }),
      nestApiClient.getInsightsTrends('habits', { period: 'weekly', points: 6 }),
      nestApiClient.getInsightsTrends('goals', { period: 'weekly', points: 6 }),
      nestApiClient.getAnalyticsDecisionDashboard({ window_days: 28 }),
      nestApiClient.getAiBriefings({ per_page: 1 }).then((response) => response.data[0] ?? null).catch(() => null),
    ])
      .then(([balance, taskTrend, habitTrend, goalTrend, dashboardResponse, latestBriefing]) => {
        if (!mounted) return;

        const balancePayload = balance ?? emptyBalance;
        const trendTotal = taskTrend.meta.total + habitTrend.meta.total + goalTrend.meta.total;
        const dashboard = dashboardResponse.data as AnalyticsLoopDecisionDashboardResponse['data'];

        setApiState('success');
        setApiDetail('Insights are ready.');
        setBriefing(latestBriefing);
        setMetrics([
          { label: 'Balance', value: balancePayload.meta.global_balance_score.toFixed(1) },
          { label: 'Window', value: `${balancePayload.meta.window_days}d` },
          { label: 'Trends', value: String(trendTotal) },
          { label: 'Retention', value: `${dashboard.retention.retention_rate_percent.toFixed(1)}%` },
        ]);
        setRows([
          ...balancePayload.data.slice(0, 2).map((row) => ({
            title: row.name,
            detail: `target ${Math.round(row.target_share * 100)}% vs actual ${Math.round(row.actual_share * 100)}%`,
            badge: row.balance_score.toFixed(1),
          })),
          {
            title: 'Tasks/Habits/Goals',
            detail: 'weekly trend totals',
            badge: `${taskTrend.meta.total}/${habitTrend.meta.total}/${goalTrend.meta.total}`,
          },
          {
            title: 'Growth loops',
            detail: `${dashboard.funnel.activated} activations | MRR ${(dashboard.monetization.estimated_mrr_minor / 100).toFixed(2)}`,
            badge: `${dashboard.retention.retention_rate_percent.toFixed(1)}%`,
          },
          ...(latestBriefing
            ? [
                {
                  title: `AI ${latestBriefing.cadence} briefing`,
                  detail: latestBriefing.summary,
                  badge: latestBriefing.generated_at ? new Date(latestBriefing.generated_at).toLocaleDateString() : 'ready',
                },
              ]
            : []),
        ]);
      })
      .catch((error) => {
        if (!mounted) return;

        setApiState('error');
        setApiDetail(`We could not refresh insights right now. ${describeApiIssue(error)} Showing your fallback snapshot instead.`);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const telemetry = useMemo(() => insightsData.telemetry, []);

  return (
    <ModuleScreen
      moduleKey={insightsData.module}
      title="Insights"
      subtitle="Watch balance, weekly trends, and briefing context from one panel."
      state={insightsData.state}
      telemetry={telemetry}
      metrics={metrics}
      rows={rows}
      intentProgress={0.67}
      quickActions={[
        { label: 'Refresh Trends', variant: 'primary' },
        { label: 'Export Snapshot', variant: 'secondary' },
      ]}
      connectivity={{
        state: apiState,
        detail: briefing ? `${apiDetail} Latest briefing: ${briefing.cadence}.` : apiDetail,
      }}
    />
  );
}
