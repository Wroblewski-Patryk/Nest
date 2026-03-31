import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { ApiConnectCard } from "@/components/api-connect-card";
import { tasksSnapshot } from "@/lib/mvp-snapshot";

export default function TasksPage() {
  return (
    <WorkspaceShell
      title="Tasks + Lists"
      subtitle="Capture commitments, group them by context, and execute with clarity."
      module="tasks"
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

      <Panel
        title="Priority Queue"
        actions={(
          <>
            <button type="button" className="btn-primary">Add Task</button>
            <button type="button" className="btn-secondary">Add List</button>
          </>
        )}
      >
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

      <Panel title="Today Timeline">
        <ul className="list">
          <li className="list-row">
            <div>
              <strong>Morning</strong>
              <p>07:30 - Water + 10-minute meditation</p>
            </div>
            <span className="pill">settled</span>
          </li>
          <li className="list-row">
            <div>
              <strong>Now</strong>
              <p>10:00 - Projekt &quot;Nest&quot; UI Design [G]</p>
            </div>
            <span className="pill state-success">active</span>
          </li>
          <li className="list-row">
            <div>
              <strong>Evening</strong>
              <p>21:00 - Journal reflection checkpoint</p>
            </div>
            <span className="pill">planned</span>
          </li>
        </ul>
      </Panel>

      <ApiConnectCard />
    </WorkspaceShell>
  );
}
