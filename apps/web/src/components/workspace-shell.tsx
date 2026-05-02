"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { resolveAuraVariant, resolveLocale, translate, type ModuleKey, type SupportedLanguage } from "@nest/shared-types";
import { WorkspaceLogoutButton } from "@/components/workspace-logout-button";
import { useUiLanguage } from "@/lib/ui-language";

type WorkspaceNavKey = ModuleKey | "dashboard" | "settings" | "assistant";
type PlanningSubnavKey = "tasks" | "lists" | "targets" | "goals";
type MobileNavKey = "dashboard" | "tasks" | "calendar" | "journal" | "settings";

type WorkspaceShellProps = {
  title: string;
  subtitle: string;
  language?: SupportedLanguage;
  module?: ModuleKey;
  navKey?: WorkspaceNavKey | "none";
  contentLayout?: "single" | "grid";
  shellTone?: "default" | "dashboard-canonical";
  utilityDateLabel?: string;
  utilityWeatherLabel?: string;
  hideAssistantNav?: boolean;
  hideRailFooterActions?: boolean;
  planningSubnav?: {
    active: PlanningSubnavKey;
  };
  children: ReactNode;
};

type NavIconName =
  | "dashboard"
  | "tasks"
  | "habits"
  | "routines"
  | "goals"
  | "targets"
  | "calendar"
  | "journal"
  | "life_areas"
  | "insights"
  | "assistant"
  | "settings";

const CORE_NAV_ITEMS: Array<{
  href: string;
  label: string;
  key: WorkspaceNavKey;
  icon: NavIconName;
}> = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard", icon: "dashboard" },
  { href: "/tasks", label: "Planning", key: "tasks", icon: "tasks" },
  { href: "/calendar", label: "Calendar", key: "calendar", icon: "calendar" },
  { href: "/journal", label: "Journal", key: "journal", icon: "journal" },
  { href: "/settings", label: "Settings", key: "settings", icon: "settings" },
];

const OPTIONAL_NAV_ITEMS: Array<{
  href: string;
  label: string;
  key: WorkspaceNavKey;
  icon: NavIconName;
}> = [
  { href: "/insights", label: "Insights", key: "insights", icon: "insights" },
  { href: "/assistant", label: "Assistant", key: "assistant", icon: "assistant" },
];

const PLANNING_SUBNAV_ITEMS: Array<{
  key: PlanningSubnavKey;
  label: string;
  href: string;
}> = [
  { key: "tasks", label: "Tasks", href: "/tasks?tab=tasks" },
  { key: "lists", label: "Lists", href: "/tasks?tab=lists" },
  { key: "targets", label: "Targets", href: "/tasks?tab=targets" },
  { key: "goals", label: "Goals", href: "/tasks?tab=goals" },
];

const MOBILE_NAV_ITEMS: Array<{
  href: string;
  label: string;
  key: MobileNavKey;
  icon: NavIconName;
}> = [
  { href: "/dashboard", label: "Dashboard", key: "dashboard", icon: "dashboard" },
  { href: "/tasks", label: "Planning", key: "tasks", icon: "tasks" },
  { href: "/calendar", label: "Calendar", key: "calendar", icon: "calendar" },
  { href: "/journal", label: "Journal", key: "journal", icon: "journal" },
  { href: "/settings", label: "Settings", key: "settings", icon: "settings" },
];

function MenuIcon({ name }: { name: NavIconName }) {
  if (name === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 10.2 12 4l7 6.2V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-8.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9.5 20.5v-5h5v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "tasks") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "habits") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 20c4.2 0 7-2.8 7-7 0-5-3.5-8-7-9-3.5 1-7 4-7 9 0 4.2 2.8 7 7 7Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 7v10M8.5 11.5h7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "routines") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 6h12M8 12h12M8 18h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="5" cy="6" r="1.4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="5" cy="12" r="1.4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="5" cy="18" r="1.4" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === "goals") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (name === "targets") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 3v4M16 3v4M4 9h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "journal") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H19v18H8.5A2.5 2.5 0 0 0 6 23V5.5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9.5 8.5H16M9.5 12H16M9.5 15.5H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "life_areas") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4.5 15.5c1.2-4.5 4.3-7.7 9.1-9.2 1.6 2.2 2.3 4.3 2.2 6.4-.2 3.7-2.7 6.3-6.5 6.3-2.9 0-4.8-1.5-4.8-3.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M8.2 14.5c1.7-.4 3.1-1.3 4.2-2.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "insights") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 19h16M7 15h3M11 11h3M15 7h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M6 15l2-2 2 2 3-3 2 2 3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "assistant") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="6" width="14" height="10" rx="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9 12h6M12 16v2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="10" cy="11" r="1" fill="currentColor" />
        <circle cx="14" cy="11" r="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M4.7 13.3V10.7l2.1-.5c.2-.6.4-1.1.8-1.6L6.3 6.8l1.9-1.9 1.8 1.3c.5-.3 1-.6 1.6-.8l.5-2.1h2.6l.5 2.1c.6.2 1.1.4 1.6.8l1.8-1.3 1.9 1.9-1.3 1.8c.3.5.6 1 .8 1.6l2.1.5v2.6l-2.1.5c-.2.6-.4 1.1-.8 1.6l1.3 1.8-1.9 1.9-1.8-1.3c-.5.3-1 .6-1.6.8l-.5 2.1h-2.6l-.5-2.1c-.6-.2-1.1-.4-1.6-.8l-1.8 1.3-1.9-1.9 1.3-1.8c-.3-.5-.6-1-.8-1.6l-2.1-.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UtilityIcon({ name }: { name: "search" | "bell" }) {
  if (name === "search") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.7" />
        <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7.5 17.5h9a2 2 0 0 0 2-2v-4a6 6 0 1 0-12 0v4a2 2 0 0 0 2 2Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function WorkspaceShell({
  title,
  subtitle,
  language,
  module,
  navKey,
  contentLayout,
  shellTone = "default",
  utilityDateLabel,
  utilityWeatherLabel,
  hideAssistantNav,
  hideRailFooterActions,
  planningSubnav,
  children,
}: WorkspaceShellProps) {
  const storedUiLanguage = useUiLanguage();
  const uiLanguage = language ?? storedUiLanguage;
  const auraVariant = resolveAuraVariant(module ?? "tasks");
  const activeNavKey = navKey === "none" ? null : (navKey ?? module ?? null);
  const layoutClass = contentLayout === "grid" ? "is-grid" : "is-single";
  const resolvedUtilityDateLabel = utilityDateLabel ?? new Date().toLocaleDateString(resolveLocale(uiLanguage), {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const resolvedUtilityWeatherLabel = utilityWeatherLabel ?? "18 C";
  const optionalNavItems = shellTone === "dashboard-canonical"
    ? []
    : hideAssistantNav
      ? OPTIONAL_NAV_ITEMS.filter((item) => item.key !== "assistant")
      : OPTIONAL_NAV_ITEMS;

  return (
    <div className={`workspace-bg aura-${auraVariant} ${shellTone === "dashboard-canonical" ? "shell-dashboard-canonical" : ""}`}>
      <div className="workspace-stage">
        <aside className="workspace-rail">
          <div className="workspace-rail-brand">
            <div className="workspace-brand-row">
              <div className="workspace-brand-mark" aria-hidden="true">
                <span className="workspace-brand-nest" />
              </div>
              <p className="workspace-logo">Nest</p>
              <span className="workspace-brand-collapse" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="m14 7-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            {shellTone === "dashboard-canonical" ? null : <p className="workspace-kicker">{translate("app.kicker", uiLanguage)}</p>}
          </div>

          <nav className="workspace-rail-nav" aria-label={translate("app.nav.core_modules", uiLanguage)}>
            {CORE_NAV_ITEMS.map((item) => {
              const isActive = activeNavKey === item.key;
              const isPlanning = item.key === "tasks";
              const itemLabel = isPlanning
                ? translate("app.nav.planning", uiLanguage, item.label)
                : translate(`app.nav.${item.key}`, uiLanguage, item.label);

              if (!isPlanning || !planningSubnav) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`workspace-rail-link ${isActive ? "is-active" : ""}`}
                  >
                    <span className="workspace-rail-icon">
                      <MenuIcon name={item.icon} />
                    </span>
                    <span>{itemLabel}</span>
                  </Link>
                );
              }

              return (
                <div key={item.href} className={`workspace-rail-group ${isActive ? "is-active" : ""}`}>
                  <Link href={item.href} className={`workspace-rail-link ${isActive ? "is-active" : ""}`}>
                    <span className="workspace-rail-icon">
                      <MenuIcon name={item.icon} />
                    </span>
                    <span>{itemLabel}</span>
                  </Link>
                  <nav className="workspace-rail-subnav" aria-label={translate("app.nav.planning", uiLanguage)}>
                    {PLANNING_SUBNAV_ITEMS.map((subitem) => (
                      <Link
                        key={subitem.key}
                        href={subitem.href}
                        className={`workspace-rail-sublink ${planningSubnav.active === subitem.key ? "is-active" : ""}`}
                      >
                        {translate(`app.nav.${subitem.key}`, uiLanguage, subitem.label)}
                      </Link>
                    ))}
                  </nav>
                </div>
              );
            })}
          </nav>

          {optionalNavItems.length > 0 ? (
            <nav className="workspace-rail-nav workspace-rail-secondary-nav" aria-label={translate("app.nav.optional_surfaces", uiLanguage)}>
              <span className="workspace-rail-section-label">{translate("app.nav.optional_surfaces", uiLanguage)}</span>
              {optionalNavItems.map((item) => {
                const isActive = activeNavKey === item.key;
                const itemLabel = translate(`app.nav.${item.key}`, uiLanguage, item.label);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`workspace-rail-link workspace-rail-link-secondary ${isActive ? "is-active" : ""}`}
                  >
                    <span className="workspace-rail-icon">
                      <MenuIcon name={item.icon} />
                    </span>
                    <span>{itemLabel}</span>
                  </Link>
                );
              })}
            </nav>
          ) : null}

          <div className="workspace-rail-footer">
            <div className="workspace-rail-atmosphere" aria-hidden="true">
              <span className="workspace-rail-plant-pot" />
              <span className="workspace-rail-plant-stem workspace-rail-plant-stem-left" />
              <span className="workspace-rail-plant-stem workspace-rail-plant-stem-right" />
              <span className="workspace-rail-plant-leaf workspace-rail-plant-leaf-left" />
              <span className="workspace-rail-plant-leaf workspace-rail-plant-leaf-right" />
            </div>
            <blockquote className="workspace-rail-quote">
              <p>&ldquo;{translate("app.quote.daily_intention", uiLanguage)}&rdquo;</p>
              <span>Nest</span>
            </blockquote>
            <div className="workspace-account-card">
              <div className="workspace-account-avatar" aria-hidden="true">
                A
              </div>
              <div>
                <small>{translate("app.account.welcome_back", uiLanguage)}</small>
                <strong>Alexandra</strong>
              </div>
              <span className="workspace-account-chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="m9 7 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            {hideRailFooterActions ? null : (
              <div className="workspace-rail-footer-actions">
                <WorkspaceLogoutButton
                  idleLabel={translate("app.action.sign_out", uiLanguage)}
                  busyLabel={translate("app.action.signing_out", uiLanguage)}
                />
              </div>
            )}
          </div>
        </aside>

        <div className="workspace-main">
          <div className="workspace-main-shell">
            <header className="workspace-topbar">
              <div className="workspace-brand">
                <h1>{title}</h1>
                <p>{subtitle}</p>
              </div>
              <div className="workspace-hero-tools">
                <div className="workspace-utility-meta">
                  <span>{resolvedUtilityDateLabel}</span>
                  <small>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.7" />
                      <path
                        d="M12 2.8v3M12 18.2v3M21.2 12h-3M5.8 12h-3M18.6 5.4l-2.1 2.1M7.5 16.5l-2.1 2.1M18.6 18.6l-2.1-2.1M7.5 7.5 5.4 5.4"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{resolvedUtilityWeatherLabel}</span>
                  </small>
                </div>
                <Link
                  href="/assistant"
                  className="workspace-utility-button"
                  aria-label={translate("app.utility.search_assistant", uiLanguage)}
                >
                  <UtilityIcon name="search" />
                </Link>
                <Link
                  href="/settings"
                  className="workspace-utility-button"
                  aria-label={translate("app.utility.notifications", uiLanguage)}
                >
                  <UtilityIcon name="bell" />
                  <span className="workspace-utility-badge">3</span>
                </Link>
              </div>
            </header>

            <nav className="workspace-mobile-nav" aria-label={translate("app.nav.mobile_modules", uiLanguage)}>
              {MOBILE_NAV_ITEMS.map((item) => (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  className={`workspace-mobile-link ${activeNavKey === item.key ? "is-active" : ""}`}
                >
                  <MenuIcon name={item.icon} />
                  <span>{translate(item.key === "tasks" ? "app.nav.planning" : `app.nav.${item.key}`, uiLanguage, item.label)}</span>
                </Link>
              ))}
            </nav>

            <main className="workspace-content-shell">
              <div className={`workspace-grid ${layoutClass}`}>{children}</div>
            </main>
          </div>
        </div>
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
  id?: string;
  title: string;
  className?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function Panel({ id, title, className, actions, children }: PanelProps) {
  const panelClassName = className ? `panel ${className}` : "panel";

  return (
    <section id={id} className={panelClassName}>
      <div className="panel-header">
        <h2>{title}</h2>
        {actions ? <div className="panel-actions">{actions}</div> : null}
      </div>
      <div className="panel-content">{children}</div>
    </section>
  );
}
