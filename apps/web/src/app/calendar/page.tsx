"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { ConflictQueueCard } from "@/components/conflict-queue-card";
import { IntegrationHealthCenterCard } from "@/components/integration-health-center-card";
import { ProviderConnectionsCard } from "@/components/provider-connections-card";
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

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStartAt, setNewEventStartAt] = useState("");
  const [newEventEndAt, setNewEventEndAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
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

  return (
    <WorkspaceShell
      title="Calendar"
      subtitle="Place life activities on timeline with a direct create flow."
      module="calendar"
    >
      <div className="stack">
        <MetricCard label="Events total" value={String(events.length)} />
        <MetricCard
          label="Linked entities"
          value={String(events.filter((item) => item.linked_entity_type !== null).length)}
        />
        <MetricCard label="Create flow" value="Enabled" />
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
              disabled={isCreating || isLoading}
            />
          </label>
          <label className="field">
            <span>Start</span>
            <input
              className="list-row"
              type="datetime-local"
              value={newEventStartAt}
              onChange={(event) => setNewEventStartAt(event.target.value)}
              disabled={isCreating || isLoading}
            />
          </label>
          <label className="field">
            <span>End</span>
            <input
              className="list-row"
              type="datetime-local"
              value={newEventEndAt}
              onChange={(event) => setNewEventEndAt(event.target.value)}
              disabled={isCreating || isLoading}
            />
          </label>
          <button type="submit" className="btn-primary" disabled={isCreating || isLoading}>
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
                <div>
                  <strong>{entry.title}</strong>
                  <p>
                    {formatWhen(entry.start_at)} - {formatWhen(entry.end_at)}
                  </p>
                </div>
                <span className="pill">{entry.linked_entity_type ?? "standalone"}</span>
              </li>
            ))
          )}
        </ul>
      </Panel>

      <ConflictQueueCard />
      <IntegrationHealthCenterCard />
      <ProviderConnectionsCard />

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
