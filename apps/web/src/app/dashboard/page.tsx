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
  DashboardLadderStrip,
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

  const hasMeaningfulLiveDashboard =
    todayTasks.length >= 3 ||
    activeHabits.length >= 2 ||
    todayEvents.length >= 2 ||
    (todayOpenTasks.length >= 1 && activeHabits.length >= 1) ||
    (goals.length > 0 && todayOpenTasks.length >= 1);
  const useShowcaseFallback = !isLoading && !errorMessage && !hasMeaningfulLiveDashboard;

  const displayMorningItems = useShowcaseFallback
    ? [
        { id: "morning-1", label: t("dashboard.timeline.morning_routine", "Morning routine"), detail: t("dashboard.timeline.type.routine", "Routine"), timeLabel: "6:30 AM" },
        { id: "morning-2", label: "Deep Work", detail: "Design Presentation", timeLabel: "8:00 AM" },
      ]
    : morningItems.map((item) => ({ ...item, detail: t("dashboard.timeline.type.event", "Event") }));
  const displayNowItem = useShowcaseFallback
    ? {
        id: "now-1",
        label: "Client call",
        detail: "",
        timeLabel: "10:15 AM",
      }
    : nowItems[0] ?? null;
  const displayEveningItems = useShowcaseFallback
    ? [
        { id: "evening-1", label: "Planning", detail: "Q3 roadmap", timeLabel: "11:30 AM" },
        { id: "evening-2", label: "Lunch & reset", detail: t("dashboard.timeline.type.recovery", "Recovery"), timeLabel: "1:00 PM" },
        { id: "evening-3", label: "Focus block", detail: "Content strategy", timeLabel: "2:00 PM" },
        { id: "evening-4", label: "Admin & email", detail: t("dashboard.timeline.type.event", "Event"), timeLabel: "4:00 PM" },
        { id: "evening-5", label: "Evening routine", detail: t("dashboard.timeline.type.routine", "Routine"), timeLabel: "5:30 PM" },
      ]
    : eveningItems.map((item) => ({ ...item, detail: t("dashboard.timeline.type.event", "Event") }));
  const displayTaskItems = useShowcaseFallback
    ? [
        { id: "task-1", title: "Design presentation outline", note: t("dashboard.list.note.high_impact", "High impact"), badge: t("dashboard.badge.today", "Today") },
        { id: "task-2", title: "Review Q3 roadmap", note: t("dashboard.list.note.work", "Work"), badge: t("dashboard.badge.today", "Today") },
        { id: "task-3", title: "Reply to client feedback", note: t("dashboard.list.note.work", "Work"), badge: t("dashboard.badge.today", "Today") },
        { id: "task-4", title: "Prepare team update", note: t("dashboard.list.note.work", "Work"), badge: t("dashboard.badge.tomorrow", "Tomorrow") },
        { id: "task-5", title: "Book travel for offsite", note: t("dashboard.list.note.personal", "Personal"), badge: t("dashboard.badge.tomorrow", "Tomorrow") },
      ]
    : todayOpenTasks.slice(0, 5).map((task) => ({
        id: task.id,
        title: task.title,
        note: task.priority === "high" || task.priority === "urgent" ? t("dashboard.list.note.high_impact", "High impact") : t("dashboard.list.note.work", "Work"),
        badge: task.due_date ? (task.due_date.slice(0, 10) === today ? t("dashboard.badge.today", "Today") : task.due_date.slice(0, 10)) : t("dashboard.badge.open", "Open"),
      }));
  const displayHabitItems = useShowcaseFallback
    ? [
        { id: "habit-1", title: "Move my body", streak: "6/7" },
        { id: "habit-2", title: "Read daily", streak: "5/7" },
        { id: "habit-3", title: "Meditate", streak: "4/7" },
        { id: "habit-4", title: "No phone after 9pm", streak: "6/7" },
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
  const journalPreviewTitle =
    entries[0]?.title && entries[0].title.trim().length >= 8
      ? entries[0].title
      : t("dashboard.reflection.title", "Journal reflection");
  const journalPreviewBody =
    entries[0]?.body && entries[0].body.trim().length >= 36
      ? entries[0].body
      : "A focused morning, a good conversation, and progress on something that matters.";
  const displayUpNextItems = useShowcaseFallback
    ? [
        { id: "up-next-1", label: "Planning", detail: "Q3 roadmap", timeLabel: "11:30 AM", meta: "in 1h 15m", icon: "calendar" },
        { id: "up-next-2", label: "Focus block", detail: "Content strategy", timeLabel: "2:00 PM", meta: "in 3h 45m", icon: "target" },
        { id: "up-next-3", label: "Admin & email", detail: "", timeLabel: "4:00 PM", meta: "in 5h 45m", icon: "mail" },
      ]
    : [...displayMorningItems.slice(-1), ...displayEveningItems.slice(0, 2)].map((item, index) => ({
        id: item.id,
        label: item.label,
        detail: item.detail,
        timeLabel: item.timeLabel,
        meta: item.detail,
        icon: index === 0 ? "calendar" : index === 1 ? "target" : "mail",
      }));

  return (
    <WorkspaceShell
      title={`${useShowcaseFallback ? t("dashboard.greeting.morning", "Good morning") : greeting}, ${useShowcaseFallback ? "Alex" : "Alexandra"}.`}
      subtitle=""
      language={language}
      navKey="dashboard"
      module="tasks"
      contentLayout="single"
      shellTone="dashboard-canonical"
      utilityDateLabel={useShowcaseFallback ? "Friday, May 23, 2025" : undefined}
      utilityWeatherLabel={useShowcaseFallback ? "18\u00B0C" : undefined}
      hideAssistantNav
      hideRailFooterActions
    >
      <section className={`dashboard-shell is-canonical-dashboard ${isLoading ? "is-loading" : ""}`}>
        <div className="dashboard-canonical-board">
          <div className="dashboard-canonical-board-title">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 15.5c1.2-4.4 4.3-7.4 9.1-8.9 1.4 2 2.1 4.1 1.9 6-.3 3.3-2.6 5.7-6.1 5.7-2.9 0-4.9-1.2-4.9-2.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M8.6 14.6c1.9-.4 3.4-1.3 4.6-2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <h2>{t("dashboard.hero.title", "Today at a glance")}</h2>
          </div>

          <div className="dashboard-canonical-board-grid">
            <div className="dashboard-canonical-primary">
              <DashboardFocusCard
                kicker={t("dashboard.focus.kicker", "Now focus")}
                kickerIcon={
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="7.6" stroke="currentColor" strokeWidth="1.65" />
                    <circle cx="12" cy="12" r="2.1" stroke="currentColor" strokeWidth="1.65" />
                    <path d="M12 4.9v2.2M19.1 12h-2.2M12 19.1v-2.2M4.9 12h2.2" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
                  </svg>
                }
                title={useShowcaseFallback ? "Design the presentation outline" : nextAction.title}
                detail={
                  useShowcaseFallback
                    ? "Define the key points and structure to create a clear, compelling outline."
                    : t("dashboard.focus.live_detail", "This move is already alive in the day. Giving it clean attention now will create momentum for everything after it.")
                }
                href={nextAction.href}
                cta={t("dashboard.focus.cta", "Start focus session")}
                rationaleHref="/tasks"
                rationaleLabel={t("dashboard.focus.why", "Why this?")}
                meta={[
                  { label: t("dashboard.focus.meta.duration", "Duration"), value: useShowcaseFallback ? "75 min" : t("dashboard.focus.meta.live_duration", "35 min") },
                  { label: t("dashboard.focus.meta.impact", "Impact"), value: t("dashboard.focus.meta.high_impact", "Deep Work") },
                ]}
              />

              <Panel
                title={t("dashboard.panel.time_map", "Today's time map")}
                className="dashboard-panel dashboard-dayflow-panel"
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
                actions={<Link href="/tasks" className="dashboard-inline-link">{t("dashboard.panel.view_all", "View all")}</Link>}
              >
                <ul className="dashboard-focus-list dashboard-focus-list-ornate">
                  {displayTaskItems.map((task) => (
                    <li key={task.id} className="dashboard-focus-item">
                      <span className="dashboard-task-circle" aria-hidden="true" />
                      <div>
                        <strong>{task.title}</strong>
                      </div>
                      <small>{task.badge}</small>
                    </li>
                  ))}
                </ul>

                <Link href="/tasks" className="dashboard-inline-action dashboard-add-line">
                  + {t("dashboard.panel.add_task", "Add task")}
                </Link>
              </Panel>

              <Panel
                title={t("dashboard.panel.habits", "Habits")}
                className="dashboard-panel dashboard-habits-panel"
                actions={<Link href="/habits" className="dashboard-inline-link">{t("dashboard.panel.view_all", "View all")}</Link>}
              >
                <ul className="dashboard-focus-list dashboard-focus-list-ornate">
                  {displayHabitItems.slice(0, 4).map((habit, index) => (
                    <li key={habit.id} className="dashboard-focus-item">
                      <span className="dashboard-habit-icon" aria-hidden="true" />
                      <div>
                        <strong>{habit.title}</strong>
                      </div>
                      <span className="dashboard-habit-dots" aria-label={habit.streak}>
                        {Array.from({ length: 6 }).map((_, dotIndex) => (
                          <i key={`${habit.id}-${dotIndex}`} className={dotIndex < 4 + (index % 2) ? "is-filled" : ""} />
                        ))}
                      </span>
                      <small className="dashboard-habit-streak">{habit.streak}</small>
                    </li>
                  ))}
                </ul>

                <Link href="/habits" className="dashboard-inline-action dashboard-add-line">
                  + {t("dashboard.panel.add_habit", "Add habit")}
                </Link>
              </Panel>
            </div>

            <aside className="dashboard-canonical-rail">
              <QuickAddCard
                variant="list"
                className="dashboard-mobile-quick-add-card"
                items={[
              {
                label: t("dashboard.quick_add.new_task", "New task"),
                href: "/tasks",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                ),
              },
              {
                label: t("dashboard.quick_add.time_block", "Time block"),
                href: "/calendar",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M8 3v4M16 3v4M4 9h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                label: t("dashboard.quick_add.journal_entry", "Journal entry"),
                href: "/journal",
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H19v18H8.5A2.5 2.5 0 0 0 6 23V5.5Z" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M9.5 8.5H16M9.5 12H16M9.5 15.5H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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

              <DashboardLadderStrip
                title={t("dashboard.ladder.title", "Success ladder")}
                summary=""
                nodes={[
                  { label: t("dashboard.ladder.goal", "Goal"), value: t("dashboard.ladder.goal_value", "Define what matters") },
                  { label: t("dashboard.ladder.time", "Time block"), value: t("dashboard.ladder.time_value", "Protect time for it") },
                  { label: t("dashboard.ladder.rhythm", "Routine"), value: t("dashboard.ladder.rhythm_value", "Make it repeatable") },
                  { label: t("dashboard.ladder.reflection", "Reflection"), value: t("dashboard.ladder.reflection_value", "Learn and adjust") },
                ]}
              />
            </aside>

            <div className="dashboard-canonical-footer">
              <ReflectionSidebarCard
                title={journalPreviewTitle}
                excerpt={journalPreviewBody}
                prompt={t("dashboard.reflection.new_entry", "New entry")}
                href="/journal"
                className="dashboard-mobile-journal-card"
              />

              <Panel
                title={t("dashboard.panel.up_next", "Up next")}
                className="dashboard-panel dashboard-up-next-panel"
              >
                <ul className="dashboard-up-next-list">
                  {displayUpNextItems.map((item) => (
                    <li key={`up-next-${item.id}`}>
                      <span className="dashboard-up-next-bell" aria-hidden="true" />
                      <small>
                        <span>{item.timeLabel}</span>
                        <span>{item.meta}</span>
                      </small>
                      <span className={`dashboard-up-next-icon is-${item.icon}`} aria-hidden="true" />
                      <strong>
                        <span>{item.label}</span>
                        {item.detail ? <small>{item.detail}</small> : null}
                      </strong>
                      <span className="dashboard-up-next-chevron" aria-hidden="true">›</span>
                    </li>
                  ))}
                </ul>
                <Link href="/calendar" className="dashboard-dayflow-footer">
                  {t("dashboard.panel.view_full_day", "View full day")}
                </Link>
              </Panel>
            </div>
          </div>
        </div>

        {!useShowcaseFallback && errorMessage ? <p className="callout state-error">{errorMessage}</p> : null}
      </section>
    </WorkspaceShell>
  );
}
