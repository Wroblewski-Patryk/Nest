import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { resolveLanguage } from '@nest/shared-types';
import { loadOfflineQueue } from '@/constants/offlineQueue';
import { loadOfflineSyncSchedulerState } from '@/constants/offlineSyncScheduler';
import { nestApiClient } from '@/constants/apiClient';
import { getAuraPalette, mobileUiTokens } from '@/constants/uiTokens';

type RouteTarget =
  | '/modal'
  | '/(tabs)'
  | '/(tabs)/habits'
  | '/(tabs)/goals'
  | '/(tabs)/journal'
  | '/(tabs)/calendar'
  | '/(tabs)/insights'
  | '/(tabs)/billing';

export default function SettingsScreen() {
  const router = useRouter();
  const [auraA, auraB, auraC] = useMemo(() => getAuraPalette('journal'), []);
  const [language, setLanguage] = useState<'en' | 'pl'>('en');
  const [queueCount, setQueueCount] = useState(0);
  const [schedulerSummary, setSchedulerSummary] = useState('Manual sync available.');

  useEffect(() => {
    nestApiClient
      .getLocalizationOptions()
      .then((response) => {
        setLanguage(resolveLanguage(response.data.detected_language));
      })
      .catch(() => {
        setLanguage('en');
      });

    const queue = loadOfflineQueue();
    const scheduler = loadOfflineSyncSchedulerState();
    setQueueCount(queue.filter((item) => item.status === 'pending').length);
    setSchedulerSummary(
      scheduler.auto_sync_enabled
        ? `Auto sync on • lag ${scheduler.scheduler_lag_seconds}s`
        : 'Auto sync paused • manual force sync available'
    );
  }, []);

  function openRoute(route: RouteTarget) {
    router.push(route);
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.aura, styles.auraLeft, { backgroundColor: auraA }]} />
      <View style={[styles.aura, styles.auraRight, { backgroundColor: auraB }]} />
      <View style={[styles.aura, styles.auraBottom, { backgroundColor: auraC }]} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Settings + More</Text>
          <Text style={styles.heroSubtitle}>Reach mobile settings essentials, advanced sync tools, and the extra surfaces that do not belong in the core tab loop.</Text>
          <View style={styles.metricsRow}>
            <Text style={styles.metric}>Language: {language}</Text>
            <Text style={styles.metric}>Pending sync items: {queueCount}</Text>
            <Text style={styles.metric}>{schedulerSummary}</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Core settings</Text>
          <Text style={styles.panelText}>
            Open the advanced settings modal for language selection, offline sync, notification center, notification matrix, and copilot controls.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => openRoute('/modal')}>
            <Text style={styles.primaryButtonText}>Open advanced settings</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Module access</Text>
          <Text style={styles.panelText}>
            Routines and life areas are now managed from the mobile habits and journal flows. These shortcuts make that explicit.
          </Text>
          <View style={styles.rowWrap}>
            <Pressable style={styles.ghostButton} onPress={() => openRoute('/(tabs)/habits')}>
              <Text style={styles.ghostText}>Habits + Routines</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={() => openRoute('/(tabs)/journal')}>
              <Text style={styles.ghostText}>Journal + Life Areas</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={() => openRoute('/(tabs)/goals')}>
              <Text style={styles.ghostText}>Goals + Targets</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={() => openRoute('/(tabs)')}>
              <Text style={styles.ghostText}>Tasks + Lists</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Additional surfaces</Text>
          <Text style={styles.panelText}>
            Keep the main tab bar focused on the founder daily loop while still exposing the non-core surfaces that already exist in the app.
          </Text>
          <View style={styles.rowWrap}>
            <Pressable style={styles.ghostButton} onPress={() => openRoute('/(tabs)/calendar')}>
              <Text style={styles.ghostText}>Calendar</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={() => openRoute('/(tabs)/insights')}>
              <Text style={styles.ghostText}>Insights</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={() => openRoute('/(tabs)/billing')}>
              <Text style={styles.ghostText}>Billing</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: mobileUiTokens.surface },
  aura: { position: 'absolute', borderRadius: 999, opacity: 1 },
  auraLeft: { width: 320, height: 320, top: -90, left: -120 },
  auraRight: { width: 280, height: 280, top: 130, right: -120 },
  auraBottom: { width: 340, height: 340, bottom: -120, left: 10 },
  content: { gap: 12, padding: 14, paddingBottom: 110 },
  hero: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.8)', padding: 14, gap: 8 },
  heroTitle: { fontSize: 28, color: mobileUiTokens.ink, fontWeight: '400' },
  heroSubtitle: { color: mobileUiTokens.muted, fontSize: 14 },
  metricsRow: { gap: 8 },
  metric: { color: mobileUiTokens.ink, fontSize: 12, fontWeight: '600' },
  panel: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.76)', padding: 12, gap: 8 },
  panelTitle: { fontSize: 14, fontWeight: '700', color: mobileUiTokens.ink, textTransform: 'uppercase', letterSpacing: 0.7 },
  panelText: { color: mobileUiTokens.muted, fontSize: 13, lineHeight: 18 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  primaryButton: { borderWidth: 1, borderColor: mobileUiTokens.accent, backgroundColor: mobileUiTokens.accent, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fbfdf9', fontSize: 13, fontWeight: '700' },
  ghostButton: { borderWidth: 1, borderColor: mobileUiTokens.outlineGhost, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#fff' },
  ghostText: { color: mobileUiTokens.ink, fontSize: 12, fontWeight: '600' },
});
