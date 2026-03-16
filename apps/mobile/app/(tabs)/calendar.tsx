import { useCallback, useEffect, useState } from 'react';
import type { IntegrationConflictItem } from '@nest/shared-types';
import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { nestApiClient } from '@/constants/apiClient';
import { calendarData } from '@/constants/mvpData';

export default function CalendarScreen() {
  const [conflicts, setConflicts] = useState<IntegrationConflictItem[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadConflicts = useCallback(async () => {
    const response = await nestApiClient.getIntegrationConflicts({
      provider: 'google_calendar',
      per_page: 10,
    });
    setConflicts(response.data ?? []);
  }, []);

  useEffect(() => {
    let mounted = true;

    loadConflicts().catch(() => {
      if (!mounted) return;
      setConflicts([]);
    });

    return () => {
      mounted = false;
    };
  }, [loadConflicts]);

  const resolveConflict = useCallback(
    async (conflictId: string, action: 'accept' | 'override') => {
      setResolvingId(conflictId);
      try {
        await nestApiClient.resolveIntegrationConflict(
          conflictId,
          action,
          action === 'override' ? { strategy: 'keep_internal' } : undefined
        );
        await loadConflicts();
      } finally {
        setResolvingId(null);
      }
    },
    [loadConflicts]
  );

  return (
    <ModuleScreen
      title="Calendar"
      subtitle="Plan events linked to tasks, goals, and routines."
      state={calendarData.state}
      telemetry={calendarData.telemetry}
      metrics={calendarData.metrics}
      rows={calendarData.rows}
      conflicts={{
        items: conflicts.map((conflict) => ({
          id: conflict.id,
          provider: conflict.provider,
          entityType: conflict.internal_entity_type,
          fields: conflict.conflict_fields,
        })),
        onResolve: resolveConflict,
        resolvingId,
      }}
    />
  );
}
