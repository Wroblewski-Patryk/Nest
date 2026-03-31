import { useCallback, useEffect, useState } from 'react';
import type { IntegrationConflictItem, IntegrationConnectionItem, IntegrationHealthProviderItem } from '@nest/shared-types';
import { ModuleScreen } from '@/components/mvp/ModuleScreen';
import { nestApiClient } from '@/constants/apiClient';
import { calendarData } from '@/constants/mvpData';

const providerScopes: Record<string, string[]> = {
  trello: ['read', 'write'],
  google_tasks: ['tasks.readonly'],
  todoist: ['data:read_write'],
  clickup: ['task:read', 'task:write'],
  microsoft_todo: ['Tasks.ReadWrite'],
  google_calendar: ['calendar.events'],
  obsidian: ['vault:read_write'],
};

const supportedProviders = ['trello', 'google_tasks', 'todoist', 'clickup', 'microsoft_todo', 'google_calendar', 'obsidian'] as const;
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
  const [healthItems, setHealthItems] = useState<IntegrationHealthProviderItem[]>([]);
  const [healthMessage, setHealthMessage] = useState<string | null>(null);
  const [healthBusyKey, setHealthBusyKey] = useState<string | null>(null);

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

  const loadHealth = useCallback(async () => {
    const response = await nestApiClient.getIntegrationHealth({ window_hours: 24 });
    setHealthItems(response.data ?? []);
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
    loadHealth().catch(() => {
      if (!mounted) return;
      setHealthItems([]);
    });

    return () => {
      mounted = false;
    };
  }, [loadConflicts, loadConnections, loadHealth]);

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

  const remediateProvider = useCallback(
    async (provider: string, action: 'replay_latest_failure' | 'reconnect_provider') => {
      const typedProvider = asProvider(provider);
      if (typedProvider === null) return;

      const key = `${provider}:${action}`;
      setHealthBusyKey(key);
      setHealthMessage(null);

      try {
        const response = await nestApiClient.remediateIntegrationHealth(typedProvider, action);
        setHealthMessage(`${provider}: ${response.data.message}`);
        await loadHealth();
      } finally {
        setHealthBusyKey(null);
      }
    },
    [loadHealth]
  );

  return (
    <ModuleScreen
      moduleKey={calendarData.module}
      title="Calendar"
      subtitle="Plan events linked to tasks, goals, and routines."
      state={calendarData.state}
      telemetry={calendarData.telemetry}
      metrics={calendarData.metrics}
      rows={calendarData.rows}
      intentProgress={0.64}
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
          mergeState: conflict.merge_state,
          autoMergeFields: conflict.merge_policy?.auto_merge_fields ?? [],
          comparison: conflict.comparison,
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
      integrationHealth={{
        items: healthItems,
        onRemediate: remediateProvider,
        busyKey: healthBusyKey,
        message: healthMessage,
      }}
    />
  );
}
