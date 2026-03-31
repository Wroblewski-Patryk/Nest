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
                <div>
                  <strong>{target.title}</strong>
                  <p>
                    {target.value_current}/{target.value_target} {target.unit ?? ""}
                  </p>
                </div>
                <span className="pill">{target.status}</span>
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
