import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { goalsSnapshot } from "@/lib/mvp-snapshot";

export default function TargetsPage() {
  return (
    <WorkspaceShell
      title="Targets"
      subtitle="Track measurable checkpoints and connect them to goals and lists."
      module="targets"
    >
      <div className="stack">
        <MetricCard label="Targets live" value={String(goalsSnapshot.targets.length)} />
        <MetricCard label="On track" value="1" />
        <MetricCard label="Needs attention" value="1" />
      </div>

      <Panel title="Target Checkpoints">
        <ul className="list">
          {goalsSnapshot.targets.map((target) => (
            <li className="list-row" key={target.title}>
              <strong>{target.title}</strong>
              <span className="pill">{target.value}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </WorkspaceShell>
  );
}
