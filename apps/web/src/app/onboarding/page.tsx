"use client";

import { useState } from "react";
import { resolveLanguage } from "@nest/shared-types";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState("");
  const [language, setLanguage] = useState<"en" | "pl">(resolveLanguage("en"));
  const [detail, setDetail] = useState("Complete onboarding with language and display name.");

  const submit = async () => {
    try {
      await nestApiClient.completeOnboarding({
        display_name: displayName,
        language,
      });
      setDetail("Onboarding completed. Preferences applied immediately.");
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
    <WorkspaceShell title="Onboarding" subtitle="Set display name and language before entering dashboard.">
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
          <button type="button" className="btn-primary" onClick={() => void submit()} disabled={displayName.trim().length === 0}>
            Continue
          </button>
          <p className="callout">{detail}</p>
        </div>
      </Panel>
    </WorkspaceShell>
  );
}
