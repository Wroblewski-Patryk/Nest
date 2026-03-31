"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

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

function toIsoDateOnly(dateValue: Date): string {
  return new Date(dateValue.getTime() - dateValue.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
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

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const today = useMemo(() => toIsoDateOnly(new Date()), []);

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [tasksResponse, eventsResponse] = await Promise.all([
        nestApiClient.getTasks({ per_page: 100, sort: "-created_at" }),
        nestApiClient.getCalendarEvents({ per_page: 100 }),
      ]);

      setTasks((tasksResponse.data ?? []) as TaskItem[]);
      setEvents((eventsResponse.data ?? []) as CalendarEventItem[]);
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
          task.status !== "done" &&
          task.status !== "canceled"
      ),
    [tasks, today]
  );

  const todayEvents = useMemo(
    () => events.filter((event) => event.start_at.slice(0, 10) === today),
    [events, today]
  );

  return (
    <WorkspaceShell
      title="Dashboard"
      subtitle="Twoj widok dnia: co zrobic teraz i gdzie dodac kolejne elementy planu."
      navKey="dashboard"
      module="tasks"
    >
      <div className="stack">
        <MetricCard label="Today tasks" value={String(todayTasks.length)} />
        <MetricCard label="Today events" value={String(todayEvents.length)} />
        <MetricCard
          label="Open tasks (all)"
          value={String(tasks.filter((task) => task.status !== "done" && task.status !== "canceled").length)}
        />
      </div>

      <Panel title="Quick Add Menu">
        <div className="row-inline">
          <Link href="/tasks" className="btn-primary">
            Add Task/List
          </Link>
          <Link href="/habits" className="btn-secondary">
            Add Habit
          </Link>
          <Link href="/routines" className="btn-secondary">
            Add Routine
          </Link>
          <Link href="/goals" className="btn-secondary">
            Add Goal
          </Link>
          <Link href="/targets" className="btn-secondary">
            Add Target
          </Link>
          <Link href="/calendar" className="btn-secondary">
            Add Event
          </Link>
          <Link href="/journal" className="btn-secondary">
            Add Reflection
          </Link>
        </div>
      </Panel>

      <Panel title="Today Tasks">
        <ul className="list">
          {isLoading ? (
            <li className="list-row">
              <p>Loading tasks...</p>
            </li>
          ) : todayTasks.length === 0 ? (
            <li className="list-row">
              <p>No due tasks for today. Great chance to plan calmly.</p>
            </li>
          ) : (
            todayTasks.map((task) => (
              <li className="list-row" key={task.id}>
                <div>
                  <strong>{task.title}</strong>
                  <p>Priority: {task.priority}</p>
                </div>
                <span className="pill">{task.status}</span>
              </li>
            ))
          )}
        </ul>
      </Panel>

      <Panel title="Today Calendar">
        <ul className="list">
          {isLoading ? (
            <li className="list-row">
              <p>Loading calendar...</p>
            </li>
          ) : todayEvents.length === 0 ? (
            <li className="list-row">
              <p>No calendar blocks today.</p>
            </li>
          ) : (
            todayEvents.map((event) => (
              <li className="list-row" key={event.id}>
                <div>
                  <strong>{event.title}</strong>
                  <p>
                    {formatDateTime(event.start_at)} - {formatDateTime(event.end_at)}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      </Panel>

      {errorMessage ? (
        <Panel title="Error">
          <p className="callout state-error">{errorMessage}</p>
        </Panel>
      ) : null}
    </WorkspaceShell>
  );
}
