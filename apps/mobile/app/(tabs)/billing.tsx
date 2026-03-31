import { useEffect, useMemo, useState } from 'react';
import type { BillingSubscriptionItem, UiAsyncState } from '@nest/shared-types';
import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { nestApiClient } from '@/constants/apiClient';
import { billingData } from '@/constants/mvpData';

export default function BillingScreen() {
  const [apiState, setApiState] = useState<UiAsyncState>('loading');
  const [apiDetail, setApiDetail] = useState('Loading billing subscription + events...');
  const [metrics, setMetrics] = useState(billingData.metrics);
  const [rows, setRows] = useState(billingData.rows);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      nestApiClient.getBillingSubscription(),
      nestApiClient.getBillingEvents({ per_page: 10 }),
    ])
      .then(([subscriptionResponse, eventsResponse]) => {
        if (!mounted) return;

        const subscription = subscriptionResponse.data as BillingSubscriptionItem | null;
        const events = eventsResponse.data ?? [];

        setApiState('success');
        setApiDetail('Billing API calls succeeded.');
        setMetrics([
          { label: 'Status', value: subscription?.status ?? 'none' },
          { label: 'Plan', value: subscription?.plan?.plan_code ?? 'none' },
          { label: 'Events', value: String(events.length) },
        ]);
        setRows(
          events.slice(0, 3).map((event) => ({
            title: event.event_name,
            detail: event.provider,
            badge: subscription?.status ?? '-',
          }))
        );
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
        setApiDetail(`Billing API calls failed (HTTP ${status}). Showing fallback snapshot.`);
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
      subtitle="Manage subscription state and inspect billing events."
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
