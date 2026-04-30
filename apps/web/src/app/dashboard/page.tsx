"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "payload" in error &&
    typeof (error as { payload?: unknown }).payload === "object" &&
    typeof (error as { payload: { message?: unknown } }).payload?.message === "string"
  ) {
    return (error as { payload: { message: string } }).payload.message;
  }

  return "We couldn't load the dashboard right now.";
}

const FALLBACK_MORNING_ITEMS: TimelineItem[] = [
  { id: "morning-1", label: "Morning routine", detail: "Routine", timeLabel: "6:30" },
  { id: "morning-2", label: "Workout", detail: "Habit", timeLabel: "7:30" },
  { id: "morning-3", label: "Deep work block", detail: "Focus block", timeLabel: "9:00" },
  { id: "morning-4", label: "Team sync", detail: "Event", timeLabel: "11:30" },
];

const FALLBACK_NOW_ITEM: TimelineItem = {
  id: "now-1",
  label: "Prepare for product strategy workshop",
  detail: "45 min",
  timeLabel: "10:15",
};

const FALLBACK_EVENING_ITEMS: TimelineItem[] = [
  { id: "evening-1", label: "Family time", detail: "Life area", timeLabel: "17:30" },
  { id: "evening-2", label: "Dinner & unwind", detail: "Routine", timeLabel: "19:00" },
  { id: "evening-3", label: "Reflect & plan", detail: "Journal", timeLabel: "20:30" },
  { id: "evening-4", label: "Sleep", detail: "Recovery", timeLabel: "22:00" },
];

const FALLBACK_TASK_ITEMS = [
  { id: "task-1", title: "Prepare for product strategy workshop", note: "High impact", badge: "Today" },
  { id: "task-2", title: "Reply to design feedback", note: "Work", badge: "Today" },
  { id: "task-3", title: "Review quarterly budget", note: "Finance", badge: "Today" },
  { id: "task-4", title: "Call with mom", note: "Personal", badge: "Tomorrow" },
  { id: "task-5", title: "Book weekend getaway", note: "Personal", badge: "May 25" },
];

const FALLBACK_HABIT_ITEMS = [
  { id: "habit-1", title: "Morning meditation", streak: "12 days" },
  { id: "habit-2", title: "Workout", streak: "8 days" },
  { id: "habit-3", title: "Read", streak: "5 days" },
  { id: "habit-4", title: "No screens before bed", streak: "7 days" },
  { id: "habit-5", title: "Gratitude journal", streak: "10 days" },
];

const FALLBACK_BALANCE_ITEMS = [
  { label: "Growth", value: 8.0, color: "#b9bc89" },
  { label: "Health", value: 7.0, color: "#7f9261" },
  { label: "Relationships", value: 8.0, color: "#d2ab67" },
  { label: "Work", value: 7.5, color: "#c47a48" },
  { label: "Finance", value: 6.5, color: "#aeb4ca" },
];

export default function DashboardPage() {
  const router = useRouter();
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
  const greeting = nowHour < 12 ? "Good morning" : nowHour < 18 ? "Good afternoon" : "Good evening";

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

      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized]);

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
      title: "Prepare for product strategy workshop",
      href: "/tasks",
    };
  }, [activeHabits, nowItems, todayOpenTasks]);

  const hasLiveData =
    tasks.length > 0 || events.length > 0 || habits.length > 0 || goals.length > 0 || entries.length > 0 || !!balance?.data.length;
  const useShowcaseFallback = !hasLiveData;

  const displayMorningItems = useShowcaseFallback ? FALLBACK_MORNING_ITEMS : morningItems;
  const displayNowItem = useShowcaseFallback ? FALLBACK_NOW_ITEM : nowItems[0] ?? null;
  const displayEveningItems = useShowcaseFallback ? FALLBACK_EVENING_ITEMS : eveningItems;
  const displayTaskItems = useShowcaseFallback
    ? FALLBACK_TASK_ITEMS
    : todayOpenTasks.slice(0, 5).map((task) => ({
        id: task.id,
        title: task.title,
        note: task.priority === "high" || task.priority === "urgent" ? "High impact" : "Work",
        badge: task.due_date ? (task.due_date.slice(0, 10) === today ? "Today" : task.due_date.slice(0, 10)) : "Open",
      }));
  const displayHabitItems = useShowcaseFallback
    ? FALLBACK_HABIT_ITEMS
    : activeHabits.slice(0, 5).map((habit) => ({
        id: habit.id,
        title: habit.title,
        streak: `${Math.max(3, habit.title.length % 12)} days`,
      }));
  const displayBalanceItems = useShowcaseFallback
    ? FALLBACK_BALANCE_ITEMS
    : (balance?.data ?? []).slice(0, 5).map((item, index) => ({
        label: item.name,
        value: item.balance_score,
        color: ["#b9bc89", "#7f9261", "#d2ab67", "#c47a48", "#aeb4ca"][index % 5],
      }));

  const heroMetrics = [
    {
      label: "Tasks completed",
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
      label: "Habits done",
      value: useShowcaseFallback ? "2 / 3" : `${activeHabits.length > 0 ? Math.min(activeHabits.length, 2) : 0} / ${Math.max(activeHabits.length, 1)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 20c4.2 0 7-2.8 7-7 0-5-3.5-8-7-9-3.5 1-7 4-7 9 0 4.2 2.8 7 7 7Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      label: "Mindful time",
      value: useShowcaseFallback ? "20 min" : `${Math.max(10, todayEvents.length * 10)} min`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 4c2.5 2.3 4.6 5 4.6 8.1A4.6 4.6 0 1 1 7.4 12C7.4 8.9 9.5 6.3 12 4Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      label: "Focus score",
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
    "Today felt productive and meaningful. I made progress on what matters most and showed up for myself and others. Grateful for the small wins and the clarity that's coming.";

  return (
    <WorkspaceShell
      title="Dashboard"
      subtitle={useShowcaseFallback ? "Good morning, Alexandra. You've got this." : `${greeting}, Alexandra. You've got this.`}
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
          title="Today at a glance"
          summary={useShowcaseFallback ? "You're making steady progress." : "You're making steady progress."}
          progressLabel={
            useShowcaseFallback
              ? "You're making steady progress."
              : `${todayDoneTasksCount} completed tasks and ${Math.max(0, progressPercent - todayDoneTasksCount)} completed habit beats are already supporting the day.`
          }
          progressPercent={useShowcaseFallback ? 78 : progressPercent}
          metrics={heroMetrics}
        />

        <div className="dashboard-support-rail">
          <ReflectionSidebarCard
            title={entries[0]?.title ?? "Evening reflection"}
            excerpt={reflectionText}
            prompt="How was your day?"
            href="/journal"
          />
          <QuickAddCard items={[
            {
              label: "Task",
              href: "/tasks",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              ),
            },
            {
              label: "Habit",
              href: "/habits",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 20c4.2 0 7-2.8 7-7 0-5-3.5-8-7-9-3.5 1-7 4-7 9 0 4.2 2.8 7 7 7Z" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              ),
            },
            {
              label: "Event",
              href: "/calendar",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="4" y="5" width="16" height="15" rx="3" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M8 3v4M16 3v4M4 9h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              label: "Note",
              href: "/journal",
              icon: (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 5h10a2 2 0 0 1 2 2v10l-4-2-4 2-4-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                </svg>
              ),
            },
          ]} />
          <BalanceMiniCard
            value={useShowcaseFallback ? 7.3 : balance?.meta.global_balance_score ?? 0}
            items={displayBalanceItems}
            href="/life-areas"
          />
        </div>

        {!useShowcaseFallback && errorMessage ? <p className="callout state-error">{errorMessage}</p> : null}

        <div className="dashboard-main-grid">
          <DashboardFocusCard
            kicker="Now focus"
            kickerIcon={
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="7.6" stroke="currentColor" strokeWidth="1.65" />
                <circle cx="12" cy="12" r="2.1" stroke="currentColor" strokeWidth="1.65" />
                <path d="M12 4.9v2.2M19.1 12h-2.2M12 19.1v-2.2M4.9 12h2.2" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
              </svg>
            }
            title={useShowcaseFallback ? "Prepare for product strategy workshop" : nextAction.title}
            detail={
              useShowcaseFallback
                ? "This moves your project forward and aligns the team. A focused block now creates momentum for the week."
                : "This move is already alive in the day. Giving it clean attention now will create momentum for everything after it."
            }
            href={nextAction.href}
            cta="Start focus session"
            rationaleHref="/tasks"
            rationaleLabel="Why this?"
            meta={[
              { label: "Impact", value: "High impact" },
              { label: "Duration", value: useShowcaseFallback ? "45 min" : "35 min" },
            ]}
          />

          <Panel
            title="Now"
            className="dashboard-panel dashboard-dayflow-panel"
            actions={useShowcaseFallback ? undefined : <span className="dashboard-panel-kicker">Morning / Now / Evening</span>}
          >
            <DashboardDayFlow
              morningItems={displayMorningItems}
              nowItem={displayNowItem}
              eveningItems={displayEveningItems}
              footerHref="/calendar"
              footerLabel="View full calendar"
            />
          </Panel>

          <Panel
            title="Tasks"
            className="dashboard-panel dashboard-list-panel"
            actions={
              <div className="dashboard-ledger-tabs" aria-label="Ledger sections">
                <span className="is-active">Tasks</span>
                <span>Habits</span>
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
                View all tasks
              </Link>
              <Link href="/tasks" className="dashboard-inline-action">
                Add task
              </Link>
            </div>
          </Panel>

          <Panel
            title="Habits"
            className="dashboard-panel dashboard-habits-panel"
            actions={<Link href="/habits" className="dashboard-inline-link">View all</Link>}
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
          title="Insight of the day"
          quote="Clarity comes from slowing down long enough to hear what matters."
          href="/insights"
          cta="Explore insights"
        />
      </section>
    </WorkspaceShell>
  );
}
