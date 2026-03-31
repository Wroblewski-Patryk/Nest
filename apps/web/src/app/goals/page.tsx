"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";

type GoalItem = {
  id: string;
  title: string;
  status: "active" | "paused" | "completed" | "archived";
  target_date: string | null;
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
  return "Goal request failed.";
}

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTargetDate, setNewGoalTargetDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalTitle, setEditGoalTitle] = useState("");
  const [editGoalTargetDate, setEditGoalTargetDate] = useState("");
  const [editGoalStatus, setEditGoalStatus] = useState<GoalItem["status"]>("active");
  const [busyGoalId, setBusyGoalId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Create a goal first, then attach targets in the Targets module.");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadData = useCallback(async () => {
    const response = await nestApiClient.getGoals({ per_page: 100 });
    setGoals((response.data ?? []) as GoalItem[]);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadData()
      .then(() => {
        if (!mounted) {
          return;
        }
        setFeedback("Goals loaded.");
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

  async function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newGoalTitle.trim()) {
      setErrorMessage("Goal title is required.");
      return;
    }

    setIsCreating(true);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest("/goals", {
        method: "POST",
        body: {
          title: newGoalTitle.trim(),
          status: "active",
          ...(newGoalTargetDate ? { target_date: newGoalTargetDate } : {}),
        },
      });
      setNewGoalTitle("");
      setNewGoalTargetDate("");
      await loadData();
      setFeedback("Goal created.");
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

  function startGoalEdit(goal: GoalItem) {
    setEditingGoalId(goal.id);
    setEditGoalTitle(goal.title);
    setEditGoalTargetDate(goal.target_date ? goal.target_date.slice(0, 10) : "");
    setEditGoalStatus(goal.status);
  }

  async function saveGoalEdit(goalId: string) {
    if (!editGoalTitle.trim()) {
      setErrorMessage("Goal title is required.");
      return;
    }

    setBusyGoalId(goalId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/goals/${goalId}`, {
        method: "PATCH",
        body: {
          title: editGoalTitle.trim(),
          status: editGoalStatus,
          target_date: editGoalTargetDate || null,
        },
      });
      setEditingGoalId(null);
      await loadData();
      setFeedback("Goal updated.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyGoalId(null);
    }
  }

  async function deleteGoal(goalId: string) {
    if (!window.confirm("Delete this goal?")) {
      return;
    }

    setBusyGoalId(goalId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/goals/${goalId}`, {
        method: "DELETE",
      });
      if (editingGoalId === goalId) {
        setEditingGoalId(null);
      }
      await loadData();
      setFeedback("Goal deleted.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyGoalId(null);
    }
  }

  return (
    <WorkspaceShell
      title="Goals"
      subtitle="Ustal kierunek i termin, a potem rozbij to na konkretne targety."
      module="goals"
    >
      <div className="stack">
        <MetricCard label="Goals active" value={String(goals.length)} />
        <MetricCard
          label="With target date"
          value={String(goals.filter((goal) => goal.target_date !== null).length)}
        />
        <MetricCard
          label="Completed"
          value={String(goals.filter((goal) => goal.status === "completed").length)}
        />
      </div>

      <Panel title="Add Goal">
        <form className="form-grid" onSubmit={createGoal}>
          <label className="field">
            <span>Title</span>
            <input
              className="list-row"
              type="text"
              value={newGoalTitle}
              onChange={(event) => setNewGoalTitle(event.target.value)}
              placeholder="Example: Build calmer weekly planning routine"
              disabled={isCreating}
            />
          </label>
          <label className="field">
            <span>Target date (optional)</span>
            <input
              className="list-row"
              type="date"
              value={newGoalTargetDate}
              onChange={(event) => setNewGoalTargetDate(event.target.value)}
              disabled={isCreating}
            />
          </label>
          <button type="submit" className="btn-primary" disabled={isCreating}>
            {isCreating ? "Adding..." : "Add goal"}
          </button>
        </form>
      </Panel>

      <Panel title="Goal List">
        <ul className="list">
          {goals.length === 0 ? (
            <li className="list-row">
              <p>No goals yet. Add your first one above.</p>
            </li>
          ) : (
            goals.map((goal) => (
              <li className="list-row" key={goal.id}>
                {editingGoalId === goal.id ? (
                  <div className="form-grid">
                    <label className="field">
                      <span>Title</span>
                      <input
                        className="list-row"
                        type="text"
                        value={editGoalTitle}
                        onChange={(event) => setEditGoalTitle(event.target.value)}
                        disabled={busyGoalId === goal.id}
                      />
                    </label>
                    <div className="row-inline">
                      <label className="field">
                        <span>Status</span>
                        <select
                          className="list-row"
                          value={editGoalStatus}
                          onChange={(event) => setEditGoalStatus(event.target.value as GoalItem["status"])}
                          disabled={busyGoalId === goal.id}
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                      <label className="field">
                        <span>Target date</span>
                        <input
                          className="list-row"
                          type="date"
                          value={editGoalTargetDate}
                          onChange={(event) => setEditGoalTargetDate(event.target.value)}
                          disabled={busyGoalId === goal.id}
                        />
                      </label>
                    </div>
                    <div className="row-inline">
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => void saveGoalEdit(goal.id)}
                        disabled={busyGoalId === goal.id}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => setEditingGoalId(null)}
                        disabled={busyGoalId === goal.id}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>{goal.title}</strong>
                      <p>
                        status: {goal.status}
                        {goal.target_date ? ` | target ${goal.target_date.slice(0, 10)}` : ""}
                      </p>
                    </div>
                    <div className="row-inline">
                      <span className="pill">{goal.status}</span>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => startGoalEdit(goal)}
                        disabled={busyGoalId === goal.id}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => void deleteGoal(goal.id)}
                        disabled={busyGoalId === goal.id}
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
