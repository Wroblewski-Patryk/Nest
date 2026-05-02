"use client";

import { useSyncExternalStore } from "react";
import { resolveLanguage } from "@nest/shared-types";

const UI_LANGUAGE_STORAGE_KEY = "nest.ui.language";
const UI_LANGUAGE_COOKIE_KEY = "nest.ui.language";
const UI_LANGUAGE_EVENT = "nest:ui-language-change";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function getDefaultUiLanguage(): "en" | "pl" {
  return resolveLanguage(process.env.NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE ?? "en");
}

function getUiLanguageSnapshot(): "en" | "pl" {
  return getStoredUiLanguage() ?? getDefaultUiLanguage();
}

function subscribeToUiLanguage(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleChange = () => callback();

  window.addEventListener(UI_LANGUAGE_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    window.removeEventListener(UI_LANGUAGE_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

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
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${UI_LANGUAGE_COOKIE_KEY}=${resolved}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
    window.dispatchEvent(new CustomEvent(UI_LANGUAGE_EVENT, { detail: resolved }));
  }

  return resolved;
}

export function useUiLanguage(): "en" | "pl" {
  return useSyncExternalStore(subscribeToUiLanguage, getUiLanguageSnapshot, getDefaultUiLanguage);
}
