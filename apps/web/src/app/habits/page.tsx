import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { habitsSnapshot } from "@/lib/mvp-snapshot";

export default function HabitsPage() {
  return (
    <WorkspaceShell
      title="Habits"
      subtitle="Track small recurring actions that keep your day stable."
      module="habits"
    >
      <div className="stack">
        <MetricCard label="Habits tracked" value={String(habitsSnapshot.habits.length)} />
        <MetricCard label="Logged this week" value="12" />
        <MetricCard label="Longest streak" value="9 days" />
      </div>

      <Panel title="Habit Snapshot">
        <ul className="list">
          {habitsSnapshot.habits.map((habit) => (
            <li className="list-row" key={habit.title}>
              <div>
                <strong>{habit.title}</strong>
                <p>Cadence: {habit.cadence}</p>
              </div>
              <span className="pill">{habit.streak} day streak</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Module Link">
        <p className="callout">
          Routines now live in a separate module so habits and ritual flows are not mixed in one
          list.
        </p>
      </Panel>
    </WorkspaceShell>
  );
}
