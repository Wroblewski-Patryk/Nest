import Link from "next/link";
import type { ReactNode } from "react";

type HeroMetric = {
  label: string;
  value: string;
  emphasis?: "default" | "accent";
  icon?: ReactNode;
};

type FocusCardMeta = {
  label: string;
  value: string;
};

type FocusCardProps = {
  kicker: string;
  kickerIcon?: ReactNode;
  title: string;
  detail: string;
  supportingLabel?: string;
  supportingValue?: string;
  href: string;
  cta: string;
  rationaleHref?: string;
  rationaleLabel?: string;
  meta?: FocusCardMeta[];
  secondaryAction?: ReactNode;
};

type HeroBandProps = {
  brand?: string;
  dateLabel?: string;
  weatherLabel?: string;
  title: string;
  summary: string;
  progressLabel: string;
  progressPercent: number;
  metrics: HeroMetric[];
};

type DayFlowItem = {
  id: string;
  label: string;
  detail: string;
  timeLabel: string;
};

type DayFlowProps = {
  morningItems: DayFlowItem[];
  nowItem: DayFlowItem | null;
  eveningItems: DayFlowItem[];
  footerHref: string;
  footerLabel: string;
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

type ReflectionSidebarCardProps = {
  title: string;
  excerpt: string;
  prompt: string;
  href: string;
};

type QuickAddItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

type QuickAddCardProps = {
  items: QuickAddItem[];
};

type BalanceMiniCardProps = {
  value: number;
  items: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  href: string;
};

type InsightStripProps = {
  title: string;
  quote: string;
  href: string;
  cta: string;
};

function CircularProgress({ value }: { value: number }) {
  const degrees = Math.max(0, Math.min(100, value)) * 3.6;

  return (
    <div
      className="dashboard-progress-ring"
      style={{ background: `conic-gradient(var(--accent) 0deg ${degrees}deg, rgb(228 224 215 / 92%) ${degrees}deg 360deg)` }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div className="dashboard-progress-ring-inner">
        <strong>{value}%</strong>
        <span>Daily progress</span>
      </div>
      <div className="dashboard-progress-ring-leaf" aria-hidden="true" />
    </div>
  );
}

export function DashboardHeroBand({
  brand,
  dateLabel,
  weatherLabel,
  title,
  summary,
  progressLabel,
  progressPercent,
  metrics,
}: HeroBandProps) {
  const showHeroHeader = Boolean(brand || dateLabel || weatherLabel);
  const showProgressLabel = Boolean(progressLabel) && progressLabel !== summary;

  return (
    <article className="dashboard-hero-band">
      {showHeroHeader ? (
        <div className="dashboard-hero-header">
          {brand ? <span className="dashboard-hero-kicker">{brand}</span> : <span />}
          <div className="dashboard-hero-utility">
            {dateLabel ? <span>{dateLabel}</span> : null}
            {weatherLabel ? <small>{weatherLabel}</small> : null}
          </div>
        </div>
      ) : null}

      <div className="dashboard-hero-scene">
        <CircularProgress value={progressPercent} />

        <div className="dashboard-hero-story">
          <strong>{title}</strong>
          <p>{summary}</p>
          {showProgressLabel ? <small>{progressLabel}</small> : null}
        </div>

        <ul className="dashboard-hero-stat-row" aria-label="Daily dashboard metrics">
          {metrics.map((metric) => (
            <li key={metric.label} className={`dashboard-hero-stat ${metric.emphasis === "accent" ? "is-accent" : ""}`}>
              <span className="dashboard-hero-stat-icon" aria-hidden="true">
                {metric.icon}
              </span>
              <div>
                <strong>{metric.value}</strong>
                <small>{metric.label}</small>
              </div>
            </li>
          ))}
        </ul>

        <div className="dashboard-hero-landscape" aria-hidden="true">
          <span className="dashboard-sun-wash" />
          <span className="dashboard-mountain-back" />
          <span className="dashboard-mountain-front" />
          <span className="dashboard-tree-wash" />
        </div>
      </div>
    </article>
  );
}

export function DashboardFocusCard({
  kicker,
  kickerIcon,
  title,
  detail,
  supportingLabel,
  supportingValue,
  href,
  cta,
  rationaleHref,
  rationaleLabel,
  meta,
  secondaryAction,
}: FocusCardProps) {
  return (
    <article className="dashboard-focus-card">
      <div className="dashboard-focus-copy">
        <p className="dashboard-focus-kicker">
          {kickerIcon ? <span className="dashboard-focus-kicker-icon" aria-hidden="true">{kickerIcon}</span> : null}
          <span>{kicker}</span>
        </p>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>

      {meta?.length ? (
        <div className="dashboard-focus-meta" aria-label="Focus metadata">
          {meta.map((item) => (
            <div key={item.label} className="dashboard-focus-meta-item">
              <small>{item.label}</small>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      ) : null}

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

      {rationaleHref && rationaleLabel ? (
        <Link href={rationaleHref} className="dashboard-rationale-link">
          {rationaleLabel}
        </Link>
      ) : null}
    </article>
  );
}

function TimelineList({ items }: { items: DayFlowItem[] }) {
  if (items.length === 0) {
    return <p className="dashboard-dayflow-empty">Nothing anchored here yet.</p>;
  }

  return (
    <ul className="dashboard-dayflow-list">
      {items.map((item) => (
        <li key={item.id} className="dashboard-dayflow-list-item">
          <span className="dashboard-dayflow-check" aria-hidden="true" />
          <span className="dashboard-dayflow-time">{item.timeLabel}</span>
          <div>
            <strong>{item.label}</strong>
            <small>{item.detail}</small>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DashboardDayFlow({ morningItems, nowItem, eveningItems, footerHref, footerLabel }: DayFlowProps) {
  return (
    <section className="dashboard-dayflow">
      <div className="dashboard-dayflow-head">
        <span>Morning</span>
        <strong>Now</strong>
        <span>Evening</span>
      </div>

      <div className="dashboard-dayflow-grid">
        <div className="dashboard-dayflow-lane">
          <TimelineList items={morningItems} />
        </div>

        <div className="dashboard-dayflow-now-column">
          <span className="dashboard-dayflow-now-dot" aria-hidden="true" />
          {nowItem ? (
            <article className="dashboard-dayflow-now-card">
              <small>{nowItem.timeLabel}</small>
              <strong>{nowItem.label}</strong>
              <p>{nowItem.detail}</p>
            </article>
          ) : (
            <article className="dashboard-dayflow-now-card is-empty">
              <small>Now</small>
              <strong>Space is still open.</strong>
              <p>Protect this slot for the next meaningful action.</p>
            </article>
          )}
        </div>

        <div className="dashboard-dayflow-lane">
          <TimelineList items={eveningItems} />
        </div>
      </div>

      <Link href={footerHref} className="dashboard-dayflow-footer">
        {footerLabel}
      </Link>
    </section>
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

export function ReflectionSidebarCard({ title, excerpt, prompt, href }: ReflectionSidebarCardProps) {
  return (
    <article className="dashboard-sidebar-card dashboard-sidebar-card-journal">
      <div className="dashboard-sidebar-card-head">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H19v18H8.5A2.5 2.5 0 0 0 6 23V5.5Z" stroke="currentColor" strokeWidth="1.7" />
            <path d="M9.5 8.5H16M9.5 12H16M9.5 15.5H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <span>Journal</span>
        </h3>
        <span>...</span>
      </div>
      <strong className="dashboard-sidebar-card-title">{title}</strong>
      <p className="dashboard-sidebar-card-script">{excerpt}</p>
      <div className="dashboard-sidebar-card-footer">
        <span>{prompt}</span>
        <Link href={href} className="dashboard-floating-action" aria-label="Open journal">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 18h3.2l8.5-8.5a1.7 1.7 0 0 0 0-2.4l-.8-.8a1.7 1.7 0 0 0-2.4 0L6 14.8V18Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="m13.2 7.8 3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

export function QuickAddCard({ items }: QuickAddCardProps) {
  return (
    <article className="dashboard-sidebar-card">
      <div className="dashboard-sidebar-card-head">
        <h3>Quick add</h3>
      </div>
      <div className="dashboard-quick-add-grid">
        {items.map((item) => (
          <Link key={item.label} href={item.href} className="dashboard-quick-add-tile">
            <span className="dashboard-quick-add-icon" aria-hidden="true">
              {item.icon}
            </span>
            <small>{item.label}</small>
          </Link>
        ))}
      </div>
    </article>
  );
}

export function BalanceMiniCard({ items, href }: BalanceMiniCardProps) {
  const gradient = items
    .map((item, index) => {
      const start = (index / Math.max(items.length, 1)) * 360;
      const end = ((index + 1) / Math.max(items.length, 1)) * 360;
      return `${item.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <article className="dashboard-sidebar-card">
      <div className="dashboard-sidebar-card-head">
        <h3>Life areas</h3>
        <Link href={href}>View all</Link>
      </div>

      <div className="dashboard-balance-grid">
        <div className="dashboard-balance-donut" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="dashboard-balance-donut-inner" aria-hidden="true" />
        </div>

        <ul className="dashboard-balance-legend">
          {items.map((item) => (
            <li key={item.label}>
              <span className="dashboard-balance-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
              <small>{item.label}</small>
              <strong>{item.value.toFixed(1)}</strong>
            </li>
          ))}
        </ul>
      </div>

      <p className="dashboard-balance-caption">Monthly balance overview</p>
    </article>
  );
}

export function InsightStrip({ title, quote, href, cta }: InsightStripProps) {
  return (
    <section className="dashboard-insight-strip">
      <div className="dashboard-insight-strip-title">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 2.8v3M12 18.2v3M21.2 12h-3M5.8 12h-3M18.6 5.4l-2.1 2.1M7.5 16.5l-2.1 2.1M18.6 18.6l-2.1-2.1M7.5 7.5 5.4 5.4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <span>{title}</span>
      </div>
      <p>{quote}</p>
      <Link href={href}>{cta}</Link>
    </section>
  );
}
