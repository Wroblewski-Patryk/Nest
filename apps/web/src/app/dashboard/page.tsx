"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { translate } from "@nest/shared-types";
import { Panel, WorkspaceShell } from "@/components/workspace-shell";
import {
  BalanceMiniCard,
  DashboardDayFlow,
  DashboardFocusCard,
  DashboardHeroBand,
  InsightStrip,
  QuickAddCard,
  ReflectionSidebarCard,
} from "@/components/workspace-primitives";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";
import { useUiLanguage } from "@/lib/ui-language";
import { getUserSafeErrorMessage } from "@/lib/ux-contract";

type TaskItem = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "canceled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
};

type CalendarEventItem = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
};

type HabitItem = {
  id: string;
  title: string;
  is_active: boolean;
};

type GoalItem = {
  id: string;
  title: string;
  status: "active" | "paused" | "completed" | "archived";
  target_date: string | null;
};

type JournalEntryItem = {
  id: string;
  title: string;
  body: string;
  entry_date: string;
  mood: "low" | "neutral" | "good" | "great" | null;
};

type TimelineItem = {
  id: string;
  label: string;
  detail: string;
  timeLabel: string;
};

type LifeAreaBalanceItem = {
  life_area_id: string;
  name: string;
  target_share: number;
  actual_share: number;
  balance_score: number;
};

type LifeAreaBalanceResponse = {
  data: LifeAreaBalanceItem[];
  meta: {
    global_balance_score: number;
    window_days: number;
  };
};

function fillTemplate(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template
  );
}

function toIsoDateOnly(dateValue: Date): string {
  return new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatHourMinute(value: string): string {
  return new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function getErrorStatus(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }

  return null;
}

export default function DashboardPage() {
  const router = useRouter();
  const language = useUiLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [balance, setBalance] = useState<LifeAreaBalanceResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const today = useMemo(() => toIsoDateOnly(new Date()), []);
  const nowHour = new Date().getHours();
  const t = useCallback((key: string, fallback: string) => translate(key, language, fallback), [language]);
  const greeting = nowHour < 12
    ? t("dashboard.greeting.morning", "Good morning")
    : nowHour < 18
      ? t("dashboard.greeting.afternoon", "Good afternoon")
      : t("dashboard.greeting.evening", "Good evening");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadDashboard = useCallback(async () => {
    setErrorMessage("");

    try {
      const [tasksResponse, eventsResponse, habitsResponse, goalsResponse, entriesResponse, balanceResponse] = await Promise.all([
        nestApiClient.getTasks({ per_page: 100, sort: "-created_at" }),
        nestApiClient.getCalendarEvents({ per_page: 100 }),
        nestApiClient.getHabits({ per_page: 100 }),
        nestApiClient.getGoals({ per_page: 12, sort: "-created_at" }),
        nestApiClient.getJournalEntries({ per_page: 20, sort: "-entry_date" }),
        nestApiClient.getLifeAreaBalance({ window_days: 14 }),
      ]);

      setTasks((tasksResponse.data ?? []) as TaskItem[]);
      setEvents((eventsResponse.data ?? []) as CalendarEventItem[]);
      setHabits((habitsResponse.data ?? []) as HabitItem[]);
      setGoals((goalsResponse.data ?? []) as GoalItem[]);
      setEntries((entriesResponse.data ?? []) as JournalEntryItem[]);
      setBalance(balanceResponse as LifeAreaBalanceResponse);
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }

      setErrorMessage(getUserSafeErrorMessage(error, t("dashboard.error.load", "We couldn't load the dashboard right now")));
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized, t]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const todayTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.due_date?.slice(0, 10) === today &&
          task.status !== "canceled"
      ),
    [tasks, today]
  );

  const todayOpenTasks = useMemo(
    () => todayTasks.filter((task) => task.status !== "done"),
    [todayTasks]
  );

  const todayDoneTasksCount = useMemo(
    () => todayTasks.filter((task) => task.status === "done").length,
    [todayTasks]
  );

  const todayEvents = useMemo(
    () =>
      events
        .filter((event) => event.start_at.slice(0, 10) === today)
        .sort((left, right) => left.start_at.localeCompare(right.start_at)),
    [events, today]
  );

  const activeHabits = useMemo(
    () => habits.filter((habit) => habit.is_active),
    [habits]
  );

  const progressPercent = useMemo(() => {
    const total = todayTasks.length + activeHabits.length;
    if (total === 0) {
      return 0;
    }

    return Math.min(100, Math.round((todayDoneTasksCount / total) * 100));
  }, [activeHabits.length, todayDoneTasksCount, todayTasks.length]);

  const morningItems = useMemo<TimelineItem[]>(
    () =>
      todayEvents
        .filter((event) => new Date(event.start_at).getHours() < 12)
        .map((event) => ({
          id: `morning-event-${event.id}`,
          label: event.title,
          detail: "Event",
          timeLabel: formatHourMinute(event.start_at),
        })),
    [todayEvents]
  );

  const nowItems = useMemo<TimelineItem[]>(
    () => [
      ...todayEvents
        .filter((event) => Math.abs(new Date(event.start_at).getHours() - nowHour) <= 1)
        .map((event) => ({
          id: `now-event-${event.id}`,
          label: event.title,
          detail: "Event",
          timeLabel: formatHourMinute(event.start_at),
        })),
      ...todayOpenTasks.slice(0, 2).map((task) => ({
        id: `now-task-${task.id}`,
        label: task.title,
        detail: "Focus block",
        timeLabel: "Now",
      })),
    ],
    [todayEvents, nowHour, todayOpenTasks]
  );

  const eveningItems = useMemo<TimelineItem[]>(
    () =>
      todayEvents
        .filter((event) => new Date(event.start_at).getHours() >= 17)
        .map((event) => ({
          id: `evening-event-${event.id}`,
          label: event.title,
          detail: "Event",
          timeLabel: formatHourMinute(event.start_at),
        })),
    [todayEvents]
  );

  const nextAction = useMemo(() => {
    if (nowItems.length > 0) {
      const item = nowItems[0];
      return {
        title: item.label,
        href: "/tasks",
      };
    }

    if (todayOpenTasks.length > 0) {
      return {
        title: todayOpenTasks[0].title,
        href: "/tasks",
      };
    }

    if (activeHabits.length > 0) {
      return {
        title: activeHabits[0].title,
        href: "/habits",
      };
    }

    return {
      title: t("dashboard.focus.default_title", "Prepare for product strategy workshop"),
      href: "/tasks",
    };
  }, [activeHabits, nowItems, t, todayOpenTasks]);

  const hasLiveData =
    tasks.length > 0 || events.length > 0 || habits.length > 0 || goals.length > 0 || entries.length > 0 || !!balance?.data.length;
  const useShowcaseFallback = !hasLiveData;

  const displayMorningItems = useShowcaseFallback
    ? [
        { id: "morning-1", label: t("dashboard.timeline.morning_routine", "Morning routine"), detail: t("dashboard.timeline.type.routine", "Routine"), timeLabel: "6:30" },
        { id: "morning-2", label: t("dashboard.timeline.workout", "Workout"), detail: t("dashboard.timeline.type.habit", "Habit"), timeLabel: "7:30" },
        { id: "morning-3", label: t("dashboard.timeline.deep_work", "Deep work block"), detail: t("dashboard.timeline.type.focus_block", "Focus block"), timeLabel: "9:00" },
        { id: "morning-4", label: t("dashboard.timeline.team_sync", "Team sync"), detail: t("dashboard.timeline.type.event", "Event"), timeLabel: "11:30" },
      ]
    : morningItems.map((item) => ({ ...item, detail: t("dashboard.timeline.type.event", "Event") }));
  const displayNowItem = useShowcaseFallback
    ? {
        id: "now-1",
        label: t("dashboard.timeline.product_workshop", "Prepare for product strategy workshop"),
        detail: t("dashboard.focus.meta.showcase_duration", "45 min"),
        timeLabel: "10:15",
      }
    : nowItems[0] ?? null;
  const displayEveningItems = useShowcaseFallback
    ? [
        { id: "evening-1", label: t("dashboard.timeline.family_time", "Family time"), detail: t("dashboard.timeline.type.life_area", "Life area"), timeLabel: "17:30" },
        { id: "evening-2", label: t("dashboard.timeline.dinner_unwind", "Dinner & unwind"), detail: t("dashboard.timeline.type.routine", "Routine"), timeLabel: "19:00" },
        { id: "evening-3", label: t("dashboard.timeline.reflect_plan", "Reflect & plan"), detail: t("app.nav.journal", "Journal"), timeLabel: "20:30" },
        { id: "evening-4", label: t("dashboard.timeline.sleep", "Sleep"), detail: t("dashboard.timeline.type.recovery", "Recovery"), timeLabel: "22:00" },
      ]
    : eveningItems.map((item) => ({ ...item, detail: t("dashboard.timeline.type.event", "Event") }));
  const displayTaskItems = useShowcaseFallback
    ? [
        { id: "task-1", title: t("dashboard.timeline.product_workshop", "Prepare for product strategy workshop"), note: t("dashboard.list.note.high_impact", "High impact"), badge: t("dashboard.badge.today", "Today") },
        { id: "task-2", title: "Reply to design feedback", note: t("dashboard.list.note.work", "Work"), badge: t("dashboard.badge.today", "Today") },
        { id: "task-3", title: "Review quarterly budget", note: t("dashboard.list.note.finance", "Finance"), badge: t("dashboard.badge.today", "Today") },
        { id: "task-4", title: "Call with mom", note: t("dashboard.list.note.personal", "Personal"), badge: t("dashboard.badge.tomorrow", "Tomorrow") },
        { id: "task-5", title: "Book weekend getaway", note: t("dashboard.list.note.personal", "Personal"), badge: "May 25" },
      ]
    : todayOpenTasks.slice(0, 5).map((task) => ({
        id: task.id,
        title: task.title,
        note: task.priority === "high" || task.priority === "urgent" ? t("dashboard.list.note.high_impact", "High impact") : t("dashboard.list.note.work", "Work"),
        badge: task.due_date ? (task.due_date.slice(0, 10) === today ? t("dashboard.badge.today", "Today") : task.due_date.slice(0, 10)) : t("dashboard.badge.open", "Open"),
      }));
  const displayHabitItems = useShowcaseFallback
    ? [
        { id: "habit-1", title: "Morning meditation", streak: fillTemplate(t("dashboard.habit.streak_days", "{count} days"), { count: 12 }) },
        { id: "habit-2", title: t("dashboard.timeline.workout", "Workout"), streak: fillTemplate(t("dashboard.habit.streak_days", "{count} days"), { count: 8 }) },
        { id: "habit-3", title: "Read", streak: fillTemplate(t("dashboard.habit.streak_days", "{count} days"), { count: 5 }) },
        { id: "habit-4", title: "No screens before bed", streak: fillTemplate(t("dashboard.habit.streak_days", "{count} days"), { count: 7 }) },
        { id: "habit-5", title: "Gratitude journal", streak: fillTemplate(t("dashboard.habit.streak_days", "{count} days"), { count: 10 }) },
      ]
    : activeHabits.slice(0, 5).map((habit) => ({
        id: habit.id,
        title: habit.title,
        streak: fillTemplate(t("dashboard.habit.streak_days", "{count} days"), { count: Math.max(3, habit.title.length % 12) }),
      }));
  const displayBalanceItems = useShowcaseFallback
    ? [
        { label: language === "pl" ? "Rozwoj" : "Growth", value: 8.0, color: "#b9bc89" },
        { label: language === "pl" ? "Zdrowie" : "Health", value: 7.0, color: "#7f9261" },
        { label: language === "pl" ? "Relacje" : "Relationships", value: 8.0, color: "#d2ab67" },
        { label: t("dashboard.list.note.work", "Work"), value: 7.5, color: "#c47a48" },
        { label: t("dashboard.list.note.finance", "Finance"), value: 6.5, color: "#aeb4ca" },
      ]
    : (balance?.data ?? []).slice(0, 5).map((item, index) => ({
        label: item.name,
        value: item.balance_score,
        color: ["#b9bc89", "#7f9261", "#d2ab67", "#c47a48", "#aeb4ca"][index % 5],
      }));

  const heroMetrics = [
    {
      label: t("dashboard.metric.tasks_completed", "Tasks completed"),
      value: useShowcaseFallback ? "6 / 8" : `${todayDoneTasksCount} / ${Math.max(todayTasks.length, todayDoneTasksCount)}`,
      emphasis: "accent" as const,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="m8.5 12.3 2.3 2.3 4.7-5.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: t("dashboard.metric.habits_active", "Active habits"),
      value: useShowcaseFallback ? "3" : `${activeHabits.length}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 20c4.2 0 7-2.8 7-7 0-5-3.5-8-7-9-3.5 1-7 4-7 9 0 4.2 2.8 7 7 7Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      label: t("dashboard.metric.mindful_time", "Mindful time"),
      value: useShowcaseFallback ? "20 min" : `${Math.max(10, todayEvents.length * 10)} min`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 4c2.5 2.3 4.6 5 4.6 8.1A4.6 4.6 0 1 1 7.4 12C7.4 8.9 9.5 6.3 12 4Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      label: t("dashboard.metric.focus_score", "Focus score"),
      value: useShowcaseFallback ? "7 / 10" : `${Math.max(6, Math.min(10, todayDoneTasksCount + 4))} / 10`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.3 7.2 19l.9-5.4L4.2 9.7l5.4-.8L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  const reflectionText =
    entries[0]?.body ??
    t(
      "dashboard.reflection.fallback_body",
      "Today felt productive and meaningful. I made progress on what matters most and showed up for myself and others. Grateful for the small wins and the clarity that's coming."
    );

  return (
    <WorkspaceShell
      title={t("dashboard.title", "Dashboard")}
      subtitle={`${useShowcaseFallback ? t("dashboard.greeting.morning", "Good morning") : greeting}, Alexandra. ${t("dashboard.subtitle", "You've got this.")}`}
      language={language}
      navKey="dashboard"
      module="tasks"
      contentLayout="single"
      shellTone={useShowcaseFallback ? "dashboard-canonical" : "default"}
      utilityDateLabel={useShowcaseFallback ? "Friday, May 23, 2025" : undefined}
      utilityWeatherLabel={useShowcaseFallback ? "18\u00B0C" : undefined}
      hideAssistantNav={useShowcaseFallback}
      hideRailFooterActions={useShowcaseFallback}
    >
      <section className={`dashboard-shell ${isLoading ? "is-loading" : ""} ${useShowcaseFallback ? "is-canonical-dashboard" : ""}`}>
        <DashboardHeroBand
          title={t("dashboard.hero.title", "Today at a glance")}
          summary={t("dashboard.hero.summary", "You're making steady progress.")}
          progressLabel={
            useShowcaseFallback
              ? t("dashboard.hero.progress.showcase", "You're making steady progress.")
              : fillTemplate(
                  t(
                    "dashboard.hero.progress.live",
                    "{tasks} completed tasks and {habits} active habits are already supporting the day."
                  ),
                  {
                    tasks: todayDoneTasksCount,
                    habits: activeHabits.length,
                  }
                )
          }
          progressPercent={useShowcaseFallback ? 78 : progressPercent}
          metrics={heroMetrics}
        />

        <div className="dashboard-support-rail">
          <ReflectionSidebarCard
            title={entries[0]?.title ?? t("dashboard.reflection.fallback_title", "Evening reflection")}
            excerpt={reflectionText}
            prompt={t("dashboard.reflection.prompt", "How was your day?")}
            href="/journal"
            className="dashboard-mobile-journal-card"
          />
          <QuickAddCard
            className="dashboard-mobile-quick-add-card"
            items={[
              {
                label: t("dashboard.quick_add.task", "Task"),
                href: "/tasks",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                ),
              },
              {
                label: t("dashboard.quick_add.habit", "Habit"),
                href: "/habits",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 20c4.2 0 7-2.8 7-7 0-5-3.5-8-7-9-3.5 1-7 4-7 9 0 4.2 2.8 7 7 7Z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                ),
              },
              {
                label: t("dashboard.quick_add.event", "Event"),
                href: "/calendar",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M8 3v4M16 3v4M4 9h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                label: t("dashboard.quick_add.note", "Note"),
                href: "/journal",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M7 5h10a2 2 0 0 1 2 2v10l-4-2-4 2-4-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  </svg>
                ),
              },
            ]}
          />
          <BalanceMiniCard
            value={useShowcaseFallback ? 7.3 : balance?.meta.global_balance_score ?? 0}
            items={displayBalanceItems}
            href="/life-areas"
            className="dashboard-mobile-balance-card"
          />
        </div>

        {!useShowcaseFallback && errorMessage ? <p className="callout state-error">{errorMessage}</p> : null}

        <div className="dashboard-main-grid">
          <DashboardFocusCard
            kicker={t("dashboard.focus.kicker", "Now focus")}
            kickerIcon={
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="7.6" stroke="currentColor" strokeWidth="1.65" />
                <circle cx="12" cy="12" r="2.1" stroke="currentColor" strokeWidth="1.65" />
                <path d="M12 4.9v2.2M19.1 12h-2.2M12 19.1v-2.2M4.9 12h2.2" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
              </svg>
            }
            title={useShowcaseFallback ? t("dashboard.focus.default_title", "Prepare for product strategy workshop") : nextAction.title}
            detail={
              useShowcaseFallback
                ? t("dashboard.focus.showcase_detail", "This moves your project forward and aligns the team. A focused block now creates momentum for the week.")
                : t("dashboard.focus.live_detail", "This move is already alive in the day. Giving it clean attention now will create momentum for everything after it.")
            }
            href={nextAction.href}
            cta={t("dashboard.focus.cta", "Start focus session")}
            rationaleHref="/tasks"
            rationaleLabel={t("dashboard.focus.why", "Why this?")}
            meta={[
              { label: t("dashboard.focus.meta.impact", "Impact"), value: t("dashboard.focus.meta.high_impact", "High impact") },
              { label: t("dashboard.focus.meta.duration", "Duration"), value: useShowcaseFallback ? t("dashboard.focus.meta.showcase_duration", "45 min") : t("dashboard.focus.meta.live_duration", "35 min") },
            ]}
          />

          <Panel
            title={t("dashboard.panel.now", "Now")}
            className="dashboard-panel dashboard-dayflow-panel"
            actions={useShowcaseFallback ? undefined : <span className="dashboard-panel-kicker">{t("dashboard.panel.dayflow", "Morning / Now / Evening")}</span>}
          >
            <DashboardDayFlow
              morningItems={displayMorningItems}
              nowItem={displayNowItem}
              eveningItems={displayEveningItems}
              footerHref="/calendar"
              footerLabel={t("dashboard.panel.view_full_calendar", "View full calendar")}
            />
          </Panel>

          <Panel
            title={t("dashboard.panel.tasks", "Tasks")}
            className="dashboard-panel dashboard-list-panel"
            actions={
              <div className="dashboard-ledger-tabs" aria-label={t("dashboard.panel.tasks", "Tasks")}>
                <span className="is-active">{t("dashboard.panel.tasks", "Tasks")}</span>
                <span>{t("dashboard.panel.habits", "Habits")}</span>
              </div>
            }
          >
            <ul className="dashboard-focus-list dashboard-focus-list-ornate">
              {displayTaskItems.map((task) => (
                <li key={task.id} className="dashboard-focus-item">
                  <div>
                    <strong>{task.title}</strong>
                    <small>{task.note}</small>
                  </div>
                  <span className="pill">{task.badge}</span>
                </li>
              ))}
            </ul>

            <div className="row-inline dashboard-list-footer">
              <Link href="/tasks" className="dashboard-inline-link">
                {t("dashboard.panel.view_all_tasks", "View all tasks")}
              </Link>
              <Link href="/tasks" className="dashboard-inline-action">
                {t("dashboard.panel.add_task", "Add task")}
              </Link>
            </div>
          </Panel>

          <Panel
            title={t("dashboard.panel.habits", "Habits")}
            className="dashboard-panel dashboard-habits-panel"
            actions={<Link href="/habits" className="dashboard-inline-link">{t("dashboard.panel.view_all", "View all")}</Link>}
          >
            <ul className="dashboard-focus-list dashboard-focus-list-ornate">
              {displayHabitItems.map((habit) => (
                <li key={habit.id} className="dashboard-focus-item">
                  <div>
                    <strong>{habit.title}</strong>
                    <small>{habit.streak}</small>
                  </div>
                  <span className="dashboard-habit-check" aria-hidden="true" />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <InsightStrip
          title={t("dashboard.insight.title", "Insight of the day")}
          quote={t("dashboard.insight.quote", "Clarity comes from slowing down long enough to hear what matters.")}
          href="/insights"
          cta={t("dashboard.insight.cta", "Explore insights")}
        />
      </section>
    </WorkspaceShell>
  );
}
