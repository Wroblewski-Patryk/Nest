"use client";

import { useState } from "react";
import type { AiCopilotConversationResponse } from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";

type LoadState = "idle" | "loading" | "success" | "error";

export function AiCopilotCard() {
  const [state, setState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("Help me plan the next 3 high-impact actions.");
  const [detail, setDetail] = useState("Ask the copilot about planning, execution, or reflection.");
  const [result, setResult] = useState<AiCopilotConversationResponse["data"] | null>(null);

  const submit = async () => {
    if (!message.trim()) {
      setDetail("Type a question before sending.");
      return;
    }

    setState("loading");
    setDetail("Preparing a Copilot answer...");

    try {
      const response = await nestApiClient.askAiCopilot({
        message: message.trim(),
        context: {
          window_days: 14,
          entity_limit: 12,
        },
      });
      setResult(response.data);
      setState("success");
      setDetail(
        response.data.provider.mode === "fallback"
          ? "Primary AI provider is unavailable, so a fallback answer was returned."
          : "Copilot answer is ready."
      );
    } catch {
      setState("error");
      setDetail("We couldn't reach Copilot right now. Please try again in a moment.");
    }
  };

  return (
    <div className="stack">
      <p className="mono-note">{detail}</p>
      <textarea
        className="list-row"
        rows={3}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Ask about priorities, schedule, habits, goals, or reflection."
      />
      <div className="row-inline">
        <button
          type="button"
          className="btn-primary"
          onClick={() => void submit()}
          disabled={state === "loading"}
        >
          {state === "loading" ? "Thinking..." : "Ask Copilot"}
        </button>
      </div>
      {result ? (
        <div className="stack">
          <p>{result.answer}</p>
          <p className="mono-note">
            Intent: {result.intent} | Provider: {result.provider.mode} | Snapshot:{" "}
            {result.context_snapshot.fingerprint.slice(0, 12)}
          </p>
          <ul className="list">
            {result.source_references.slice(0, 5).map((reference, index) => (
              <li key={`${reference.entity_id ?? "n/a"}-${index}`} className="list-row">
                <div>
                  <strong>{reference.title ?? "Untitled"}</strong>
                  <p className="mono-note">
                    {reference.module} | {reference.entity_type} | {reference.entity_id ?? "n/a"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
