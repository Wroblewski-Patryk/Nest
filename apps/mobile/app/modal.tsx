import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { resolveLanguage } from '@nest/shared-types';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { nestApiClient } from '@/constants/apiClient';
import { Pressable } from 'react-native';
import { enqueueOfflineAction, loadOfflineQueue, saveOfflineQueue, type MobileOfflineQueueItem } from '@/constants/offlineQueue';

export default function ModalScreen() {
  const [selected, setSelected] = useState<'en' | 'pl'>('en');
  const [queue, setQueue] = useState<MobileOfflineQueueItem[]>([]);
  const [detail, setDetail] = useState('Queue offline changes and run manual force sync.');
  const [isSyncing, setIsSyncing] = useState(false);

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

  const forceSync = async (queueSource: MobileOfflineQueueItem[] = queue) => {
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
          setDetail(`Synced ${item.action} from ${item.created_at}.`);
        } catch (error) {
          const status =
            typeof error === 'object' &&
            error !== null &&
            'status' in error &&
            typeof (error as { status?: unknown }).status === 'number'
              ? String((error as { status: number }).status)
              : 'n/a';
          item.status = 'failed';
          item.last_error = `HTTP ${status}`;
          setDetail(`Force sync stopped on first error at ${item.action} (HTTP ${status}).`);
          break;
        }
      }
    } finally {
      saveOfflineQueue(nextQueue);
      setQueue(nextQueue);
      setIsSyncing(false);
    }
  };

  const retrySync = async () => {
    const retriable = queue.map((item) =>
      item.status === 'failed'
        ? { ...item, status: 'pending' as const, last_error: undefined }
        : item
    );
    setQueue(retriable);
    saveOfflineQueue(retriable);
    await forceSync(retriable);
  };

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
      <Text style={styles.description}>Pending: {pending} | Total: {queue.length}</Text>
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
