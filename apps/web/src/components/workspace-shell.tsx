import Link from "next/link";
import type { ReactNode } from "react";
import { moduleReadiness } from "@/lib/mvp-snapshot";
import { STATE_LABELS } from "@/lib/ux-contract";

type WorkspaceShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function WorkspaceShell({ title, subtitle, children }: WorkspaceShellProps) {
  return (
    <div className="workspace-bg">
      <div className="workspace-container">
        <header className="workspace-hero">
          <p className="workspace-kicker">Nest LifeOS MVP</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        <nav className="workspace-nav" aria-label="MVP modules">
          {moduleReadiness.map((module) => (
            <Link key={module.href} href={module.href} className="workspace-tab">
              <span>{module.label}</span>
              <small>{STATE_LABELS[module.state]}</small>
            </Link>
          ))}
        </nav>

        <main className="workspace-grid">{children}</main>
      </div>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

type PanelProps = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function Panel({ title, actions, children }: PanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        {actions ? <div className="panel-actions">{actions}</div> : null}
      </div>
      <div className="panel-content">{children}</div>
    </section>
  );
}
