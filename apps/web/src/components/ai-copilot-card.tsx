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
    <div className="assistant-copilot-card">
      <div className="assistant-copilot-intro">
        <p className="assistant-copilot-detail">{detail}</p>
      </div>
      <div className="assistant-copilot-composer">
        <textarea
          className="list-row assistant-copilot-textarea"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask about priorities, schedule, habits, goals, or reflection."
        />
      </div>
      <div className="row-inline assistant-copilot-actions">
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
        <div className="assistant-copilot-result">
          <div className="assistant-copilot-status">
            <span className={`pill ${result.provider.mode === "fallback" ? "" : "is-live"}`}>
              {result.provider.mode === "fallback" ? "Fallback guidance" : "Live guidance"}
            </span>
            <small>Snapshot {result.context_snapshot.fingerprint.slice(0, 12)}</small>
          </div>
          <div className="assistant-copilot-answer">
            <strong>Response</strong>
            <p>{result.answer}</p>
          </div>
          <p className="mono-note assistant-copilot-meta">Intent: {result.intent} | Provider: {result.provider.mode}</p>
          <div className="assistant-copilot-sources">
            <div className="assistant-copilot-sources-head">
              <strong>Context sources</strong>
              <small>{Math.min(result.source_references.length, 5)} signals surfaced</small>
            </div>
          <ul className="list assistant-copilot-reference-list">
            {result.source_references.slice(0, 5).map((reference, index) => (
              <li key={`${reference.entity_id ?? "n/a"}-${index}`} className="list-row assistant-copilot-reference-item">
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
        </div>
      ) : null}
    </div>
  );
}
