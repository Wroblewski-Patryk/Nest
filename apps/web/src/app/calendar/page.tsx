import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { ConflictQueueCard } from "@/components/conflict-queue-card";
import { ProviderConnectionsCard } from "@/components/provider-connections-card";
import { calendarSnapshot } from "@/lib/mvp-snapshot";

export default function CalendarPage() {
  return (
    <WorkspaceShell
      title="Calendar"
      subtitle="Plan your day with events linked to tasks, goals, and routines."
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
          Every event can stay internal or reference an existing module entity.
          This screen mirrors backend support for linked task, goal, or routine
          items.
        </p>
      </Panel>

      <Panel
        title="Calendar Commands"
        actions={(
          <>
            <button type="button" className="btn-primary">Add Event</button>
            <button type="button" className="btn-secondary">Force Sync</button>
          </>
        )}
      >
        <p className="callout">
          Use force sync when provider changes should be pulled immediately
          before resolving conflict queue items.
        </p>
      </Panel>

      <ConflictQueueCard />
      <ProviderConnectionsCard />
    </WorkspaceShell>
  );
}
