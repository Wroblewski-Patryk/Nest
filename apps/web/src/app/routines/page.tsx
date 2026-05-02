"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { clearAuthSession } from "@/lib/auth-session";
import { apiRequest } from "@/lib/api-client";
import { getUserSafeErrorMessage } from "@/lib/ux-contract";

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
  return getUserSafeErrorMessage(error, "We couldn't update routines right now");
}

export default function RoutinesPage() {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [newRoutineTitle, setNewRoutineTitle] = useState("");
  const [newRoutineStepTitle, setNewRoutineStepTitle] = useState("");
  const [newRoutineStepDuration, setNewRoutineStepDuration] = useState("15");
  const [isCreating, setIsCreating] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [editRoutineTitle, setEditRoutineTitle] = useState("");
  const [editRoutineIsActive, setEditRoutineIsActive] = useState(true);
  const [busyRoutineId, setBusyRoutineId] = useState<string | null>(null);
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

  function startRoutineEdit(routine: RoutineItem) {
    setEditingRoutineId(routine.id);
    setEditRoutineTitle(routine.title);
    setEditRoutineIsActive(routine.is_active);
  }

  async function saveRoutineEdit(routineId: string) {
    if (!editRoutineTitle.trim()) {
      setErrorMessage("Routine title is required.");
      return;
    }

    setBusyRoutineId(routineId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/routines/${routineId}`, {
        method: "PATCH",
        body: {
          title: editRoutineTitle.trim(),
          is_active: editRoutineIsActive,
        },
      });
      setEditingRoutineId(null);
      await loadData();
      setFeedback("Routine updated.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyRoutineId(null);
    }
  }

  async function toggleRoutineActive(routine: RoutineItem) {
    setBusyRoutineId(routine.id);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/routines/${routine.id}`, {
        method: "PATCH",
        body: { is_active: !routine.is_active },
      });
      await loadData();
      setFeedback(routine.is_active ? "Routine paused." : "Routine reactivated.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyRoutineId(null);
    }
  }

  async function deleteRoutine(routineId: string) {
    if (
      !(await confirm({
        title: "Delete routine?",
        description: "This removes the routine and its steps from your workspace.",
        confirmLabel: "Delete routine",
        tone: "danger",
      }))
    ) {
      return;
    }

    setBusyRoutineId(routineId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/routines/${routineId}`, {
        method: "DELETE",
      });
      if (editingRoutineId === routineId) {
        setEditingRoutineId(null);
      }
      await loadData();
      setFeedback("Routine deleted.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyRoutineId(null);
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
      shellTone="dashboard-canonical"
      utilityDateLabel="Friday, May 23, 2025"
      utilityWeatherLabel="18°C"
      hideRailFooterActions
    >
      <div className="daily-system-shell">
        <div className="stack daily-system-metrics">
          <MetricCard label="Routines active" value={String(routines.length)} />
          <MetricCard label="Avg steps" value={String(avgSteps)} />
          <MetricCard
            label="Total steps"
            value={String(routines.reduce((sum, routine) => sum + routine.steps.length, 0))}
          />
        </div>

        <Panel title="Where routines fit" className="daily-system-panel daily-system-context">
          <p className="daily-system-context-copy">
            Routines connect habits with Calendar time blocks, so repeated work has a place instead of becoming background noise.
          </p>
          <div className="daily-system-context-links">
            <Link href="/calendar?action=create-event">Schedule time</Link>
            <Link href="/habits">Review habits</Link>
            <Link href="/dashboard">Return to Dashboard</Link>
          </div>
        </Panel>

        <Panel title="Create routine" className="daily-system-panel daily-system-composer">
          <form className="form-grid" onSubmit={createRoutine}>
            <label className="field">
              <span>Title</span>
              <input
                className="list-row"
                type="text"
                value={newRoutineTitle}
                onChange={(event) => setNewRoutineTitle(event.target.value)}
                placeholder="Example: Morning reset"
                disabled={isCreating}
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
                disabled={isCreating}
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
                disabled={isCreating}
              />
            </label>
            <button type="submit" className="btn-primary" disabled={isCreating}>
              {isCreating ? "Adding..." : "Add routine"}
            </button>
          </form>
        </Panel>

        <Panel title="Routine library" className="daily-system-panel daily-system-list-panel">
          <ul className="list">
            {routines.length === 0 ? (
              <li className="list-row">
                <p>No routines yet. Add your first one above.</p>
              </li>
            ) : (
              routines.map((routine) => (
                <li className="list-row" key={routine.id}>
                  {editingRoutineId === routine.id ? (
                    <div className="form-grid">
                      <label className="field">
                        <span>Title</span>
                        <input
                          className="list-row"
                          type="text"
                          value={editRoutineTitle}
                          onChange={(event) => setEditRoutineTitle(event.target.value)}
                          disabled={busyRoutineId === routine.id}
                        />
                      </label>
                      <label className="field">
                        <span>Active</span>
                        <input
                          type="checkbox"
                          checked={editRoutineIsActive}
                          onChange={(event) => setEditRoutineIsActive(event.target.checked)}
                          disabled={busyRoutineId === routine.id}
                        />
                      </label>
                      <div className="row-inline">
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => void saveRoutineEdit(routine.id)}
                          disabled={busyRoutineId === routine.id}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => setEditingRoutineId(null)}
                          disabled={busyRoutineId === routine.id}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>{routine.title}</strong>
                        <p>{routine.steps.length} steps configured</p>
                      </div>
                      <div className="row-inline">
                        <span className={`pill ${routine.is_active ? "state-success" : ""}`}>
                          {routine.is_active ? "active" : "inactive"}
                        </span>
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => startRoutineEdit(routine)}
                          disabled={busyRoutineId === routine.id}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => void toggleRoutineActive(routine)}
                          disabled={busyRoutineId === routine.id}
                        >
                          {routine.is_active ? "Pause" : "Activate"}
                        </button>
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => void deleteRoutine(routine.id)}
                          disabled={busyRoutineId === routine.id}
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
          <Panel title="Status" className="daily-system-panel daily-system-status">
            <p className="callout">{feedback}</p>
          </Panel>
        ) : null}
        {errorMessage ? (
          <Panel title="Error" className="daily-system-panel daily-system-status">
            <p className="callout state-error">{errorMessage}</p>
          </Panel>
        ) : null}
      </div>
      {confirmDialog}
    </WorkspaceShell>
  );
}
