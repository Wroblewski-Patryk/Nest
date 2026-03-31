import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type {
  IntegrationConnectionItem,
  IntegrationHealthProviderItem,
  ModuleKey,
  TelemetryEventName,
  UiAsyncState,
} from '@nest/shared-types';
import { resolveLanguage, translate } from '@nest/shared-types';
import { getAuraPalette, mobileUiTokens } from '@/constants/uiTokens';

type Metric = {
  label: string;
  value: string;
};

type Row = {
  title: string;
  detail: string;
  badge: string;
};

type DailySection = {
  label: string;
  subtitle?: string;
  highlight?: boolean;
  items: Row[];
};

type ModuleScreenProps = {
  moduleKey?: ModuleKey;
  title: string;
  subtitle: string;
  state: UiAsyncState;
  telemetry: TelemetryEventName;
  metrics: Metric[];
  rows: Row[];
  intentProgress?: number;
  dailySections?: DailySection[];
  quickActions?: Array<{
    label: string;
    variant?: 'primary' | 'secondary';
  }>;
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
      mergeState?: string;
      autoMergeFields?: string[];
      comparison?: Record<string, { base: string; local: string; remote: string }>;
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
  integrationHealth?: {
    items: IntegrationHealthProviderItem[];
    onRemediate: (provider: string, action: 'replay_latest_failure' | 'reconnect_provider') => void;
    busyKey?: string | null;
    message?: string | null;
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
  clickup: ['task:read', 'task:write'],
  microsoft_todo: ['Tasks.ReadWrite'],
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
  moduleKey = 'tasks',
  title,
  subtitle,
  state,
  telemetry,
  metrics,
  rows,
  intentProgress = 0.75,
  dailySections,
  quickActions,
  connectivity,
  conflicts,
  connections,
  integrationHealth,
}: ModuleScreenProps) {
  const language = resolveLanguage(process.env.EXPO_PUBLIC_NEST_DEFAULT_LANGUAGE);
  const [auraA, auraB, auraC] = useMemo(() => getAuraPalette(moduleKey), [moduleKey]);
  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    [language]
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.aura, styles.auraLeft, { backgroundColor: auraA }]} />
      <View style={[styles.aura, styles.auraRight, { backgroundColor: auraB }]} />
      <View style={[styles.aura, styles.auraBottom, { backgroundColor: auraC }]} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.brand}>{translate('app.kicker', language)}</Text>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, intentProgress * 100))}%` }]} />
          </View>
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

        {dailySections && dailySections.length > 0 ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Twoje dzisiaj</Text>
            {dailySections.map((section) => (
              <View key={section.label} style={styles.sectionWrap}>
                <Text style={[styles.sectionLabel, section.highlight && styles.sectionLabelHighlight]}>
                  {section.label}
                </Text>
                {section.subtitle ? <Text style={styles.sectionSubtitle}>{section.subtitle}</Text> : null}
                {section.items.map((item) => (
                  <View key={`${section.label}-${item.title}`} style={styles.row}>
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.rowDetail}>{item.detail}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {quickActions && quickActions.length > 0 ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Quick Actions</Text>
            <View style={styles.actionRow}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.label}
                  style={[
                    styles.actionButton,
                    action.variant === 'primary' ? styles.actionButtonPrimary : styles.actionButtonSecondary,
                  ]}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      action.variant === 'primary' ? styles.actionButtonTextPrimary : styles.actionButtonTextSecondary,
                    ]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

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
                        {conflict.entityType} - {conflict.fields.join(', ')}
                      </Text>
                      {conflict.mergeState ? (
                        <Text style={styles.rowDetail}>Merge: {conflict.mergeState}</Text>
                      ) : null}
                      {conflict.autoMergeFields && conflict.autoMergeFields.length > 0 ? (
                        <Text style={styles.rowDetail}>Auto: {conflict.autoMergeFields.join(', ')}</Text>
                      ) : null}
                      {conflict.fields[0] ? (
                        <Text style={styles.rowDetail}>
                          base/local/remote ({conflict.fields[0]}):{' '}
                          {conflict.comparison?.[conflict.fields[0]]?.base ?? '(unavailable)'} /{' '}
                          {conflict.comparison?.[conflict.fields[0]]?.local ?? '(unavailable)'} /{' '}
                          {conflict.comparison?.[conflict.fields[0]]?.remote ?? '(unavailable)'}
                        </Text>
                      ) : null}
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
                      <Text style={styles.scopeHeading}>Connection scopes</Text>
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

        {integrationHealth ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Integration Health Center</Text>
            {integrationHealth.message ? (
              <Text style={styles.rowDetail}>{integrationHealth.message}</Text>
            ) : null}
            {integrationHealth.items.length === 0 ? (
              <View style={styles.row}>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>No provider health data</Text>
                  <Text style={styles.rowDetail}>Health data appears after first sync window.</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>empty</Text>
                </View>
              </View>
            ) : (
              integrationHealth.items.map((item) => (
                <View key={item.provider} style={styles.rowStack}>
                  <View style={styles.row}>
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowTitle}>{item.display_name}</Text>
                      <Text style={styles.rowDetail}>Health: {item.health.status}</Text>
                      <Text style={styles.rowDetail}>Connection: {item.connection.status}</Text>
                      <Text style={styles.rowDetail}>
                        Sync success: {item.sync_window.success_rate_percent}%
                      </Text>
                      <Text style={styles.rowDetail}>
                        Dropped events: {item.events.dropped_count}/{item.events.received_count}
                      </Text>
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.health.risk_level}</Text>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    {item.remediation.one_click_actions.map((action) => {
                      const key = `${item.provider}:${action.action}`;

                      return (
                        <Pressable
                          key={key}
                          style={[
                            styles.actionButton,
                            (!action.enabled || integrationHealth.busyKey === key) && styles.actionButtonDisabled,
                          ]}
                          onPress={() => integrationHealth.onRemediate(item.provider, action.action)}
                          disabled={!action.enabled || integrationHealth.busyKey === key}
                        >
                          <Text style={styles.actionButtonText}>{action.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: mobileUiTokens.surface,
  },
  scroll: {
    flex: 1,
  },
  aura: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 1,
  },
  auraLeft: {
    width: 320,
    height: 320,
    top: -80,
    left: -120,
  },
  auraRight: {
    width: 280,
    height: 280,
    top: 120,
    right: -110,
  },
  auraBottom: {
    width: 340,
    height: 340,
    bottom: -120,
    left: 20,
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },
  hero: {
    borderWidth: 1,
    borderColor: mobileUiTokens.outlineGhost,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.78)',
    padding: 14,
    gap: 4,
  },
  brand: {
    fontSize: 11,
    fontWeight: '700',
    color: mobileUiTokens.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dateLabel: {
    fontSize: 12,
    color: mobileUiTokens.muted,
    marginBottom: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: '400',
    color: mobileUiTokens.ink,
  },
  subtitle: {
    fontSize: 14,
    color: mobileUiTokens.muted,
  },
  progressTrack: {
    marginTop: 6,
    borderRadius: 999,
    height: 7,
    backgroundColor: mobileUiTokens.surfaceLow,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: mobileUiTokens.accent,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaPill: {
    fontSize: 11,
    fontWeight: '700',
    color: mobileUiTokens.ink,
    backgroundColor: mobileUiTokens.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  metaCode: {
    fontSize: 11,
    color: mobileUiTokens.muted,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: mobileUiTokens.outlineGhost,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.68)',
    padding: 10,
    gap: 3,
  },
  metricLabel: {
    fontSize: 11,
    color: mobileUiTokens.muted,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: mobileUiTokens.ink,
  },
  panel: {
    borderWidth: 1,
    borderColor: mobileUiTokens.outlineGhost,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.76)',
    padding: 12,
    gap: 8,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: mobileUiTokens.ink,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  sectionWrap: {
    gap: 6,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: mobileUiTokens.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionLabelHighlight: {
    color: mobileUiTokens.accent,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: mobileUiTokens.muted,
    marginTop: -2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: mobileUiTokens.outlineGhost,
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
    color: mobileUiTokens.ink,
  },
  rowDetail: {
    fontSize: 12,
    color: mobileUiTokens.muted,
  },
  badge: {
    backgroundColor: mobileUiTokens.accentSoft,
    borderColor: mobileUiTokens.outlineGhost,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: mobileUiTokens.ink,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    borderWidth: 1,
    borderColor: mobileUiTokens.outlineGhost,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  actionButtonPrimary: {
    borderColor: mobileUiTokens.accent,
    backgroundColor: mobileUiTokens.accent,
  },
  actionButtonSecondary: {
    borderColor: mobileUiTokens.outlineGhost,
    backgroundColor: mobileUiTokens.accentSoft,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: mobileUiTokens.ink,
  },
  actionButtonTextPrimary: {
    color: '#fbfdf9',
  },
  actionButtonTextSecondary: {
    color: mobileUiTokens.ink,
  },
  scopeHeading: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: mobileUiTokens.ink,
  },
  scopeWarnText: {
    fontSize: 12,
    color: '#8c4f1d',
  },
  scopeOkText: {
    fontSize: 12,
    color: '#2f6c3c',
  },
});
