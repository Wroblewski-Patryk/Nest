"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveLanguage } from "@nest/shared-types";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";
import { setOnboardingRequired } from "@/lib/auth-session";

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState<"en" | "pl">(resolveLanguage("en"));
  const [detail, setDetail] = useState("Complete onboarding with language and display name.");
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
      setDetail("Onboarding completed. Redirecting to dashboard...");
      router.replace("/dashboard");
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status?: unknown }).status === "number"
          ? String((error as { status: number }).status)
          : "n/a";
      setDetail(`Onboarding request failed (HTTP ${status}).`);
    }
  };

  return (
    <WorkspaceShell
      title="Onboarding"
      subtitle="Set display name and language before entering dashboard."
      module="journal"
    >
      <div className="stack">
        <MetricCard label="Required field" value="display_name" />
        <MetricCard label="Required field" value="language" />
        <MetricCard label="Apply mode" value="Immediate" />
      </div>

      <Panel title="Account Setup">
        <div className="panel-content">
          <label className="mono-note" htmlFor="display-name">
            Display name
          </label>
          <input
            id="display-name"
            className="list-row"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <label className="mono-note" htmlFor="language">
            Language
          </label>
          <select
            id="language"
            className="list-row"
            value={language}
            onChange={(event) => setLanguage(resolveLanguage(event.target.value))}
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
            Continue
          </button>
          <p className="callout">{detail}</p>
        </div>
      </Panel>
    </WorkspaceShell>
  );
}
