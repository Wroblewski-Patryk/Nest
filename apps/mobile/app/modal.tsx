import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { resolveLanguage } from '@nest/shared-types';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { nestApiClient } from '@/constants/apiClient';
import { Pressable } from 'react-native';

export default function ModalScreen() {
  const [selected, setSelected] = useState<'en' | 'pl'>('en');

  useEffect(() => {
    nestApiClient
      .getLocalizationOptions()
      .then((response) => {
        setSelected(resolveLanguage(response.data.detected_language));
      })
      .catch(() => {
        setSelected('en');
      });
  }, []);

  return (
    <View style={styles.container}>
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
      <EditScreenInfo path="app/modal.tsx" />

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
