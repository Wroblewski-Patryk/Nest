import { useEffect, useState } from 'react';
import type { UiAsyncState } from '@nest/shared-types';
import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { nestApiClient } from '@/constants/apiClient';
import { tasksData } from '@/constants/mvpData';

export default function TasksScreen() {
  const [apiState, setApiState] = useState<UiAsyncState>('loading');
  const [apiDetail, setApiDetail] = useState('Checking /lists endpoint...');

  useEffect(() => {
    let mounted = true;

    nestApiClient
      .getLists({ per_page: 1 })
      .then((response) => {
        if (!mounted) return;

        const total = response.meta?.total ?? response.data?.length ?? 0;
        setApiState(total > 0 ? 'success' : 'empty');
        setApiDetail(`Shared client call succeeded (${total} list items visible).`);
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
        setApiDetail(`Shared client call failed (HTTP ${status}).`);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ModuleScreen
      moduleKey={tasksData.module}
      title="Tasks + Lists"
      subtitle="Capture commitments and execute daily priorities."
      state={tasksData.state}
      telemetry={tasksData.telemetry}
      metrics={tasksData.metrics}
      rows={tasksData.rows}
      intentProgress={0.75}
      dailySections={[
        {
          label: 'Morning',
          subtitle: 'Poranek',
          items: [
            { title: '07:30 Szklanka wody', detail: 'Nawyk', badge: 'done' },
            { title: '08:00 Medytacja 10 min', detail: 'Rutyna', badge: 'done' },
          ],
        },
        {
          label: 'Now',
          subtitle: 'Teraz',
          highlight: true,
          items: [{ title: 'Projekt \"Nest\" UI Design [G]', detail: 'Zadanie', badge: 'active' }],
        },
        {
          label: 'Evening',
          subtitle: 'Wieczór',
          items: [{ title: '21:00 Zapis w Dzienniku', detail: 'Refleksja', badge: 'planned' }],
        },
      ]}
      quickActions={[
        { label: 'Add Task', variant: 'primary' },
        { label: 'Add List', variant: 'secondary' },
      ]}
      connectivity={{
        state: apiState,
        detail: apiDetail,
      }}
    />
  );
}
