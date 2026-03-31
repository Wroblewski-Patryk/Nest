import Link from "next/link";
import type { ReactNode } from "react";
import {
  formatLocalizedDateTime,
  resolveAuraVariant,
  resolveLanguage,
  translate,
  type ModuleKey,
} from "@nest/shared-types";
import { moduleReadiness } from "@/lib/mvp-snapshot";

type WorkspaceShellProps = {
  title: string;
  subtitle: string;
  module?: ModuleKey;
  children: ReactNode;
};

export function WorkspaceShell({ title, subtitle, module, children }: WorkspaceShellProps) {
  const language = resolveLanguage(process.env.NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE);
  const auraVariant = resolveAuraVariant(module ?? "tasks");

  return (
    <div className={`workspace-bg aura-${auraVariant}`}>
      <div className="workspace-container">
        <header className="workspace-hero">
          <div className="workspace-brand-row">
            <div className="workspace-brand">
              <p className="workspace-logo">NEST</p>
              <p className="workspace-date">{formatLocalizedDateTime(new Date(), language)}</p>
            </div>
            <p className="workspace-kicker">{translate("app.kicker", language)}</p>
          </div>

          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        <nav className="workspace-nav" aria-label="Core modules">
          {moduleReadiness.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`workspace-tab ${module === item.key ? "is-active" : ""}`}
            >
              <span>{item.label}</span>
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
