import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type {
  IntegrationConnectionItem,
  TelemetryEventName,
  UiAsyncState,
} from '@nest/shared-types';

type Metric = {
  label: string;
  value: string;
};

type Row = {
  title: string;
  detail: string;
  badge: string;
};

type ModuleScreenProps = {
  title: string;
  subtitle: string;
  state: UiAsyncState;
  telemetry: TelemetryEventName;
  metrics: Metric[];
  rows: Row[];
  connectivity?: {
    state: UiAsyncState;
    detail: string;
  };
  conflicts?: {
    items: Array<{
      id: string;
      provider: string;
      entityType: string;
      fields: string[];
    }>;
    onResolve: (conflictId: string, action: 'accept' | 'override') => void;
    resolvingId?: string | null;
  };
  connections?: {
    items: IntegrationConnectionItem[];
    onConnect: (provider: string) => void;
    onRevoke: (provider: string) => void;
    busyProvider?: string | null;
  };
};

const stateLabels: Record<UiAsyncState, string> = {
  loading: 'Loading',
  empty: 'Empty',
  error: 'Error',
  success: 'Success',
};

const providerLeastPrivilegeScopes: Record<string, string[]> = {
  trello: ['read', 'write'],
  google_tasks: ['tasks.readonly'],
  todoist: ['data:read_write'],
  google_calendar: ['calendar.events'],
  obsidian: ['vault:read_write'],
};

function reviewConnectionScopes(connection: IntegrationConnectionItem): {
  level: 'ok' | 'warn';
  message: string;
} {
  const required = providerLeastPrivilegeScopes[connection.provider] ?? [];
  const granted = Array.from(new Set(connection.scopes ?? []));
  const extras = granted.filter((scope) => !required.includes(scope));
  const missing = required.filter((scope) => !granted.includes(scope));

  if (granted.length === 0) {
    return {
      level: 'warn',
      message: 'No granted scopes detected.',
    };
  }

  if (extras.length > 0) {
    return {
      level: 'warn',
      message: `Least-privilege warning: extra scopes (${extras.join(', ')})`,
    };
  }

  if (missing.length > 0) {
    return {
      level: 'warn',
      message: `Missing required scopes: ${missing.join(', ')}`,
    };
  }

  return {
    level: 'ok',
    message: 'Scope set matches least-privilege baseline.',
  };
}

export function ModuleScreen({
  title,
  subtitle,
  state,
  telemetry,
  metrics,
  rows,
  connectivity,
  conflicts,
  connections,
}: ModuleScreenProps) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Nest MVP</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaPill}>{stateLabels[state]}</Text>
          <Text style={styles.metaCode}>{telemetry}</Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Live Snapshot</Text>
        {rows.map((row) => (
          <View key={`${row.title}-${row.badge}`} style={styles.row}>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>{row.title}</Text>
              <Text style={styles.rowDetail}>{row.detail}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{row.badge}</Text>
            </View>
          </View>
        ))}
      </View>

      {connectivity ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>API Client Status</Text>
          <View style={styles.row}>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>{stateLabels[connectivity.state]}</Text>
              <Text style={styles.rowDetail}>{connectivity.detail}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>shared client</Text>
            </View>
          </View>
        </View>
      ) : null}

      {conflicts ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Conflict Queue</Text>
          {conflicts.items.length === 0 ? (
            <View style={styles.row}>
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle}>No open conflicts</Text>
                <Text style={styles.rowDetail}>Queue is clear for this module.</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>clear</Text>
              </View>
            </View>
          ) : (
            conflicts.items.map((conflict) => (
              <View key={conflict.id} style={styles.rowStack}>
                <View style={styles.row}>
                  <View style={styles.rowTextWrap}>
                    <Text style={styles.rowTitle}>{conflict.provider}</Text>
                    <Text style={styles.rowDetail}>
                      {conflict.entityType} • {conflict.fields.join(', ')}
                    </Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>open</Text>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      conflicts.resolvingId === conflict.id && styles.actionButtonDisabled,
                    ]}
                    onPress={() => conflicts.onResolve(conflict.id, 'accept')}
                    disabled={conflicts.resolvingId === conflict.id}
                  >
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.actionButton,
                      conflicts.resolvingId === conflict.id && styles.actionButtonDisabled,
                    ]}
                    onPress={() => conflicts.onResolve(conflict.id, 'override')}
                    disabled={conflicts.resolvingId === conflict.id}
                  >
                    <Text style={styles.actionButtonText}>Override</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}

      {connections ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Provider Permissions</Text>
          {connections.items.map((connection) => {
            const review = reviewConnectionScopes(connection);

            return (
              <View key={connection.provider} style={styles.rowStack}>
                <View style={styles.row}>
                  <View style={styles.rowTextWrap}>
                    <Text style={styles.rowTitle}>{connection.provider}</Text>
                    <Text style={styles.rowDetail}>Status: {connection.status}</Text>
                    <Text style={styles.rowDetail}>
                      Granted: {connection.scopes.length > 0 ? connection.scopes.join(', ') : 'none'}
                    </Text>
                    {connection.status === 'connected' ? (
                      <Text style={review.level === 'warn' ? styles.scopeWarnText : styles.scopeOkText}>
                        {review.message}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {connection.is_connected ? 'connected' : 'inactive'}
                    </Text>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <Pressable
                    style={[
                      styles.actionButton,
                      connections.busyProvider === connection.provider && styles.actionButtonDisabled,
                    ]}
                    onPress={() => connections.onConnect(connection.provider)}
                    disabled={connections.busyProvider === connection.provider}
                  >
                    <Text style={styles.actionButtonText}>
                      {connection.status === 'connected' ? 'Reconnect' : 'Connect'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.actionButton,
                      connections.busyProvider === connection.provider && styles.actionButtonDisabled,
                    ]}
                    onPress={() => connections.onRevoke(connection.provider)}
                    disabled={connections.busyProvider === connection.provider}
                  >
                    <Text style={styles.actionButtonText}>Revoke</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 16,
    gap: 14,
  },
  hero: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    backgroundColor: '#fffdf8',
    padding: 14,
    gap: 4,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  metaCode: {
    fontSize: 11,
    color: '#334155',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    padding: 10,
    gap: 3,
  },
  metricLabel: {
    fontSize: 11,
    color: '#334155',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  panel: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 8,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  rowStack: {
    gap: 8,
  },
  rowTextWrap: {
    flexShrink: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  rowDetail: {
    fontSize: 12,
    color: '#64748b',
  },
  badge: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 8,
    backgroundColor: '#ccfbf1',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#115e59',
  },
  scopeWarnText: {
    fontSize: 12,
    color: '#9a3412',
  },
  scopeOkText: {
    fontSize: 12,
    color: '#166534',
  },
});
