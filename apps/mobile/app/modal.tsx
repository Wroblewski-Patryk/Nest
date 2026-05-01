import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  type AiCopilotConversationResponse,
  type InAppNotificationItem,
  type NotificationChannel,
  type NotificationChannelDeliveryItem,
  type NotificationPreferencesItem,
} from '@nest/shared-types';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { nestApiClient } from '@/constants/apiClient';
import {
  clearOfflineQueue,
  enqueueOfflineAction,
  getOfflineQueueRetentionDays,
  loadOfflineQueue,
  saveOfflineQueue,
  type MobileOfflineQueueItem,
} from '@/constants/offlineQueue';
import {
  clearOfflineSyncSchedulerState,
  evaluateOfflineSyncSchedulerHealth,
  loadOfflineSyncSchedulerState,
  saveOfflineSyncSchedulerState,
  type MobileOfflineSyncSchedulerState,
} from '@/constants/offlineSyncScheduler';
import { setStoredUiLanguage, useUiLanguage } from '@/lib/ui-language';
import {
  describeApiIssue,
  getApiErrorCode,
  getApiErrorRetryable,
  getApiErrorStatus,
} from '@/lib/ux-contract';

const AUTO_SYNC_INTERVAL_MS = 15000;
const BASE_RETRY_SECONDS = 15;
const MAX_RETRY_SECONDS = 300;

type NotificationRoute =
  | '/(tabs)'
  | '/(tabs)/calendar'
  | '/(tabs)/habits'
  | '/(tabs)/goals'
  | '/(tabs)/journal'
  | '/(tabs)/insights'
  | '/(tabs)/billing';

const NOTIFICATION_CHANNELS: NotificationChannel[] = ['in_app', 'push', 'email'];
const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  in_app: 'In-app',
  push: 'Push',
  email: 'Email',
};

function resolveMobileNotificationRoute(item: InAppNotificationItem): NotificationRoute | null {
  const normalize = (value: string | null): NotificationRoute | null => {
    if (value === '/tasks') return '/(tabs)';
    if (value === '/calendar') return '/(tabs)/calendar';
    if (value === '/habits') return '/(tabs)/habits';
    if (value === '/goals') return '/(tabs)/goals';
    if (value === '/journal') return '/(tabs)/journal';
    if (value === '/insights') return '/(tabs)/insights';
    if (value === '/billing') return '/(tabs)/billing';
    if (
      value === '/(tabs)' ||
      value === '/(tabs)/calendar' ||
      value === '/(tabs)/habits' ||
      value === '/(tabs)/goals' ||
      value === '/(tabs)/journal' ||
      value === '/(tabs)/insights' ||
      value === '/(tabs)/billing'
    ) {
      return value;
    }

    return null;
  };

  const fromDeepLink = normalize(item.deep_link);
  if (fromDeepLink) {
    return fromDeepLink;
  }

  return normalize(item.module ? `/${item.module}` : null);
}

function computeJitterSeconds(seed: string, retryCount: number): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }

  return Math.abs(hash + retryCount * 17) % 5;
}

function computeRetryDelaySeconds(retryCount: number, seed: string): number {
  const delay = BASE_RETRY_SECONDS * Math.pow(2, Math.max(0, retryCount - 1));
  const withJitter = delay + computeJitterSeconds(seed, retryCount);
  return Math.min(MAX_RETRY_SECONDS, withJitter);
}

function isRetryDue(item: MobileOfflineQueueItem, nowMs: number): boolean {
  if (item.retryable === false) {
    return false;
  }

  if (!item.next_retry_at) {
    return true;
  }

  const nextAt = Date.parse(item.next_retry_at);
  if (Number.isNaN(nextAt)) {
    return true;
  }

  return nextAt <= nowMs;
}

export default function ModalScreen() {
  const router = useRouter();
  const selected = useUiLanguage();
  const [queue, setQueue] = useState<MobileOfflineQueueItem[]>([]);
  const [detail, setDetail] = useState('Queue offline changes here and run a manual sync when you are ready.');
  const [notificationDetail, setNotificationDetail] = useState('Loading your in-app notifications...');
  const [notifications, setNotifications] = useState<InAppNotificationItem[]>([]);
  const [notificationBusyId, setNotificationBusyId] = useState<string | null>(null);
  const [matrixDetail, setMatrixDetail] = useState('Loading your notification settings...');
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferencesItem | null>(null);
  const [channelDeliveries, setChannelDeliveries] = useState<NotificationChannelDeliveryItem[]>([]);
  const [isSavingMatrix, setIsSavingMatrix] = useState(false);
  const [copilotPrompt, setCopilotPrompt] = useState('Help me plan the next 3 high-impact actions.');
  const [copilotDetail, setCopilotDetail] = useState('Ask Copilot about planning, execution, or reflection.');
  const [copilotResult, setCopilotResult] = useState<AiCopilotConversationResponse['data'] | null>(null);
  const [isCopilotBusy, setIsCopilotBusy] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [scheduler, setScheduler] = useState<MobileOfflineSyncSchedulerState>(() =>
    loadOfflineSyncSchedulerState()
  );

  const autoSyncEnabled = scheduler.auto_sync_enabled;

  const updateScheduler = useCallback(
    (updater: (previous: MobileOfflineSyncSchedulerState) => MobileOfflineSyncSchedulerState) => {
      setScheduler((previous) => {
        const next = updater(previous);
        saveOfflineSyncSchedulerState(next);
        return next;
      });
    },
    []
  );

  const refreshNotifications = useCallback(async () => {
    try {
      const response = await nestApiClient.getInAppNotifications({
        per_page: 12,
        include_snoozed: false,
      });
      setNotifications(response.data);
      setNotificationDetail(
        response.data.length > 0
          ? `${response.data.length} notification(s) are ready.`
          : 'No notifications need attention right now.'
      );
    } catch (error) {
      setNotificationDetail(`We could not load notifications right now. ${describeApiIssue(error)}`);
    }
  }, []);

  const refreshNotificationMatrix = useCallback(async () => {
    try {
      const [preferencesResponse, deliveriesResponse] = await Promise.all([
        nestApiClient.getNotificationPreferences(),
        nestApiClient.getNotificationChannelDeliveries({ per_page: 10 }),
      ]);
      setNotificationPreferences(preferencesResponse.data);
      setChannelDeliveries(deliveriesResponse.data);
      setMatrixDetail('Notification settings are ready.');
    } catch (error) {
      setMatrixDetail(`We could not load notification settings right now. ${describeApiIssue(error)}`);
    }
  }, []);

  const toggleMatrixGlobalChannel = useCallback(
    (channel: NotificationChannel) => {
      setNotificationPreferences((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          channels: {
            ...previous.channels,
            [channel]: !previous.channels[channel],
          },
        };
      });
    },
    []
  );

  const toggleMatrixEventChannel = useCallback(
    (eventType: string, channel: NotificationChannel) => {
      setNotificationPreferences((previous) => {
        if (!previous) return previous;
        const eventChannels = previous.event_channels[eventType] ?? previous.channels;
        return {
          ...previous,
          event_channels: {
            ...previous.event_channels,
            [eventType]: {
              ...eventChannels,
              [channel]: !eventChannels[channel],
            },
          },
        };
      });
    },
    []
  );

  const saveNotificationMatrix = useCallback(async () => {
    if (!notificationPreferences) {
      return;
    }

    setIsSavingMatrix(true);
    try {
      const response = await nestApiClient.updateNotificationPreferences({
        channels: notificationPreferences.channels,
        event_channels: notificationPreferences.event_channels,
        quiet_hours: notificationPreferences.quiet_hours,
        locale: notificationPreferences.locale,
      });
      setNotificationPreferences(response.data);
      setMatrixDetail('Notification settings saved.');
      const deliveriesResponse = await nestApiClient.getNotificationChannelDeliveries({ per_page: 10 });
      setChannelDeliveries(deliveriesResponse.data);
    } catch (error) {
      setMatrixDetail(`We could not save notification settings. ${describeApiIssue(error)}`);
    } finally {
      setIsSavingMatrix(false);
    }
  }, [notificationPreferences]);

  const askCopilot = useCallback(async () => {
    if (!copilotPrompt.trim()) {
      setCopilotDetail('Type a question before asking Copilot.');
      return;
    }

    setIsCopilotBusy(true);
    setCopilotDetail('Preparing a Copilot answer...');
    try {
      const response = await nestApiClient.askAiCopilot({
        message: copilotPrompt.trim(),
        context: {
          window_days: 14,
          entity_limit: 10,
        },
      });
      setCopilotResult(response.data);
      setCopilotDetail(
        response.data.provider.mode === 'fallback'
          ? 'Primary AI provider is unavailable, so a fallback answer was returned.'
          : 'Copilot answer is ready.'
      );
    } catch (error) {
      setCopilotDetail(`We could not reach Copilot right now. ${describeApiIssue(error)}`);
    } finally {
      setIsCopilotBusy(false);
    }
  }, [copilotPrompt]);

  const toggleRead = useCallback(
    async (item: InAppNotificationItem) => {
      setNotificationBusyId(item.id);
      try {
        if (item.is_read) {
          await nestApiClient.markInAppNotificationUnread(item.id);
        } else {
          await nestApiClient.markInAppNotificationRead(item.id);
        }
        await refreshNotifications();
      } finally {
        setNotificationBusyId(null);
      }
    },
    [refreshNotifications]
  );

  const snoozeNotification = useCallback(
    async (item: InAppNotificationItem) => {
      setNotificationBusyId(item.id);
      try {
        await nestApiClient.snoozeInAppNotification(item.id, {
          snoozed_until: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        });
        await refreshNotifications();
      } finally {
        setNotificationBusyId(null);
      }
    },
    [refreshNotifications]
  );

  const openNotificationContext = useCallback(
    (item: InAppNotificationItem) => {
      const route = resolveMobileNotificationRoute(item);
      if (!route) {
        setNotificationDetail('This notification does not have a destination screen yet.');
        return;
      }

      router.push(route);
    },
    [router]
  );

  useEffect(() => {
    setQueue(loadOfflineQueue());
    setScheduler(loadOfflineSyncSchedulerState());
    void refreshNotifications();
    void refreshNotificationMatrix();
  }, [refreshNotifications, refreshNotificationMatrix]);

  const enqueue = (action: 'sync_list_tasks' | 'sync_calendar' | 'sync_journal') => {
    const duplicatePending = queue.some(
      (item) => item.action === action && item.status === 'pending'
    );
    if (duplicatePending) {
      setDetail(`A pending ${action} sync is already queued.`);
      return;
    }

    setQueue(enqueueOfflineAction(action));
  };

  const forceSync = useCallback(
    async (
      queueSource: MobileOfflineQueueItem[] = queue,
      options: { stopOnError: boolean; source: 'manual' | 'auto' } = {
        stopOnError: true,
        source: 'manual',
      }
    ) => {
      const runStartedAt = new Date().toISOString();
      let hadFailure = false;
      let hadSuccess = false;
      let lastError = '';

      setIsSyncing(true);
      updateScheduler((previous) => ({
        ...previous,
        last_run_at: runStartedAt,
      }));
      const nextQueue = [...queueSource].sort((a, b) => a.created_at.localeCompare(b.created_at));

      try {
        for (const item of nextQueue) {
          if (item.status !== 'pending') continue;

          try {
            if (item.action === 'sync_list_tasks') await nestApiClient.syncListTasks('todoist');
            if (item.action === 'sync_calendar') await nestApiClient.syncCalendar('google_calendar');
            if (item.action === 'sync_journal') await nestApiClient.syncJournal('obsidian');
            item.status = 'synced';
            delete item.last_error;
            delete item.retry_count;
            delete item.next_retry_at;
            hadSuccess = true;
            setDetail(`${item.action} synced successfully.`);
          } catch (error) {
            const status = getApiErrorStatus(error);
            const code = getApiErrorCode(error);
            const retryable = getApiErrorRetryable(error);
            const shouldRetryAutomatically = retryable !== false;
            const retryCount = (item.retry_count ?? 0) + 1;
            const retryDelaySeconds = computeRetryDelaySeconds(retryCount, item.id);
            item.status = 'failed';
            item.retry_count = retryCount;
            item.retryable = retryable ?? true;
            if (shouldRetryAutomatically) {
              item.next_retry_at = new Date(Date.now() + retryDelaySeconds * 1000).toISOString();
            } else {
              delete item.next_retry_at;
            }
            item.last_error = code ?? (status === null ? 'request_failed' : `HTTP ${status}`);
            hadFailure = true;
            lastError = item.last_error;
            setDetail(
              `${options.source === 'auto' ? 'Auto-sync' : 'Manual sync'} could not finish ${item.action}. ${describeApiIssue(error)} ${
                shouldRetryAutomatically
                  ? `Next retry in ${retryDelaySeconds}s.`
                  : 'Resolve the issue, then use Retry Sync to try again.'
              }`
            );
            if (options.stopOnError) {
              break;
            }
          }
        }
      } finally {
        saveOfflineQueue(nextQueue);
        setQueue(nextQueue);
        const health = evaluateOfflineSyncSchedulerHealth(nextQueue);
        updateScheduler((previous) => ({
          ...previous,
          ...health,
          last_run_at: runStartedAt,
          last_success_at: hadSuccess ? new Date().toISOString() : previous.last_success_at,
          consecutive_failures: hadFailure
            ? previous.consecutive_failures + 1
            : hadSuccess
              ? 0
              : previous.consecutive_failures,
          last_error: hadFailure ? lastError : undefined,
        }));
        setIsSyncing(false);
      }
    },
    [queue, updateScheduler]
  );

  const retrySync = useCallback(async () => {
    const retriable = queue.map((item) =>
      item.status === 'failed'
        ? {
            ...item,
            status: 'pending' as const,
            last_error: undefined,
            next_retry_at: undefined,
            retryable: undefined,
          }
        : item
    );
    setQueue(retriable);
    saveOfflineQueue(retriable);
    await forceSync(retriable);
  }, [forceSync, queue]);

  const secureWipeCache = useCallback(() => {
    clearOfflineQueue();
    clearOfflineSyncSchedulerState();
    setQueue([]);
    setScheduler(loadOfflineSyncSchedulerState());
    setDetail('Offline cache was securely removed from this device.');
  }, []);

  useEffect(() => {
    if (!autoSyncEnabled) {
      return;
    }

    const interval = globalThis.setInterval(() => {
      if (isSyncing) {
        return;
      }

      const nowMs = Date.now();
      const hasPending = queue.some((item) => item.status === 'pending');
      const hasDueRetries = queue.some(
        (item) => item.status === 'failed' && isRetryDue(item, nowMs)
      );

      if (!hasPending && !hasDueRetries) {
        return;
      }

      const autoPrepared = queue.map((item) =>
        item.status === 'failed' && isRetryDue(item, nowMs)
          ? { ...item, status: 'pending' as const }
          : item
      );

      if (hasDueRetries) {
        setQueue(autoPrepared);
        saveOfflineQueue(autoPrepared);
      }

      void forceSync(autoPrepared, { stopOnError: false, source: 'auto' });
    }, AUTO_SYNC_INTERVAL_MS);

    return () => {
      globalThis.clearInterval(interval);
    };
  }, [autoSyncEnabled, forceSync, isSyncing, queue]);

  const pending = queue.filter((item) => item.status === 'pending').length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support Map</Text>
      <Text style={styles.description}>
        Start with the recovery job you need, then use the matching section below.
      </Text>
      <View style={styles.supportMap}>
        <View style={styles.supportCard}>
          <Text style={styles.supportCardTitle}>Language</Text>
          <Text style={styles.supportCardText}>Switch active UI language.</Text>
        </View>
        <View style={styles.supportCard}>
          <Text style={styles.supportCardTitle}>Sync recovery</Text>
          <Text style={styles.supportCardText}>Queue, force, retry, or wipe sync state.</Text>
        </View>
        <View style={styles.supportCard}>
          <Text style={styles.supportCardTitle}>Notifications</Text>
          <Text style={styles.supportCardText}>Review alerts and channel rules.</Text>
        </View>
        <View style={styles.supportCard}>
          <Text style={styles.supportCardTitle}>Copilot</Text>
          <Text style={styles.supportCardText}>Ask for planning or recovery help.</Text>
        </View>
      </View>

      <Text style={styles.title}>Pre-Auth Language</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text style={styles.description}>
        Choose your language before signing in and onboarding.
      </Text>
      <View style={styles.actionRow}>
        <Pressable
          style={[styles.languageButton, selected === 'en' && styles.languageButtonActive]}
          onPress={() => setStoredUiLanguage('en')}
          accessibilityRole="button"
          accessibilityLabel="Switch language to English"
        >
          <Text style={styles.languageButtonText}>English</Text>
        </Pressable>
        <Pressable
          style={[styles.languageButton, selected === 'pl' && styles.languageButtonActive]}
          onPress={() => setStoredUiLanguage('pl')}
          accessibilityRole="button"
          accessibilityLabel="Switch language to Polish"
        >
          <Text style={styles.languageButtonText}>Polski</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Sync Options</Text>
      <Text style={styles.description}>{detail}</Text>
      <View style={styles.actionRow}>
        <Pressable style={styles.languageButton} onPress={() => enqueue('sync_list_tasks')} accessibilityRole="button" accessibilityLabel="Queue tasks sync">
          <Text style={styles.languageButtonText}>Queue Tasks</Text>
        </Pressable>
        <Pressable style={styles.languageButton} onPress={() => enqueue('sync_calendar')} accessibilityRole="button" accessibilityLabel="Queue calendar sync">
          <Text style={styles.languageButtonText}>Queue Calendar</Text>
        </Pressable>
        <Pressable style={styles.languageButton} onPress={() => enqueue('sync_journal')} accessibilityRole="button" accessibilityLabel="Queue journal sync">
          <Text style={styles.languageButtonText}>Queue Journal</Text>
        </Pressable>
      </View>
      <Pressable
        style={[styles.languageButton, styles.languageButtonActive]}
        onPress={() => void forceSync()}
        disabled={isSyncing || pending === 0}
        accessibilityRole="button"
        accessibilityLabel="Force sync"
      >
        <Text style={styles.languageButtonText}>{isSyncing ? 'Syncing...' : 'Force Sync'}</Text>
      </Pressable>
      <Pressable
        style={styles.languageButton}
        onPress={() => void retrySync()}
        disabled={isSyncing}
        accessibilityRole="button"
        accessibilityLabel="Retry sync"
      >
        <Text style={styles.languageButtonText}>Retry Sync</Text>
      </Pressable>
      <Pressable
        style={styles.languageButton}
        onPress={() =>
          updateScheduler((previous) => ({
            ...previous,
            auto_sync_enabled: !previous.auto_sync_enabled,
          }))
        }
        disabled={isSyncing}
        accessibilityRole="button"
        accessibilityLabel={autoSyncEnabled ? 'Pause auto sync' : 'Resume auto sync'}
      >
        <Text style={styles.languageButtonText}>{autoSyncEnabled ? 'Pause Auto Sync' : 'Resume Auto Sync'}</Text>
      </Pressable>
      <Pressable
        style={styles.languageButton}
        onPress={secureWipeCache}
        disabled={isSyncing}
        accessibilityRole="button"
        accessibilityLabel="Secure wipe cache"
      >
        <Text style={styles.languageButtonText}>Secure Wipe Cache</Text>
      </Pressable>
      <Text style={styles.description}>
        Pending: {pending} | Total: {queue.length} | Auto: {autoSyncEnabled ? 'on' : 'off'} | Lag: {scheduler.scheduler_lag_seconds}s | Retention: {getOfflineQueueRetentionDays()}d
      </Text>
      {scheduler.stuck_detected ? (
        <Text style={styles.description}>Scheduler alert: stuck queue ({scheduler.stuck_reason ?? 'unknown'}).</Text>
      ) : null}

      <Text style={styles.title}>Notification Center</Text>
      <Text style={styles.description}>{notificationDetail}</Text>
      {notifications.length === 0 ? (
        <Text style={styles.description}>No notifications need attention right now.</Text>
      ) : null}
      {notifications.map((item) => (
        <View key={item.id} style={styles.notificationCard}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.description}>{item.body}</Text>
          <Text style={styles.description}>
            {item.module ?? 'general'} | {item.is_read ? 'read' : 'unread'}
          </Text>
          <View style={styles.actionRow}>
            <Pressable
              style={styles.languageButton}
              onPress={() => openNotificationContext(item)}
              disabled={notificationBusyId === item.id}
              accessibilityRole="button"
              accessibilityLabel={`Open notification ${item.title}`}
            >
              <Text style={styles.languageButtonText}>Open</Text>
            </Pressable>
            <Pressable
              style={styles.languageButton}
              onPress={() => void toggleRead(item)}
              disabled={notificationBusyId === item.id}
              accessibilityRole="button"
              accessibilityLabel={item.is_read ? `Mark ${item.title} unread` : `Mark ${item.title} read`}
            >
              <Text style={styles.languageButtonText}>{item.is_read ? 'Mark Unread' : 'Mark Read'}</Text>
            </Pressable>
            <Pressable
              style={styles.languageButton}
              onPress={() => void snoozeNotification(item)}
              disabled={notificationBusyId === item.id}
              accessibilityRole="button"
              accessibilityLabel={`Snooze notification ${item.title} for one hour`}
            >
              <Text style={styles.languageButtonText}>Snooze 1h</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Text style={styles.title}>Notification Matrix</Text>
      <Text style={styles.description}>{matrixDetail}</Text>
      {notificationPreferences ? (
        <View style={styles.notificationCard}>
          <Text style={styles.notificationTitle}>Global channels</Text>
          <View style={styles.actionRow}>
            {NOTIFICATION_CHANNELS.map((channel) => (
              <Pressable
                key={channel}
                style={[
                  styles.languageButton,
                  notificationPreferences.channels[channel] && styles.languageButtonActive,
                ]}
                onPress={() => toggleMatrixGlobalChannel(channel)}
                disabled={isSavingMatrix}
                accessibilityRole="button"
                accessibilityLabel={`Toggle ${CHANNEL_LABEL[channel]} notifications`}
              >
                <Text style={styles.languageButtonText}>
                  {CHANNEL_LABEL[channel]} {notificationPreferences.channels[channel] ? 'on' : 'off'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.notificationTitle}>Quiet hours</Text>
          <Pressable
            style={[styles.languageButton, notificationPreferences.quiet_hours.enabled && styles.languageButtonActive]}
            onPress={() =>
              setNotificationPreferences((previous) => {
                if (!previous) return previous;
                return {
                  ...previous,
                  quiet_hours: {
                    ...previous.quiet_hours,
                    enabled: !previous.quiet_hours.enabled,
                  },
                };
              })
            }
            disabled={isSavingMatrix}
            accessibilityRole="button"
            accessibilityLabel="Toggle quiet hours"
          >
            <Text style={styles.languageButtonText}>
              {notificationPreferences.quiet_hours.enabled ? 'Quiet hours enabled' : 'Quiet hours disabled'}
            </Text>
          </Pressable>
          <TextInput
            style={styles.matrixInput}
            value={notificationPreferences.quiet_hours.start}
            onChangeText={(value) =>
              setNotificationPreferences((previous) =>
                previous
                  ? {
                      ...previous,
                      quiet_hours: { ...previous.quiet_hours, start: value },
                    }
                  : previous
              )
            }
            editable={!isSavingMatrix}
            placeholder="Start (HH:mm)"
            accessibilityLabel="Quiet hours start time"
          />
          <TextInput
            style={styles.matrixInput}
            value={notificationPreferences.quiet_hours.end}
            onChangeText={(value) =>
              setNotificationPreferences((previous) =>
                previous
                  ? {
                      ...previous,
                      quiet_hours: { ...previous.quiet_hours, end: value },
                    }
                  : previous
              )
            }
            editable={!isSavingMatrix}
            placeholder="End (HH:mm)"
            accessibilityLabel="Quiet hours end time"
          />
          <TextInput
            style={styles.matrixInput}
            value={notificationPreferences.quiet_hours.timezone}
            onChangeText={(value) =>
              setNotificationPreferences((previous) =>
                previous
                  ? {
                      ...previous,
                      quiet_hours: { ...previous.quiet_hours, timezone: value },
                    }
                  : previous
              )
            }
            editable={!isSavingMatrix}
            placeholder="Timezone"
            accessibilityLabel="Quiet hours timezone"
          />

          <Text style={styles.notificationTitle}>Per-event channels</Text>
          {notificationPreferences.supported_event_types.map((eventType) => {
            const eventChannels =
              notificationPreferences.event_channels[eventType] ?? notificationPreferences.channels;
            return (
              <View key={eventType} style={styles.eventMatrixRow}>
                <Text style={styles.description}>{eventType}</Text>
                <View style={styles.actionRow}>
                  {NOTIFICATION_CHANNELS.map((channel) => (
                    <Pressable
                      key={`${eventType}-${channel}`}
                      style={[styles.languageButton, eventChannels[channel] && styles.languageButtonActive]}
                      onPress={() => toggleMatrixEventChannel(eventType, channel)}
                      disabled={isSavingMatrix}
                      accessibilityRole="button"
                      accessibilityLabel={`Toggle ${CHANNEL_LABEL[channel]} for ${eventType}`}
                    >
                      <Text style={styles.languageButtonText}>
                        {CHANNEL_LABEL[channel]} {eventChannels[channel] ? 'on' : 'off'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          })}

          <Pressable
            style={[styles.languageButton, styles.languageButtonActive]}
            onPress={() => void saveNotificationMatrix()}
            disabled={isSavingMatrix}
            accessibilityRole="button"
            accessibilityLabel="Save notification settings"
          >
            <Text style={styles.languageButtonText}>
              {isSavingMatrix ? 'Saving notification settings...' : 'Save notification settings'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Text style={styles.title}>Notification Telemetry</Text>
      {channelDeliveries.length === 0 ? (
        <Text style={styles.description}>No delivery activity is available yet.</Text>
      ) : null}
      {channelDeliveries.map((delivery) => (
        <View key={delivery.id} style={styles.notificationCard}>
          <Text style={styles.notificationTitle}>{delivery.title}</Text>
          <Text style={styles.description}>
            {delivery.channel} | {delivery.event_type} | {delivery.status}
            {delivery.failure_reason ? ` | ${delivery.failure_reason}` : ''}
          </Text>
        </View>
      ))}

      <Text style={styles.title}>Copilot</Text>
      <Text style={styles.description}>{copilotDetail}</Text>
      <TextInput
        style={styles.copilotInput}
        value={copilotPrompt}
        onChangeText={setCopilotPrompt}
        editable={!isCopilotBusy}
        multiline
        placeholder="Ask about priorities, scheduling, habits, goals, or reflection."
        accessibilityLabel="Copilot question"
      />
      <Pressable
        style={[styles.languageButton, styles.languageButtonActive]}
        onPress={() => void askCopilot()}
        disabled={isCopilotBusy}
        accessibilityRole="button"
        accessibilityLabel="Ask Copilot"
      >
        <Text style={styles.languageButtonText}>{isCopilotBusy ? 'Thinking...' : 'Ask Copilot'}</Text>
      </Pressable>
      {copilotResult ? (
        <View style={styles.notificationCard}>
          <Text style={styles.notificationTitle}>Answer</Text>
          <Text style={styles.description}>{copilotResult.answer}</Text>
          <Text style={styles.description}>
            Intent: {copilotResult.intent} | Provider mode: {copilotResult.provider.mode}
          </Text>
          {copilotResult.source_references.slice(0, 5).map((reference, index) => (
            <Text key={`${reference.entity_id ?? 'n-a'}-${index}`} style={styles.description}>
              {reference.module} | {reference.entity_type} | {reference.title ?? 'Untitled'}
            </Text>
          ))}
        </View>
      ) : null}
      <EditScreenInfo path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 16,
    marginTop: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  description: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  supportMap: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  supportCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  supportCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  supportCardText: {
    fontSize: 12,
    color: '#475569',
  },
  languageButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  languageButtonActive: {
    borderColor: '#0f766e',
    backgroundColor: '#ccfbf1',
  },
  languageButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  notificationCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  matrixInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  copilotInput: {
    width: '100%',
    minHeight: 86,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    textAlignVertical: 'top',
  },
  eventMatrixRow: {
    marginBottom: 8,
  },
});
