"use client";

import { useEffect, useState } from "react";
import { resolveLanguage, translate } from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";
import { getStoredUiLanguage, setStoredUiLanguage } from "@/lib/ui-language";

type LanguageOption = {
  code: "en" | "pl";
  label: string;
};

type PreAuthLanguageSelectorProps = {
  language?: "en" | "pl";
  onLanguageChange?: (language: "en" | "pl") => void;
};

export function PreAuthLanguageSelector({ language, onLanguageChange }: PreAuthLanguageSelectorProps) {
  const initialLanguage = language ?? getStoredUiLanguage() ?? resolveLanguage("en");
  const [options, setOptions] = useState<LanguageOption[]>([
    { code: "en", label: "English" },
    { code: "pl", label: "Polski" },
  ]);
  const [selected, setSelected] = useState<"en" | "pl">(initialLanguage);
  const activeLanguage = language ?? selected;

  useEffect(() => {
    nestApiClient
      .getLocalizationOptions()
      .then((response) => {
        const detected = resolveLanguage(response.data.detected_language);
        const mapped = response.data.supported_languages.map((item) => ({
          code: resolveLanguage(item.code),
          label: item.label,
        }));
        setOptions(mapped);
        const persisted = getStoredUiLanguage();
        const nextLanguage = language ?? persisted ?? detected;
        setSelected(nextLanguage);
        onLanguageChange?.(nextLanguage);
        setStoredUiLanguage(nextLanguage);
      })
      .catch(() => {
        const persisted = getStoredUiLanguage() ?? resolveLanguage("en");
        setSelected(persisted);
        onLanguageChange?.(persisted);
        setStoredUiLanguage(persisted);
      });
  }, [language, onLanguageChange]);

  return (
    <div className="panel-content">
      <p className="callout">
        {translate("auth.language.helper", activeLanguage)}
      </p>
      <label className="mono-note" htmlFor="preauth-language">
        {translate("auth.section.language", activeLanguage)}
      </label>
      <select
        id="preauth-language"
        className="list-row"
        value={activeLanguage}
        onChange={(event) => {
          const nextLanguage = setStoredUiLanguage(event.target.value);
          setSelected(nextLanguage);
          onLanguageChange?.(nextLanguage);
        }}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
