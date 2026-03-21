import { useCallback, useEffect, useState } from 'react';
import type { IntegrationConflictItem, IntegrationConnectionItem } from '@nest/shared-types';
import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { nestApiClient } from '@/constants/apiClient';
import { calendarData } from '@/constants/mvpData';

const providerScopes: Record<string, string[]> = {
  trello: ['read', 'write'],
  google_tasks: ['tasks.readonly'],
  todoist: ['data:read_write'],
  google_calendar: ['calendar.events'],
  obsidian: ['vault:read_write'],
};

const supportedProviders = ['trello', 'google_tasks', 'todoist', 'google_calendar', 'obsidian'] as const;
type SupportedProvider = (typeof supportedProviders)[number];

function asProvider(provider: string): SupportedProvider | null {
  if ((supportedProviders as readonly string[]).includes(provider)) {
    return provider as SupportedProvider;
  }

  return null;
}

export default function CalendarScreen() {
  const [conflicts, setConflicts] = useState<IntegrationConflictItem[]>([]);
  const [connections, setConnections] = useState<IntegrationConnectionItem[]>([]);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);

  const loadConflicts = useCallback(async () => {
    const response = await nestApiClient.getIntegrationConflicts({
      provider: 'google_calendar',
      per_page: 10,
    });
    setConflicts(response.data ?? []);
  }, []);

  const loadConnections = useCallback(async () => {
    const response = await nestApiClient.getIntegrationConnections();
    setConnections(response.data ?? []);
  }, []);

  useEffect(() => {
    let mounted = true;

    loadConflicts().catch(() => {
      if (!mounted) return;
      setConflicts([]);
    });

    loadConnections().catch(() => {
      if (!mounted) return;
      setConnections([]);
    });

    return () => {
      mounted = false;
    };
  }, [loadConflicts, loadConnections]);

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

  const connectProvider = useCallback(
    async (provider: string) => {
      const typedProvider = asProvider(provider);
      if (typedProvider === null) return;

      setBusyProvider(provider);
      try {
        await nestApiClient.upsertIntegrationConnection(typedProvider, {
          access_token: `manual-token-${provider}-${Date.now()}`,
          scopes: providerScopes[provider] ?? [],
        });
        await loadConnections();
      } finally {
        setBusyProvider(null);
      }
    },
    [loadConnections]
  );

  const revokeProvider = useCallback(
    async (provider: string) => {
      const typedProvider = asProvider(provider);
      if (typedProvider === null) return;

      setBusyProvider(provider);
      try {
        await nestApiClient.revokeIntegrationConnection(typedProvider);
        await loadConnections();
      } finally {
        setBusyProvider(null);
      }
    },
    [loadConnections]
  );

  return (
    <ModuleScreen
      title="Calendar"
      subtitle="Plan events linked to tasks, goals, and routines."
      state={calendarData.state}
      telemetry={calendarData.telemetry}
      metrics={calendarData.metrics}
      rows={calendarData.rows}
      quickActions={[
        { label: 'Add Event', variant: 'primary' },
        { label: 'Force Sync', variant: 'secondary' },
      ]}
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
      connections={{
        items: connections,
        onConnect: connectProvider,
        onRevoke: revokeProvider,
        busyProvider,
      }}
    />
  );
}
