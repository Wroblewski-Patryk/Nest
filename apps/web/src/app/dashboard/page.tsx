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
  return value.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatHourMinute(value: string): string {
  return new Date(value).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
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

  return "Dashboard data request failed.";
}

function formatMoodLabel(mood: JournalEntryItem["mood"]): string {
  if (mood === "great") {
    return "swietnie";
  }

  if (mood === "good") {
    return "dobrze";
  }

  if (mood === "neutral") {
    return "neutralnie";
  }

  if (mood === "low") {
    return "slabiej";
  }

  return "brak";
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
      setFeedback("Dashboard odswiezony.");
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
          detail: "Wydarzenie",
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
        detail: "Wydarzenie",
        timeLabel: formatHourMinute(event.start_at),
        isNow: true,
      }));

    const nowTasks = todayOpenTasks.slice(0, 3).map((task) => ({
      id: `now-task-${task.id}`,
      label: task.title,
      detail: "Zadanie",
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
          detail: "Wydarzenie",
          timeLabel: formatHourMinute(event.start_at),
        })),
      ...todayTasks
        .filter((task) => task.status === "done")
        .slice(0, 2)
        .map((task) => ({
          id: `evening-task-${task.id}`,
          label: task.title,
          detail: "Zadanie zakonczone",
          timeLabel: "Done",
        })),
    ],
    [todayEvents, todayTasks]
  );

  const lastEntry = entries[0] ?? null;

  async function saveQuickReflection() {
    if (!reflectionBody.trim()) {
      setErrorMessage("Wpisz krotka refleksje przed zapisem.");
      return;
    }

    setIsSavingReflection(true);
    setErrorMessage("");

    try {
      await apiRequest("/journal-entries", {
        method: "POST",
        body: {
          title: `Refleksja ${today}`,
          body: reflectionBody.trim(),
          mood: "neutral",
          entry_date: today,
        },
      });

      setReflectionBody("");
      setFeedback("Refleksja zapisana.");
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
          <p className="dashboard-timeline-empty">Brak zaplanowanych elementow.</p>
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
      subtitle="Widok dnia: najpierw co teraz, potem co doplanowac spokojnie."
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
            <p>{progressPercent}% Twoich intencji zamkniete dzisiaj</p>
            <div className="dashboard-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="dashboard-hero-metrics">
            <span>{todayOpenTasks.length} otwartych zadan</span>
            <span>{todayEvents.length} wydarzen</span>
            <span>{activeHabits.length} aktywnych nawykow</span>
          </div>
        </article>

        {errorMessage ? <p className="callout state-error">{errorMessage}</p> : null}
        {!errorMessage && feedback ? <p className="callout state-success">{feedback}</p> : null}

        <div className="dashboard-content-grid">
          <Panel title="Twoje Dzisiaj">
            <div className="dashboard-timeline-grid">
              {renderTimelineGroup("Morning", "Poranek", morningItems)}
              {renderTimelineGroup("Now", "Teraz", nowItems)}
              {renderTimelineGroup("Evening", "Wieczor", eveningItems)}
            </div>
          </Panel>

          <Panel title="Zadania & Nawyki">
            <div className="dashboard-tabs" role="tablist" aria-label="Dzienny fokus">
              <button
                type="button"
                role="tab"
                aria-selected={focusTab === "tasks"}
                className={`dashboard-tab ${focusTab === "tasks" ? "is-active" : ""}`}
                onClick={() => setFocusTab("tasks")}
              >
                Zadania
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={focusTab === "habits"}
                className={`dashboard-tab ${focusTab === "habits" ? "is-active" : ""}`}
                onClick={() => setFocusTab("habits")}
              >
                Nawyki
              </button>
            </div>

            {isLoading ? <p className="callout state-loading">Ladowanie dziennego fokusu...</p> : null}

            {!isLoading && focusTab === "tasks" ? (
              <ul className="dashboard-focus-list">
                {todayOpenTasks.length === 0 ? (
                  <li className="dashboard-focus-item">
                    <div>
                      <strong>Brak otwartych zadan na dzisiaj</strong>
                      <small>To dobry moment na spokojne doplanowanie.</small>
                    </div>
                  </li>
                ) : (
                  todayOpenTasks.slice(0, 6).map((task) => (
                    <li key={task.id} className="dashboard-focus-item">
                      <div>
                        <strong>{task.title}</strong>
                        <small>priorytet: {task.priority}</small>
                      </div>
                      <span className="pill">{task.status === "in_progress" ? "w trakcie" : "otwarte"}</span>
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
                      <strong>Brak aktywnych nawykow</strong>
                      <small>Dodaj pierwszy nawyk i polacz go z codziennym rytmem.</small>
                    </div>
                  </li>
                ) : (
                  activeHabits.slice(0, 6).map((habit) => (
                    <li key={habit.id} className="dashboard-focus-item">
                      <div>
                        <strong>{habit.title}</strong>
                        <small>nawyk aktywny</small>
                      </div>
                      <span className="pill">habit</span>
                    </li>
                  ))
                )}
              </ul>
            ) : null}

            <div className="row-inline">
              <Link href={focusTab === "tasks" ? "/tasks" : "/habits"} className="btn-secondary">
                Otworz modul
              </Link>
            </div>
          </Panel>

          <Panel title="Dziennik / Refleksja">
            <label className="field">
              <span>Szybki wpis</span>
              <textarea
                className="list-row dashboard-reflection-input"
                value={reflectionBody}
                onChange={(event) => setReflectionBody(event.target.value)}
                placeholder="Opisz swoj dzien..."
                rows={5}
              />
            </label>

            <div className="row-inline">
              <button type="button" className="btn-primary" onClick={() => void saveQuickReflection()} disabled={isSavingReflection}>
                {isSavingReflection ? "Zapisywanie..." : "Zapisz refleksje"}
              </button>
              <Link href="/journal" className="btn-secondary">
                Pelny dziennik
              </Link>
            </div>

            {lastEntry ? (
              <article className="dashboard-journal-preview">
                <strong>{lastEntry.title}</strong>
                <p>{lastEntry.body}</p>
                <small>
                  {lastEntry.entry_date.slice(0, 10)} | nastroj: {formatMoodLabel(lastEntry.mood)}
                </small>
              </article>
            ) : (
              <p className="dashboard-timeline-empty">Brak wpisow. Zapisz pierwsza refleksje dzisiaj.</p>
            )}
          </Panel>

          <Panel title="Quick Actions">
            <div className="dashboard-actions-grid">
              <Link href="/tasks" className="btn-primary">Dodaj zadanie</Link>
              <Link href="/calendar" className="btn-secondary">Dodaj wydarzenie</Link>
              <Link href="/habits" className="btn-secondary">Dodaj nawyk</Link>
              <Link href="/routines" className="btn-secondary">Dodaj rutyne</Link>
              <Link href="/goals" className="btn-secondary">Dodaj cel</Link>
              <Link href="/life-areas" className="btn-secondary">Life areas</Link>
            </div>
          </Panel>
        </div>
      </section>
    </WorkspaceShell>
  );
}
