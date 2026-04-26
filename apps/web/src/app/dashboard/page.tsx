"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Panel, WorkspaceShell } from "@/components/workspace-shell";
import {
  DashboardContextRibbon,
  DashboardFocusCard,
  DashboardHeroBand,
  DashboardTimelineGroup,
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
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [balance, setBalance] = useState<LifeAreaBalanceResponse | null>(null);
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

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status === "active"),
    [goals]
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

  const topLifeAreaDrift = useMemo(() => {
    if (!balance?.data.length) {
      return null;
    }

    return [...balance.data]
      .sort(
        (left, right) =>
          Math.abs(right.actual_share - right.target_share) -
          Math.abs(left.actual_share - left.target_share)
      )[0];
  }, [balance]);

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
  const lastEntryAgeLabel = lastEntry ? lastEntry.entry_date.slice(0, 10) : "No entry yet";
  const completedHabitsEstimate = Math.max(0, progressPercent - todayDoneTasksCount);
  const dailySummary =
    todayOpenTasks.length > 0
      ? `${todayOpenTasks.length} open tasks still need attention, with ${todayEvents.length} time anchors shaping the day.`
      : activeHabits.length > 0
        ? `${activeHabits.length} active habits can carry the day even though your task list is light.`
        : "The board is calm right now, which makes this a good moment to set one deliberate next step.";

  const heroMetrics = [
    { label: "Open tasks", value: String(todayOpenTasks.length), emphasis: "accent" as const },
    { label: "Events today", value: String(todayEvents.length) },
    { label: "Active habits", value: String(activeHabits.length) },
    { label: "Active goals", value: String(activeGoals.length) },
  ];

  const contextItems = [
    {
      label: "Goals in motion",
      value: activeGoals.length > 0 ? String(activeGoals.length) : "Calm",
      detail:
        activeGoals.length > 0
          ? `${activeGoals[0]?.title ?? "Active goal"} leads the current arc.`
          : "No active goals yet. Planning can stay lightweight.",
      href: "/goals",
    },
    {
      label: "Life balance",
      value: balance ? `${balance.meta.global_balance_score.toFixed(1)} / 100` : "Pending",
      detail: topLifeAreaDrift
        ? `${topLifeAreaDrift.name} shows the strongest drift vs target share.`
        : "Balance insights will appear once more activity is captured.",
      href: "/life-areas",
    },
    {
      label: "Reflection pulse",
      value: lastEntry ? formatMoodLabel(lastEntry.mood) : "Quiet",
      detail: lastEntry
        ? `Latest reflection saved on ${lastEntryAgeLabel}.`
        : "Capture a short note to start building your reflection loop.",
      href: "/journal",
    },
  ];

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

  return (
    <WorkspaceShell
      title="Dashboard"
      subtitle="A calm command center for what matters now, what supports the day, and what deserves reflection next."
      navKey="dashboard"
      module="tasks"
      contentLayout="single"
    >
      <section className="dashboard-shell">
        <div className="dashboard-primary-grid">
          <DashboardHeroBand
            brand="Nest"
            dateLabel={formatLongDate(new Date())}
            title="Today should feel directed, not crowded."
            summary={dailySummary}
            progressLabel={`${todayDoneTasksCount} completed tasks and ${completedHabitsEstimate} completed habit beats are already supporting the day.`}
            progressPercent={progressPercent}
            metrics={heroMetrics}
          />

          <DashboardFocusCard
            kicker="Now focus"
            title={nextAction.title}
            detail={nextAction.detail}
            supportingLabel="Best next move"
            supportingValue={
              nowItems.length > 0
                ? "Act on what is already live."
                : todayOpenTasks.length > 0
                  ? "Clear one open loop."
                  : "Plant one deliberate action."
            }
            href={nextAction.href}
            cta={nextAction.cta}
            secondaryAction={
              <button type="button" className="btn-secondary" onClick={() => void loadDashboard()} disabled={isLoading}>
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            }
          />
        </div>

        <DashboardContextRibbon title="Whole-life context" items={contextItems} />

        {errorMessage ? <p className="callout state-error">{errorMessage}</p> : null}
        {!errorMessage && feedback ? <p className="callout state-success">{feedback}</p> : null}

        <div className="dashboard-content-grid">
          <Panel
            title="Today at a Glance"
            className="dashboard-panel dashboard-panel-wide"
            actions={<span className="dashboard-panel-kicker">Morning / Now / Evening</span>}
          >
            <div className="dashboard-timeline-grid">
              <DashboardTimelineGroup
                title="Morning"
                subtitle="Start the day with clarity"
                items={morningItems}
                emptyLabel="Nothing is scheduled here yet."
              />
              <DashboardTimelineGroup
                title="Now"
                subtitle="What needs attention now"
                items={nowItems}
                emptyLabel="This slot is still open. Protect it for the next useful action."
              />
              <DashboardTimelineGroup
                title="Evening"
                subtitle="Wrap up and reset"
                items={eveningItems}
                emptyLabel="Nothing is scheduled here yet."
              />
            </div>
          </Panel>

          <Panel
            title="Tasks & Habits"
            className="dashboard-panel"
            actions={<span className="dashboard-panel-kicker">Execution lane</span>}
          >
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
                        <small>priority: {task.priority}{task.due_date ? ` | due ${task.due_date.slice(0, 10)}` : ""}</small>
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

          <Panel
            title="Journal / Reflection"
            className="dashboard-panel dashboard-reflection-panel"
            actions={<span className="dashboard-panel-kicker">Warm capture</span>}
          >
            <p className="dashboard-reflection-lead">
              Keep the reflection loop light: one honest note is enough to preserve the day.
            </p>
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

            <div className="row-inline dashboard-reflection-actions">
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

          <Panel
            title="Quick Actions"
            className="dashboard-panel dashboard-panel-wide"
            actions={<span className="dashboard-panel-kicker">Fast entry points</span>}
          >
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
