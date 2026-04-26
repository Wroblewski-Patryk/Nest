"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Panel, WorkspaceShell } from "@/components/workspace-shell";
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

type JournalEntryItem = {
  id: string;
  title: string;
  body: string;
  entry_date: string;
  mood: "low" | "neutral" | "good" | "great" | null;
};

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
};

type FocusTab = "tasks" | "habits";

type TimelineItem = {
  id: string;
  label: string;
  detail: string;
  timeLabel: string;
  isNow?: boolean;
};

function toIsoDateOnly(dateValue: Date): string {
  return new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatLongDate(value: Date): string {
  return value.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
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
    const message = (error as { payload: { message: string } }).payload.message;
    if (message.toLowerCase().includes("per page field must not be greater than 100")) {
      return "Too many items were requested at once. Refresh and try again.";
    }

    return message;
  }

  return "We couldn't load the dashboard right now. Please refresh and try again.";
}

function formatMoodLabel(mood: JournalEntryItem["mood"]): string {
  if (mood === "great") {
    return "great";
  }

  if (mood === "good") {
    return "good";
  }

  if (mood === "neutral") {
    return "neutral";
  }

  if (mood === "low") {
    return "low";
  }

  return "none";
}

async function apiRequest<TResponse>(path: string, init?: ApiRequestInit): Promise<TResponse> {
  const requestFn = nestApiClient.request as unknown as (
    requestPath: string,
    requestInit?: ApiRequestInit
  ) => Promise<unknown>;

  return (await requestFn(path, init)) as TResponse;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [focusTab, setFocusTab] = useState<FocusTab>("tasks");
  const [reflectionBody, setReflectionBody] = useState("");
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  const today = useMemo(() => toIsoDateOnly(new Date()), []);
  const nowHour = new Date().getHours();

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadDashboard = useCallback(async () => {
    setErrorMessage("");

    try {
      const [tasksResponse, eventsResponse, habitsResponse, entriesResponse] = await Promise.all([
        nestApiClient.getTasks({ per_page: 100, sort: "-created_at" }),
        nestApiClient.getCalendarEvents({ per_page: 100 }),
        nestApiClient.getHabits({ per_page: 100 }),
        nestApiClient.getJournalEntries({ per_page: 20, sort: "-entry_date" }),
      ]);

      setTasks((tasksResponse.data ?? []) as TaskItem[]);
      setEvents((eventsResponse.data ?? []) as CalendarEventItem[]);
      setHabits((habitsResponse.data ?? []) as HabitItem[]);
      setEntries((entriesResponse.data ?? []) as JournalEntryItem[]);
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

  const nowItems = useMemo<TimelineItem[]>(() => {
    const nowEvents = todayEvents
      .filter((event) => Math.abs(new Date(event.start_at).getHours() - nowHour) <= 1)
      .map((event) => ({
        id: `now-event-${event.id}`,
        label: event.title,
        detail: "Event",
        timeLabel: formatHourMinute(event.start_at),
        isNow: true,
      }));

    const nowTasks = todayOpenTasks.slice(0, 3).map((task) => ({
      id: `now-task-${task.id}`,
      label: task.title,
      detail: "Task",
      timeLabel: "Teraz",
      isNow: true,
    }));

    return [...nowEvents, ...nowTasks];
  }, [todayEvents, nowHour, todayOpenTasks]);

  const eveningItems = useMemo<TimelineItem[]>(
    () => [
      ...todayEvents
        .filter((event) => new Date(event.start_at).getHours() >= 17)
        .map((event) => ({
          id: `evening-event-${event.id}`,
          label: event.title,
          detail: "Event",
          timeLabel: formatHourMinute(event.start_at),
        })),
      ...todayTasks
        .filter((task) => task.status === "done")
        .slice(0, 2)
        .map((task) => ({
          id: `evening-task-${task.id}`,
          label: task.title,
          detail: "Completed task",
          timeLabel: "Done",
        })),
    ],
    [todayEvents, todayTasks]
  );

  const nextAction = useMemo(() => {
    if (nowItems.length > 0) {
      const item = nowItems[0];
      return {
        title: item.label,
        detail: `${item.detail} | ${item.timeLabel}`,
        href: item.detail === "Event" ? "/calendar" : "/tasks",
        cta: item.detail === "Event" ? "Open Calendar" : "Open Tasks",
      };
    }

    if (todayOpenTasks.length > 0) {
      return {
        title: todayOpenTasks[0].title,
        detail: "Open task waiting for focus",
        href: "/tasks",
        cta: "Open Tasks",
      };
    }

    if (activeHabits.length > 0) {
      return {
        title: activeHabits[0].title,
        detail: "Active habit ready to check in",
        href: "/habits",
        cta: "Open Habits",
      };
    }

    return {
      title: "Capture your first task for today",
      detail: "Start simple: add one concrete next step.",
      href: "/tasks",
      cta: "Add Task",
    };
  }, [activeHabits, nowItems, todayOpenTasks]);

  const lastEntry = entries[0] ?? null;

  async function saveQuickReflection() {
    if (!reflectionBody.trim()) {
      setErrorMessage("Write a short reflection before saving.");
      return;
    }

    setIsSavingReflection(true);
    setErrorMessage("");

    try {
      await apiRequest("/journal-entries", {
        method: "POST",
        body: {
          title: `Reflection ${today}`,
          body: reflectionBody.trim(),
          mood: "neutral",
          entry_date: today,
        },
      });

      setReflectionBody("");
      setFeedback("Reflection saved.");
      await loadDashboard();
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }

      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingReflection(false);
    }
  }

  function renderTimelineGroup(title: string, subtitle: string, items: TimelineItem[]) {
    return (
      <article className="dashboard-timeline-group">
        <header>
          <p>{title}</p>
          <small>{subtitle}</small>
        </header>

        {items.length === 0 ? (
          <p className="dashboard-timeline-empty">Nothing is scheduled here yet.</p>
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

  return (
    <WorkspaceShell
      title="Dashboard"
      subtitle="Your day at a glance: what matters now, and what to shape calmly next."
      navKey="dashboard"
      module="tasks"
      contentLayout="single"
    >
      <section className="dashboard-shell">
        <article className="dashboard-hero">
          <div className="dashboard-hero-top">
            <p className="dashboard-brand">NEST</p>
            <p className="dashboard-date">{formatLongDate(new Date())}</p>
          </div>

          <div className="dashboard-progress-wrap">
            <p>{progressPercent}% of today&apos;s intentions are already complete</p>
            <div className="dashboard-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="dashboard-hero-metrics">
            <span>{todayOpenTasks.length} open tasks</span>
            <span>{todayEvents.length} events</span>
            <span>{activeHabits.length} active habits</span>
          </div>
        </article>

        <article className="dashboard-now-card">
          <p className="dashboard-now-kicker">Now focus</p>
          <h2>{nextAction.title}</h2>
          <p>{nextAction.detail}</p>
          <div className="row-inline">
            <Link href={nextAction.href} className="btn-primary">
              {nextAction.cta}
            </Link>
            <button type="button" className="btn-secondary" onClick={() => void loadDashboard()} disabled={isLoading}>
              Refresh
            </button>
          </div>
        </article>

        {errorMessage ? <p className="callout state-error">{errorMessage}</p> : null}
        {!errorMessage && feedback ? <p className="callout state-success">{feedback}</p> : null}

        <div className="dashboard-content-grid">
          <Panel title="Today at a Glance">
            <div className="dashboard-timeline-grid">
              {renderTimelineGroup("Morning", "Start the day with clarity", morningItems)}
              {renderTimelineGroup("Now", "What needs attention now", nowItems)}
              {renderTimelineGroup("Evening", "Wrap up and reset", eveningItems)}
            </div>
          </Panel>

          <Panel title="Tasks & Habits">
            <div className="dashboard-tabs" role="tablist" aria-label="Daily focus">
              <button
                type="button"
                role="tab"
                aria-selected={focusTab === "tasks"}
                className={`dashboard-tab ${focusTab === "tasks" ? "is-active" : ""}`}
                onClick={() => setFocusTab("tasks")}
              >
                Tasks
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={focusTab === "habits"}
                className={`dashboard-tab ${focusTab === "habits" ? "is-active" : ""}`}
                onClick={() => setFocusTab("habits")}
              >
                Habits
              </button>
            </div>

            {isLoading ? <p className="callout state-loading">Loading your daily focus...</p> : null}

            {!isLoading && focusTab === "tasks" ? (
              <ul className="dashboard-focus-list">
                {todayOpenTasks.length === 0 ? (
                  <li className="dashboard-focus-item">
                    <div>
                      <strong>No open tasks are scheduled for today</strong>
                      <small>This is a good moment to plan calmly.</small>
                    </div>
                  </li>
                ) : (
                  todayOpenTasks.slice(0, 6).map((task) => (
                    <li key={task.id} className="dashboard-focus-item">
                      <div>
                        <strong>{task.title}</strong>
                        <small>priority: {task.priority}</small>
                      </div>
                      <span className="pill">{task.status === "in_progress" ? "in progress" : "open"}</span>
                    </li>
                  ))
                )}
              </ul>
            ) : null}

            {!isLoading && focusTab === "habits" ? (
              <ul className="dashboard-focus-list">
                {activeHabits.length === 0 ? (
                  <li className="dashboard-focus-item">
                    <div>
                      <strong>No active habits yet</strong>
                      <small>Add your first habit and connect it to your daily rhythm.</small>
                    </div>
                  </li>
                ) : (
                  activeHabits.slice(0, 6).map((habit) => (
                    <li key={habit.id} className="dashboard-focus-item">
                      <div>
                        <strong>{habit.title}</strong>
                        <small>active habit</small>
                      </div>
                      <span className="pill">habit</span>
                    </li>
                  ))
                )}
              </ul>
            ) : null}

            <div className="row-inline">
              <Link href={focusTab === "tasks" ? "/tasks" : "/habits"} className="btn-secondary">
                Open module
              </Link>
            </div>
          </Panel>

          <Panel title="Journal / Reflection">
            <label className="field">
              <span>Quick note</span>
              <textarea
                className="list-row dashboard-reflection-input"
                value={reflectionBody}
                onChange={(event) => setReflectionBody(event.target.value)}
                placeholder="Describe your day..."
                rows={5}
              />
            </label>

            <div className="row-inline">
              <button type="button" className="btn-primary" onClick={() => void saveQuickReflection()} disabled={isSavingReflection}>
                {isSavingReflection ? "Saving..." : "Save reflection"}
              </button>
              <Link href="/journal" className="btn-secondary">
                Full journal
              </Link>
            </div>

            {lastEntry ? (
              <article className="dashboard-journal-preview">
                <strong>{lastEntry.title}</strong>
                <p>{lastEntry.body}</p>
                <small>
                  {lastEntry.entry_date.slice(0, 10)} | mood: {formatMoodLabel(lastEntry.mood)}
                </small>
              </article>
            ) : (
              <p className="dashboard-timeline-empty">No entries yet. Save your first reflection today.</p>
            )}
          </Panel>

          <Panel title="Quick Actions">
            <div className="dashboard-actions-grid">
              <Link href="/tasks" className="btn-primary">Add task</Link>
              <Link href="/calendar" className="btn-secondary">Add event</Link>
              <Link href="/habits" className="btn-secondary">Add habit</Link>
              <Link href="/routines" className="btn-secondary">Add routine</Link>
              <Link href="/goals" className="btn-secondary">Add goal</Link>
              <Link href="/life-areas" className="btn-secondary">Life areas</Link>
            </div>
          </Panel>
        </div>
      </section>
    </WorkspaceShell>
  );
}
