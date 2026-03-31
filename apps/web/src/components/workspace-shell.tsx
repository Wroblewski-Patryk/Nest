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

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  key: ModuleKey;
  short: string;
}> = [
  { href: "/tasks", label: "Tasks + Lists", key: "tasks", short: "TL" },
  { href: "/habits", label: "Habits", key: "habits", short: "HB" },
  { href: "/routines", label: "Routines", key: "routines", short: "RT" },
  { href: "/goals", label: "Goals", key: "goals", short: "GL" },
  { href: "/targets", label: "Targets", key: "targets", short: "TG" },
  { href: "/calendar", label: "Calendar", key: "calendar", short: "CL" },
  { href: "/journal", label: "Journal", key: "journal", short: "JR" },
  { href: "/insights", label: "Insights", key: "insights", short: "IN" },
];

export function WorkspaceShell({ title, subtitle, module, children }: WorkspaceShellProps) {
  const language = resolveLanguage(process.env.NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE);
  const auraVariant = resolveAuraVariant(module ?? "tasks");

  return (
    <div className={`workspace-bg aura-${auraVariant}`}>
      <aside className="workspace-rail">
        <div className="workspace-rail-brand">
          <p className="workspace-logo">Nest</p>
          <p className="workspace-kicker">{translate("app.kicker", language)}</p>
        </div>

        <nav className="workspace-rail-nav" aria-label="Core modules">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`workspace-rail-link ${module === item.key ? "is-active" : ""}`}
            >
              <span className="workspace-rail-icon">{item.short}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="workspace-rail-footer">
          <Link href="/settings" className="workspace-settings-link">
            Access Control
          </Link>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-brand">
            <p className="workspace-date">{formatLocalizedDateTime(new Date(), language)}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="workspace-hero-tools">
            <Link href="/tasks" className="btn-primary">
              Quick Add
            </Link>
            <Link href="/settings" className="btn-secondary">
              Settings
            </Link>
          </div>
        </header>

        <nav className="workspace-nav" aria-label="Current cycle modules">
          {moduleReadiness.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`workspace-tab ${module === item.key ? "is-active" : ""}`}
            >
              <span>{item.label}</span>
              <small>{item.state}</small>
            </Link>
          ))}
        </nav>

        <main className="workspace-grid">{children}</main>

        <nav className="workspace-mobile-nav" aria-label="Mobile modules">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <Link
              key={`mobile-${item.href}`}
              href={item.href}
              className={`workspace-mobile-link ${module === item.key ? "is-active" : ""}`}
            >
              <span>{item.short}</span>
            </Link>
          ))}
        </nav>
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
