import { useMemo, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type {
  IntegrationConnectionItem,
  IntegrationHealthProviderItem,
  ModuleKey,
  SupportedLanguage,
  TelemetryEventName,
  UiAsyncState,
} from '@nest/shared-types';
import { resolveLocale, translate } from '@nest/shared-types';
import { getAuraPalette, mobileUiTokens } from '@/constants/uiTokens';
import { useUiLanguage } from '@/lib/ui-language';

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
    onPress?: () => void;
    disabled?: boolean;
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
    onConnect?: (provider: string) => void;
    onRevoke: (provider: string) => void;
    busyProvider?: string | null;
    connectUnavailableMessage?: string;
  };
  integrationHealth?: {
    items: IntegrationHealthProviderItem[];
    onRemediate: (provider: string, action: 'replay_latest_failure' | 'reconnect_provider') => void;
    busyKey?: string | null;
    message?: string | null;
  };
  children?: ReactNode;
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
      message: 'mobile.module.connection.no_scopes',
    };
  }

  if (extras.length > 0) {
    return {
      level: 'warn',
      message: `${translateMessageKey('mobile.module.connection.extra_scopes', extras.join(', '))}`,
    };
  }

  if (missing.length > 0) {
    return {
      level: 'warn',
      message: `${translateMessageKey('mobile.module.connection.missing_scopes', missing.join(', '))}`,
    };
  }

  return {
    level: 'ok',
    message: 'mobile.module.connection.baseline_ok',
  };
}

function translateMessageKey(key: string, value: string) {
  return `${key}::${value}`;
}

function resolveReviewMessage(review: ReturnType<typeof reviewConnectionScopes>, language: SupportedLanguage) {
  if (!review) {
    return '';
  }

  if (review.message.includes('::')) {
    const [key, suffix] = review.message.split('::');
    return `${translate(key, language)}: ${suffix}`;
  }

  return translate(review.message, language);
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
  children,
}: ModuleScreenProps) {
  const language = useUiLanguage();
  const t = (key: string, fallback?: string) => translate(key, language, fallback);
  const stateLabels: Record<UiAsyncState, string> = {
    loading: t('mobile.module.state.loading', 'Loading'),
    empty: t('mobile.module.state.empty', 'Empty'),
    error: t('mobile.module.state.error', 'Error'),
    success: t('mobile.module.state.success', 'Success'),
  };
  const [auraA, auraB, auraC] = useMemo(() => getAuraPalette(moduleKey), [moduleKey]);
  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString(resolveLocale(language), {
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
          <Text style={styles.brand}>{t('app.kicker', 'Nest MVP')}</Text>
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
            <Text style={styles.panelTitle}>{t('mobile.module.panel.today', 'Your day')}</Text>
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
            <Text style={styles.panelTitle}>{t('mobile.module.panel.quick_actions', 'Quick actions')}</Text>
            <View style={styles.actionRow}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.label}
                  style={[
                    styles.actionButton,
                    action.variant === 'primary' ? styles.actionButtonPrimary : styles.actionButtonSecondary,
                    action.disabled && styles.actionButtonDisabled,
                  ]}
                  onPress={action.onPress}
                  disabled={action.disabled}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
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

        {children}

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{t('mobile.module.panel.live_snapshot', 'Live snapshot')}</Text>
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
            <Text style={styles.panelTitle}>{t('mobile.module.panel.api_status', 'API client status')}</Text>
            <View style={styles.row}>
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowTitle}>{stateLabels[connectivity.state]}</Text>
                <Text style={styles.rowDetail}>{connectivity.detail}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t('mobile.module.badge.shared_client', 'shared client')}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {conflicts ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{t('mobile.module.panel.conflict_queue', 'Conflict queue')}</Text>
            {conflicts.items.length === 0 ? (
              <View style={styles.row}>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>{t('mobile.module.empty.conflicts.title', 'No open conflicts')}</Text>
                  <Text style={styles.rowDetail}>{t('mobile.module.empty.conflicts.detail', 'Queue is clear for this module.')}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t('mobile.module.badge.clear', 'clear')}</Text>
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
                      <Text style={styles.badgeText}>{t('mobile.module.badge.open', 'open')}</Text>
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
                      accessibilityRole="button"
                      accessibilityLabel={`Accept ${conflict.provider} conflict`}
                    >
                      <Text style={styles.actionButtonText}>{t('mobile.module.action.accept', 'Accept')}</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.actionButton,
                        conflicts.resolvingId === conflict.id && styles.actionButtonDisabled,
                      ]}
                      onPress={() => conflicts.onResolve(conflict.id, 'override')}
                      disabled={conflicts.resolvingId === conflict.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Override ${conflict.provider} conflict`}
                    >
                      <Text style={styles.actionButtonText}>{t('mobile.module.action.override', 'Override')}</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : null}

        {connections ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{t('mobile.module.panel.connections', 'Connections')}</Text>
            {connections.items.map((connection) => {
              const review = reviewConnectionScopes(connection);

              return (
                <View key={connection.provider} style={styles.rowStack}>
                  <View style={styles.row}>
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowTitle}>{connection.provider}</Text>
                      <Text style={styles.rowDetail}>Status: {connection.status}</Text>
                      <Text style={styles.scopeHeading}>{t('mobile.module.connection.scopes', 'Scopes')}</Text>
                      <Text style={styles.rowDetail}>
                        {t('mobile.module.connection.scopes', 'Scopes')}: {connection.scopes.length > 0 ? connection.scopes.join(', ') : t('mobile.module.connection.none', 'none')}
                      </Text>
                      {connection.status === 'connected' ? (
                        <Text style={review.level === 'warn' ? styles.scopeWarnText : styles.scopeOkText}>
                          {resolveReviewMessage(review, language)}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {connection.is_connected ? 'connected' : 'inactive'}
                      </Text>
                    </View>
                  </View>
                  {connections.connectUnavailableMessage ? (
                    <Text style={styles.rowDetail}>{connections.connectUnavailableMessage}</Text>
                  ) : null}
                  <View style={styles.actionRow}>
                    {connections.onConnect ? (
                      <Pressable
                        style={[
                          styles.actionButton,
                          connections.busyProvider === connection.provider && styles.actionButtonDisabled,
                        ]}
                        onPress={() => connections.onConnect?.(connection.provider)}
                        disabled={connections.busyProvider === connection.provider}
                        accessibilityRole="button"
                        accessibilityLabel={`Connect ${connection.provider}`}
                      >
                        <Text style={styles.actionButtonText}>
                          {t('mobile.module.action.connect', 'Connect')}
                        </Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      style={[
                        styles.actionButton,
                        connections.busyProvider === connection.provider && styles.actionButtonDisabled,
                      ]}
                      onPress={() => connections.onRevoke(connection.provider)}
                      disabled={connections.busyProvider === connection.provider}
                      accessibilityRole="button"
                      accessibilityLabel={`Revoke ${connection.provider}`}
                    >
                      <Text style={styles.actionButtonText}>{t('mobile.module.action.revoke', 'Revoke')}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {integrationHealth ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>{t('mobile.module.panel.integration_health', 'Integration health')}</Text>
            {integrationHealth.message ? (
              <Text style={styles.rowDetail}>
                {t('mobile.module.health.message', 'Health update')}: {integrationHealth.message}
              </Text>
            ) : null}
            {integrationHealth.items.length === 0 ? (
              <View style={styles.row}>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowTitle}>{t('mobile.module.state.empty', 'Empty')}</Text>
                  <Text style={styles.rowDetail}>Health data appears after first sync window.</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t('mobile.module.state.empty', 'Empty')}</Text>
                </View>
              </View>
            ) : (
              integrationHealth.items.map((item) => (
                <View key={item.provider} style={styles.rowStack}>
                  <View style={styles.row}>
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowTitle}>{item.display_name}</Text>
                      <Text style={styles.rowDetail}>{t('mobile.module.health.summary', 'Summary')}: {item.health.status}</Text>
                      <Text style={styles.rowDetail}>{t('mobile.module.panel.connections', 'Connections')}: {item.connection.status}</Text>
                      <Text style={styles.rowDetail}>
                        {t('mobile.module.health.window', 'Window')}: {item.sync_window.success_rate_percent}%
                      </Text>
                      <Text style={styles.rowDetail}>
                        {t('mobile.module.health.drop_rate', 'Drop rate')}: {item.events.dropped_count}/{item.events.received_count}
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
                          accessibilityRole="button"
                          accessibilityLabel={`${action.label} for ${item.display_name}`}
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
