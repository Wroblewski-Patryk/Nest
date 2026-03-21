const SUPPORTED_LANGUAGES = ["en", "pl"];

const DEFAULT_LOCALES = {
  en: "en-US",
  pl: "pl-PL",
};

const DICTIONARY = {
  en: {
    "app.kicker": "Nest LifeOS MVP",
  },
  pl: {
    "app.kicker": "Nest LifeOS MVP",
  },
};

export function resolveLanguage(value) {
  if (typeof value === "string" && SUPPORTED_LANGUAGES.includes(value)) {
    return value;
  }

  return "en";
}

export function resolveLocale(language, override) {
  if (typeof override === "string" && override.length > 0) {
    return override;
  }

  const safeLanguage = resolveLanguage(language);
  return DEFAULT_LOCALES[safeLanguage];
}

export function translate(key, language, fallback = key) {
  const safeLanguage = resolveLanguage(language);
  return DICTIONARY[safeLanguage]?.[key] ?? DICTIONARY.en?.[key] ?? fallback;
}

export function formatLocalizedDateTime(value, language, localeOverride) {
  const locale = resolveLocale(language, localeOverride);
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
