import { useEffect, useSyncExternalStore } from 'react';
import { resolveLanguage, type SupportedLanguage } from '@nest/shared-types';
import { nestApiClient } from '@/constants/apiClient';

const DEFAULT_LANGUAGE = resolveLanguage(process.env.EXPO_PUBLIC_NEST_DEFAULT_LANGUAGE);
const UI_LANGUAGE_STORAGE_KEY = 'nest.mobile.ui.language';

const listeners = new Set<() => void>();
let currentLanguage: SupportedLanguage = getPersistedUiLanguage() ?? DEFAULT_LANGUAGE;
let didHydrateFromApi = false;

function getStorage() {
  return (globalThis as { localStorage?: Storage }).localStorage;
}

function getPersistedUiLanguage(): SupportedLanguage | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const value = storage.getItem(UI_LANGUAGE_STORAGE_KEY);
  if (!value) {
    return null;
  }

  return resolveLanguage(value);
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function updateCurrentLanguage(language: SupportedLanguage) {
  currentLanguage = language;

  const storage = getStorage();
  if (storage) {
    storage.setItem(UI_LANGUAGE_STORAGE_KEY, language);
  }

  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStoredUiLanguage() {
  return currentLanguage;
}

export function setStoredUiLanguage(language: SupportedLanguage | string) {
  const resolved = resolveLanguage(language);
  updateCurrentLanguage(resolved);
  return resolved;
}

export async function refreshStoredUiLanguage() {
  try {
    const response = await nestApiClient.getLocalizationOptions();
    updateCurrentLanguage(resolveLanguage(response.data.detected_language));
  } catch {
    updateCurrentLanguage(getPersistedUiLanguage() ?? DEFAULT_LANGUAGE);
  }
}

export function useUiLanguage() {
  const language = useSyncExternalStore(subscribe, getStoredUiLanguage, () => DEFAULT_LANGUAGE);

  useEffect(() => {
    if (didHydrateFromApi) {
      return;
    }

    didHydrateFromApi = true;
    void refreshStoredUiLanguage();
  }, []);

  return language;
}
