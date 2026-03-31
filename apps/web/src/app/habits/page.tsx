"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";

type HabitItem = {
  id: string;
  title: string;
  type: "boolean" | "numeric" | "duration";
  cadence: Record<string, unknown>;
  is_active: boolean;
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
  return "Habit request failed.";
}

export default function HabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitType, setNewHabitType] = useState<HabitItem["type"]>("boolean");
  const [newHabitCadence, setNewHabitCadence] = useState<"daily" | "weekly">("daily");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState("Add your first habit to start consistency tracking.");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadData = useCallback(async () => {
    const response = await nestApiClient.getHabits({ per_page: 100 });
    setHabits((response.data ?? []) as HabitItem[]);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadData()
      .then(() => {
        if (!mounted) {
          return;
        }
        setFeedback("Habits loaded.");
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

  async function createHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newHabitTitle.trim()) {
      setErrorMessage("Habit title is required.");
      return;
    }

    setIsCreating(true);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest("/habits", {
        method: "POST",
        body: {
          title: newHabitTitle.trim(),
          type: newHabitType,
          cadence: {
            type: newHabitCadence,
          },
          is_active: true,
        },
      });
      setNewHabitTitle("");
      await loadData();
      setFeedback("Habit created.");
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

  const activeHabits = useMemo(() => habits.filter((habit) => habit.is_active).length, [habits]);

  return (
    <WorkspaceShell
      title="Habits"
      subtitle="Track recurring actions with clear, low-friction creation flow."
      module="habits"
    >
      <div className="stack">
        <MetricCard label="Habits tracked" value={String(habits.length)} />
        <MetricCard label="Active habits" value={String(activeHabits)} />
        <MetricCard label="Paused habits" value={String(habits.length - activeHabits)} />
      </div>

      <Panel title="Add Habit">
        <form className="form-grid" onSubmit={createHabit}>
          <label className="field">
            <span>Title</span>
            <input
              className="list-row"
              type="text"
              value={newHabitTitle}
              onChange={(event) => setNewHabitTitle(event.target.value)}
              placeholder="Example: 20 min reading"
              disabled={isCreating}
            />
          </label>
          <label className="field">
            <span>Type</span>
            <select
              className="list-row"
              value={newHabitType}
              onChange={(event) => setNewHabitType(event.target.value as HabitItem["type"])}
              disabled={isCreating}
            >
              <option value="boolean">Boolean</option>
              <option value="numeric">Numeric</option>
              <option value="duration">Duration</option>
            </select>
          </label>
          <label className="field">
            <span>Cadence</span>
            <select
              className="list-row"
              value={newHabitCadence}
              onChange={(event) => setNewHabitCadence(event.target.value as "daily" | "weekly")}
              disabled={isCreating}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          <button type="submit" className="btn-primary" disabled={isCreating}>
            {isCreating ? "Adding..." : "Add habit"}
          </button>
        </form>
      </Panel>

      <Panel title="Habit List">
        <ul className="list">
          {habits.length === 0 ? (
            <li className="list-row">
              <p>No habits yet. Add your first one above.</p>
            </li>
          ) : (
            habits.map((habit) => (
              <li className="list-row" key={habit.id}>
                <div>
                  <strong>{habit.title}</strong>
                  <p>
                    {habit.type} | cadence: {String(habit.cadence?.type ?? "custom")}
                  </p>
                </div>
                <span className={`pill ${habit.is_active ? "state-success" : ""}`}>
                  {habit.is_active ? "active" : "inactive"}
                </span>
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
