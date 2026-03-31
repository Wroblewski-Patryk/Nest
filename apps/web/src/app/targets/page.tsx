"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";

type GoalItem = {
  id: string;
  title: string;
};

type TargetItem = {
  id: string;
  goal_id: string;
  title: string;
  metric_type: string;
  value_target: number;
  value_current: number;
  unit: string | null;
  due_date: string | null;
  status: "active" | "paused" | "completed" | "archived";
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
  return "Target request failed.";
}

export default function TargetsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [targets, setTargets] = useState<TargetItem[]>([]);

  const [newTargetGoalId, setNewTargetGoalId] = useState("");
  const [newTargetTitle, setNewTargetTitle] = useState("");
  const [newTargetMetricType, setNewTargetMetricType] = useState("count");
  const [newTargetValueTarget, setNewTargetValueTarget] = useState("1");
  const [newTargetUnit, setNewTargetUnit] = useState("items");
  const [quickGoalTitle, setQuickGoalTitle] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editTargetTitle, setEditTargetTitle] = useState("");
  const [editTargetMetricType, setEditTargetMetricType] = useState("count");
  const [editTargetValueTarget, setEditTargetValueTarget] = useState("1");
  const [editTargetValueCurrent, setEditTargetValueCurrent] = useState("0");
  const [editTargetUnit, setEditTargetUnit] = useState("items");
  const [editTargetDueDate, setEditTargetDueDate] = useState("");
  const [editTargetStatus, setEditTargetStatus] = useState<TargetItem["status"]>("active");
  const [busyTargetId, setBusyTargetId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Create target checkpoints linked to a goal.");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadData = useCallback(async () => {
    const [goalsResponse, targetsResponse] = await Promise.all([
      nestApiClient.getGoals({ per_page: 100 }),
      apiRequest<{ data: TargetItem[] }>("/targets", {
        query: { per_page: 100 },
      }),
    ]);

    const normalizedGoals = (goalsResponse.data ?? []) as GoalItem[];
    setGoals(normalizedGoals);
    setTargets(targetsResponse.data ?? []);
    setNewTargetGoalId((current) => current || normalizedGoals[0]?.id || "");
  }, []);

  useEffect(() => {
    let mounted = true;
    loadData()
      .then(() => {
        if (!mounted) {
          return;
        }
        setFeedback("Targets loaded.");
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

  async function createTarget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTargetGoalId) {
      setErrorMessage("Select goal first.");
      return;
    }
    if (!newTargetTitle.trim()) {
      setErrorMessage("Target title is required.");
      return;
    }

    setIsCreating(true);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest("/targets", {
        method: "POST",
        body: {
          goal_id: newTargetGoalId,
          title: newTargetTitle.trim(),
          metric_type: newTargetMetricType,
          value_target: Number(newTargetValueTarget) || 0,
          unit: newTargetUnit.trim() || null,
          status: "active",
        },
      });
      setNewTargetTitle("");
      setNewTargetValueTarget("1");
      setNewTargetUnit("items");
      await loadData();
      setFeedback("Target created.");
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

  async function createGoalQuick(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quickGoalTitle.trim()) {
      setErrorMessage("Goal title is required.");
      return;
    }

    setIsCreatingGoal(true);
    setErrorMessage("");
    setFeedback("");
    try {
      const response = await apiRequest<{ data: GoalItem }>("/goals", {
        method: "POST",
        body: {
          title: quickGoalTitle.trim(),
          status: "active",
        },
      });

      setQuickGoalTitle("");
      setNewTargetGoalId(response.data.id);
      await loadData();
      setFeedback("Goal created. You can now add target checkpoints.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreatingGoal(false);
    }
  }

  function startTargetEdit(target: TargetItem) {
    setEditingTargetId(target.id);
    setEditTargetTitle(target.title);
    setEditTargetMetricType(target.metric_type);
    setEditTargetValueTarget(String(target.value_target));
    setEditTargetValueCurrent(String(target.value_current));
    setEditTargetUnit(target.unit ?? "");
    setEditTargetDueDate(target.due_date ? target.due_date.slice(0, 10) : "");
    setEditTargetStatus(target.status);
  }

  async function saveTargetEdit(targetId: string) {
    if (!editTargetTitle.trim()) {
      setErrorMessage("Target title is required.");
      return;
    }

    setBusyTargetId(targetId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/targets/${targetId}`, {
        method: "PATCH",
        body: {
          title: editTargetTitle.trim(),
          metric_type: editTargetMetricType,
          value_target: Number(editTargetValueTarget) || 0,
          value_current: Number(editTargetValueCurrent) || 0,
          unit: editTargetUnit.trim() || null,
          due_date: editTargetDueDate || null,
          status: editTargetStatus,
        },
      });
      setEditingTargetId(null);
      await loadData();
      setFeedback("Target updated.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyTargetId(null);
    }
  }

  async function deleteTarget(targetId: string) {
    if (!window.confirm("Delete this target?")) {
      return;
    }

    setBusyTargetId(targetId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/targets/${targetId}`, {
        method: "DELETE",
      });
      if (editingTargetId === targetId) {
        setEditingTargetId(null);
      }
      await loadData();
      setFeedback("Target deleted.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyTargetId(null);
    }
  }

  return (
    <WorkspaceShell
      title="Targets"
      subtitle="Create measurable checkpoints connected to your goals."
      module="targets"
    >
      <div className="stack">
        <MetricCard label="Targets live" value={String(targets.length)} />
        <MetricCard label="Goals available" value={String(goals.length)} />
        <MetricCard
          label="Completed"
          value={String(targets.filter((target) => target.status === "completed").length)}
        />
      </div>

      <Panel title="Add Target">
        {goals.length === 0 ? (
          <form className="form-grid" onSubmit={createGoalQuick}>
            <p className="callout">Najpierw dodaj jeden goal, aby tworzyc targety.</p>
            <label className="field">
              <span>Quick goal title</span>
              <input
                className="list-row"
                type="text"
                value={quickGoalTitle}
                onChange={(event) => setQuickGoalTitle(event.target.value)}
                placeholder="Example: Improve weekly planning discipline"
                disabled={isCreatingGoal}
              />
            </label>
            <button type="submit" className="btn-secondary" disabled={isCreatingGoal}>
              {isCreatingGoal ? "Creating..." : "Create goal first"}
            </button>
          </form>
        ) : null}
        <form className="form-grid" onSubmit={createTarget}>
          <label className="field">
            <span>Goal</span>
            <select
              className="list-row"
              value={newTargetGoalId}
              onChange={(event) => setNewTargetGoalId(event.target.value)}
              disabled={isCreating || goals.length === 0}
            >
              {goals.length === 0 ? <option value="">No goals yet</option> : null}
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Title</span>
            <input
              className="list-row"
              type="text"
              value={newTargetTitle}
              onChange={(event) => setNewTargetTitle(event.target.value)}
              placeholder="Example: 3 planning reviews per week"
              disabled={isCreating}
            />
          </label>
          <label className="field">
            <span>Metric type</span>
            <input
              className="list-row"
              type="text"
              value={newTargetMetricType}
              onChange={(event) => setNewTargetMetricType(event.target.value)}
              disabled={isCreating}
            />
          </label>
          <label className="field">
            <span>Target value</span>
            <input
              className="list-row"
              type="number"
              value={newTargetValueTarget}
              onChange={(event) => setNewTargetValueTarget(event.target.value)}
              disabled={isCreating}
            />
          </label>
          <label className="field">
            <span>Unit</span>
            <input
              className="list-row"
              type="text"
              value={newTargetUnit}
              onChange={(event) => setNewTargetUnit(event.target.value)}
              disabled={isCreating}
            />
          </label>
          <button
            type="submit"
            className="btn-primary"
            disabled={isCreating || goals.length === 0}
          >
            {isCreating ? "Adding..." : "Add target"}
          </button>
        </form>
      </Panel>

      <Panel title="Target Checkpoints">
        <ul className="list">
          {targets.length === 0 ? (
            <li className="list-row">
              <p>No targets yet. Add your first checkpoint above.</p>
            </li>
          ) : (
            targets.map((target) => (
              <li className="list-row" key={target.id}>
                {editingTargetId === target.id ? (
                  <div className="form-grid">
                    <label className="field">
                      <span>Title</span>
                      <input
                        className="list-row"
                        type="text"
                        value={editTargetTitle}
                        onChange={(event) => setEditTargetTitle(event.target.value)}
                        disabled={busyTargetId === target.id}
                      />
                    </label>
                    <div className="row-inline">
                      <label className="field">
                        <span>Metric type</span>
                        <input
                          className="list-row"
                          type="text"
                          value={editTargetMetricType}
                          onChange={(event) => setEditTargetMetricType(event.target.value)}
                          disabled={busyTargetId === target.id}
                        />
                      </label>
                      <label className="field">
                        <span>Status</span>
                        <select
                          className="list-row"
                          value={editTargetStatus}
                          onChange={(event) => setEditTargetStatus(event.target.value as TargetItem["status"])}
                          disabled={busyTargetId === target.id}
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                    </div>
                    <div className="row-inline">
                      <label className="field">
                        <span>Current</span>
                        <input
                          className="list-row"
                          type="number"
                          value={editTargetValueCurrent}
                          onChange={(event) => setEditTargetValueCurrent(event.target.value)}
                          disabled={busyTargetId === target.id}
                        />
                      </label>
                      <label className="field">
                        <span>Target</span>
                        <input
                          className="list-row"
                          type="number"
                          value={editTargetValueTarget}
                          onChange={(event) => setEditTargetValueTarget(event.target.value)}
                          disabled={busyTargetId === target.id}
                        />
                      </label>
                      <label className="field">
                        <span>Unit</span>
                        <input
                          className="list-row"
                          type="text"
                          value={editTargetUnit}
                          onChange={(event) => setEditTargetUnit(event.target.value)}
                          disabled={busyTargetId === target.id}
                        />
                      </label>
                      <label className="field">
                        <span>Due date</span>
                        <input
                          className="list-row"
                          type="date"
                          value={editTargetDueDate}
                          onChange={(event) => setEditTargetDueDate(event.target.value)}
                          disabled={busyTargetId === target.id}
                        />
                      </label>
                    </div>
                    <div className="row-inline">
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => void saveTargetEdit(target.id)}
                        disabled={busyTargetId === target.id}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => setEditingTargetId(null)}
                        disabled={busyTargetId === target.id}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>{target.title}</strong>
                      <p>
                        {target.value_current}/{target.value_target} {target.unit ?? ""}
                        {target.due_date ? ` | due ${target.due_date.slice(0, 10)}` : ""}
                      </p>
                    </div>
                    <div className="row-inline">
                      <span className="pill">{target.status}</span>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => startTargetEdit(target)}
                        disabled={busyTargetId === target.id}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => void deleteTarget(target.id)}
                        disabled={busyTargetId === target.id}
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
