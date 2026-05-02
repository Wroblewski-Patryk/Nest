"use client";

import { useState } from "react";
import type { AiCopilotConversationResponse } from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";
import { useTranslator } from "@/lib/ui-language";

type LoadState = "idle" | "loading" | "success" | "error";

export function AiCopilotCard() {
  const t = useTranslator();
  const [state, setState] = useState<LoadState>("idle");
  const [message, setMessage] = useState(t("web.ai_copilot.default_message", "Help me plan the next 3 high-impact actions."));
  const [detail, setDetail] = useState(t("web.ai_copilot.initial_detail", "Ask the copilot about planning, execution, or reflection."));
  const [result, setResult] = useState<AiCopilotConversationResponse["data"] | null>(null);

  const submit = async () => {
    if (!message.trim()) {
      setDetail(t("web.ai_copilot.validation.message_required", "Type a question before sending."));
      return;
    }

    setState("loading");
    setDetail(t("web.ai_copilot.feedback.preparing", "Preparing a Copilot answer..."));

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
          ? t("web.ai_copilot.feedback.fallback", "Primary AI provider is unavailable, so a fallback answer was returned.")
          : t("web.ai_copilot.feedback.ready", "Copilot answer is ready.")
      );
    } catch {
      setState("error");
      setDetail(t("web.ai_copilot.feedback.error", "We couldn't reach Copilot right now. Please try again in a moment."));
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
          placeholder={t("web.ai_copilot.placeholder", "Ask about priorities, schedule, habits, goals, or reflection.")}
        />
      </div>
      <div className="row-inline assistant-copilot-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => void submit()}
          disabled={state === "loading"}
        >
          {state === "loading" ? t("web.ai_copilot.action.thinking", "Thinking...") : t("web.ai_copilot.action.ask", "Ask Copilot")}
        </button>
      </div>
      {!result ? (
        <div className="assistant-copilot-idle">
          <div className="assistant-copilot-idle-head">
            <strong>{t("web.ai_copilot.idle.title", "Good prompts feel grounded.")}</strong>
            <small>{t("web.ai_copilot.idle.subtitle", "Bring one tension, one decision, or one messy signal.")}</small>
          </div>
          <div className="assistant-copilot-idle-grid">
            <article className="assistant-copilot-idle-card">
              <small>{t("web.planning.title", "Planning")}</small>
              <p>{t("web.ai_copilot.idle.planning", "Ask what deserves your cleanest energy before the day gets noisy.")}</p>
            </article>
            <article className="assistant-copilot-idle-card">
              <small>{t("web.ai_copilot.idle.execution_label", "Execution")}</small>
              <p>{t("web.ai_copilot.idle.execution", "Ask what to protect, postpone, or simplify so movement feels lighter.")}</p>
            </article>
            <article className="assistant-copilot-idle-card">
              <small>{t("web.journal.field.reflection", "Reflection")}</small>
              <p>{t("web.ai_copilot.idle.reflection", "Ask the room to turn scattered impressions into one honest sentence.")}</p>
            </article>
          </div>
        </div>
      ) : null}
      {result ? (
        <div className="assistant-copilot-result">
          <div className="assistant-copilot-status">
            <span className={`pill ${result.provider.mode === "fallback" ? "" : "is-live"}`}>
              {result.provider.mode === "fallback" ? t("web.ai_copilot.status.fallback", "Fallback guidance") : t("web.ai_copilot.status.live", "Live guidance")}
            </span>
            <small>{t("web.ai_copilot.meta.snapshot", "Snapshot")} {result.context_snapshot.fingerprint.slice(0, 12)}</small>
          </div>
          <div className="assistant-copilot-answer">
            <strong>{t("web.ai_copilot.result.response", "Response")}</strong>
            <p>{result.answer}</p>
          </div>
          <p className="mono-note assistant-copilot-meta">{t("web.ai_copilot.meta.intent", "Intent")}: {result.intent} | {t("web.ai_copilot.meta.provider", "Provider")}: {result.provider.mode}</p>
          <div className="assistant-copilot-sources">
            <div className="assistant-copilot-sources-head">
              <strong>{t("web.ai_copilot.sources.title", "Context sources")}</strong>
              <small>{Math.min(result.source_references.length, 5)} {t("web.ai_copilot.sources.signals", "signals surfaced")}</small>
            </div>
          <ul className="list assistant-copilot-reference-list">
            {result.source_references.slice(0, 5).map((reference, index) => (
              <li key={`${reference.entity_id ?? "n/a"}-${index}`} className="list-row assistant-copilot-reference-item">
                <div>
                  <strong>{reference.title ?? t("web.ai_copilot.sources.untitled", "Untitled")}</strong>
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
