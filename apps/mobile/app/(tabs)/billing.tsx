import { useEffect, useMemo, useState } from 'react';
import type { BillingAuditReconciliationItem, BillingSubscriptionItem, UiAsyncState } from '@nest/shared-types';
import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { nestApiClient } from '@/constants/apiClient';
import { billingData } from '@/constants/mvpData';

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

  if (status === 403) {
    return 'This billing action is not available for your account right now.';
  }

  if (status === 404) {
    return 'Billing data is not available yet.';
  }

  if (status === 429) {
    return 'Too many requests were sent at once. Please try again in a moment.';
  }

  if (status !== null && status >= 500) {
    return 'Nest is having trouble loading billing details right now. Please try again shortly.';
  }

  return 'Please try again in a moment.';
}

export default function BillingScreen() {
  const [apiState, setApiState] = useState<UiAsyncState>('loading');
  const [apiDetail, setApiDetail] = useState('Loading your billing status, events, and recovery activity...');
  const [metrics, setMetrics] = useState(billingData.metrics);
  const [rows, setRows] = useState(billingData.rows);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      nestApiClient.getBillingSubscription(),
      nestApiClient.getBillingEvents({ per_page: 10 }),
      nestApiClient.getBillingDunningAttempts({ per_page: 10 }),
      nestApiClient.getBillingAuditReconciliation(),
    ])
      .then(([subscriptionResponse, eventsResponse, dunningResponse, reconciliationResponse]) => {
        if (!mounted) return;

        const subscription = subscriptionResponse.data as BillingSubscriptionItem | null;
        const events = eventsResponse.data ?? [];
        const dunning = dunningResponse.data ?? [];
        const reconciliation = reconciliationResponse.data as BillingAuditReconciliationItem | null;

        setApiState('success');
        setApiDetail('Billing status and recovery activity are ready.');
        setMetrics([
          { label: 'Status', value: subscription?.status ?? 'none' },
          { label: 'Plan', value: subscription?.plan?.plan_code ?? 'none' },
          { label: 'Events', value: String(events.length) },
          { label: 'Dunning', value: String(dunning.length) },
          { label: 'Reconciled', value: reconciliation?.is_reconciled ? 'yes' : 'no' },
        ]);
        setRows(
          [
            ...events.slice(0, 2).map((event) => ({
              title: event.event_name,
              detail: event.provider,
              badge: subscription?.status ?? '-',
            })),
            ...dunning.slice(0, 1).map((attempt) => ({
              title: `dunning attempt #${attempt.attempt_number}`,
              detail: attempt.channel,
              badge: attempt.status,
            })),
          ]
        );
      })
      .catch((error) => {
        if (!mounted) return;

        setApiState('error');
        setApiDetail(`We could not load billing details right now. ${describeApiIssue(error)} Showing your fallback snapshot instead.`);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const telemetry = useMemo(() => billingData.telemetry, []);

  return (
    <ModuleScreen
      moduleKey={billingData.module}
      title="Billing"
      subtitle="Check subscription status and recent billing activity in one place."
      state={billingData.state}
      telemetry={telemetry}
      metrics={metrics}
      rows={rows}
      intentProgress={0.58}
      quickActions={[
        { label: 'Start Trial', variant: 'primary' },
        { label: 'Manage Plan', variant: 'secondary' },
      ]}
      connectivity={{
        state: apiState,
        detail: apiDetail,
      }}
    />
  );
}
