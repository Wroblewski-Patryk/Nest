import Link from "next/link";
import type { ReactNode } from "react";

type HeroMetric = {
  label: string;
  value: string;
  emphasis?: "default" | "accent";
};

type FocusCardProps = {
  kicker: string;
  title: string;
  detail: string;
  supportingLabel?: string;
  supportingValue?: string;
  href: string;
  cta: string;
  secondaryAction?: ReactNode;
};

type HeroBandProps = {
  brand: string;
  dateLabel: string;
  title: string;
  summary: string;
  progressLabel: string;
  progressPercent: number;
  metrics: HeroMetric[];
};

type TimelineGroupProps = {
  title: string;
  subtitle: string;
  items: Array<{
    id: string;
    label: string;
    detail: string;
    timeLabel: string;
    isNow?: boolean;
  }>;
  emptyLabel: string;
};

type ContextRibbonItem = {
  label: string;
  value: string;
  detail: string;
  href?: string;
};

type ContextRibbonProps = {
  title: string;
  items: ContextRibbonItem[];
};

export function DashboardHeroBand({
  brand,
  dateLabel,
  title,
  summary,
  progressLabel,
  progressPercent,
  metrics,
}: HeroBandProps) {
  return (
    <article className="dashboard-hero-band">
      <div className="dashboard-hero-header">
        <div className="dashboard-hero-copy">
          <p className="dashboard-hero-brand">{brand}</p>
          <p className="dashboard-hero-date">{dateLabel}</p>
        </div>
        <div className="dashboard-hero-progress-pill">
          <span>{progressPercent}%</span>
          <small>complete</small>
        </div>
      </div>

      <div className="dashboard-hero-body">
        <div className="dashboard-hero-story">
          <h2>{title}</h2>
          <p>{summary}</p>
        </div>

        <div className="dashboard-hero-progress">
          <div className="dashboard-hero-progress-copy">
            <span>{progressLabel}</span>
            <strong>{progressPercent}%</strong>
          </div>
          <div
            className="dashboard-progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
          >
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <ul className="dashboard-hero-metrics" aria-label="Daily dashboard metrics">
        {metrics.map((metric) => (
          <li key={metric.label} className={`dashboard-hero-metric ${metric.emphasis === "accent" ? "is-accent" : ""}`}>
            <small>{metric.label}</small>
            <strong>{metric.value}</strong>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function DashboardFocusCard({
  kicker,
  title,
  detail,
  supportingLabel,
  supportingValue,
  href,
  cta,
  secondaryAction,
}: FocusCardProps) {
  return (
    <article className="dashboard-focus-card">
      <div className="dashboard-focus-copy">
        <p className="dashboard-focus-kicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>

      {supportingLabel && supportingValue ? (
        <div className="dashboard-focus-support">
          <small>{supportingLabel}</small>
          <strong>{supportingValue}</strong>
        </div>
      ) : null}

      <div className="dashboard-focus-actions">
        <Link href={href} className="btn-primary">
          {cta}
        </Link>
        {secondaryAction}
      </div>
    </article>
  );
}

export function DashboardTimelineGroup({ title, subtitle, items, emptyLabel }: TimelineGroupProps) {
  return (
    <article className="dashboard-timeline-group">
      <header>
        <p>{title}</p>
        <small>{subtitle}</small>
      </header>

      {items.length === 0 ? (
        <p className="dashboard-timeline-empty">{emptyLabel}</p>
      ) : (
        <ul className="dashboard-timeline-list">
          {items.map((item) => (
            <li key={item.id} className={`dashboard-timeline-item ${item.isNow ? "is-now" : ""}`}>
              <span className="dashboard-timeline-time">{item.timeLabel}</span>
              <div>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function DashboardContextRibbon({ title, items }: ContextRibbonProps) {
  return (
    <section className="dashboard-context-ribbon" aria-label={title}>
      <div className="dashboard-context-title">
        <p>{title}</p>
        <span>Quiet system context</span>
      </div>

      <div className="dashboard-context-grid">
        {items.map((item) => {
          const content = (
            <>
              <small>{item.label}</small>
              <strong>{item.value}</strong>
              <span>{item.detail}</span>
            </>
          );

          if (item.href) {
            return (
              <Link key={item.label} href={item.href} className="dashboard-context-item">
                {content}
              </Link>
            );
          }

          return (
            <article key={item.label} className="dashboard-context-item">
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
