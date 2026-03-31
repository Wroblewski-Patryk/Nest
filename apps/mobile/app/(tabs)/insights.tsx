import { useEffect, useMemo, useState } from 'react';
import type { LifeAreaBalanceResponse, UiAsyncState } from '@nest/shared-types';
import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { nestApiClient } from '@/constants/apiClient';
import { insightsData } from '@/constants/mvpData';

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
  const [apiDetail, setApiDetail] = useState('Loading life-area balance + trends...');
  const [metrics, setMetrics] = useState(insightsData.metrics);
  const [rows, setRows] = useState(insightsData.rows);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      nestApiClient.getLifeAreaBalance({ window_days: 30 }),
      nestApiClient.getInsightsTrends('tasks', { period: 'weekly', points: 6 }),
      nestApiClient.getInsightsTrends('habits', { period: 'weekly', points: 6 }),
      nestApiClient.getInsightsTrends('goals', { period: 'weekly', points: 6 }),
    ])
      .then(([balance, taskTrend, habitTrend, goalTrend]) => {
        if (!mounted) return;

        const balancePayload = balance ?? emptyBalance;
        const trendTotal = taskTrend.meta.total + habitTrend.meta.total + goalTrend.meta.total;

        setApiState('success');
        setApiDetail('Insights API calls succeeded.');
        setMetrics([
          { label: 'Balance', value: balancePayload.meta.global_balance_score.toFixed(1) },
          { label: 'Window', value: `${balancePayload.meta.window_days}d` },
          { label: 'Trends', value: String(trendTotal) },
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
        ]);
      })
      .catch((error) => {
        if (!mounted) return;

        const status =
          typeof error === 'object' &&
          error !== null &&
          'status' in error &&
          typeof (error as { status?: unknown }).status === 'number'
            ? String((error as { status: number }).status)
            : 'n/a';

        setApiState('error');
        setApiDetail(`Insights API calls failed (HTTP ${status}). Showing fallback snapshot.`);
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
      subtitle="Watch life-area balance and weekly trends from one panel."
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
        detail: apiDetail,
      }}
    />
  );
}
