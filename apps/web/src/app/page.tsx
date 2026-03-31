import Link from "next/link";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { NotificationChannelMatrixCard } from "@/components/notification-channel-matrix-card";
import { OfflineSyncCard } from "@/components/offline-sync-card";
import { PreAuthLanguageSelector } from "@/components/pre-auth-language-selector";
import { NotificationCenterCard } from "@/components/notification-center-card";
import { moduleReadiness } from "@/lib/mvp-snapshot";

export default function HomePage() {
  return (
    <WorkspaceShell
      title="Web MVP Control Center"
      subtitle="Desktop and mobile web shell for all core planning modules."
      module="tasks"
    >
      <div className="stack">
        <MetricCard label="Modules online" value="7 / 7" />
        <MetricCard label="API baseline" value="Stable" />
        <MetricCard label="Current phase" value="Automation Builder" />
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

      <Panel title="Pre-Auth Language">
        <PreAuthLanguageSelector />
      </Panel>

      <Panel title="Sync Options">
        <OfflineSyncCard />
      </Panel>

      <Panel title="Notification Center">
        <NotificationCenterCard />
      </Panel>

      <Panel title="Notification Preferences">
        <NotificationChannelMatrixCard />
      </Panel>
    </WorkspaceShell>
  );
}
