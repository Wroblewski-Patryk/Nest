"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";

type TaskStatus = "todo" | "in_progress" | "done" | "canceled";
type TaskPriority = "low" | "medium" | "high" | "urgent";
type GoalStatus = "active" | "paused" | "completed" | "archived";
type PlanningTab = "tasks" | "lists" | "goals" | "targets";

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
  status: GoalStatus;
  target_date: string | null;
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
  status: GoalStatus;
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
const TASKS_PAGE_SIZE = 100;
const TASKS_PAGE_GUARD_LIMIT = 20;

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

function formatGoalStatus(status: GoalStatus): string {
  if (status === "completed") {
    return "Completed";
  }

  if (status === "paused") {
    return "Paused";
  }

  if (status === "archived") {
    return "Archived";
  }

  return "Active";
}

function resolvePlanningTab(tab: string | null): PlanningTab {
  if (tab === "tasks" || tab === "lists" || tab === "goals" || tab === "targets") {
    return tab;
  }

  return "tasks";
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
  const [planningTab, setPlanningTab] = useState<PlanningTab>("tasks");

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
  const [taskComposerListId, setTaskComposerListId] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>("medium");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskLifeAreaId, setEditTaskLifeAreaId] = useState("");
  const [editTaskStatus, setEditTaskStatus] = useState<TaskStatus>("todo");
  const [editTaskListId, setEditTaskListId] = useState("");

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTargetDate, setNewGoalTargetDate] = useState("");
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalTitle, setEditGoalTitle] = useState("");
  const [editGoalTargetDate, setEditGoalTargetDate] = useState("");
  const [editGoalStatus, setEditGoalStatus] = useState<GoalStatus>("active");
  const [busyGoalId, setBusyGoalId] = useState<string | null>(null);

  const [newTargetGoalId, setNewTargetGoalId] = useState("");
  const [newTargetTitle, setNewTargetTitle] = useState("");
  const [newTargetMetricType, setNewTargetMetricType] = useState("count");
  const [newTargetValueTarget, setNewTargetValueTarget] = useState("1");
  const [newTargetUnit, setNewTargetUnit] = useState("items");
  const [isCreatingTarget, setIsCreatingTarget] = useState(false);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [editTargetTitle, setEditTargetTitle] = useState("");
  const [editTargetMetricType, setEditTargetMetricType] = useState("count");
  const [editTargetValueTarget, setEditTargetValueTarget] = useState("1");
  const [editTargetValueCurrent, setEditTargetValueCurrent] = useState("0");
  const [editTargetUnit, setEditTargetUnit] = useState("items");
  const [editTargetDueDate, setEditTargetDueDate] = useState("");
  const [editTargetStatus, setEditTargetStatus] = useState<GoalStatus>("active");
  const [busyTargetId, setBusyTargetId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "done">("all");
  const [listContextFilter, setListContextFilter] = useState<"all" | "with_context" | "without_context">("all");
  const [boardLifeAreaFilter, setBoardLifeAreaFilter] = useState("");
  const [hideEmptyColumns, setHideEmptyColumns] = useState(true);

  const [feedback, setFeedback] = useState("Planning ready.");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setPlanningTab(resolvePlanningTab(new URLSearchParams(window.location.search).get("tab")));
  }, []);

  const loadAllTasks = useCallback(async (): Promise<TaskItem[]> => {
    const allTasks: TaskItem[] = [];
    let page = 1;

    while (page <= TASKS_PAGE_GUARD_LIMIT) {
      const response = await nestApiClient.getTasks({
        page,
        per_page: TASKS_PAGE_SIZE,
        sort: "-created_at",
      });

      const chunk = (response.data ?? []) as TaskItem[];
      allTasks.push(...chunk);

      const total =
        response.meta && typeof response.meta.total === "number" ? response.meta.total : allTasks.length;
      if (chunk.length === 0 || allTasks.length >= total) {
        break;
      }

      page += 1;
    }

    return allTasks;
  }, []);

  const loadWorkspace = useCallback(async () => {
    const [listsResponse, tasksResponse, goalsResponse, targetsResponse, lifeAreasResponse] = await Promise.all([
      nestApiClient.getLists({ per_page: 100 }),
      loadAllTasks(),
      nestApiClient.getGoals({ per_page: 100 }),
      apiRequest<{ data: TargetItem[] }>("/targets", { query: { per_page: 100 } }),
      apiRequest<{ data: LifeAreaItem[] }>("/life-areas", { query: { per_page: 100 } }),
    ]);

    const normalizedLists = (listsResponse.data ?? []) as ListItem[];
    const normalizedGoals = (goalsResponse.data ?? []) as GoalItem[];
    setLists(normalizedLists);
    setTasks(tasksResponse);
    setGoals(normalizedGoals);
    setTargets(targetsResponse.data ?? []);
    setLifeAreas(lifeAreasResponse.data ?? []);
    setNewTargetGoalId((current) =>
      normalizedGoals.some((goal) => goal.id === current) ? current : (normalizedGoals[0]?.id ?? "")
    );

    setTaskDrafts((current) => {
      const next: Record<string, TaskDraft> = {};
      for (const list of normalizedLists) {
        next[list.id] = current[list.id] ?? createEmptyTaskDraft();
      }
      next[UNASSIGNED_COLUMN_ID] = current[UNASSIGNED_COLUMN_ID] ?? createEmptyTaskDraft();
      return next;
    });
  }, [loadAllTasks]);

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
  const targetsByGoalId = useMemo(() => {
    const grouped = new Map<string, TargetItem[]>();
    for (const target of targets) {
      const bucket = grouped.get(target.goal_id) ?? [];
      bucket.push(target);
      grouped.set(target.goal_id, bucket);
    }
    return grouped;
  }, [targets]);

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
  const activeGoalsCount = useMemo(
    () => goals.filter((goal) => goal.status === "active").length,
    [goals]
  );
  const activeTargetsCount = useMemo(
    () => targets.filter((target) => target.status === "active").length,
    [targets]
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

  const showUnassignedColumn = true;

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
      setTaskComposerListId(null);
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

  async function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newGoalTitle.trim()) {
      setErrorMessage("Goal title is required.");
      return;
    }

    setIsCreatingGoal(true);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest("/goals", {
        method: "POST",
        body: {
          title: newGoalTitle.trim(),
          status: "active",
          target_date: newGoalTargetDate || null,
        },
      });
      setNewGoalTitle("");
      setNewGoalTargetDate("");
      await loadWorkspace();
      setFeedback("Goal created.");
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

  function startGoalEdit(goal: GoalItem) {
    setEditingGoalId(goal.id);
    setEditGoalTitle(goal.title);
    setEditGoalTargetDate(toDateInputValue(goal.target_date));
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
      await loadWorkspace();
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
      await loadWorkspace();
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

    setIsCreatingTarget(true);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest("/targets", {
        method: "POST",
        body: {
          goal_id: newTargetGoalId,
          title: newTargetTitle.trim(),
          metric_type: newTargetMetricType.trim() || "count",
          value_target: Number(newTargetValueTarget) || 0,
          unit: newTargetUnit.trim() || null,
          status: "active",
        },
      });
      setNewTargetTitle("");
      setNewTargetMetricType("count");
      setNewTargetValueTarget("1");
      setNewTargetUnit("items");
      await loadWorkspace();
      setFeedback("Target created.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreatingTarget(false);
    }
  }

  function startTargetEdit(target: TargetItem) {
    setEditingTargetId(target.id);
    setEditTargetTitle(target.title);
    setEditTargetMetricType(target.metric_type);
    setEditTargetValueTarget(String(target.value_target));
    setEditTargetValueCurrent(String(target.value_current));
    setEditTargetUnit(target.unit ?? "");
    setEditTargetDueDate(toDateInputValue(target.due_date));
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
          metric_type: editTargetMetricType.trim() || "count",
          value_target: Number(editTargetValueTarget) || 0,
          value_current: Number(editTargetValueCurrent) || 0,
          unit: editTargetUnit.trim() || null,
          due_date: editTargetDueDate || null,
          status: editTargetStatus,
        },
      });
      setEditingTargetId(null);
      await loadWorkspace();
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
      await loadWorkspace();
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

  function resolveListParentLabel(list: ListItem): string | null {
    const parent = resolveParentType(list);
    if (parent.type === "goal") {
      return `Goal: ${goalLabelById.get(parent.id) ?? "Unknown goal"}`;
    }

    if (parent.type === "target") {
      return `Target: ${targetLabelById.get(parent.id) ?? "Unknown target"}`;
    }

    if (parent.type === "life_area") {
      return `Life area: ${lifeAreaLabelById.get(parent.id) ?? "Unknown area"}`;
    }

    return null;
  }

  function renderTaskCard(task: TaskItem) {
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
              <span className={`kanban-meta-chip priority-${task.priority}`}>{formatPriority(task.priority)}</span>
              <span className={`kanban-meta-chip ${isOverdue ? "is-overdue" : ""}`}>
                {task.due_date ? `Due ${dueDateLabel}` : "No date"}
              </span>
              {task.life_area_id ? (
                <span className="kanban-meta-chip">{lifeAreaLabelById.get(task.life_area_id) ?? "Unknown area"}</span>
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
  }

  function renderTaskComposer(columnId: string, label: string) {
    const draft = taskDrafts[columnId] ?? createEmptyTaskDraft();
    const isBusy = creatingTaskForListId === columnId;

    return (
      <form className="form-grid planning-task-composer" onSubmit={(event) => void createTaskInList(columnId, event)}>
        <label className="field">
          <span>{label}</span>
          <input
            id={columnId === UNASSIGNED_COLUMN_ID ? "unassigned-capture" : undefined}
            className="list-row"
            type="text"
            value={draft.title}
            onChange={(event) => setTaskDraft(columnId, { title: event.target.value })}
            placeholder="Task title"
            disabled={isBusy}
          />
        </label>
        <div className="row-inline">
          <label className="field">
            <span>Priority</span>
            <select
              className="list-row"
              value={draft.priority}
              onChange={(event) => setTaskDraft(columnId, { priority: event.target.value as TaskPriority })}
              disabled={isBusy}
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
              onChange={(event) => setTaskDraft(columnId, { dueDate: event.target.value })}
              disabled={isBusy}
            />
          </label>
          <label className="field">
            <span>Life area</span>
            <select
              className="list-row"
              value={draft.lifeAreaId}
              onChange={(event) => setTaskDraft(columnId, { lifeAreaId: event.target.value })}
              disabled={isBusy}
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
          <button type="submit" className="btn-primary" disabled={isBusy}>
            {isBusy ? "Adding..." : "Save card"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setTaskComposerListId(null)} disabled={isBusy}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  function openPlanningTab(tab: PlanningTab) {
    setPlanningTab(tab);
    router.replace(tab === "tasks" ? "/tasks" : `/tasks?tab=${tab}`);
  }

  return (
    <WorkspaceShell
      title="Planning"
      subtitle="Jedno miejsce dla goals, targets, lists i tasks. Hierarchia jest opcjonalna, żeby planowanie było lekkie."
      module="tasks"
      contentLayout="single"
      planningSubnav={{ active: planningTab }}
    >
      <div className="stack">
        <MetricCard label="Lists" value={String(lists.length)} />
        <MetricCard label="Open tasks" value={String(openTasksCount)} />
        <MetricCard label="Goals active" value={String(activeGoalsCount)} />
        <MetricCard label="Targets active" value={String(activeTargetsCount)} />
        <MetricCard label="Due today" value={String(dueTodayCount)} />
        <MetricCard label="Overdue" value={String(overdueCount)} />
      </div>

      {errorMessage ? <p className="callout state-error">{errorMessage}</p> : null}
      {!errorMessage && feedback ? <p className="callout state-success">{feedback}</p> : null}

      <Panel title="Planning Views">
        <div className="tasks-filter-group" role="tablist" aria-label="Planning module views">
          <button
            type="button"
            role="tab"
            aria-selected={planningTab === "tasks"}
            className={`filter-chip ${planningTab === "tasks" ? "is-active" : ""}`}
            onClick={() => openPlanningTab("tasks")}
          >
            Tasks
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={planningTab === "lists"}
            className={`filter-chip ${planningTab === "lists" ? "is-active" : ""}`}
            onClick={() => openPlanningTab("lists")}
          >
            Lists
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={planningTab === "goals"}
            className={`filter-chip ${planningTab === "goals" ? "is-active" : ""}`}
            onClick={() => openPlanningTab("goals")}
          >
            Goals
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={planningTab === "targets"}
            className={`filter-chip ${planningTab === "targets" ? "is-active" : ""}`}
            onClick={() => openPlanningTab("targets")}
          >
            Targets
          </button>
        </div>
        <p className="form-hint">Tasks pokazuje zadania pogrupowane po listach. Lists służy do zarządzania strukturą.</p>
      </Panel>

      {planningTab === "tasks" ? (
        <Panel title="Today Focus" className="planning-focus-primary">
          <p className="callout">
            Start from quick capture in <strong>No List</strong>, then move tasks into lists and connect them to
            goals/targets only when needed.
          </p>
          <div className="row-inline">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setTaskComposerListId(UNASSIGNED_COLUMN_ID)}
            >
              Add first task
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setHideEmptyColumns(false)}
            >
              Show all columns
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => void loadWorkspace()}
              disabled={isLoading}
            >
              Refresh board
            </button>
          </div>
        </Panel>
      ) : null}

      {planningTab === "tasks" ? (
        <>
      <Panel title="Quick Setup" className="planning-secondary-tools">
        <details className="collapsible-panel">
          <summary>Create list</summary>
        <form className="form-grid collapsible-content" onSubmit={createList}>
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
        </details>
      </Panel>

      <Panel title="Board Filters" className="planning-secondary-tools">
        <details className="collapsible-panel">
          <summary>Show and adjust filters</summary>
        <div className="tasks-board-toolbar collapsible-content">
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
              setHideEmptyColumns(true);
            }}
          >
            Reset
          </button>
        </div>
        </details>
      </Panel>

      <section className="panel planning-board-primary">
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
            <p className="callout state-empty">
              No lists yet. Open <strong>Quick Setup</strong> below, or start immediately with standalone tasks in
              <strong> No List</strong>.
            </p>
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

                    {filteredUnassignedTasks.map((task) => renderTaskCard(task))}
                  </div>

                  <footer className="kanban-column-footer">
                    <div className="row-inline">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() =>
                          setTaskComposerListId((current) =>
                            current === UNASSIGNED_COLUMN_ID ? null : UNASSIGNED_COLUMN_ID
                          )
                        }
                      >
                        {taskComposerListId === UNASSIGNED_COLUMN_ID ? "Close add form" : "Add card"}
                      </button>
                    </div>
                    {taskComposerListId === UNASSIGNED_COLUMN_ID
                      ? renderTaskComposer(UNASSIGNED_COLUMN_ID, "Add standalone task")
                      : null}
                  </footer>
                </article>
              ) : null}

              {visibleLists.map((list) => {
                const listTasks = filteredTasksByListId.get(list.id) ?? [];
                const totalListTasks = tasksByListId.get(list.id)?.length ?? 0;
                const parentBadge = resolveListParentLabel(list);

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

                      {listTasks.map((task) => renderTaskCard(task))}
                    </div>

                    <footer className="kanban-column-footer">
                      <div className="row-inline">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setTaskComposerListId((current) => (current === list.id ? null : list.id))}
                        >
                          {taskComposerListId === list.id ? "Close add form" : "Add card"}
                        </button>
                      </div>
                      {taskComposerListId === list.id ? renderTaskComposer(list.id, `Add card to ${list.name}`) : null}
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>
        </>
      ) : null}

      {planningTab === "lists" ? (
        <>
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

          <Panel title="List Library">
            <ul className="list">
              {lists.length === 0 ? (
                <li className="list-row">
                  <p>No lists yet. Add your first one above.</p>
                </li>
              ) : (
                lists.map((list) => {
                  const parentLabel = resolveListParentLabel(list);
                  const listTasksCount = tasksByListId.get(list.id)?.length ?? 0;

                  return (
                    <li className="list-row" key={list.id}>
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
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <strong>{list.name}</strong>
                            <p>{parentLabel ?? "No parent context"}</p>
                            <p className="mono-note">{listTasksCount} tasks assigned</p>
                          </div>
                          <div className="row-inline">
                            <button
                              type="button"
                              className="pill-link"
                              onClick={() => startListEdit(list)}
                              disabled={busyListId === list.id}
                            >
                              Edit
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
                        </>
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </Panel>
        </>
      ) : null}

      {planningTab === "goals" ? (
        <>
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
                  disabled={isCreatingGoal}
                />
              </label>
              <label className="field">
                <span>Target date (optional)</span>
                <input
                  className="list-row"
                  type="date"
                  value={newGoalTargetDate}
                  onChange={(event) => setNewGoalTargetDate(event.target.value)}
                  disabled={isCreatingGoal}
                />
              </label>
              <button type="submit" className="btn-primary" disabled={isCreatingGoal}>
                {isCreatingGoal ? "Adding..." : "Add goal"}
              </button>
            </form>
          </Panel>

          <Panel title="Goal Roadmaps">
            <ul className="list">
              {goals.length === 0 ? (
                <li className="list-row">
                  <p>No goals yet. Add your first one above.</p>
                </li>
              ) : (
                goals.map((goal) => {
                  const goalTargets = targetsByGoalId.get(goal.id) ?? [];
                  const goalTargetIds = new Set(goalTargets.map((target) => target.id));
                  const goalLists = lists.filter(
                    (list) => list.goal_id === goal.id || (list.target_id ? goalTargetIds.has(list.target_id) : false)
                  );
                  const goalListIds = new Set(goalLists.map((list) => list.id));
                  const goalTasks = tasks.filter((task) =>
                    Boolean(task.list_id) && goalListIds.has(task.list_id as string)
                  );
                  const goalOpenTasks = goalTasks.filter(
                    (task) => task.status !== "done" && task.status !== "canceled"
                  ).length;

                  return (
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
                              onChange={(event) => setEditGoalStatus(event.target.value as GoalStatus)}
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
                            status: {formatGoalStatus(goal.status)}
                            {goal.target_date ? ` | target ${toDateInputValue(goal.target_date)}` : ""}
                          </p>
                          <p className="mono-note">
                            {`Path: Goal -> ${goalTargets.length} targets -> ${goalLists.length} lists -> ${goalOpenTasks}/${goalTasks.length} open tasks`}
                          </p>
                          {goalTargets.length > 0 ? (
                            <div className="journey-list">
                              {goalTargets.map((target) => {
                                const targetLists = lists.filter((list) => list.target_id === target.id);
                                const targetListIds = new Set(targetLists.map((list) => list.id));
                                const targetTasks = tasks.filter(
                                  (task) => Boolean(task.list_id) && targetListIds.has(task.list_id as string)
                                );
                                const targetOpenTasks = targetTasks.filter(
                                  (task) => task.status !== "done" && task.status !== "canceled"
                                ).length;

                                return (
                                  <div className="journey-row" key={target.id}>
                                    <strong>{target.title}</strong>
                                    <span>
                                      {targetLists.length} lists | {targetOpenTasks}/{targetTasks.length} open tasks
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="mono-note">No targets yet. Add one to build a concrete path.</p>
                          )}
                        </div>
                        <div className="row-inline">
                          <span className="pill">{formatGoalStatus(goal.status)}</span>
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
                  );
                })
              )}
            </ul>
          </Panel>
        </>
      ) : null}

      {planningTab === "targets" ? (
        <>
          <Panel title="Add Target">
            {goals.length === 0 ? (
              <p className="callout state-empty">Create at least one goal in the Goals tab first.</p>
            ) : null}
            <form className="form-grid" onSubmit={createTarget}>
              <label className="field">
                <span>Goal</span>
                <select
                  className="list-row"
                  value={newTargetGoalId}
                  onChange={(event) => setNewTargetGoalId(event.target.value)}
                  disabled={isCreatingTarget || goals.length === 0}
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
                  disabled={isCreatingTarget}
                />
              </label>
              <div className="row-inline">
                <label className="field">
                  <span>Metric type</span>
                  <input
                    className="list-row"
                    type="text"
                    value={newTargetMetricType}
                    onChange={(event) => setNewTargetMetricType(event.target.value)}
                    disabled={isCreatingTarget}
                  />
                </label>
                <label className="field">
                  <span>Target value</span>
                  <input
                    className="list-row"
                    type="number"
                    value={newTargetValueTarget}
                    onChange={(event) => setNewTargetValueTarget(event.target.value)}
                    disabled={isCreatingTarget}
                  />
                </label>
                <label className="field">
                  <span>Unit</span>
                  <input
                    className="list-row"
                    type="text"
                    value={newTargetUnit}
                    onChange={(event) => setNewTargetUnit(event.target.value)}
                    disabled={isCreatingTarget}
                  />
                </label>
              </div>
              <button type="submit" className="btn-primary" disabled={isCreatingTarget || goals.length === 0}>
                {isCreatingTarget ? "Adding..." : "Add target"}
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
                              onChange={(event) => setEditTargetStatus(event.target.value as GoalStatus)}
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
                            goal: {goalLabelById.get(target.goal_id) ?? "Unknown goal"} | {target.value_current}/
                            {target.value_target} {target.unit ?? ""}
                            {target.due_date ? ` | due ${toDateInputValue(target.due_date)}` : ""}
                          </p>
                        </div>
                        <div className="row-inline">
                          <span className="pill">{formatGoalStatus(target.status)}</span>
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
        </>
      ) : null}

    </WorkspaceShell>
  );
}
