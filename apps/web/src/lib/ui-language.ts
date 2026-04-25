"use client";

import { resolveLanguage } from "@nest/shared-types";

const UI_LANGUAGE_STORAGE_KEY = "nest.ui.language";

export function getStoredUiLanguage(): "en" | "pl" | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
  if (!value) {
    return null;
  }

  return resolveLanguage(value);
}

export function setStoredUiLanguage(language: string): "en" | "pl" {
  const resolved = resolveLanguage(language);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, resolved);
  }

  return resolved;
}
