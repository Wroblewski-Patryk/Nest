import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { resolveLanguage } from '@nest/shared-types';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { nestApiClient } from '@/constants/apiClient';
import { Pressable } from 'react-native';
import { enqueueOfflineAction, loadOfflineQueue, saveOfflineQueue, type MobileOfflineQueueItem } from '@/constants/offlineQueue';

const AUTO_SYNC_INTERVAL_MS = 15000;
const BASE_RETRY_SECONDS = 15;
const MAX_RETRY_SECONDS = 300;

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
  const [selected, setSelected] = useState<'en' | 'pl'>('en');
  const [queue, setQueue] = useState<MobileOfflineQueueItem[]>([]);
  const [detail, setDetail] = useState('Queue offline changes and run manual force sync.');
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  useEffect(() => {
    nestApiClient
      .getLocalizationOptions()
      .then((response) => {
        setSelected(resolveLanguage(response.data.detected_language));
      })
      .catch(() => {
        setSelected('en');
      });

    setQueue(loadOfflineQueue());
  }, []);

  const enqueue = (action: 'sync_list_tasks' | 'sync_calendar' | 'sync_journal') => {
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
      setIsSyncing(true);
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
            setDetail(`Synced ${item.action} from ${item.created_at}.`);
          } catch (error) {
            const status =
              typeof error === 'object' &&
              error !== null &&
              'status' in error &&
              typeof (error as { status?: unknown }).status === 'number'
                ? String((error as { status: number }).status)
                : 'n/a';
            const retryCount = (item.retry_count ?? 0) + 1;
            const retryDelaySeconds = computeRetryDelaySeconds(retryCount, item.id);
            item.status = 'failed';
            item.retry_count = retryCount;
            item.next_retry_at = new Date(Date.now() + retryDelaySeconds * 1000).toISOString();
            item.last_error = `HTTP ${status}`;
            setDetail(
              `${options.source === 'auto' ? 'Auto' : 'Force'} sync error at ${item.action} (HTTP ${status}); retry in ${retryDelaySeconds}s.`
            );
            if (options.stopOnError) {
              break;
            }
          }
        }
      } finally {
        saveOfflineQueue(nextQueue);
        setQueue(nextQueue);
        setIsSyncing(false);
      }
    },
    [queue]
  );

  const retrySync = useCallback(async () => {
    const retriable = queue.map((item) =>
      item.status === 'failed'
        ? {
            ...item,
            status: 'pending' as const,
            last_error: undefined,
            next_retry_at: undefined,
          }
        : item
    );
    setQueue(retriable);
    saveOfflineQueue(retriable);
    await forceSync(retriable);
  }, [forceSync, queue]);

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
      <Text style={styles.title}>Pre-Auth Language</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text style={styles.description}>
        Select language before authentication and onboarding.
      </Text>
      <View style={styles.actionRow}>
        <Pressable style={[styles.languageButton, selected === 'en' && styles.languageButtonActive]} onPress={() => setSelected('en')}>
          <Text style={styles.languageButtonText}>English</Text>
        </Pressable>
        <Pressable style={[styles.languageButton, selected === 'pl' && styles.languageButtonActive]} onPress={() => setSelected('pl')}>
          <Text style={styles.languageButtonText}>Polski</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Sync Options</Text>
      <Text style={styles.description}>{detail}</Text>
      <View style={styles.actionRow}>
        <Pressable style={styles.languageButton} onPress={() => enqueue('sync_list_tasks')}>
          <Text style={styles.languageButtonText}>Queue Tasks</Text>
        </Pressable>
        <Pressable style={styles.languageButton} onPress={() => enqueue('sync_calendar')}>
          <Text style={styles.languageButtonText}>Queue Calendar</Text>
        </Pressable>
        <Pressable style={styles.languageButton} onPress={() => enqueue('sync_journal')}>
          <Text style={styles.languageButtonText}>Queue Journal</Text>
        </Pressable>
      </View>
      <Pressable
        style={[styles.languageButton, styles.languageButtonActive]}
        onPress={() => void forceSync()}
        disabled={isSyncing || pending === 0}
      >
        <Text style={styles.languageButtonText}>{isSyncing ? 'Syncing...' : 'Force Sync'}</Text>
      </Pressable>
      <Pressable
        style={styles.languageButton}
        onPress={() => void retrySync()}
        disabled={isSyncing}
      >
        <Text style={styles.languageButtonText}>Retry Sync</Text>
      </Pressable>
      <Pressable
        style={styles.languageButton}
        onPress={() => setAutoSyncEnabled((value) => !value)}
        disabled={isSyncing}
      >
        <Text style={styles.languageButtonText}>{autoSyncEnabled ? 'Pause Auto Sync' : 'Resume Auto Sync'}</Text>
      </Pressable>
      <Text style={styles.description}>Pending: {pending} | Total: {queue.length} | Auto: {autoSyncEnabled ? 'on' : 'off'}</Text>
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
    gap: 10,
    marginBottom: 12,
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
});
