import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { habitsSnapshot } from "@/lib/mvp-snapshot";

export default function HabitsPage() {
  return (
    <WorkspaceShell
      title="Habits + Routines"
      subtitle="Track small consistent actions and package them into repeatable routines."
      module="habits"
    >
      <div className="stack">
        <MetricCard label="Habits tracked" value={String(habitsSnapshot.habits.length)} />
        <MetricCard label="Active routines" value={String(habitsSnapshot.routines.length)} />
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
