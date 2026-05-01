import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { translate } from '@nest/shared-types';
import { loadOfflineQueue } from '@/constants/offlineQueue';
import { loadOfflineSyncSchedulerState } from '@/constants/offlineSyncScheduler';
import { getAuraPalette, mobileUiTokens } from '@/constants/uiTokens';
import { useUiLanguage } from '@/lib/ui-language';

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
  const language = useUiLanguage();
  const t = (key: string, fallback: string) => translate(key, language, fallback);
  const [auraA, auraB, auraC] = useMemo(() => getAuraPalette('journal'), []);
  const [queueCount, setQueueCount] = useState(0);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [schedulerLagSeconds, setSchedulerLagSeconds] = useState(0);

  useEffect(() => {
    const queue = loadOfflineQueue();
    const scheduler = loadOfflineSyncSchedulerState();
    setQueueCount(queue.filter((item) => item.status === 'pending').length);
    setAutoSyncEnabled(scheduler.auto_sync_enabled);
    setSchedulerLagSeconds(scheduler.scheduler_lag_seconds);
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
          <Text style={styles.heroTitle}>{t('mobile.settings.title', 'Settings + more')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('mobile.settings.subtitle', 'Reach core mobile settings, sync tools, and the extra surfaces that do not belong in the main daily tab loop.')}
          </Text>
          <View style={styles.metricsRow}>
            <Text style={styles.metric}>
              {t('mobile.settings.metric.language', 'Language')}: {language === 'pl' ? 'Polski' : 'English'}
            </Text>
            <Text style={styles.metric}>
              {t('mobile.settings.metric.pending_sync_items', 'Pending sync items')}: {queueCount}
            </Text>
            <Text style={styles.metric}>
              {autoSyncEnabled
                ? `${t('mobile.settings.metric.auto_sync_on', 'Auto sync on')} | ${t('mobile.settings.metric.lag', 'lag')} ${schedulerLagSeconds}s`
                : `${t('mobile.settings.metric.auto_sync_paused', 'Auto sync paused')} | ${t('mobile.settings.metric.manual_sync_available', 'manual sync available')}`}
            </Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{t('mobile.settings.panel.core_settings', 'Core settings')}</Text>
          <Text style={styles.panelText}>
            {t('mobile.settings.panel.core_settings_text', 'Open the advanced settings modal for language selection, offline sync, notifications, and Copilot controls.')}
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => openRoute('/modal')}
            accessibilityRole="button"
            accessibilityLabel="Open advanced settings"
          >
            <Text style={styles.primaryButtonText}>{t('mobile.settings.panel.open_advanced', 'Open advanced settings')}</Text>
          </Pressable>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{t('mobile.settings.panel.module_access', 'Module access')}</Text>
          <Text style={styles.panelText}>
            {t('mobile.settings.panel.module_access_text', 'Routines and life areas are managed from the mobile habits and journal flows. These shortcuts make that easier to reach.')}
          </Text>
          <View style={styles.rowWrap}>
            <Pressable
              style={styles.ghostButton}
              onPress={() => openRoute('/(tabs)/habits')}
              accessibilityRole="button"
              accessibilityLabel="Open Habits and Routines"
            >
              <Text style={styles.ghostText}>{t('mobile.settings.route.habits_routines', 'Habits + Routines')}</Text>
            </Pressable>
            <Pressable
              style={styles.ghostButton}
              onPress={() => openRoute('/(tabs)/journal')}
              accessibilityRole="button"
              accessibilityLabel="Open Journal and Life Areas"
            >
              <Text style={styles.ghostText}>{t('mobile.settings.route.journal_life_areas', 'Journal + Life Areas')}</Text>
            </Pressable>
            <Pressable
              style={styles.ghostButton}
              onPress={() => openRoute('/(tabs)/goals')}
              accessibilityRole="button"
              accessibilityLabel="Open Goals and Targets"
            >
              <Text style={styles.ghostText}>{t('mobile.settings.route.goals_targets', 'Goals + Targets')}</Text>
            </Pressable>
            <Pressable
              style={styles.ghostButton}
              onPress={() => openRoute('/(tabs)')}
              accessibilityRole="button"
              accessibilityLabel="Open Tasks and Lists"
            >
              <Text style={styles.ghostText}>{t('mobile.settings.route.tasks_lists', 'Tasks + Lists')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{t('mobile.settings.panel.additional_surfaces', 'Additional surfaces')}</Text>
          <Text style={styles.panelText}>
            {t('mobile.settings.panel.additional_surfaces_text', 'Keep the main tab bar focused on the daily loop while still exposing the non-core surfaces already available in the app.')}
          </Text>
          <View style={styles.rowWrap}>
            <Pressable
              style={styles.ghostButton}
              onPress={() => openRoute('/(tabs)/calendar')}
              accessibilityRole="button"
              accessibilityLabel="Open Calendar"
            >
              <Text style={styles.ghostText}>{t('app.nav.calendar', 'Calendar')}</Text>
            </Pressable>
            <Pressable
              style={styles.ghostButton}
              onPress={() => openRoute('/(tabs)/insights')}
              accessibilityRole="button"
              accessibilityLabel="Open Insights"
            >
              <Text style={styles.ghostText}>{t('app.nav.insights', 'Insights')}</Text>
            </Pressable>
            <Pressable
              style={styles.ghostButton}
              onPress={() => openRoute('/(tabs)/billing')}
              accessibilityRole="button"
              accessibilityLabel="Open Billing"
            >
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
