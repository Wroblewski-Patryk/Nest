import Link from "next/link";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { moduleReadiness } from "@/lib/mvp-snapshot";

export default function HomePage() {
  return (
    <WorkspaceShell
      title="Web MVP Control Center"
      subtitle="Desktop and mobile web shell for all core planning modules."
    >
      <div className="stack">
        <MetricCard label="Modules online" value="6 / 6" />
        <MetricCard label="API baseline" value="Stable" />
        <MetricCard label="Current phase" value="Insights Delivery" />
      </div>

      <Panel title="Module Coverage">
        <ul className="list">
          {moduleReadiness.map((module) => (
            <li key={module.href} className="list-row">
              <div>
                <strong>{module.label}</strong>
                <p>{module.focus}</p>
                <p className="mono-note">Telemetry: {module.telemetry}</p>
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
