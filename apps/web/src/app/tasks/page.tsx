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
  list_id: string | null;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  life_area_id: string | null;
};

type ListParentType = "none" | "goal" | "target" | "life_area";

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

const UNASSIGNED_COLUMN_ID = "__unassigned__";

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
    (error as { payload: { errors?: unknown } }).payload?.errors &&
    typeof (error as { payload: { errors: unknown } }).payload.errors === "object"
  ) {
    const details = (error as { payload: { errors: Record<string, unknown> } }).payload.errors;
    const firstFieldError = Object.values(details).find(
      (value) => Array.isArray(value) && typeof value[0] === "string"
    ) as string[] | undefined;
    if (firstFieldError?.[0]) {
      return firstFieldError[0];
    }
  }

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

function toLocalDateKey(value: Date): string {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
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

function formatStatus(status: TaskStatus): string {
  if (status === "in_progress") {
    return "In progress";
  }
  if (status === "done") {
    return "Done";
  }
  if (status === "canceled") {
    return "Canceled";
  }
  return "To do";
}

function resolveParentType(list: ListItem): { type: ListParentType; id: string } {
  if (list.target_id) {
    return { type: "target", id: list.target_id };
  }

  if (list.goal_id) {
    return { type: "goal", id: list.goal_id };
  }

  if (list.life_area_id) {
    return { type: "life_area", id: list.life_area_id };
  }

  return { type: "none", id: "" };
}

function buildListParentPayload(type: ListParentType, id: string): {
  goal_id: string | null;
  target_id: string | null;
  life_area_id: string | null;
} {
  if (type === "goal") {
    return { goal_id: id || null, target_id: null, life_area_id: null };
  }

  if (type === "target") {
    return { goal_id: null, target_id: id || null, life_area_id: null };
  }

  if (type === "life_area") {
    return { goal_id: null, target_id: null, life_area_id: id || null };
  }

  return { goal_id: null, target_id: null, life_area_id: null };
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
  const [newListParentType, setNewListParentType] = useState<ListParentType>("none");
  const [newListParentId, setNewListParentId] = useState("");

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState("");
  const [editListColor, setEditListColor] = useState("#789262");
  const [editListParentType, setEditListParentType] = useState<ListParentType>("none");
  const [editListParentId, setEditListParentId] = useState("");

  const [taskDrafts, setTaskDrafts] = useState<Record<string, TaskDraft>>({});

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>("medium");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskLifeAreaId, setEditTaskLifeAreaId] = useState("");
  const [editTaskStatus, setEditTaskStatus] = useState<TaskStatus>("todo");
  const [editTaskListId, setEditTaskListId] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "done">("all");
  const [listContextFilter, setListContextFilter] = useState<"all" | "with_context" | "without_context">("all");
  const [boardLifeAreaFilter, setBoardLifeAreaFilter] = useState("");
  const [hideEmptyColumns, setHideEmptyColumns] = useState(false);

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
      next[UNASSIGNED_COLUMN_ID] = current[UNASSIGNED_COLUMN_ID] ?? createEmptyTaskDraft();
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
    grouped.set(UNASSIGNED_COLUMN_ID, []);

    for (const task of tasks) {
      const bucketKey = task.list_id ?? UNASSIGNED_COLUMN_ID;
      const bucket = grouped.get(bucketKey);
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

  const todayKey = useMemo(() => toLocalDateKey(new Date()), []);
  const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const openTasksCount = useMemo(
    () => tasks.filter((task) => task.status !== "done" && task.status !== "canceled").length,
    [tasks]
  );
  const dueTodayCount = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.due_date?.slice(0, 10) === todayKey && task.status !== "done" && task.status !== "canceled"
      ).length,
    [tasks, todayKey]
  );
  const overdueCount = useMemo(
    () =>
      tasks.filter(
        (task) =>
          Boolean(task.due_date) &&
          task.due_date!.slice(0, 10) < todayKey &&
          task.status !== "done" &&
          task.status !== "canceled"
      ).length,
    [tasks, todayKey]
  );

  const filteredTasksByListId = useMemo(() => {
    const grouped = new Map<string, TaskItem[]>();
    for (const [columnId, columnTasks] of tasksByListId.entries()) {
      const filtered = columnTasks.filter((task) => {
        if (statusFilter === "open" && (task.status === "done" || task.status === "canceled")) {
          return false;
        }

        if (statusFilter === "done" && task.status !== "done") {
          return false;
        }

        if (boardLifeAreaFilter && task.life_area_id !== boardLifeAreaFilter) {
          return false;
        }

        if (normalizedSearch && !task.title.toLowerCase().includes(normalizedSearch)) {
          return false;
        }

        return true;
      });

      grouped.set(columnId, filtered);
    }

    return grouped;
  }, [boardLifeAreaFilter, normalizedSearch, statusFilter, tasksByListId]);

  const filteredUnassignedTasks = useMemo(
    () => filteredTasksByListId.get(UNASSIGNED_COLUMN_ID) ?? [],
    [filteredTasksByListId]
  );

  const visibleLists = useMemo(() => {
    return lists.filter((list) => {
      if (listContextFilter === "with_context" && !list.goal_id && !list.target_id && !list.life_area_id) {
        return false;
      }

      if (listContextFilter === "without_context" && (list.goal_id || list.target_id || list.life_area_id)) {
        return false;
      }

      const listTasks = filteredTasksByListId.get(list.id) ?? [];
      if (hideEmptyColumns && listTasks.length === 0) {
        return false;
      }

      if (normalizedSearch && !list.name.toLowerCase().includes(normalizedSearch) && listTasks.length === 0) {
        return false;
      }

      return true;
    });
  }, [filteredTasksByListId, hideEmptyColumns, listContextFilter, lists, normalizedSearch]);

  const showUnassignedColumn = useMemo(() => {
    if (hideEmptyColumns && filteredUnassignedTasks.length === 0) {
      return false;
    }

    if (normalizedSearch && filteredUnassignedTasks.length === 0) {
      return false;
    }

    return true;
  }, [filteredUnassignedTasks.length, hideEmptyColumns, normalizedSearch]);

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

    if (newListParentType !== "none" && !newListParentId) {
      setErrorMessage("Select parent for selected parent type.");
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
          ...buildListParentPayload(newListParentType, newListParentId),
        },
      });

      setNewListName("");
      setNewListParentType("none");
      setNewListParentId("");
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
    const parent = resolveParentType(list);
    setEditingListId(list.id);
    setEditListName(list.name);
    setEditListColor(list.color);
    setEditListParentType(parent.type);
    setEditListParentId(parent.id);
  }

  async function saveListEdit(listId: string) {
    if (!editListName.trim()) {
      setErrorMessage("List name is required.");
      return;
    }

    if (editListParentType !== "none" && !editListParentId) {
      setErrorMessage("Select parent for selected parent type.");
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
          ...buildListParentPayload(editListParentType, editListParentId),
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

  async function createTaskInList(columnId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const draft = taskDrafts[columnId] ?? createEmptyTaskDraft();
    if (!draft.title.trim()) {
      setErrorMessage("Task title is required.");
      return;
    }

    setCreatingTaskForListId(columnId);
    setErrorMessage("");
    setFeedback("");

    try {
      const resolvedListId = columnId === UNASSIGNED_COLUMN_ID ? null : columnId;
      await apiRequest("/tasks", {
        method: "POST",
        body: {
          list_id: resolvedListId,
          title: draft.title.trim(),
          priority: draft.priority,
          due_date: draft.dueDate || null,
          life_area_id: draft.lifeAreaId || null,
        },
      });

      setTaskDraft(columnId, createEmptyTaskDraft());
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
    setEditTaskListId(task.list_id ?? "");
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
          list_id: editTaskListId || null,
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
        <MetricCard label="Due today" value={String(dueTodayCount)} />
        <MetricCard label="Overdue" value={String(overdueCount)} />
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
              <span>Parent type</span>
              <select
                className="list-row"
                value={newListParentType}
                onChange={(event) => {
                  setNewListParentType(event.target.value as ListParentType);
                  setNewListParentId("");
                }}
                disabled={isCreatingList}
              >
                <option value="none">No parent</option>
                <option value="goal">Goal</option>
                <option value="target">Target</option>
                <option value="life_area">Life area</option>
              </select>
            </label>
            {newListParentType !== "none" ? (
              <label className="field">
                <span>Parent</span>
                <select
                  className="list-row"
                  value={newListParentId}
                  onChange={(event) => setNewListParentId(event.target.value)}
                  disabled={isCreatingList}
                >
                  <option value="">Select parent</option>
                  {newListParentType === "goal"
                    ? goals.map((goal) => (
                        <option key={goal.id} value={goal.id}>
                          {goal.title}
                        </option>
                      ))
                    : null}
                  {newListParentType === "target"
                    ? targets.map((target) => (
                        <option key={target.id} value={target.id}>
                          {target.title}
                        </option>
                      ))
                    : null}
                  {newListParentType === "life_area"
                    ? lifeAreas.map((lifeArea) => (
                        <option key={lifeArea.id} value={lifeArea.id}>
                          {lifeArea.name}
                        </option>
                      ))
                    : null}
                </select>
              </label>
            ) : null}
          </div>

          <button type="submit" className="btn-primary" disabled={isCreatingList}>
            {isCreatingList ? "Creating..." : "Create list"}
          </button>
        </form>
      </Panel>

      <Panel title="Board Filters">
        <div className="tasks-board-toolbar">
          <label className="field tasks-search">
            <span>Search</span>
            <input
              className="list-row"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search list or task title"
            />
          </label>

          <div className="tasks-filter-group" role="group" aria-label="Status filter">
            <button
              type="button"
              className={`filter-chip ${statusFilter === "all" ? "is-active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-chip ${statusFilter === "open" ? "is-active" : ""}`}
              onClick={() => setStatusFilter("open")}
            >
              Open
            </button>
            <button
              type="button"
              className={`filter-chip ${statusFilter === "done" ? "is-active" : ""}`}
              onClick={() => setStatusFilter("done")}
            >
              Done
            </button>
          </div>

          <label className="field">
            <span>Context</span>
            <select
              className="list-row"
              value={listContextFilter}
              onChange={(event) =>
                setListContextFilter(event.target.value as "all" | "with_context" | "without_context")
              }
            >
              <option value="all">All lists</option>
              <option value="with_context">Only contextualized</option>
              <option value="without_context">Only without context</option>
            </select>
          </label>

          <label className="field">
            <span>Life area</span>
            <select
              className="list-row"
              value={boardLifeAreaFilter}
              onChange={(event) => setBoardLifeAreaFilter(event.target.value)}
            >
              <option value="">All areas</option>
              {lifeAreas.map((lifeArea) => (
                <option key={lifeArea.id} value={lifeArea.id}>
                  {lifeArea.name}
                </option>
              ))}
            </select>
          </label>

          <label className="tasks-toggle">
            <input
              type="checkbox"
              checked={hideEmptyColumns}
              onChange={(event) => setHideEmptyColumns(event.target.checked)}
            />
            Hide empty columns
          </label>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setListContextFilter("all");
              setBoardLifeAreaFilter("");
              setHideEmptyColumns(false);
            }}
          >
            Reset
          </button>
        </div>
      </Panel>

      <section className="panel">
        <div className="panel-header">
          <h2>Kanban Board</h2>
          <div className="panel-actions">
            <span className="pill">{visibleLists.length + (showUnassignedColumn ? 1 : 0)} columns</span>
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
          {!isLoading && lists.length > 0 && visibleLists.length === 0 && !showUnassignedColumn ? (
            <p className="callout state-empty">No columns match current filters.</p>
          ) : null}

          {!isLoading && (visibleLists.length > 0 || showUnassignedColumn) ? (
            <div className="kanban-columns">
              {showUnassignedColumn ? (
                <article className="kanban-column kanban-column-unassigned" key={UNASSIGNED_COLUMN_ID}>
                  <header className="kanban-column-head">
                    <div className="kanban-column-top">
                      <h3 className="kanban-column-title">No List</h3>
                    </div>
                    <div className="kanban-badges">
                      <span className="kanban-badge">
                        {`${filteredUnassignedTasks.length}/${tasksByListId.get(UNASSIGNED_COLUMN_ID)?.length ?? 0} cards`}
                      </span>
                    </div>
                  </header>

                  <div className="panel-content">
                    {filteredUnassignedTasks.length === 0 ? (
                      <p className="callout state-empty">No standalone tasks.</p>
                    ) : null}

                    {filteredUnassignedTasks.map((task) => {
                      const dueDateLabel = toDateInputValue(task.due_date);
                      const isOverdue =
                        Boolean(task.due_date) &&
                        dueDateLabel < todayKey &&
                        task.status !== "done" &&
                        task.status !== "canceled";

                      return (
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
                                  <span>List</span>
                                  <select
                                    className="list-row"
                                    value={editTaskListId}
                                    onChange={(event) => setEditTaskListId(event.target.value)}
                                    disabled={busyTaskId === task.id}
                                  >
                                    <option value="">No list</option>
                                    {lists.map((listOption) => (
                                      <option key={listOption.id} value={listOption.id}>
                                        {listOption.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
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
                              <div className="kanban-meta">
                                <span className={`kanban-meta-chip priority-${task.priority}`}>
                                  {formatPriority(task.priority)}
                                </span>
                                <span className={`kanban-meta-chip ${isOverdue ? "is-overdue" : ""}`}>
                                  {task.due_date ? `Due ${dueDateLabel}` : "No date"}
                                </span>
                                {task.life_area_id ? (
                                  <span className="kanban-meta-chip">
                                    {lifeAreaLabelById.get(task.life_area_id) ?? "Unknown area"}
                                  </span>
                                ) : null}
                              </div>
                              <div className="kanban-actions">
                                <span className={`pill status-${task.status}`}>{formatStatus(task.status)}</span>
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
                      );
                    })}
                  </div>

                  <footer className="kanban-column-footer">
                    <form
                      className="form-grid"
                      onSubmit={(event) => void createTaskInList(UNASSIGNED_COLUMN_ID, event)}
                    >
                      <label className="field">
                        <span>Add standalone task</span>
                        <input
                          className="list-row"
                          type="text"
                          value={taskDrafts[UNASSIGNED_COLUMN_ID]?.title ?? ""}
                          onChange={(event) =>
                            setTaskDraft(UNASSIGNED_COLUMN_ID, { title: event.target.value })
                          }
                          placeholder="Task title"
                          disabled={creatingTaskForListId === UNASSIGNED_COLUMN_ID}
                        />
                      </label>
                      <div className="row-inline">
                        <label className="field">
                          <span>Priority</span>
                          <select
                            className="list-row"
                            value={taskDrafts[UNASSIGNED_COLUMN_ID]?.priority ?? "medium"}
                            onChange={(event) =>
                              setTaskDraft(UNASSIGNED_COLUMN_ID, {
                                priority: event.target.value as TaskPriority,
                              })
                            }
                            disabled={creatingTaskForListId === UNASSIGNED_COLUMN_ID}
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
                            value={taskDrafts[UNASSIGNED_COLUMN_ID]?.dueDate ?? ""}
                            onChange={(event) =>
                              setTaskDraft(UNASSIGNED_COLUMN_ID, { dueDate: event.target.value })
                            }
                            disabled={creatingTaskForListId === UNASSIGNED_COLUMN_ID}
                          />
                        </label>
                        <label className="field">
                          <span>Life area</span>
                          <select
                            className="list-row"
                            value={taskDrafts[UNASSIGNED_COLUMN_ID]?.lifeAreaId ?? ""}
                            onChange={(event) =>
                              setTaskDraft(UNASSIGNED_COLUMN_ID, { lifeAreaId: event.target.value })
                            }
                            disabled={creatingTaskForListId === UNASSIGNED_COLUMN_ID}
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
                        disabled={creatingTaskForListId === UNASSIGNED_COLUMN_ID}
                      >
                        {creatingTaskForListId === UNASSIGNED_COLUMN_ID ? "Adding..." : "Add task"}
                      </button>
                    </form>
                  </footer>
                </article>
              ) : null}

              {visibleLists.map((list) => {
                const listTasks = filteredTasksByListId.get(list.id) ?? [];
                const totalListTasks = tasksByListId.get(list.id)?.length ?? 0;
                const draft = taskDrafts[list.id] ?? createEmptyTaskDraft();
                const parent = resolveParentType(list);
                const parentBadge =
                  parent.type === "goal"
                    ? `Goal: ${goalLabelById.get(parent.id) ?? "Unknown goal"}`
                    : parent.type === "target"
                      ? `Target: ${targetLabelById.get(parent.id) ?? "Unknown target"}`
                      : parent.type === "life_area"
                        ? `Area: ${lifeAreaLabelById.get(parent.id) ?? "Unknown area"}`
                        : null;

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
                        <span className="kanban-badge">{`${listTasks.length}/${totalListTasks} cards`}</span>
                        {parentBadge ? <span className="kanban-badge">{parentBadge}</span> : null}
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
                            <span>Parent type</span>
                            <select
                              className="list-row"
                              value={editListParentType}
                              onChange={(event) => {
                                setEditListParentType(event.target.value as ListParentType);
                                setEditListParentId("");
                              }}
                              disabled={busyListId === list.id}
                            >
                              <option value="none">No parent</option>
                              <option value="goal">Goal</option>
                              <option value="target">Target</option>
                              <option value="life_area">Life area</option>
                            </select>
                          </label>
                          {editListParentType !== "none" ? (
                            <label className="field">
                              <span>Parent</span>
                              <select
                                className="list-row"
                                value={editListParentId}
                                onChange={(event) => setEditListParentId(event.target.value)}
                                disabled={busyListId === list.id}
                              >
                                <option value="">Select parent</option>
                                {editListParentType === "goal"
                                  ? goals.map((goal) => (
                                      <option key={goal.id} value={goal.id}>
                                        {goal.title}
                                      </option>
                                    ))
                                  : null}
                                {editListParentType === "target"
                                  ? targets.map((target) => (
                                      <option key={target.id} value={target.id}>
                                        {target.title}
                                      </option>
                                    ))
                                  : null}
                                {editListParentType === "life_area"
                                  ? lifeAreas.map((lifeArea) => (
                                      <option key={lifeArea.id} value={lifeArea.id}>
                                        {lifeArea.name}
                                      </option>
                                    ))
                                  : null}
                              </select>
                            </label>
                          ) : null}
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

                      {listTasks.map((task) => {
                        const dueDateLabel = toDateInputValue(task.due_date);
                        const isOverdue =
                          Boolean(task.due_date) &&
                          dueDateLabel < todayKey &&
                          task.status !== "done" &&
                          task.status !== "canceled";

                        return (
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
                                  <span>List</span>
                                  <select
                                    className="list-row"
                                    value={editTaskListId}
                                    onChange={(event) => setEditTaskListId(event.target.value)}
                                    disabled={busyTaskId === task.id}
                                  >
                                    <option value="">No list</option>
                                    {lists.map((listOption) => (
                                      <option key={listOption.id} value={listOption.id}>
                                        {listOption.name}
                                      </option>
                                    ))}
                                  </select>
                                </label>
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
                              <div className="kanban-meta">
                                <span className={`kanban-meta-chip priority-${task.priority}`}>
                                  {formatPriority(task.priority)}
                                </span>
                                <span className={`kanban-meta-chip ${isOverdue ? "is-overdue" : ""}`}>
                                  {task.due_date ? `Due ${dueDateLabel}` : "No date"}
                                </span>
                                {task.life_area_id ? (
                                  <span className="kanban-meta-chip">
                                    {lifeAreaLabelById.get(task.life_area_id) ?? "Unknown area"}
                                  </span>
                                ) : null}
                              </div>

                              <div className="kanban-actions">
                                <span className={`pill status-${task.status}`}>{formatStatus(task.status)}</span>
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
                        );
                      })}
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
