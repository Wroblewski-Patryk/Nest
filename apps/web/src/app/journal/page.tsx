import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { journalSnapshot } from "@/lib/mvp-snapshot";

export default function JournalPage() {
  return (
    <WorkspaceShell
      title="Journal + Life Areas"
      subtitle="Capture reflections and tag entries to maintain life-area balance awareness."
      module="journal"
    >
      <div className="stack">
        <MetricCard label="Entries this week" value={String(journalSnapshot.entries.length)} />
        <MetricCard label="Life areas tracked" value={String(journalSnapshot.lifeAreas.length)} />
        <MetricCard label="Mood trend" value="Positive" />
      </div>

      <Panel title="Journal Entries">
        <ul className="list">
          {journalSnapshot.entries.map((entry) => (
            <li className="list-row" key={entry.title}>
              <div>
                <strong>{entry.title}</strong>
                <p>{entry.lifeAreas}</p>
              </div>
              <span className="pill">{entry.mood}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Quick Reflection">
        <div className="row-inline">
          <span className="pill">Szybki wpis</span>
          <span className="pill">Nastroje</span>
          <span className="pill">Wdzięczność</span>
        </div>
        <p className="callout">Use short tags to keep reflection lightweight and daily-friendly.</p>
      </Panel>

      <Panel title="Life Area Balance">
        <ul className="list">
          {journalSnapshot.lifeAreas.map((area) => (
            <li className="list-row" key={area.name}>
              <strong>{area.name}</strong>
              <span className="pill">{area.weight}%</span>
            </li>
          ))}
        </ul>
      </Panel>
    </WorkspaceShell>
  );
}
