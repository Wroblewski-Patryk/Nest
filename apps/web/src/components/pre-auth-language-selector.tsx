"use client";

import { useEffect, useState } from "react";
import { resolveLanguage } from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";

type LanguageOption = {
  code: "en" | "pl";
  label: string;
};

export function PreAuthLanguageSelector() {
  const [options, setOptions] = useState<LanguageOption[]>([
    { code: "en", label: "English" },
    { code: "pl", label: "Polski" },
  ]);
  const [selected, setSelected] = useState<"en" | "pl">(resolveLanguage("en"));

  useEffect(() => {
    nestApiClient
      .getLocalizationOptions()
      .then((response) => {
        const detected = resolveLanguage(response.data.detected_language);
        const mapped = response.data.supported_languages.map((item) => ({
          code: resolveLanguage(item.code),
          label: item.label,
        }));
        setSelected(detected);
        setOptions(mapped);
      })
      .catch(() => {
        setSelected(resolveLanguage("en"));
      });
  }, []);

  return (
    <div className="panel-content">
      <p className="callout">
        Pre-auth language selection baseline. Selected language applies to onboarding defaults.
      </p>
      <label className="mono-note" htmlFor="preauth-language">
        Language
      </label>
      <select
        id="preauth-language"
        className="list-row"
        value={selected}
        onChange={(event) => setSelected(resolveLanguage(event.target.value))}
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
