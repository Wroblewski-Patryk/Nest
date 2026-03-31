"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";

type RoutineStep = {
  id: string;
  title: string;
  duration_minutes: number | null;
};

type RoutineItem = {
  id: string;
  title: string;
  is_active: boolean;
  steps: RoutineStep[];
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
  return "Routine request failed.";
}

export default function RoutinesPage() {
  const router = useRouter();
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [newRoutineTitle, setNewRoutineTitle] = useState("");
  const [newRoutineStepTitle, setNewRoutineStepTitle] = useState("");
  const [newRoutineStepDuration, setNewRoutineStepDuration] = useState("15");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState("Add first routine with one step and expand later.");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadData = useCallback(async () => {
    const response = await apiRequest<{ data: RoutineItem[] }>("/routines", {
      query: { per_page: 100 },
    });
    setRoutines(response.data ?? []);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadData()
      .then(() => {
        if (!mounted) {
          return;
        }
        setFeedback("Routines loaded.");
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

  async function createRoutine(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newRoutineTitle.trim()) {
      setErrorMessage("Routine title is required.");
      return;
    }
    if (!newRoutineStepTitle.trim()) {
      setErrorMessage("At least one step title is required.");
      return;
    }

    setIsCreating(true);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest("/routines", {
        method: "POST",
        body: {
          title: newRoutineTitle.trim(),
          is_active: true,
          steps: [
            {
              title: newRoutineStepTitle.trim(),
              duration_minutes: Number(newRoutineStepDuration) || 0,
            },
          ],
        },
      });
      setNewRoutineTitle("");
      setNewRoutineStepTitle("");
      setNewRoutineStepDuration("15");
      await loadData();
      setFeedback("Routine created.");
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

  const avgSteps = useMemo(() => {
    if (routines.length === 0) {
      return 0;
    }

    const totalSteps = routines.reduce((sum, routine) => sum + routine.steps.length, 0);
    return Math.round((totalSteps / routines.length) * 10) / 10;
  }, [routines]);

  return (
    <WorkspaceShell
      title="Routines"
      subtitle="Create repeatable rituals with a practical first-step setup flow."
      module="routines"
    >
      <div className="stack">
        <MetricCard label="Routines active" value={String(routines.length)} />
        <MetricCard label="Avg steps" value={String(avgSteps)} />
        <MetricCard label="Create flow" value="Enabled" />
      </div>

      <Panel title="Add Routine">
        <form className="form-grid" onSubmit={createRoutine}>
          <label className="field">
            <span>Title</span>
            <input
              className="list-row"
              type="text"
              value={newRoutineTitle}
              onChange={(event) => setNewRoutineTitle(event.target.value)}
              placeholder="Example: Morning reset"
              disabled={isCreating || isLoading}
            />
          </label>
          <label className="field">
            <span>First step</span>
            <input
              className="list-row"
              type="text"
              value={newRoutineStepTitle}
              onChange={(event) => setNewRoutineStepTitle(event.target.value)}
              placeholder="Example: Hydrate"
              disabled={isCreating || isLoading}
            />
          </label>
          <label className="field">
            <span>First step duration (min)</span>
            <input
              className="list-row"
              type="number"
              min={0}
              value={newRoutineStepDuration}
              onChange={(event) => setNewRoutineStepDuration(event.target.value)}
              disabled={isCreating || isLoading}
            />
          </label>
          <button type="submit" className="btn-primary" disabled={isCreating || isLoading}>
            {isCreating ? "Adding..." : "Add routine"}
          </button>
        </form>
      </Panel>

      <Panel title="Routine List">
        <ul className="list">
          {routines.length === 0 ? (
            <li className="list-row">
              <p>No routines yet. Add your first one above.</p>
            </li>
          ) : (
            routines.map((routine) => (
              <li className="list-row" key={routine.id}>
                <div>
                  <strong>{routine.title}</strong>
                  <p>{routine.steps.length} steps configured</p>
                </div>
                <span className={`pill ${routine.is_active ? "state-success" : ""}`}>
                  {routine.is_active ? "active" : "inactive"}
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
