"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";

type TaskStatus = "todo" | "in_progress" | "done" | "canceled";
type TaskPriority = "low" | "medium" | "high" | "urgent";

type ListItem = {
  id: string;
  name: string;
  color: string;
  goal_id: string | null;
  target_id: string | null;
  life_area_id: string | null;
};

type TaskItem = {
  id: string;
  list_id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  life_area_id: string | null;
};

type GoalItem = {
  id: string;
  title: string;
};

type TargetItem = {
  id: string;
  goal_id: string;
  title: string;
};

type LifeAreaItem = {
  id: string;
  name: string;
};

type TaskDraft = {
  title: string;
  priority: TaskPriority;
  dueDate: string;
  lifeAreaId: string;
};

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
};

function createEmptyTaskDraft(): TaskDraft {
  return {
    title: "",
    priority: "medium",
    dueDate: "",
    lifeAreaId: "",
  };
}

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
  return "Tasks and lists request failed.";
}

function toDateInputValue(value: string | null): string {
  if (!value) {
    return "";
  }
  return value.slice(0, 10);
}

function formatPriority(priority: TaskPriority): string {
  if (priority === "urgent") {
    return "Urgent";
  }
  if (priority === "high") {
    return "High";
  }
  if (priority === "medium") {
    return "Medium";
  }
  return "Low";
}

export default function TasksPage() {
  const router = useRouter();

  const [lists, setLists] = useState<ListItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [lifeAreas, setLifeAreas] = useState<LifeAreaItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [creatingTaskForListId, setCreatingTaskForListId] = useState<string | null>(null);
  const [busyListId, setBusyListId] = useState<string | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState("#789262");
  const [newListGoalId, setNewListGoalId] = useState("");
  const [newListTargetId, setNewListTargetId] = useState("");
  const [newListLifeAreaId, setNewListLifeAreaId] = useState("");

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState("");
  const [editListColor, setEditListColor] = useState("#789262");
  const [editListGoalId, setEditListGoalId] = useState("");
  const [editListTargetId, setEditListTargetId] = useState("");
  const [editListLifeAreaId, setEditListLifeAreaId] = useState("");

  const [taskDrafts, setTaskDrafts] = useState<Record<string, TaskDraft>>({});

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>("medium");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskLifeAreaId, setEditTaskLifeAreaId] = useState("");
  const [editTaskStatus, setEditTaskStatus] = useState<TaskStatus>("todo");

  const [feedback, setFeedback] = useState("Kanban board gotowy: listy jako kolumny, taski jako karty.");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadWorkspace = useCallback(async () => {
    const [listsResponse, tasksResponse, goalsResponse, targetsResponse, lifeAreasResponse] = await Promise.all([
      nestApiClient.getLists({ per_page: 100 }),
      nestApiClient.getTasks({ per_page: 200, sort: "-created_at" }),
      nestApiClient.getGoals({ per_page: 100 }),
      apiRequest<{ data: TargetItem[] }>("/targets", { query: { per_page: 100 } }),
      apiRequest<{ data: LifeAreaItem[] }>("/life-areas", { query: { per_page: 100 } }),
    ]);

    const normalizedLists = (listsResponse.data ?? []) as ListItem[];
    setLists(normalizedLists);
    setTasks((tasksResponse.data ?? []) as TaskItem[]);
    setGoals((goalsResponse.data ?? []) as GoalItem[]);
    setTargets(targetsResponse.data ?? []);
    setLifeAreas(lifeAreasResponse.data ?? []);

    setTaskDrafts((current) => {
      const next: Record<string, TaskDraft> = {};
      for (const list of normalizedLists) {
        next[list.id] = current[list.id] ?? createEmptyTaskDraft();
      }
      return next;
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    loadWorkspace()
      .then(() => {
        if (mounted) {
          setFeedback("Board loaded.");
        }
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
  }, [handleUnauthorized, loadWorkspace]);

  const tasksByListId = useMemo(() => {
    const grouped = new Map<string, TaskItem[]>();
    for (const list of lists) {
      grouped.set(list.id, []);
    }

    for (const task of tasks) {
      const bucket = grouped.get(task.list_id);
      if (bucket) {
        bucket.push(task);
      }
    }

    return grouped;
  }, [lists, tasks]);

  const goalLabelById = useMemo(() => new Map(goals.map((goal) => [goal.id, goal.title])), [goals]);
  const targetLabelById = useMemo(() => new Map(targets.map((target) => [target.id, target.title])), [targets]);
  const lifeAreaLabelById = useMemo(
    () => new Map(lifeAreas.map((lifeArea) => [lifeArea.id, lifeArea.name])),
    [lifeAreas]
  );

  const openTasksCount = useMemo(
    () => tasks.filter((task) => task.status !== "done" && task.status !== "canceled").length,
    [tasks]
  );

  function getTargetsForGoal(goalId: string): TargetItem[] {
    if (!goalId) {
      return targets;
    }

    return targets.filter((target) => target.goal_id === goalId);
  }

  function setTaskDraft(listId: string, patch: Partial<TaskDraft>) {
    setTaskDrafts((current) => ({
      ...current,
      [listId]: {
        ...(current[listId] ?? createEmptyTaskDraft()),
        ...patch,
      },
    }));
  }

  async function createList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newListName.trim()) {
      setErrorMessage("List name is required.");
      return;
    }

    setIsCreatingList(true);
    setErrorMessage("");
    setFeedback("");

    try {
      await apiRequest("/lists", {
        method: "POST",
        body: {
          name: newListName.trim(),
          color: newListColor,
          goal_id: newListGoalId || null,
          target_id: newListTargetId || null,
          life_area_id: newListLifeAreaId || null,
        },
      });

      setNewListName("");
      setNewListGoalId("");
      setNewListTargetId("");
      setNewListLifeAreaId("");
      await loadWorkspace();
      setFeedback("List created.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreatingList(false);
    }
  }

  function startListEdit(list: ListItem) {
    setEditingListId(list.id);
    setEditListName(list.name);
    setEditListColor(list.color);
    setEditListGoalId(list.goal_id ?? "");
    setEditListTargetId(list.target_id ?? "");
    setEditListLifeAreaId(list.life_area_id ?? "");
  }

  async function saveListEdit(listId: string) {
    if (!editListName.trim()) {
      setErrorMessage("List name is required.");
      return;
    }

    setBusyListId(listId);
    setErrorMessage("");
    setFeedback("");

    try {
      await apiRequest(`/lists/${listId}`, {
        method: "PATCH",
        body: {
          name: editListName.trim(),
          color: editListColor,
          goal_id: editListGoalId || null,
          target_id: editListTargetId || null,
          life_area_id: editListLifeAreaId || null,
        },
      });

      setEditingListId(null);
      await loadWorkspace();
      setFeedback("List updated.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyListId(null);
    }
  }

  async function deleteList(listId: string) {
    if (!window.confirm("Delete this list?")) {
      return;
    }

    setBusyListId(listId);
    setErrorMessage("");
    setFeedback("");

    try {
      await apiRequest(`/lists/${listId}`, { method: "DELETE" });

      if (editingListId === listId) {
        setEditingListId(null);
      }

      await loadWorkspace();
      setFeedback("List deleted.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyListId(null);
    }
  }

  async function createTaskInList(listId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const draft = taskDrafts[listId] ?? createEmptyTaskDraft();
    if (!draft.title.trim()) {
      setErrorMessage("Task title is required.");
      return;
    }

    setCreatingTaskForListId(listId);
    setErrorMessage("");
    setFeedback("");

    try {
      await apiRequest("/tasks", {
        method: "POST",
        body: {
          list_id: listId,
          title: draft.title.trim(),
          priority: draft.priority,
          due_date: draft.dueDate || null,
          life_area_id: draft.lifeAreaId || null,
        },
      });

      setTaskDraft(listId, createEmptyTaskDraft());
      await loadWorkspace();
      setFeedback("Task created.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setCreatingTaskForListId(null);
    }
  }

  function startTaskEdit(task: TaskItem) {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(toDateInputValue(task.due_date));
    setEditTaskLifeAreaId(task.life_area_id ?? "");
    setEditTaskStatus(task.status);
  }

  async function saveTaskEdit(taskId: string) {
    if (!editTaskTitle.trim()) {
      setErrorMessage("Task title is required.");
      return;
    }

    setBusyTaskId(taskId);
    setErrorMessage("");
    setFeedback("");

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: "PATCH",
        body: {
          title: editTaskTitle.trim(),
          priority: editTaskPriority,
          due_date: editTaskDueDate || null,
          life_area_id: editTaskLifeAreaId || null,
          status: editTaskStatus,
        },
      });

      setEditingTaskId(null);
      await loadWorkspace();
      setFeedback("Task updated.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyTaskId(null);
    }
  }

  async function toggleTaskDone(task: TaskItem) {
    setBusyTaskId(task.id);
    setErrorMessage("");
    setFeedback("");

    try {
      await apiRequest(`/tasks/${task.id}`, {
        method: "PATCH",
        body: {
          status: task.status === "done" ? "todo" : "done",
        },
      });

      await loadWorkspace();
      setFeedback(task.status === "done" ? "Task reopened." : "Task marked as done.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyTaskId(null);
    }
  }

  async function deleteTask(taskId: string) {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    setBusyTaskId(taskId);
    setErrorMessage("");
    setFeedback("");

    try {
      await apiRequest(`/tasks/${taskId}`, { method: "DELETE" });
      if (editingTaskId === taskId) {
        setEditingTaskId(null);
      }
      await loadWorkspace();
      setFeedback("Task deleted.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyTaskId(null);
    }
  }

  return (
    <WorkspaceShell
      title="Tasks + Lists"
      subtitle="Widok tablicy: tworz listy, przypinaj je do goal/target/life area i zarzadzaj kartami."
      module="tasks"
      contentLayout="single"
    >
      <div className="stack">
        <MetricCard label="Lists" value={String(lists.length)} />
        <MetricCard label="Open tasks" value={String(openTasksCount)} />
        <MetricCard
          label="Completed"
          value={String(tasks.filter((task) => task.status === "done").length)}
        />
        <MetricCard
          label="Lists with context"
          value={String(lists.filter((list) => list.goal_id || list.target_id || list.life_area_id).length)}
        />
      </div>

      <Panel title="Create List">
        <form className="form-grid" onSubmit={createList}>
          <label className="field">
            <span>Name</span>
            <input
              className="list-row"
              type="text"
              value={newListName}
              onChange={(event) => setNewListName(event.target.value)}
              placeholder="Example: Weekly Focus"
              disabled={isCreatingList}
            />
          </label>

          <div className="row-inline">
            <label className="field">
              <span>Color</span>
              <input
                className="list-row"
                type="color"
                value={newListColor}
                onChange={(event) => setNewListColor(event.target.value)}
                disabled={isCreatingList}
              />
            </label>
            <label className="field">
              <span>Goal</span>
              <select
                className="list-row"
                value={newListGoalId}
                onChange={(event) => {
                  setNewListGoalId(event.target.value);
                  if (newListTargetId) {
                    const selectedTarget = targets.find((target) => target.id === newListTargetId);
                    if (selectedTarget && selectedTarget.goal_id !== event.target.value) {
                      setNewListTargetId("");
                    }
                  }
                }}
                disabled={isCreatingList}
              >
                <option value="">No goal</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Target</span>
              <select
                className="list-row"
                value={newListTargetId}
                onChange={(event) => {
                  setNewListTargetId(event.target.value);
                  if (!newListGoalId && event.target.value) {
                    const selectedTarget = targets.find((target) => target.id === event.target.value);
                    if (selectedTarget) {
                      setNewListGoalId(selectedTarget.goal_id);
                    }
                  }
                }}
                disabled={isCreatingList}
              >
                <option value="">No target</option>
                {getTargetsForGoal(newListGoalId).map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Life area</span>
              <select
                className="list-row"
                value={newListLifeAreaId}
                onChange={(event) => setNewListLifeAreaId(event.target.value)}
                disabled={isCreatingList}
              >
                <option value="">No life area</option>
                {lifeAreas.map((lifeArea) => (
                  <option key={lifeArea.id} value={lifeArea.id}>
                    {lifeArea.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={isCreatingList}>
            {isCreatingList ? "Creating..." : "Create list"}
          </button>
        </form>
      </Panel>

      <section className="panel">
        <div className="panel-header">
          <h2>Kanban Board</h2>
          <div className="panel-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void loadWorkspace()}
              disabled={isLoading}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="panel-content">
          {isLoading ? <p className="callout state-loading">Loading board...</p> : null}
          {!isLoading && lists.length === 0 ? (
            <p className="callout state-empty">No lists yet. Create one above to start your board.</p>
          ) : null}

          {!isLoading && lists.length > 0 ? (
            <div className="kanban-columns">
              {lists.map((list) => {
                const listTasks = tasksByListId.get(list.id) ?? [];
                const draft = taskDrafts[list.id] ?? createEmptyTaskDraft();

                return (
                  <article
                    className="kanban-column"
                    key={list.id}
                    style={{ borderTop: `3px solid ${list.color}` }}
                  >
                    <header className="kanban-column-head">
                      <div className="kanban-column-top">
                        <h3 className="kanban-column-title">{list.name}</h3>
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => startListEdit(list)}
                          disabled={busyListId === list.id}
                        >
                          Edit list
                        </button>
                      </div>

                      <div className="kanban-badges">
                        <span className="kanban-badge">{listTasks.length} cards</span>
                        {list.goal_id ? (
                          <span className="kanban-badge">Goal: {goalLabelById.get(list.goal_id)}</span>
                        ) : null}
                        {list.target_id ? (
                          <span className="kanban-badge">Target: {targetLabelById.get(list.target_id)}</span>
                        ) : null}
                        {list.life_area_id ? (
                          <span className="kanban-badge">Area: {lifeAreaLabelById.get(list.life_area_id)}</span>
                        ) : null}
                      </div>
                    </header>

                    {editingListId === list.id ? (
                      <div className="form-grid">
                        <label className="field">
                          <span>Name</span>
                          <input
                            className="list-row"
                            type="text"
                            value={editListName}
                            onChange={(event) => setEditListName(event.target.value)}
                            disabled={busyListId === list.id}
                          />
                        </label>

                        <div className="row-inline">
                          <label className="field">
                            <span>Color</span>
                            <input
                              className="list-row"
                              type="color"
                              value={editListColor}
                              onChange={(event) => setEditListColor(event.target.value)}
                              disabled={busyListId === list.id}
                            />
                          </label>
                          <label className="field">
                            <span>Goal</span>
                            <select
                              className="list-row"
                              value={editListGoalId}
                              onChange={(event) => {
                                setEditListGoalId(event.target.value);
                                if (editListTargetId) {
                                  const selectedTarget = targets.find((target) => target.id === editListTargetId);
                                  if (selectedTarget && selectedTarget.goal_id !== event.target.value) {
                                    setEditListTargetId("");
                                  }
                                }
                              }}
                              disabled={busyListId === list.id}
                            >
                              <option value="">No goal</option>
                              {goals.map((goal) => (
                                <option key={goal.id} value={goal.id}>
                                  {goal.title}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="field">
                            <span>Target</span>
                            <select
                              className="list-row"
                              value={editListTargetId}
                              onChange={(event) => {
                                setEditListTargetId(event.target.value);
                                if (!editListGoalId && event.target.value) {
                                  const selectedTarget = targets.find((target) => target.id === event.target.value);
                                  if (selectedTarget) {
                                    setEditListGoalId(selectedTarget.goal_id);
                                  }
                                }
                              }}
                              disabled={busyListId === list.id}
                            >
                              <option value="">No target</option>
                              {getTargetsForGoal(editListGoalId).map((target) => (
                                <option key={target.id} value={target.id}>
                                  {target.title}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="field">
                            <span>Life area</span>
                            <select
                              className="list-row"
                              value={editListLifeAreaId}
                              onChange={(event) => setEditListLifeAreaId(event.target.value)}
                              disabled={busyListId === list.id}
                            >
                              <option value="">No life area</option>
                              {lifeAreas.map((lifeArea) => (
                                <option key={lifeArea.id} value={lifeArea.id}>
                                  {lifeArea.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <div className="row-inline">
                          <button
                            type="button"
                            className="pill-link"
                            onClick={() => void saveListEdit(list.id)}
                            disabled={busyListId === list.id}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="pill-link"
                            onClick={() => setEditingListId(null)}
                            disabled={busyListId === list.id}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="pill-link"
                            onClick={() => void deleteList(list.id)}
                            disabled={busyListId === list.id}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="panel-content">
                      {listTasks.length === 0 ? (
                        <p className="callout state-empty">No cards in this list yet.</p>
                      ) : null}

                      {listTasks.map((task) => (
                        <article className="kanban-card" key={task.id}>
                          {editingTaskId === task.id ? (
                            <div className="form-grid">
                              <label className="field">
                                <span>Title</span>
                                <input
                                  className="list-row"
                                  type="text"
                                  value={editTaskTitle}
                                  onChange={(event) => setEditTaskTitle(event.target.value)}
                                  disabled={busyTaskId === task.id}
                                />
                              </label>

                              <div className="row-inline">
                                <label className="field">
                                  <span>Status</span>
                                  <select
                                    className="list-row"
                                    value={editTaskStatus}
                                    onChange={(event) => setEditTaskStatus(event.target.value as TaskStatus)}
                                    disabled={busyTaskId === task.id}
                                  >
                                    <option value="todo">To do</option>
                                    <option value="in_progress">In progress</option>
                                    <option value="done">Done</option>
                                    <option value="canceled">Canceled</option>
                                  </select>
                                </label>
                                <label className="field">
                                  <span>Priority</span>
                                  <select
                                    className="list-row"
                                    value={editTaskPriority}
                                    onChange={(event) => setEditTaskPriority(event.target.value as TaskPriority)}
                                    disabled={busyTaskId === task.id}
                                  >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                  </select>
                                </label>
                              </div>

                              <div className="row-inline">
                                <label className="field">
                                  <span>Due date</span>
                                  <input
                                    className="list-row"
                                    type="date"
                                    value={editTaskDueDate}
                                    onChange={(event) => setEditTaskDueDate(event.target.value)}
                                    disabled={busyTaskId === task.id}
                                  />
                                </label>
                                <label className="field">
                                  <span>Life area</span>
                                  <select
                                    className="list-row"
                                    value={editTaskLifeAreaId}
                                    onChange={(event) => setEditTaskLifeAreaId(event.target.value)}
                                    disabled={busyTaskId === task.id}
                                  >
                                    <option value="">No life area</option>
                                    {lifeAreas.map((lifeArea) => (
                                      <option key={lifeArea.id} value={lifeArea.id}>
                                        {lifeArea.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              </div>

                              <div className="kanban-actions">
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => void saveTaskEdit(task.id)}
                                  disabled={busyTaskId === task.id}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => setEditingTaskId(null)}
                                  disabled={busyTaskId === task.id}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4>{task.title}</h4>
                              <p>Priority: {formatPriority(task.priority)}</p>
                              {task.due_date ? <p>Due: {toDateInputValue(task.due_date)}</p> : null}
                              {task.life_area_id ? (
                                <p>Area: {lifeAreaLabelById.get(task.life_area_id) ?? "Unknown"}</p>
                              ) : null}

                              <div className="kanban-actions">
                                <span className="pill">{task.status}</span>
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => void toggleTaskDone(task)}
                                  disabled={busyTaskId === task.id}
                                >
                                  {task.status === "done" ? "Reopen" : "Done"}
                                </button>
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => startTaskEdit(task)}
                                  disabled={busyTaskId === task.id}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => void deleteTask(task.id)}
                                  disabled={busyTaskId === task.id}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </article>
                      ))}
                    </div>

                    <footer className="kanban-column-footer">
                      <form className="form-grid" onSubmit={(event) => void createTaskInList(list.id, event)}>
                        <label className="field">
                          <span>Add card</span>
                          <input
                            className="list-row"
                            type="text"
                            value={draft.title}
                            onChange={(event) => setTaskDraft(list.id, { title: event.target.value })}
                            placeholder="Task title"
                            disabled={creatingTaskForListId === list.id}
                          />
                        </label>

                        <div className="row-inline">
                          <label className="field">
                            <span>Priority</span>
                            <select
                              className="list-row"
                              value={draft.priority}
                              onChange={(event) =>
                                setTaskDraft(list.id, { priority: event.target.value as TaskPriority })
                              }
                              disabled={creatingTaskForListId === list.id}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </label>
                          <label className="field">
                            <span>Due date</span>
                            <input
                              className="list-row"
                              type="date"
                              value={draft.dueDate}
                              onChange={(event) => setTaskDraft(list.id, { dueDate: event.target.value })}
                              disabled={creatingTaskForListId === list.id}
                            />
                          </label>
                          <label className="field">
                            <span>Life area</span>
                            <select
                              className="list-row"
                              value={draft.lifeAreaId}
                              onChange={(event) => setTaskDraft(list.id, { lifeAreaId: event.target.value })}
                              disabled={creatingTaskForListId === list.id}
                            >
                              <option value="">No life area</option>
                              {lifeAreas.map((lifeArea) => (
                                <option key={lifeArea.id} value={lifeArea.id}>
                                  {lifeArea.name}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="btn-secondary"
                          disabled={creatingTaskForListId === list.id}
                        >
                          {creatingTaskForListId === list.id ? "Adding..." : "Add card"}
                        </button>
                      </form>
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

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
