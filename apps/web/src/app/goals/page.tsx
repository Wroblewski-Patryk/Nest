import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { goalsSnapshot } from "@/lib/mvp-snapshot";

export default function GoalsPage() {
  return (
    <WorkspaceShell
      title="Goals + Targets"
      subtitle="Break long-term outcomes into measurable targets and weekly progress."
    >
      <div className="stack">
        <MetricCard label="Active goals" value={String(goalsSnapshot.goals.length)} />
        <MetricCard label="Targets live" value={String(goalsSnapshot.targets.length)} />
        <MetricCard label="Progress pulse" value="70%" />
      </div>

      <Panel title="Goal Timeline">
        <ul className="list">
          {goalsSnapshot.goals.map((goal) => (
            <li className="list-row" key={goal.title}>
              <div>
                <strong>{goal.title}</strong>
                <p>Status: {goal.status}</p>
              </div>
              <span className="pill">{goal.progress}%</span>
            </li>
          ))}
        </ul>
      </Panel>

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
