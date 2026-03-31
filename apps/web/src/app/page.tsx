import Link from "next/link";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { moduleReadiness } from "@/lib/mvp-snapshot";

export default function HomePage() {
  return (
    <WorkspaceShell
      title="Nest LifeOS"
      subtitle="Simple, calm daily planning surface to organize life without friction."
      module="tasks"
    >
      <div className="stack">
        <MetricCard label="Core modules" value={String(moduleReadiness.length)} />
        <MetricCard label="Primary flow" value="Tasks -> Calendar -> Review" />
        <MetricCard label="Default focus" value="Today plan" />
      </div>

      <Panel title="Start Here">
        <p className="callout">
          Start with <strong>Tasks + Lists</strong>, then place time-bound items in{" "}
          <strong>Calendar</strong>. Habits, routines, goals, and targets stay linked as supporting
          modules.
        </p>
      </Panel>

      <Panel title="Core Modules">
        <ul className="list">
          {moduleReadiness.map((module) => (
            <li key={module.href} className="list-row">
              <div>
                <strong>{module.label}</strong>
                <p>{module.focus}</p>
              </div>
              <Link href={module.href} className="pill-link">
                Open
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </WorkspaceShell>
  );
}
