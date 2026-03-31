import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { habitsSnapshot } from "@/lib/mvp-snapshot";

export default function RoutinesPage() {
  return (
    <WorkspaceShell
      title="Routines"
      subtitle="Run structured rituals and repeatable sequences for predictable days."
      module="routines"
    >
      <div className="stack">
        <MetricCard label="Active routines" value={String(habitsSnapshot.routines.length)} />
        <MetricCard label="Planned blocks" value="5" />
        <MetricCard label="Average duration" value="28 min" />
      </div>

      <Panel title="Routine Blocks">
        <ul className="list">
          {habitsSnapshot.routines.map((routine) => (
            <li className="list-row" key={routine.title}>
              <div>
                <strong>{routine.title}</strong>
                <p>{routine.steps} steps</p>
              </div>
              <span className="pill">{routine.duration}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </WorkspaceShell>
  );
}
