import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { tasksSnapshot } from "@/lib/mvp-snapshot";

export default function TasksPage() {
  return (
    <WorkspaceShell
      title="Tasks + Lists"
      subtitle="Capture commitments, group them by context, and execute with clarity."
    >
      <div className="stack">
        <MetricCard label="Open tasks" value="9" />
        <MetricCard label="Urgent today" value="1" />
        <MetricCard label="Lists active" value={String(tasksSnapshot.lists.length)} />
      </div>

      <Panel title="Task Lists">
        <ul className="list">
          {tasksSnapshot.lists.map((list) => (
            <li className="list-row" key={list.name}>
              <div className="row-inline">
                <span className="dot" style={{ backgroundColor: list.color }} />
                <strong>{list.name}</strong>
              </div>
              <p>{list.count} tasks</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Priority Queue">
        <ul className="list">
          {tasksSnapshot.items.map((task) => (
            <li className="list-row" key={task.title}>
              <div>
                <strong>{task.title}</strong>
                <p>Due: {task.due}</p>
              </div>
              <span className="pill">{task.priority}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </WorkspaceShell>
  );
}
