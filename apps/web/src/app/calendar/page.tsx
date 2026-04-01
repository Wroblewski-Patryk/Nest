"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";

type CalendarEventItem = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  linked_entity_type: string | null;
};

type TaskCalendarItem = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "canceled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
};

type CalendarViewMode = "day" | "week" | "month";

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
};

async function apiRequest<TResponse>(path: string, init?: ApiRequestInit): Promise<TResponse> {
  const requestFn = nestApiClient.request as unknown as (
    requestPath: string,
    requestInit?: ApiRequestInit
  ) => Promise<unknown>;

  return (await requestFn(path, init)) as TResponse;
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
  return "Calendar request failed.";
}

function toIso(input: string): string | null {
  if (!input) {
    return null;
  }

  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function toLocalDateTimeInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function toDateInputValue(value: Date): string {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function fromDateInput(value: string): Date {
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
}

function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeekMonday(value: Date): Date {
  const base = startOfDay(value);
  const weekDay = base.getDay();
  const diff = weekDay === 0 ? -6 : 1 - weekDay;
  return addDays(base, diff);
}

function endForView(view: CalendarViewMode, start: Date): Date {
  if (view === "day") {
    return addDays(start, 1);
  }

  if (view === "week") {
    return addDays(start, 7);
  }

  return new Date(start.getFullYear(), start.getMonth() + 1, 1, 0, 0, 0, 0);
}

function resolveWindow(view: CalendarViewMode, anchor: Date): { start: Date; end: Date } {
  if (view === "day") {
    const start = startOfDay(anchor);
    return { start, end: endForView("day", start) };
  }

  if (view === "week") {
    const start = startOfWeekMonday(anchor);
    return { start, end: endForView("week", start) };
  }

  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 0, 0, 0, 0);
  return { start, end: endForView("month", start) };
}

function formatRangeLabel(view: CalendarViewMode, start: Date, end: Date): string {
  if (view === "day") {
    return start.toLocaleDateString();
  }

  if (view === "week") {
    const lastDay = addDays(end, -1);
    return `${start.toLocaleDateString()} - ${lastDay.toLocaleDateString()}`;
  }

  return start.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function isInRange(value: Date, start: Date, end: Date): boolean {
  return value >= start && value < end;
}

function overlapsRange(startAt: Date, endAt: Date, start: Date, end: Date): boolean {
  return endAt > start && startAt < end;
}

function formatWhen(value: string): string {
  return new Date(value).toLocaleString();
}

function isClosedTask(status: TaskCalendarItem["status"]): boolean {
  return status === "done" || status === "canceled";
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [tasks, setTasks] = useState<TaskCalendarItem[]>([]);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("week");
  const [anchorDate, setAnchorDate] = useState(toDateInputValue(new Date()));

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStartAt, setNewEventStartAt] = useState("");
  const [newEventEndAt, setNewEventEndAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventTitle, setEditEventTitle] = useState("");
  const [editEventStartAt, setEditEventStartAt] = useState("");
  const [editEventEndAt, setEditEventEndAt] = useState("");
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Create your first time block.");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadData = useCallback(async () => {
    const [eventsResponse, tasksResponse] = await Promise.all([
      nestApiClient.getCalendarEvents({ per_page: 200 }),
      nestApiClient.getTasks({ per_page: 200 }),
    ]);
    setEvents((eventsResponse.data ?? []) as CalendarEventItem[]);
    setTasks((tasksResponse.data ?? []) as TaskCalendarItem[]);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadData()
      .then(() => {
        if (!mounted) {
          return;
        }
        setFeedback("Calendar loaded.");
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }
        if (getErrorStatus(error) === 401) {
          handleUnauthorized();
          return;
        }
        setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [handleUnauthorized, loadData]);

  const windowStart = useMemo(() => resolveWindow(viewMode, fromDateInput(anchorDate)).start, [anchorDate, viewMode]);
  const windowEnd = useMemo(() => resolveWindow(viewMode, fromDateInput(anchorDate)).end, [anchorDate, viewMode]);
  const windowLabel = useMemo(() => formatRangeLabel(viewMode, windowStart, windowEnd), [viewMode, windowStart, windowEnd]);

  const visibleEvents = useMemo(
    () =>
      events.filter((item) => {
        const startAt = new Date(item.start_at);
        const endAt = new Date(item.end_at);
        if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
          return false;
        }
        return overlapsRange(startAt, endAt, windowStart, windowEnd);
      }),
    [events, windowEnd, windowStart]
  );

  const visibleTasks = useMemo(
    () =>
      tasks.filter((item) => {
        if (!item.due_date) {
          return false;
        }
        const dueDate = new Date(item.due_date);
        if (Number.isNaN(dueDate.getTime())) {
          return false;
        }
        return isInRange(dueDate, windowStart, windowEnd);
      }),
    [tasks, windowEnd, windowStart]
  );

  const planningFeed = useMemo(() => {
    const eventRows = visibleEvents.map((entry) => ({
      key: `event-${entry.id}`,
      type: "event" as const,
      at: new Date(entry.start_at),
      title: entry.title,
      detail: `${formatWhen(entry.start_at)} - ${formatWhen(entry.end_at)}`,
      tag: entry.linked_entity_type ?? "event",
    }));

    const taskRows = visibleTasks.map((task) => ({
      key: `task-${task.id}`,
      type: "task" as const,
      at: new Date(task.due_date ?? ""),
      title: task.title,
      detail: `Due ${task.due_date?.slice(0, 10)} | ${task.priority} | ${task.status}`,
      tag: "task",
    }));

    return [...eventRows, ...taskRows]
      .filter((entry) => !Number.isNaN(entry.at.getTime()))
      .sort((a, b) => a.at.getTime() - b.at.getTime());
  }, [visibleEvents, visibleTasks]);

  const openTasksInView = useMemo(
    () => visibleTasks.filter((item) => !isClosedTask(item.status)).length,
    [visibleTasks]
  );

  function moveWindow(direction: -1 | 1) {
    const anchor = fromDateInput(anchorDate);
    const next = new Date(anchor);

    if (viewMode === "day") {
      next.setDate(anchor.getDate() + direction);
    } else if (viewMode === "week") {
      next.setDate(anchor.getDate() + direction * 7);
    } else {
      next.setMonth(anchor.getMonth() + direction, 1);
    }

    setAnchorDate(toDateInputValue(next));
  }

  function goToday() {
    setAnchorDate(toDateInputValue(new Date()));
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newEventTitle.trim()) {
      setErrorMessage("Event title is required.");
      return;
    }

    const startAt = toIso(newEventStartAt);
    const endAt = toIso(newEventEndAt);
    if (!startAt || !endAt) {
      setErrorMessage("Start and end date-time are required.");
      return;
    }

    setIsCreating(true);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest("/calendar-events", {
        method: "POST",
        body: {
          title: newEventTitle.trim(),
          start_at: startAt,
          end_at: endAt,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          all_day: false,
        },
      });
      setNewEventTitle("");
      setNewEventStartAt("");
      setNewEventEndAt("");
      await loadData();
      setFeedback("Calendar event created.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  }

  function startEventEdit(entry: CalendarEventItem) {
    setEditingEventId(entry.id);
    setEditEventTitle(entry.title);
    setEditEventStartAt(toLocalDateTimeInput(entry.start_at));
    setEditEventEndAt(toLocalDateTimeInput(entry.end_at));
  }

  async function saveEventEdit(eventId: string) {
    if (!editEventTitle.trim()) {
      setErrorMessage("Event title is required.");
      return;
    }

    const startAt = toIso(editEventStartAt);
    const endAt = toIso(editEventEndAt);
    if (!startAt || !endAt) {
      setErrorMessage("Start and end date-time are required.");
      return;
    }

    setBusyEventId(eventId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/calendar-events/${eventId}`, {
        method: "PATCH",
        body: {
          title: editEventTitle.trim(),
          start_at: startAt,
          end_at: endAt,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        },
      });
      setEditingEventId(null);
      await loadData();
      setFeedback("Calendar event updated.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyEventId(null);
    }
  }

  async function deleteEvent(eventId: string) {
    if (!window.confirm("Delete this calendar event?")) {
      return;
    }

    setBusyEventId(eventId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/calendar-events/${eventId}`, {
        method: "DELETE",
      });
      if (editingEventId === eventId) {
        setEditingEventId(null);
      }
      await loadData();
      setFeedback("Calendar event deleted.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyEventId(null);
    }
  }

  return (
    <WorkspaceShell
      title="Calendar"
      subtitle="Plan dnia i tygodnia na osi czasu, zeby widziec realne obciazenie."
      module="calendar"
    >
      <div className="stack">
        <MetricCard label="Window" value={windowLabel} />
        <MetricCard label="Events in view" value={String(visibleEvents.length)} />
        <MetricCard label="Tasks due in view" value={String(visibleTasks.length)} />
        <MetricCard label="Open due tasks" value={String(openTasksInView)} />
      </div>

      <Panel title="Calendar View">
        <div className="calendar-toolbar">
          <div className="calendar-view-switch">
            <button
              type="button"
              className={`calendar-view-button ${viewMode === "day" ? "is-active" : ""}`}
              onClick={() => setViewMode("day")}
            >
              Dzien
            </button>
            <button
              type="button"
              className={`calendar-view-button ${viewMode === "week" ? "is-active" : ""}`}
              onClick={() => setViewMode("week")}
            >
              Tydzien
            </button>
            <button
              type="button"
              className={`calendar-view-button ${viewMode === "month" ? "is-active" : ""}`}
              onClick={() => setViewMode("month")}
            >
              Miesiac
            </button>
          </div>

          <div className="row-inline">
            <button type="button" className="btn-secondary" onClick={() => moveWindow(-1)}>
              Prev
            </button>
            <button type="button" className="btn-secondary" onClick={goToday}>
              Today
            </button>
            <button type="button" className="btn-secondary" onClick={() => moveWindow(1)}>
              Next
            </button>
            <label className="field">
              <span>Anchor date</span>
              <input
                className="list-row"
                type="date"
                value={anchorDate}
                onChange={(event) => setAnchorDate(event.target.value)}
              />
            </label>
          </div>
        </div>

        <ul className="list">
          {planningFeed.length === 0 ? (
            <li className="list-row">
              <p>No tasks or events in selected window.</p>
            </li>
          ) : (
            planningFeed.map((entry) => (
              <li className="list-row" key={entry.key}>
                <div>
                  <strong>{entry.title}</strong>
                  <p>{entry.detail}</p>
                </div>
                <span className="pill">{entry.tag}</span>
              </li>
            ))
          )}
        </ul>
      </Panel>

      <Panel title="Add Event">
        <form className="form-grid" onSubmit={createEvent}>
          <label className="field">
            <span>Title</span>
            <input
              className="list-row"
              type="text"
              value={newEventTitle}
              onChange={(event) => setNewEventTitle(event.target.value)}
              placeholder="Example: Weekly life planning"
              disabled={isCreating}
            />
          </label>
          <label className="field">
            <span>Start</span>
            <input
              className="list-row"
              type="datetime-local"
              value={newEventStartAt}
              onChange={(event) => setNewEventStartAt(event.target.value)}
              disabled={isCreating}
            />
          </label>
          <label className="field">
            <span>End</span>
            <input
              className="list-row"
              type="datetime-local"
              value={newEventEndAt}
              onChange={(event) => setNewEventEndAt(event.target.value)}
              disabled={isCreating}
            />
          </label>
          <button type="submit" className="btn-primary" disabled={isCreating}>
            {isCreating ? "Adding..." : "Add event"}
          </button>
        </form>
      </Panel>

      <Panel title="All Events">
        <ul className="list">
          {events.length === 0 ? (
            <li className="list-row">
              <p>No events yet. Add your first time block above.</p>
            </li>
          ) : (
            events.map((entry) => (
              <li className="list-row" key={entry.id}>
                {editingEventId === entry.id ? (
                  <div className="form-grid">
                    <label className="field">
                      <span>Title</span>
                      <input
                        className="list-row"
                        type="text"
                        value={editEventTitle}
                        onChange={(event) => setEditEventTitle(event.target.value)}
                        disabled={busyEventId === entry.id}
                      />
                    </label>
                    <div className="row-inline">
                      <label className="field">
                        <span>Start</span>
                        <input
                          className="list-row"
                          type="datetime-local"
                          value={editEventStartAt}
                          onChange={(event) => setEditEventStartAt(event.target.value)}
                          disabled={busyEventId === entry.id}
                        />
                      </label>
                      <label className="field">
                        <span>End</span>
                        <input
                          className="list-row"
                          type="datetime-local"
                          value={editEventEndAt}
                          onChange={(event) => setEditEventEndAt(event.target.value)}
                          disabled={busyEventId === entry.id}
                        />
                      </label>
                    </div>
                    <div className="row-inline">
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => void saveEventEdit(entry.id)}
                        disabled={busyEventId === entry.id}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => setEditingEventId(null)}
                        disabled={busyEventId === entry.id}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>{entry.title}</strong>
                      <p>
                        {formatWhen(entry.start_at)} - {formatWhen(entry.end_at)}
                      </p>
                    </div>
                    <div className="row-inline">
                      <span className="pill">{entry.linked_entity_type ?? "standalone"}</span>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => startEventEdit(entry)}
                        disabled={busyEventId === entry.id}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => void deleteEvent(entry.id)}
                        disabled={busyEventId === entry.id}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))
          )}
        </ul>
      </Panel>

      {isLoading ? (
        <Panel title="Loading">
          <p className="callout">Loading calendar...</p>
        </Panel>
      ) : null}

      {feedback ? (
        <Panel title="Status">
          <p className="callout">{feedback}</p>
        </Panel>
      ) : null}
      {errorMessage ? (
        <Panel title="Error">
          <p className="callout state-error">{errorMessage}</p>
        </Panel>
      ) : null}
    </WorkspaceShell>
  );
}
