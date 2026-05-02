"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { clearAuthSession } from "@/lib/auth-session";
import { apiRequest, nestApiClient } from "@/lib/api-client";
import { useTranslator } from "@/lib/ui-language";
import { getUserSafeErrorMessage } from "@/lib/ux-contract";

type HabitItem = {
  id: string;
  title: string;
  type: "boolean" | "numeric" | "duration";
  cadence: Record<string, unknown>;
  is_active: boolean;
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
  return getUserSafeErrorMessage(error, "We couldn't update habits right now");
}

export default function HabitsPage() {
  const router = useRouter();
  const t = useTranslator();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitType, setNewHabitType] = useState<HabitItem["type"]>("boolean");
  const [newHabitCadence, setNewHabitCadence] = useState<"daily" | "weekly">("daily");
  const [isCreating, setIsCreating] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editHabitTitle, setEditHabitTitle] = useState("");
  const [editHabitType, setEditHabitType] = useState<HabitItem["type"]>("boolean");
  const [editHabitCadence, setEditHabitCadence] = useState<"daily" | "weekly">("daily");
  const [editHabitIsActive, setEditHabitIsActive] = useState(true);
  const [busyHabitId, setBusyHabitId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(() => t("web.habits.feedback.initial", "Add your first habit to start consistency tracking."));
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
        setFeedback(t("web.habits.feedback.loaded", "Habits loaded."));
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
  }, [handleUnauthorized, loadData, t]);

  async function createHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newHabitTitle.trim()) {
      setErrorMessage(t("web.habits.validation.title_required", "Habit title is required."));
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
      setFeedback(t("web.habits.feedback.created", "Habit created."));
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

  function startHabitEdit(habit: HabitItem) {
    setEditingHabitId(habit.id);
    setEditHabitTitle(habit.title);
    setEditHabitType(habit.type);
    const cadenceType: "daily" | "weekly" =
      typeof habit.cadence === "object" &&
      habit.cadence !== null &&
      "type" in habit.cadence &&
      (habit.cadence as { type?: unknown }).type === "weekly"
        ? "weekly"
        : "daily";
    setEditHabitCadence(cadenceType);
    setEditHabitIsActive(habit.is_active);
  }

  async function saveHabitEdit(habitId: string) {
    if (!editHabitTitle.trim()) {
      setErrorMessage(t("web.habits.validation.title_required", "Habit title is required."));
      return;
    }

    setBusyHabitId(habitId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/habits/${habitId}`, {
        method: "PATCH",
        body: {
          title: editHabitTitle.trim(),
          type: editHabitType,
          cadence: { type: editHabitCadence },
          is_active: editHabitIsActive,
        },
      });
      setEditingHabitId(null);
      await loadData();
      setFeedback(t("web.habits.feedback.updated", "Habit updated."));
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyHabitId(null);
    }
  }

  async function toggleHabitActive(habit: HabitItem) {
    setBusyHabitId(habit.id);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/habits/${habit.id}`, {
        method: "PATCH",
        body: { is_active: !habit.is_active },
      });
      await loadData();
      setFeedback(habit.is_active ? t("web.habits.feedback.paused", "Habit paused.") : t("web.habits.feedback.reactivated", "Habit reactivated."));
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyHabitId(null);
    }
  }

  async function deleteHabit(habitId: string) {
    if (
      !(await confirm({
        title: t("web.habits.confirm.delete_title", "Delete habit?"),
        description: t("web.habits.confirm.delete_body", "This removes the habit from your workspace. Existing progress connected to it may no longer be visible here."),
        confirmLabel: t("web.habits.action.delete_habit", "Delete habit"),
        tone: "danger",
      }))
    ) {
      return;
    }

    setBusyHabitId(habitId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/habits/${habitId}`, {
        method: "DELETE",
      });
      if (editingHabitId === habitId) {
        setEditingHabitId(null);
      }
      await loadData();
      setFeedback(t("web.habits.feedback.deleted", "Habit deleted."));
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyHabitId(null);
    }
  }

  const activeHabits = useMemo(() => habits.filter((habit) => habit.is_active).length, [habits]);

  return (
    <WorkspaceShell
      title={t("web.habits.title", "Habits")}
      subtitle={t("web.habits.subtitle", "Track recurring actions with clear, low-friction creation flow.")}
      module="habits"
      shellTone="dashboard-canonical"
      utilityDateLabel="Friday, May 23, 2025"
      utilityWeatherLabel="18°C"
      hideRailFooterActions
    >
      <div className="daily-system-shell">
        <div className="stack daily-system-metrics">
          <MetricCard label={t("web.habits.metric.tracked", "Habits tracked")} value={String(habits.length)} />
          <MetricCard label={t("web.habits.metric.active", "Active habits")} value={String(activeHabits)} />
          <MetricCard label={t("web.habits.metric.paused", "Paused habits")} value={String(habits.length - activeHabits)} />
        </div>

        <Panel title={t("web.habits.context.title", "Where habits fit")} className="daily-system-panel daily-system-context">
          <p className="daily-system-context-copy">
            {t("web.habits.context.copy", "Habits support the Dashboard rhythm and turn repeated Planning intentions into visible daily proof.")}
          </p>
          <div className="daily-system-context-links">
            <Link href="/dashboard">{t("web.habits.context.dashboard", "Dashboard rhythm")}</Link>
            <Link href="/tasks?action=create-task">{t("web.habits.context.capture_task", "Capture task")}</Link>
            <Link href="/routines">{t("web.habits.context.build_routine", "Build routine")}</Link>
          </div>
        </Panel>

        <Panel title={t("web.habits.panel.create", "Create habit")} className="daily-system-panel daily-system-composer">
          <form className="form-grid" onSubmit={createHabit}>
            <label className="field">
              <span>{t("web.common.field.title", "Title")}</span>
              <input
                className="list-row"
                type="text"
                value={newHabitTitle}
                onChange={(event) => setNewHabitTitle(event.target.value)}
                placeholder={t("web.habits.placeholder.title", "Example: 20 min reading")}
                disabled={isCreating}
              />
            </label>
            <label className="field">
              <span>{t("web.habits.field.type", "Type")}</span>
              <select
                className="list-row"
                value={newHabitType}
                onChange={(event) => setNewHabitType(event.target.value as HabitItem["type"])}
                disabled={isCreating}
              >
                <option value="boolean">{t("web.habits.type.boolean", "Boolean")}</option>
                <option value="numeric">{t("web.habits.type.numeric", "Numeric")}</option>
                <option value="duration">{t("web.habits.type.duration", "Duration")}</option>
              </select>
            </label>
            <label className="field">
              <span>{t("web.habits.field.cadence", "Cadence")}</span>
              <select
                className="list-row"
                value={newHabitCadence}
                onChange={(event) => setNewHabitCadence(event.target.value as "daily" | "weekly")}
                disabled={isCreating}
              >
                <option value="daily">{t("web.habits.cadence.daily", "Daily")}</option>
                <option value="weekly">{t("web.habits.cadence.weekly", "Weekly")}</option>
              </select>
            </label>
            <button type="submit" className="btn-primary" disabled={isCreating}>
              {isCreating ? t("web.common.action.adding", "Adding...") : t("web.habits.action.add", "Add habit")}
            </button>
          </form>
        </Panel>

        <Panel title={t("web.habits.panel.library", "Habit library")} className="daily-system-panel daily-system-list-panel">
          <ul className="list">
            {habits.length === 0 ? (
              <li className="list-row">
                <p>{t("web.habits.empty", "No habits yet. Add your first one above.")}</p>
              </li>
            ) : (
              habits.map((habit) => (
                <li className="list-row" key={habit.id}>
                  {editingHabitId === habit.id ? (
                    <div className="form-grid">
                      <label className="field">
                        <span>{t("web.common.field.title", "Title")}</span>
                        <input
                          className="list-row"
                          type="text"
                          value={editHabitTitle}
                          onChange={(event) => setEditHabitTitle(event.target.value)}
                          disabled={busyHabitId === habit.id}
                        />
                      </label>
                      <div className="row-inline">
                        <label className="field">
                          <span>{t("web.habits.field.type", "Type")}</span>
                          <select
                            className="list-row"
                            value={editHabitType}
                            onChange={(event) => setEditHabitType(event.target.value as HabitItem["type"])}
                            disabled={busyHabitId === habit.id}
                          >
                            <option value="boolean">{t("web.habits.type.boolean", "Boolean")}</option>
                            <option value="numeric">{t("web.habits.type.numeric", "Numeric")}</option>
                            <option value="duration">{t("web.habits.type.duration", "Duration")}</option>
                          </select>
                        </label>
                        <label className="field">
                          <span>{t("web.habits.field.cadence", "Cadence")}</span>
                          <select
                            className="list-row"
                            value={editHabitCadence}
                            onChange={(event) => setEditHabitCadence(event.target.value as "daily" | "weekly")}
                            disabled={busyHabitId === habit.id}
                          >
                            <option value="daily">{t("web.habits.cadence.daily", "Daily")}</option>
                            <option value="weekly">{t("web.habits.cadence.weekly", "Weekly")}</option>
                          </select>
                        </label>
                      </div>
                      <label className="field">
                        <span>{t("web.common.status.active", "Active")}</span>
                        <input
                          type="checkbox"
                          checked={editHabitIsActive}
                          onChange={(event) => setEditHabitIsActive(event.target.checked)}
                          disabled={busyHabitId === habit.id}
                        />
                      </label>
                      <div className="row-inline">
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => void saveHabitEdit(habit.id)}
                          disabled={busyHabitId === habit.id}
                        >
                          {t("web.common.action.save", "Save")}
                        </button>
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => setEditingHabitId(null)}
                          disabled={busyHabitId === habit.id}
                        >
                          {t("web.common.action.cancel", "Cancel")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>{habit.title}</strong>
                        <p>
                          {t(`web.habits.type.${habit.type}`, habit.type)} | {t("web.habits.field.cadence_lower", "cadence")}: {t(`web.habits.cadence.${String(habit.cadence?.type ?? "custom")}`, String(habit.cadence?.type ?? "custom"))}
                        </p>
                      </div>
                      <div className="row-inline">
                        <span className={`pill ${habit.is_active ? "state-success" : ""}`}>
                          {habit.is_active ? t("web.common.status.active_lower", "active") : t("web.common.status.inactive_lower", "inactive")}
                        </span>
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => startHabitEdit(habit)}
                          disabled={busyHabitId === habit.id}
                        >
                          {t("web.common.action.edit", "Edit")}
                        </button>
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => void toggleHabitActive(habit)}
                          disabled={busyHabitId === habit.id}
                        >
                          {habit.is_active ? t("web.common.action.pause", "Pause") : t("web.common.action.activate", "Activate")}
                        </button>
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => void deleteHabit(habit.id)}
                          disabled={busyHabitId === habit.id}
                        >
                          {t("web.common.action.delete", "Delete")}
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
          <Panel title={t("web.common.panel.status", "Status")} className="daily-system-panel daily-system-status">
            <p className="callout">{feedback}</p>
          </Panel>
        ) : null}
        {errorMessage ? (
          <Panel title={t("web.common.panel.error", "Error")} className="daily-system-panel daily-system-status">
            <p className="callout state-error">{errorMessage}</p>
          </Panel>
        ) : null}
      </div>
      {confirmDialog}
    </WorkspaceShell>
  );
}
