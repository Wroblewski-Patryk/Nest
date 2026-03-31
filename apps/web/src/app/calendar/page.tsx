import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { ConflictQueueCard } from "@/components/conflict-queue-card";
import { IntegrationHealthCenterCard } from "@/components/integration-health-center-card";
import { ProviderConnectionsCard } from "@/components/provider-connections-card";
import { calendarSnapshot } from "@/lib/mvp-snapshot";

export default function CalendarPage() {
  return (
    <WorkspaceShell
      title="Calendar"
      subtitle="Plan your day with events linked to tasks, goals, and routines."
      module="calendar"
    >
      <div className="stack">
        <MetricCard label="Events today" value={String(calendarSnapshot.length)} />
        <MetricCard label="Linked entities" value="3" />
        <MetricCard label="Time blocked" value="4h 30m" />
      </div>

      <Panel title="Today Timeline">
        <ul className="list">
          {calendarSnapshot.map((entry) => (
            <li className="list-row" key={`${entry.time}-${entry.title}`}>
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.time}</p>
              </div>
              <span className="pill">{entry.type}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Planning Rule">
        <p className="callout">
          Calendar remains a separate module and should aggregate time-bound tasks, habits, and
          routines in one timeline.
        </p>
      </Panel>

      <Panel title="Calendar Commands">
        <p className="callout">
          Calendar command actions are being reworked for direct CRUD behavior, so non-functional
          placeholder buttons were removed from this view.
        </p>
      </Panel>

      <ConflictQueueCard />
      <IntegrationHealthCenterCard />
      <ProviderConnectionsCard />
    </WorkspaceShell>
  );
}
