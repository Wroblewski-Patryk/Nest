"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Panel, WorkspaceShell } from "@/components/workspace-shell";
import {
  BalanceMiniCard,
  DashboardDayFlow,
  DashboardContextRibbon,
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

function formatWeatherFallback(): string {
  return "18 C";
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
      }));

    const nowTasks = todayOpenTasks.slice(0, 3).map((task) => ({
      id: `now-task-${task.id}`,
      label: task.title,
      detail: "Task",
      timeLabel: "Now",
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
  const focusDuration = nowItems.length > 0 ? "45 min" : todayOpenTasks.length > 0 ? "35 min" : "20 min";
  const balanceLegendItems = useMemo(
    () =>
      (balance?.data ?? []).slice(0, 5).map((item, index) => ({
        label: item.name,
        value: item.balance_score,
        color: ["#b8b887", "#7d8d5e", "#d6b06a", "#c97c4d", "#aeb3ca"][index % 5],
      })),
    [balance]
  );
  const dailySummary =
    todayOpenTasks.length > 0
      ? `${todayOpenTasks.length} open tasks still need attention, with ${todayEvents.length} time anchors shaping the day.`
      : activeHabits.length > 0
        ? `${activeHabits.length} active habits can carry the day even though your task list is light.`
        : "The board is calm right now, which makes this a good moment to set one deliberate next step.";

  const heroMetrics = [
    {
      label: "Tasks completed",
      value: `${todayDoneTasksCount} / ${Math.max(todayTasks.length, todayDoneTasksCount)}`,
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
      value: `${activeHabits.length > 0 ? Math.min(activeHabits.length, 2) : 0} / ${Math.max(activeHabits.length, 1)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 20c4.2 0 7-2.8 7-7 0-5-3.5-8-7-9-3.5 1-7 4-7 9 0 4.2 2.8 7 7 7Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      label: "Mindful time",
      value: `${Math.max(10, todayEvents.length * 10)} min`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 4c2.5 2.3 4.6 5 4.6 8.1A4.6 4.6 0 1 1 7.4 12C7.4 8.9 9.5 6.3 12 4Z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
    },
    {
      label: "Focus score",
      value: `${Math.max(6, Math.min(10, todayDoneTasksCount + 4))} / 10`,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.3 7.2 19l.9-5.4L4.2 9.7l5.4-.8L12 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ),
    },
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

  const quickAddItems = [
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
      subtitle="Good morning. Your day should feel guided, graceful, and easy to steer."
      navKey="dashboard"
      module="tasks"
      contentLayout="single"
    >
      <section className="dashboard-shell">
        <div className="dashboard-hero-layout">
          <DashboardHeroBand
            brand="Nest"
            dateLabel={formatLongDate(new Date())}
            weatherLabel={formatWeatherFallback()}
            title="Dashboard"
            summary={dailySummary}
            progressLabel={`${todayDoneTasksCount} completed tasks and ${completedHabitsEstimate} completed habit beats are already supporting the day.`}
            progressPercent={progressPercent}
            metrics={heroMetrics}
          />

          <div className="dashboard-support-rail">
            <ReflectionSidebarCard
              title={lastEntry?.title ?? "Evening reflection"}
              excerpt={
                lastEntry?.body ??
                "Today felt productive and meaningful. I made progress on what matters most and showed up with calm intention."
              }
              prompt="How was your day?"
              href="/journal"
            />
            <QuickAddCard items={quickAddItems} />
            <BalanceMiniCard value={balance?.meta.global_balance_score ?? 0} items={balanceLegendItems} href="/life-areas" />
          </div>
        </div>

        <DashboardContextRibbon title="Whole-life context" items={contextItems} />

        {errorMessage ? <p className="callout state-error">{errorMessage}</p> : null}
        {!errorMessage && feedback ? <p className="callout state-success">{feedback}</p> : null}

        <div className="dashboard-main-grid">
          <DashboardFocusCard
            kicker="Now focus"
            title={nextAction.title}
            detail={
              nowItems.length > 0
                ? "This move is already alive in the day. Giving it clean attention now will create momentum for everything after it."
                : detailifyNextAction(nextAction.detail)
            }
            supportingLabel="Why this?"
            supportingValue={
              nowItems.length > 0
                ? "It sits in the active lane of your day."
                : todayOpenTasks.length > 0
                  ? "Closing one open loop will quiet the rest of the board."
                  : "A small deliberate start is better than a perfect plan."
            }
            href={nextAction.href}
            cta={nowItems.length > 0 ? "Start focus session" : nextAction.cta}
            rationaleHref="/tasks"
            rationaleLabel="Why this?"
            meta={[
              { label: "Impact", value: todayOpenTasks.length > 2 ? "High impact" : "Steady progress" },
              { label: "Duration", value: focusDuration },
            ]}
            secondaryAction={
              <button type="button" className="btn-secondary" onClick={() => void loadDashboard()} disabled={isLoading}>
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            }
          />

          <Panel
            title="Today"
            className="dashboard-panel dashboard-dayflow-panel"
            actions={<span className="dashboard-panel-kicker">Morning / Now / Evening</span>}
          >
            <DashboardDayFlow
              morningItems={morningItems}
              nowItem={nowItems[0] ?? null}
              eveningItems={eveningItems}
              footerHref="/calendar"
              footerLabel="View full calendar"
            />
          </Panel>

          <Panel
            title="Tasks"
            className="dashboard-panel dashboard-list-panel"
            actions={
              <div className="dashboard-tab-head">
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
            }
          >
            {isLoading ? <p className="callout state-loading">Loading your daily focus...</p> : null}

            {!isLoading && focusTab === "tasks" ? (
              <ul className="dashboard-focus-list dashboard-focus-list-ornate">
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
                        <small>{task.priority === "high" || task.priority === "urgent" ? "High impact" : "Steady"}{task.due_date ? ` | ${task.due_date.slice(0, 10) === today ? "Today" : task.due_date.slice(0, 10)}` : ""}</small>
                      </div>
                      <span className="pill">{task.status === "in_progress" ? "In progress" : "Today"}</span>
                    </li>
                  ))
                )}
              </ul>
            ) : null}

            {!isLoading && focusTab === "habits" ? (
              <ul className="dashboard-focus-list dashboard-focus-list-ornate">
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
                        <small>{Math.max(3, habit.title.length % 12)} days</small>
                      </div>
                      <span className="pill">Active</span>
                    </li>
                  ))
                )}
              </ul>
            ) : null}

            <div className="row-inline dashboard-list-footer">
              <Link href={focusTab === "tasks" ? "/tasks" : "/habits"} className="dashboard-inline-link">
                {focusTab === "tasks" ? "View all tasks" : "View all habits"}
              </Link>
              {focusTab === "tasks" ? (
                <Link href="/tasks" className="dashboard-inline-action">
                  Add task
                </Link>
              ) : null}
            </div>
          </Panel>

          <Panel
            title="Reflection capture"
            className="dashboard-panel dashboard-reflection-panel"
            actions={<span className="dashboard-panel-kicker">Warm capture</span>}
          >
            <p className="dashboard-reflection-lead">
              Keep the loop light. A few honest lines are enough to preserve the day and make tomorrow clearer.
            </p>
            <label className="field">
              <span>Quick note</span>
              <textarea
                className="list-row dashboard-reflection-input"
                value={reflectionBody}
                onChange={(event) => setReflectionBody(event.target.value)}
                placeholder="Today felt productive and meaningful..."
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
                  {lastEntryAgeLabel} | mood: {formatMoodLabel(lastEntry.mood)}
                </small>
              </article>
            ) : (
              <p className="dashboard-timeline-empty">No entries yet. Save your first reflection today.</p>
            )}
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

function detailifyNextAction(detail: string): string {
  return `${detail}. This is the cleanest next move for the day and the most reliable way to build calm momentum.`;
}
