"use client";

import Link from "next/link";
import { AiCopilotCard } from "@/components/ai-copilot-card";
import { Panel, WorkspaceShell } from "@/components/workspace-shell";

const CONTEXT_REFERENCES = [
  {
    title: "Daily planning",
    detail: "Ask for the next 3 most meaningful actions across tasks, calendar, and goals.",
  },
  {
    title: "Focus support",
    detail: "Use the assistant to shape one clean work block before your day fragments.",
  },
  {
    title: "Reflection support",
    detail: "Turn scattered thoughts into a calmer journal reflection or weekly summary.",
  },
];

const SUGGESTED_PROMPTS = [
  "Help me choose one high-impact focus for today.",
  "Review my commitments and tell me what to postpone.",
  "Turn today's signals into a short evening reflection.",
];

const ASSISTANT_PRINCIPLES = [
  "Clarity before complexity",
  "Protect what matters now",
  "Reflect without judgment",
];

const ASSISTANT_ROOM_SIGNALS = [
  "The best prompt is usually one honest question, not five clever ones.",
  "If the day feels crowded, ask what can safely become later.",
  "If your energy feels scattered, ask for a smaller truer next move.",
];

export default function AssistantPage() {
  return (
    <WorkspaceShell
      title="Assistant"
      subtitle="A calm room for planning, execution support, and reflective clarity."
      navKey="assistant"
      module="insights"
      contentLayout="single"
      shellTone="dashboard-canonical"
      utilityDateLabel="Friday, May 23, 2025"
      utilityWeatherLabel="18°C"
      hideRailFooterActions
    >
      <section className="assistant-shell">
        <div className="assistant-layout">
          <Panel
            title="Nest Assistant"
            className="assistant-panel assistant-panel-primary"
            actions={<span className="dashboard-panel-kicker">Planning / Execution / Reflection</span>}
          >
            <div className="assistant-stage">
              <div className="assistant-intro">
                <p>
                  This space should feel like another room in Nest, not a bolted-on tool. Ask for direction, clarity,
                  prioritization, or a cleaner next step.
                </p>
              </div>
              <blockquote className="assistant-quote">
                <p>Ask for the smallest truthful next step, then let the rest quiet down.</p>
              </blockquote>
              <div className="assistant-room-signals">
                {ASSISTANT_ROOM_SIGNALS.map((item) => (
                  <span key={item} className="assistant-room-signal">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <AiCopilotCard />
          </Panel>

          <div className="assistant-support-column">
            <Panel title="Suggested prompts" className="assistant-panel assistant-panel-support">
              <ul className="assistant-prompt-list">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <li key={prompt} className="assistant-prompt-item">
                    <span>{prompt}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Context references" className="assistant-panel assistant-panel-support">
              <ul className="assistant-reference-list">
                {CONTEXT_REFERENCES.map((item) => (
                  <li key={item.title} className="assistant-reference-item">
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Open modules" className="assistant-panel assistant-panel-support">
              <div className="assistant-module-links">
                <Link href="/dashboard" className="dashboard-inline-link">
                  Return to Dashboard
                </Link>
                <Link href="/tasks" className="dashboard-inline-link">
                  Open Planning
                </Link>
                <Link href="/journal" className="dashboard-inline-link">
                  Open Journal
                </Link>
              </div>
            </Panel>

            <Panel title="Conversation principles" className="assistant-panel assistant-panel-support">
              <ul className="assistant-principle-list">
                {ASSISTANT_PRINCIPLES.map((item) => (
                  <li key={item} className="assistant-principle-item">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </section>
    </WorkspaceShell>
  );
}
