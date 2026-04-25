"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveLanguage, translate } from "@nest/shared-types";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";
import { setOnboardingRequired } from "@/lib/auth-session";
import { getStoredUiLanguage, setStoredUiLanguage } from "@/lib/ui-language";

export default function OnboardingPage() {
  const router = useRouter();
  const initialLanguage = getStoredUiLanguage() ?? resolveLanguage("en");
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState<"en" | "pl">(initialLanguage);
  const [detail, setDetail] = useState(translate("onboarding.feedback.default", initialLanguage));
  const experiment = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        experimentKey: "onboarding-copy-v2",
        variantKey: "control",
      };
    }

    const query = new URLSearchParams(window.location.search);

    return {
      experimentKey: query.get("onboarding_experiment") ?? "onboarding-copy-v2",
      variantKey: query.get("onboarding_variant") ?? "control",
    };
  }, []);

  useEffect(() => {
    void nestApiClient.trackAnalyticsExperimentHook({
      context: "onboarding",
      action: "exposed",
      experiment_key: experiment.experimentKey,
      variant_key: experiment.variantKey,
      platform: "web",
      properties: {
        surface: "onboarding_page",
      },
    }).catch(() => undefined);
  }, [experiment.experimentKey, experiment.variantKey]);

  const submit = async () => {
    try {
      await nestApiClient.completeOnboarding({
        display_name: displayName,
        language,
      });
      void nestApiClient.trackAnalyticsExperimentHook({
        context: "onboarding",
        action: "converted",
        experiment_key: experiment.experimentKey,
        variant_key: experiment.variantKey,
        platform: "web",
        properties: {
          surface: "onboarding_page",
          language,
        },
      }).catch(() => undefined);
      setOnboardingRequired(false);
      setStoredUiLanguage(language);
      setDetail(translate("onboarding.feedback.success", language));
      router.replace("/dashboard");
    } catch {
      setDetail(translate("onboarding.error.generic", language));
    }
  };

  return (
    <WorkspaceShell
      title={translate("onboarding.title", language)}
      subtitle={translate("onboarding.subtitle", language)}
      module="journal"
    >
      <div className="stack">
        <MetricCard label={translate("onboarding.required.display_name", language)} value="display_name" />
        <MetricCard label={translate("onboarding.required.language", language)} value="language" />
        <MetricCard
          label={translate("onboarding.apply_mode", language)}
          value={translate("onboarding.apply_mode.value", language)}
        />
      </div>

      <Panel title={translate("onboarding.panel.title", language)}>
        <div className="panel-content">
          <label className="mono-note" htmlFor="display-name">
            {translate("onboarding.field.display_name", language)}
          </label>
          <input
            id="display-name"
            className="list-row"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <label className="mono-note" htmlFor="language">
            {translate("onboarding.field.language", language)}
          </label>
          <select
            id="language"
            className="list-row"
            value={language}
            onChange={(event) => {
              const nextLanguage = setStoredUiLanguage(event.target.value);
              setLanguage(nextLanguage);
              setDetail(translate("onboarding.feedback.default", nextLanguage));
            }}
          >
            <option value="en">English</option>
            <option value="pl">Polski</option>
          </select>
          <button
            type="button"
            className="btn-primary"
            onClick={() => void submit()}
            disabled={displayName.trim().length === 0}
          >
            {translate("onboarding.action.continue", language)}
          </button>
          <p className="callout">{detail}</p>
        </div>
      </Panel>
    </WorkspaceShell>
  );
}
