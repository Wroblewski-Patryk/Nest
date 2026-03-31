"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
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

function formatWhen(value: string): string {
  return new Date(value).toLocaleString();
}

function toLocalDateTimeInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
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
    const response = await nestApiClient.getCalendarEvents({ per_page: 100 });
    setEvents((response.data ?? []) as CalendarEventItem[]);
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
        <MetricCard label="Events total" value={String(events.length)} />
        <MetricCard
          label="Linked entities"
          value={String(events.filter((item) => item.linked_entity_type !== null).length)}
        />
        <MetricCard
          label="Standalone events"
          value={String(events.filter((item) => item.linked_entity_type === null).length)}
        />
      </div>

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

      <Panel title="Timeline">
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
