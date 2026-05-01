"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Panel, WorkspaceShell } from "@/components/workspace-shell";
import {
  DashboardFocusCard,
  DashboardHeroBand,
} from "@/components/workspace-primitives";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";
import { getUserSafeErrorMessage } from "@/lib/ux-contract";

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
  return getUserSafeErrorMessage(error, "We couldn't update planning right now");
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

function hasRealRowId(row: object): row is { id: string } {
  return "id" in row && typeof (row as { id?: unknown }).id === "string";
}

function PlanningGlyph({ name }: { name: "task" | "list" | "goal" | "target" | "note" | "pressure" }) {
  if (name === "task") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        <path d="m8.8 12.2 2.1 2.1 4.5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "list") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 7h10M9 12h10M9 17h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="5.5" cy="7" r="1.1" fill="currentColor" />
        <circle cx="5.5" cy="12" r="1.1" fill="currentColor" />
        <circle cx="5.5" cy="17" r="1.1" fill="currentColor" />
      </svg>
    );
  }

  if (name === "goal") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (name === "target") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 19V5l9 2.2-1.2 3.4L18 12l-12 2.4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "pressure") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M17.7 6.3l-2.1 2.1M8.4 15.6l-2.1 2.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3.3" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18h3.2l8.5-8.5a1.7 1.7 0 0 0 0-2.4l-.8-.8a1.7 1.7 0 0 0-2.4 0L6 14.8V18Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m13.2 7.8 3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
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

  const [feedback, setFeedback] = useState("");
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
      .then(() => undefined)
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
  const pausedGoalsCount = useMemo(
    () => goals.filter((goal) => goal.status === "paused").length,
    [goals]
  );
  const completedGoalsCount = useMemo(
    () => goals.filter((goal) => goal.status === "completed").length,
    [goals]
  );
  const contextualListsCount = useMemo(
    () => lists.filter((list) => list.goal_id || list.target_id || list.life_area_id).length,
    [lists]
  );
  const goalLinkedListsCount = useMemo(
    () => lists.filter((list) => Boolean(list.goal_id)).length,
    [lists]
  );
  const targetLinkedListsCount = useMemo(
    () => lists.filter((list) => Boolean(list.target_id)).length,
    [lists]
  );
  const lifeAreaLinkedListsCount = useMemo(
    () => lists.filter((list) => Boolean(list.life_area_id)).length,
    [lists]
  );
  const unassignedTasksCount = useMemo(
    () => tasks.filter((task) => !task.list_id).length,
    [tasks]
  );
  const plannedTasksCount = useMemo(
    () => tasks.filter((task) => task.status !== "canceled").length,
    [tasks]
  );
  const completedTasksCount = useMemo(
    () => tasks.filter((task) => task.status === "done").length,
    [tasks]
  );
  const inProgressTasksCount = useMemo(
    () => tasks.filter((task) => task.status === "in_progress").length,
    [tasks]
  );
  const listsWithTasksCount = useMemo(
    () => lists.filter((list) => (tasksByListId.get(list.id)?.length ?? 0) > 0).length,
    [lists, tasksByListId]
  );
  const nextWeekKey = useMemo(() => {
    const value = new Date();
    value.setDate(value.getDate() + 7);
    return toLocalDateKey(value);
  }, []);
  const goalsWithTargetsCount = useMemo(
    () => goals.filter((goal) => (targetsByGoalId.get(goal.id)?.length ?? 0) > 0).length,
    [goals, targetsByGoalId]
  );
  const goalIdsWithLists = useMemo(() => {
    const ids = new Set<string>();
    for (const list of lists) {
      if (list.goal_id) {
        ids.add(list.goal_id);
      }
    }
    return ids;
  }, [lists]);
  const goalsWithListsCount = useMemo(
    () => goals.filter((goal) => goalIdsWithLists.has(goal.id)).length,
    [goalIdsWithLists, goals]
  );
  const targetIdsWithLists = useMemo(() => {
    const ids = new Set<string>();
    for (const list of lists) {
      if (list.target_id) {
        ids.add(list.target_id);
      }
    }
    return ids;
  }, [lists]);
  const targetsWithListsCount = useMemo(
    () => targets.filter((target) => targetIdsWithLists.has(target.id)).length,
    [targetIdsWithLists, targets]
  );
  const dueSoonTargetsCount = useMemo(
    () =>
      targets.filter(
        (target) =>
          target.status === "active" &&
          Boolean(target.due_date) &&
          target.due_date!.slice(0, 10) >= todayKey &&
          target.due_date!.slice(0, 10) <= nextWeekKey
      ).length,
    [nextWeekKey, targets, todayKey]
  );
  const overdueTargetsCount = useMemo(
    () =>
      targets.filter(
        (target) =>
          target.status === "active" &&
          Boolean(target.due_date) &&
          target.due_date!.slice(0, 10) < todayKey
      ).length,
    [targets, todayKey]
  );
  const averageTargetProgress = useMemo(() => {
    if (targets.length === 0) {
      return 0;
    }

    const total = targets.reduce((sum, target) => {
      if (target.value_target <= 0) {
        return sum;
      }

      return sum + Math.min(100, Math.max(0, Math.round((target.value_current / target.value_target) * 100)));
    }, 0);

    return Math.round(total / targets.length);
  }, [targets]);
  const weeklyDirectionPercent = useMemo(() => {
    if (plannedTasksCount === 0 && lists.length === 0 && activeGoalsCount === 0 && activeTargetsCount === 0) {
      return 0;
    }

    const base = plannedTasksCount > 0 ? Math.round((completedTasksCount / Math.max(plannedTasksCount, 1)) * 52) : 18;
    return Math.min(94, Math.max(32, base + Math.min(contextualListsCount * 5, 18) + Math.min(activeGoalsCount * 4, 16)));
  }, [activeGoalsCount, activeTargetsCount, completedTasksCount, contextualListsCount, lists.length, plannedTasksCount]);
  const nextTask = useMemo(
    () =>
      tasks.find((task) => task.status === "in_progress") ??
      tasks.find((task) => task.status === "todo" && task.due_date?.slice(0, 10) === todayKey) ??
      tasks.find((task) => task.status === "todo") ??
      null,
    [tasks, todayKey]
  );
  const hottestGoal = useMemo(
    () =>
      goals.find((goal) => goal.status === "active" && goal.target_date) ??
      goals.find((goal) => goal.status === "active") ??
      null,
    [goals]
  );
  const canonicalPlanningRows = useMemo(() => {
    const priorityRank: Record<TaskPriority, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return [...tasks]
      .filter((task) => task.status !== "canceled")
      .sort((a, b) => {
        if (a.status === "done" && b.status !== "done") {
          return 1;
        }

        if (a.status !== "done" && b.status === "done") {
          return -1;
        }

        const dueA = a.due_date?.slice(0, 10) ?? "9999-12-31";
        const dueB = b.due_date?.slice(0, 10) ?? "9999-12-31";
        if (dueA !== dueB) {
          return dueA.localeCompare(dueB);
        }

        return priorityRank[a.priority] - priorityRank[b.priority];
      })
      .slice(0, 4);
  }, [tasks]);
  const showPlanningShowcase =
    !isLoading &&
    plannedTasksCount === 0 &&
    lists.length === 0 &&
    activeGoalsCount === 0 &&
    activeTargetsCount === 0;
  const planningHeroProgress = showPlanningShowcase ? 64 : weeklyDirectionPercent;
  const planningHeroMetrics = showPlanningShowcase
    ? [
        { label: "Tasks planned", value: "12 / 18", emphasis: "accent" as const, icon: <PlanningGlyph name="task" /> },
        { label: "Lists active", value: "4", icon: <PlanningGlyph name="list" /> },
        { label: "Goals moving", value: "3", icon: <PlanningGlyph name="goal" /> },
        { label: "Targets tracked", value: "7", icon: <PlanningGlyph name="target" /> },
      ]
    : [
        { label: "Tasks planned", value: `${plannedTasksCount} / ${Math.max(plannedTasksCount + overdueCount, 1)}`, emphasis: "accent" as const, icon: <PlanningGlyph name="task" /> },
        { label: "Lists active", value: String(lists.length), icon: <PlanningGlyph name="list" /> },
        { label: "Goals moving", value: String(activeGoalsCount), icon: <PlanningGlyph name="goal" /> },
        { label: "Targets tracked", value: String(activeTargetsCount), icon: <PlanningGlyph name="target" /> },
      ];
  const planningFlowCards = [
    { title: "Capture ideas and tasks", count: showPlanningShowcase ? "6 tasks" : `${Math.max(unassignedTasksCount, 1)} tasks`, icon: "task" as const },
    { title: "Shape priorities and lists", count: showPlanningShowcase ? "8 tasks" : `${Math.max(lists.length, 1)} lists`, icon: "list" as const },
    { title: "Commit to the right plan", count: showPlanningShowcase ? "4 tasks" : `${Math.max(dueTodayCount, 1)} tasks`, icon: "goal" as const, now: true },
    { title: "Focus on deep execution", count: showPlanningShowcase ? "6 tasks" : `${openTasksCount} open`, icon: "target" as const },
    { title: "Weekly review and learn", count: showPlanningShowcase ? "3 tasks" : `${activeTargetsCount} targets`, icon: "note" as const },
  ];
  const planningShowcaseRows = [
    {
      title: "Prepare strategy workshop",
      linked: ["Goal  Launch product", "Target  Comms plan", "List  Launch plan"],
      priority: "High",
      priorityClass: "high",
      due: "Today",
      status: "Done",
      done: true,
    },
    {
      title: "Review quarterly budget",
      linked: ["Goal  Financial clarity", "List  Finance"],
      priority: "High",
      priorityClass: "high",
      due: "Today",
      status: "Done",
      done: true,
    },
    {
      title: "Draft home reset checklist",
      linked: ["Goal  Calm home", "List  Home projects"],
      priority: "Medium",
      priorityClass: "medium",
      due: "Tomorrow",
      status: "Open",
      done: false,
    },
    {
      title: "Book weekend getaway",
      linked: ["Goal  Recharge", "List  Travel ideas"],
      priority: "Low",
      priorityClass: "low",
      due: "May 25",
      status: "Open",
      done: false,
    },
  ];
  const planningWorkspaceColumns =
    planningTab === "tasks"
      ? ["Task", "Linked to", "Priority", "Due", "Status"]
      : planningTab === "lists"
        ? ["List", "Connected to", "Tasks", "Focus", "Status"]
        : planningTab === "goals"
          ? ["Goal", "Connected to", "Targets", "Date", "Status"]
          : ["Target", "Goal", "Progress", "Due", "Status"];
  const planningShowcaseListRows = [
    {
      name: "Launch plan",
      linked: ["Goal  Launch product", "Target  Comms plan"],
      tasks: "8 tasks",
      focus: "High",
      status: "Active",
    },
    {
      name: "Finance",
      linked: ["Goal  Financial clarity"],
      tasks: "4 tasks",
      focus: "High",
      status: "Active",
    },
    {
      name: "Home projects",
      linked: ["Goal  Calm home"],
      tasks: "5 tasks",
      focus: "Medium",
      status: "Active",
    },
    {
      name: "Travel ideas",
      linked: ["Goal  Recharge"],
      tasks: "3 tasks",
      focus: "Low",
      status: "Later",
    },
  ];
  const planningShowcaseGoalRows = [
    {
      name: "Launch product",
      linked: ["Target  Comms plan", "List  Launch plan"],
      targets: "3 targets",
      date: "Jun 12",
      status: "Active",
    },
    {
      name: "Build a healthier me",
      linked: ["Target  Workout 3x per week", "List  Training program"],
      targets: "2 targets",
      date: "Jul 01",
      status: "Active",
    },
    {
      name: "Financial clarity",
      linked: ["List  Finance"],
      targets: "1 target",
      date: "May 30",
      status: "Active",
    },
    {
      name: "Calm home",
      linked: ["List  Home projects"],
      targets: "1 target",
      date: "Later",
      status: "Paused",
    },
  ];
  const planningShowcaseTargetRows = [
    {
      name: "Comms plan",
      goal: "Launch product",
      progress: "80%",
      due: "Jun 12",
      status: "Active",
    },
    {
      name: "Workout 3x per week",
      goal: "Build a healthier me",
      progress: "72%",
      due: "Jul 01",
      status: "Active",
    },
    {
      name: "Budget review",
      goal: "Financial clarity",
      progress: "64%",
      due: "May 30",
      status: "Active",
    },
    {
      name: "Home reset",
      goal: "Calm home",
      progress: "45%",
      due: "Later",
      status: "Paused",
    },
  ];
  const focusCard =
    planningTab === "tasks"
      ? {
          kicker: "Now planning",
          title: nextTask?.title ?? "Map product launch week",
          detail: nextTask
            ? `${nextTask.status === "in_progress" ? "Already in motion" : "Define the next concrete planning move"}${nextTask.due_date ? ` | due ${nextTask.due_date.slice(0, 10)}` : ""}.`
            : "Define the key milestones, owners and communications plan for launch week.",
          href: "#planning-today-focus",
          cta: nextTask ? "Start planning block" : "Start planning block",
          supportingValue: nextTask
            ? `Priority ${formatPriority(nextTask.priority)}`
            : "High impact",
        }
      : planningTab === "lists"
        ? {
            kicker: "List strategy",
            title: contextualListsCount > 0 ? `${contextualListsCount} lists already carry context` : "Lists do not need parent context to be useful",
            detail: contextualListsCount > 0
              ? "Keep parent links only where they sharpen clarity. The rest can stay flexible."
              : "Start simple, then connect a list to a goal, target, or life area only when it adds meaning.",
            href: "/tasks?tab=lists",
            cta: "Shape list structure",
            supportingValue: `${lists.length} total lists`,
          }
        : planningTab === "goals"
          ? {
              kicker: "Goal focus",
              title: hottestGoal?.title ?? "Clarify the next active goal",
              detail: hottestGoal
                ? `${hottestGoal.target_date ? `Target date ${hottestGoal.target_date.slice(0, 10)}.` : "No target date yet."} Link the goal to targets and lists that make progress visible.`
                : "Goals should name the bigger arc, not duplicate tasks.",
              href: "/tasks?tab=goals",
              cta: "Open goals",
              supportingValue: `${activeGoalsCount} active goals`,
            }
          : {
              kicker: "Target focus",
              title: activeTargetsCount > 0 ? `${activeTargetsCount} active targets are measurable` : "Create the first measurable target",
              detail: activeTargetsCount > 0
                ? "Targets turn intent into evidence. Keep them measurable, due-dated, and connected to goals."
                : "A good target should make progress legible within a week, not just aspirational.",
              href: "/tasks?tab=targets",
              cta: "Open targets",
              supportingValue: hottestGoal?.title ?? "Attach the first target to an active goal",
            };

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

  function resolveTaskPlanningContext(task: TaskItem): {
    listLabel: string;
    goalLabel: string | null;
    targetLabel: string | null;
  } {
    const list = lists.find((item) => item.id === task.list_id);
    if (!list) {
      return {
        listLabel: "No List",
        goalLabel: null,
        targetLabel: null,
      };
    }

    const target = list.target_id ? targets.find((item) => item.id === list.target_id) : null;

    return {
      listLabel: list.name,
      goalLabel:
        (target?.goal_id ? goalLabelById.get(target.goal_id) : null) ??
        (list.goal_id ? goalLabelById.get(list.goal_id) : null) ??
        null,
      targetLabel: target?.title ?? (list.target_id ? targetLabelById.get(list.target_id) ?? "Unknown target" : null),
    };
  }

  function renderCanonicalTaskEditForm(taskId: string) {
    return (
      <form className="planning-canonical-edit-row form-grid" onSubmit={(event) => {
        event.preventDefault();
        void saveTaskEdit(taskId);
      }}>
        <label className="field">
          <span>Title</span>
          <input
            className="list-row"
            type="text"
            value={editTaskTitle}
            onChange={(event) => setEditTaskTitle(event.target.value)}
            disabled={busyTaskId === taskId}
          />
        </label>
        <div className="form-grid form-grid-three">
          <label className="field">
            <span>Status</span>
            <select
              className="list-row"
              value={editTaskStatus}
              onChange={(event) => setEditTaskStatus(event.target.value as TaskStatus)}
              disabled={busyTaskId === taskId}
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
              disabled={busyTaskId === taskId}
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
              value={editTaskDueDate}
              onChange={(event) => setEditTaskDueDate(event.target.value)}
              disabled={busyTaskId === taskId}
            />
          </label>
        </div>
        <label className="field">
          <span>List</span>
          <select
            className="list-row"
            value={editTaskListId}
            onChange={(event) => setEditTaskListId(event.target.value)}
            disabled={busyTaskId === taskId}
          >
            <option value="">No list</option>
            {lists.map((listOption) => (
              <option key={listOption.id} value={listOption.id}>
                {listOption.name}
              </option>
            ))}
          </select>
        </label>
        <div className="row-inline">
          <button type="submit" className="btn-primary" disabled={busyTaskId === taskId}>
            Save task
          </button>
          <button type="button" className="btn-secondary" onClick={() => setEditingTaskId(null)} disabled={busyTaskId === taskId}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  function renderCanonicalListEditForm(listId: string) {
    return (
      <form className="planning-canonical-edit-row form-grid" onSubmit={(event) => {
        event.preventDefault();
        void saveListEdit(listId);
      }}>
        <label className="field">
          <span>Name</span>
          <input
            className="list-row"
            type="text"
            value={editListName}
            onChange={(event) => setEditListName(event.target.value)}
            disabled={busyListId === listId}
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
              disabled={busyListId === listId}
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
              disabled={busyListId === listId}
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
                disabled={busyListId === listId}
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
          <button type="submit" className="btn-primary" disabled={busyListId === listId}>
            Save list
          </button>
          <button type="button" className="btn-secondary" onClick={() => setEditingListId(null)} disabled={busyListId === listId}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  function renderCanonicalGoalEditForm(goalId: string) {
    return (
      <form className="planning-canonical-edit-row form-grid" onSubmit={(event) => {
        event.preventDefault();
        void saveGoalEdit(goalId);
      }}>
        <label className="field">
          <span>Title</span>
          <input
            className="list-row"
            type="text"
            value={editGoalTitle}
            onChange={(event) => setEditGoalTitle(event.target.value)}
            disabled={busyGoalId === goalId}
          />
        </label>
        <div className="row-inline">
          <label className="field">
            <span>Status</span>
            <select
              className="list-row"
              value={editGoalStatus}
              onChange={(event) => setEditGoalStatus(event.target.value as GoalStatus)}
              disabled={busyGoalId === goalId}
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
              disabled={busyGoalId === goalId}
            />
          </label>
        </div>
        <div className="row-inline">
          <button type="submit" className="btn-primary" disabled={busyGoalId === goalId}>
            Save goal
          </button>
          <button type="button" className="btn-secondary" onClick={() => setEditingGoalId(null)} disabled={busyGoalId === goalId}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  function renderCanonicalTargetEditForm(targetId: string) {
    return (
      <form className="planning-canonical-edit-row form-grid" onSubmit={(event) => {
        event.preventDefault();
        void saveTargetEdit(targetId);
      }}>
        <label className="field">
          <span>Title</span>
          <input
            className="list-row"
            type="text"
            value={editTargetTitle}
            onChange={(event) => setEditTargetTitle(event.target.value)}
            disabled={busyTargetId === targetId}
          />
        </label>
        <div className="form-grid form-grid-three">
          <label className="field">
            <span>Metric type</span>
            <input
              className="list-row"
              type="text"
              value={editTargetMetricType}
              onChange={(event) => setEditTargetMetricType(event.target.value)}
              disabled={busyTargetId === targetId}
            />
          </label>
          <label className="field">
            <span>Current</span>
            <input
              className="list-row"
              type="number"
              value={editTargetValueCurrent}
              onChange={(event) => setEditTargetValueCurrent(event.target.value)}
              disabled={busyTargetId === targetId}
            />
          </label>
          <label className="field">
            <span>Target</span>
            <input
              className="list-row"
              type="number"
              value={editTargetValueTarget}
              onChange={(event) => setEditTargetValueTarget(event.target.value)}
              disabled={busyTargetId === targetId}
            />
          </label>
        </div>
        <div className="row-inline">
          <label className="field">
            <span>Status</span>
            <select
              className="list-row"
              value={editTargetStatus}
              onChange={(event) => setEditTargetStatus(event.target.value as GoalStatus)}
              disabled={busyTargetId === targetId}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="field">
            <span>Due date</span>
            <input
              className="list-row"
              type="date"
              value={editTargetDueDate}
              onChange={(event) => setEditTargetDueDate(event.target.value)}
              disabled={busyTargetId === targetId}
            />
          </label>
          <label className="field">
            <span>Unit</span>
            <input
              className="list-row"
              type="text"
              value={editTargetUnit}
              onChange={(event) => setEditTargetUnit(event.target.value)}
              disabled={busyTargetId === targetId}
            />
          </label>
        </div>
        <div className="row-inline">
          <button type="submit" className="btn-primary" disabled={busyTargetId === targetId}>
            Save target
          </button>
          <button type="button" className="btn-secondary" onClick={() => setEditingTargetId(null)} disabled={busyTargetId === targetId}>
            Cancel
          </button>
        </div>
      </form>
    );
  }

  function renderPlanningWorkspaceRows() {
    if (planningTab === "tasks") {
      return (
        <>
          {isLoading ? <p className="callout state-loading">Loading planning workspace...</p> : null}
          {!isLoading && canonicalPlanningRows.length === 0 && !showPlanningShowcase ? (
            <p className="callout state-empty">No tasks yet. Start with one concrete task, then connect structure when it helps.</p>
          ) : null}
          {showPlanningShowcase
            ? planningShowcaseRows.map((row) => (
                <article key={row.title} className="planning-relational-row">
                  <div className="planning-task-title-cell">
                    <span className={`planning-check ${row.done ? "is-done" : ""}`} aria-hidden="true" />
                    <strong>{row.title}</strong>
                  </div>
                  <div className="planning-linked-chips">
                    {row.linked.map((chip) => (
                      <span key={chip}>{chip}</span>
                    ))}
                  </div>
                  <span className={`kanban-meta-chip priority-${row.priorityClass}`}>{row.priority}</span>
                  <span>{row.due}</span>
                  <div className="planning-status-actions">
                    <span className={`pill status-${row.done ? "done" : "todo"}`}>{row.status}</span>
                    <span className="planning-row-actions is-muted">Preview</span>
                  </div>
                </article>
              ))
            : null}
          {canonicalPlanningRows.map((task) => {
            const context = resolveTaskPlanningContext(task);
            return (
              <div key={task.id} className="planning-relational-row-group">
                <article className="planning-relational-row">
                  <div className="planning-task-title-cell">
                    <button
                      type="button"
                      className={`planning-check ${task.status === "done" ? "is-done" : ""}`}
                      onClick={() => void toggleTaskDone(task)}
                      disabled={busyTaskId === task.id}
                      aria-label={task.status === "done" ? `Reopen ${task.title}` : `Complete ${task.title}`}
                    />
                    <strong>{task.title}</strong>
                  </div>
                  <div className="planning-linked-chips">
                    {context.goalLabel ? <span>Goal&nbsp; {context.goalLabel}</span> : null}
                    {context.targetLabel ? <span>Target&nbsp; {context.targetLabel}</span> : null}
                    <span>List&nbsp; {context.listLabel}</span>
                  </div>
                  <span className={`kanban-meta-chip priority-${task.priority}`}>{formatPriority(task.priority)}</span>
                  <span>{task.due_date ? toDateInputValue(task.due_date) : "No date"}</span>
                  <div className="planning-status-actions">
                    <span className={`pill status-${task.status}`}>{formatStatus(task.status)}</span>
                    <span className="planning-row-actions">
                      <button type="button" className="pill-link" onClick={() => startTaskEdit(task)} disabled={busyTaskId === task.id}>
                        Edit
                      </button>
                      <button type="button" className="pill-link" onClick={() => void deleteTask(task.id)} disabled={busyTaskId === task.id}>
                        Delete
                      </button>
                    </span>
                  </div>
                </article>
                {editingTaskId === task.id ? renderCanonicalTaskEditForm(task.id) : null}
              </div>
            );
          })}
        </>
      );
    }

    if (planningTab === "lists") {
      const rows = showPlanningShowcase
        ? planningShowcaseListRows
        : lists.slice(0, 4).map((list) => {
            const parentTarget = list.target_id ? targets.find((target) => target.id === list.target_id) : null;
            const linked = [
              parentTarget?.goal_id ? `Goal  ${goalLabelById.get(parentTarget.goal_id) ?? "Unknown goal"}` : null,
              list.goal_id ? `Goal  ${goalLabelById.get(list.goal_id) ?? "Unknown goal"}` : null,
              list.target_id ? `Target  ${targetLabelById.get(list.target_id) ?? "Unknown target"}` : null,
              list.life_area_id ? `Life area  ${lifeAreaLabelById.get(list.life_area_id) ?? "Unknown area"}` : null,
            ].filter((item): item is string => Boolean(item));

            return {
              id: list.id,
              name: list.name,
              linked: linked.length > 0 ? linked : ["Flexible list"],
              tasks: `${tasksByListId.get(list.id)?.length ?? 0} tasks`,
              focus: linked.length > 0 ? "Contextual" : "Light",
              status: "Active",
            };
          });

      return rows.length > 0 ? (
        rows.map((row) => (
          <div key={row.name} className="planning-relational-row-group">
            <article className="planning-relational-row">
              <strong>{row.name}</strong>
              <div className="planning-linked-chips">
                {row.linked.map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
              <span>{row.tasks}</span>
              <span className="kanban-meta-chip priority-medium">{row.focus}</span>
              <div className="planning-status-actions">
                <span className="pill status-in_progress">{row.status}</span>
                {hasRealRowId(row) ? (
                  <span className="planning-row-actions">
                  <button
                    type="button"
                    className="pill-link"
                    onClick={() => {
                      const list = lists.find((item) => item.id === row.id);
                      if (list) {
                        startListEdit(list);
                      }
                    }}
                    disabled={busyListId === row.id}
                  >
                    Edit
                  </button>
                  <button type="button" className="pill-link" onClick={() => void deleteList(row.id)} disabled={busyListId === row.id}>
                    Delete
                  </button>
                  </span>
                ) : (
                  <span className="planning-row-actions is-muted">Preview</span>
                )}
              </div>
            </article>
            {hasRealRowId(row) && editingListId === row.id ? renderCanonicalListEditForm(row.id) : null}
          </div>
        ))
      ) : (
        <p className="callout state-empty">No lists yet. Create one list, then connect it only when context helps.</p>
      );
    }

    if (planningTab === "goals") {
      const rows = showPlanningShowcase
        ? planningShowcaseGoalRows
        : goals.slice(0, 4).map((goal) => {
            const goalTargets = targetsByGoalId.get(goal.id) ?? [];
            const goalLists = lists.filter((list) => list.goal_id === goal.id);
            return {
              id: goal.id,
              name: goal.title,
              linked: [
                goalTargets[0] ? `Target  ${goalTargets[0].title}` : null,
                goalLists[0] ? `List  ${goalLists[0].name}` : null,
              ].filter((item): item is string => Boolean(item)),
              targets: `${goalTargets.length} ${goalTargets.length === 1 ? "target" : "targets"}`,
              date: goal.target_date ? toDateInputValue(goal.target_date) : "No date",
              status: formatGoalStatus(goal.status),
            };
          });

      return rows.length > 0 ? (
        rows.map((row) => (
          <div key={row.name} className="planning-relational-row-group">
            <article className="planning-relational-row">
              <strong>{row.name}</strong>
              <div className="planning-linked-chips">
                {(row.linked.length > 0 ? row.linked : ["Needs target"]).map((chip) => (
                  <span key={chip}>{chip}</span>
                ))}
              </div>
              <span>{row.targets}</span>
              <span>{row.date}</span>
              <div className="planning-status-actions">
                <span className="pill status-in_progress">{row.status}</span>
                {hasRealRowId(row) ? (
                  <span className="planning-row-actions">
                  <button
                    type="button"
                    className="pill-link"
                    onClick={() => {
                      const goal = goals.find((item) => item.id === row.id);
                      if (goal) {
                        startGoalEdit(goal);
                      }
                    }}
                    disabled={busyGoalId === row.id}
                  >
                    Edit
                  </button>
                  <button type="button" className="pill-link" onClick={() => void deleteGoal(row.id)} disabled={busyGoalId === row.id}>
                    Delete
                  </button>
                  </span>
                ) : (
                  <span className="planning-row-actions is-muted">Preview</span>
                )}
              </div>
            </article>
            {hasRealRowId(row) && editingGoalId === row.id ? renderCanonicalGoalEditForm(row.id) : null}
          </div>
        ))
      ) : (
        <p className="callout state-empty">No goals yet. Add one clear direction before creating too much structure.</p>
      );
    }

    const rows = showPlanningShowcase
      ? planningShowcaseTargetRows
      : targets.slice(0, 4).map((target) => {
          const progress = target.value_target > 0
            ? Math.round((target.value_current / target.value_target) * 100)
            : 0;
          return {
            id: target.id,
            name: target.title,
            goal: goalLabelById.get(target.goal_id) ?? "Unknown goal",
            progress: `${Math.max(0, Math.min(progress, 100))}%`,
            due: target.due_date ? toDateInputValue(target.due_date) : "No date",
            status: formatGoalStatus(target.status),
          };
        });

    return rows.length > 0 ? (
      rows.map((row) => (
        <div key={row.name} className="planning-relational-row-group">
          <article className="planning-relational-row">
            <strong>{row.name}</strong>
            <div className="planning-linked-chips">
              <span>Goal&nbsp; {row.goal}</span>
            </div>
            <span className="planning-progress-chip" style={{ "--target-progress": row.progress } as CSSProperties}>
              {row.progress}
            </span>
            <span>{row.due}</span>
            <div className="planning-status-actions">
              <span className="pill status-in_progress">{row.status}</span>
              {hasRealRowId(row) ? (
                <span className="planning-row-actions">
                <button
                  type="button"
                  className="pill-link"
                  onClick={() => {
                    const target = targets.find((item) => item.id === row.id);
                    if (target) {
                      startTargetEdit(target);
                    }
                  }}
                  disabled={busyTargetId === row.id}
                >
                  Edit
                </button>
                <button type="button" className="pill-link" onClick={() => void deleteTarget(row.id)} disabled={busyTargetId === row.id}>
                  Delete
                </button>
                </span>
              ) : (
                <span className="planning-row-actions is-muted">Preview</span>
              )}
            </div>
          </article>
          {hasRealRowId(row) && editingTargetId === row.id ? renderCanonicalTargetEditForm(row.id) : null}
        </div>
      ))
    ) : (
      <p className="callout state-empty">No targets yet. Add a measurable target to make one goal visible.</p>
    );
  }

  function renderCanonicalComposer() {
    const composerConfig =
      planningTab === "tasks"
        ? {
            eyebrow: "Weekly capture",
            title: "Add the next concrete move",
            detail: showPlanningShowcase ? "Capture one meaningful task first. Structure can follow after clarity appears." : "Keep the weekly plan small enough that it still feels believable.",
            stats: [
              { label: "Open", value: showPlanningShowcase ? "6" : String(openTasksCount) },
              { label: "Today", value: showPlanningShowcase ? "4" : String(dueTodayCount) },
            ],
          }
        : planningTab === "lists"
          ? {
              eyebrow: "Structure with restraint",
              title: "Create a list only when it earns its place",
              detail: showPlanningShowcase ? "A strong list collects related work without becoming another bucket of guilt." : "Use parent links only when they genuinely sharpen the week.",
              stats: [
                { label: "Lists", value: showPlanningShowcase ? "4" : String(lists.length) },
                { label: "Context linked", value: showPlanningShowcase ? "4" : String(contextualListsCount) },
              ],
            }
          : planningTab === "goals"
            ? {
                eyebrow: "Direction first",
                title: "Name a goal that can guide the week",
                detail: showPlanningShowcase ? "Goals should define the arc, then let targets and lists do the operational work." : "Keep the goal big enough to matter and clear enough to connect to targets.",
                stats: [
                  { label: "Active goals", value: showPlanningShowcase ? "3" : String(activeGoalsCount) },
                  { label: "With targets", value: showPlanningShowcase ? "2" : String(goalsWithTargetsCount) },
                ],
              }
            : {
                eyebrow: "Measurable evidence",
                title: "Turn intent into a visible checkpoint",
                detail: showPlanningShowcase ? "A target should make progress easy to notice at a glance." : "Keep metrics simple, dated, and attached to a real goal.",
                stats: [
                  { label: "Active targets", value: showPlanningShowcase ? "7" : String(activeTargetsCount) },
                  { label: "Avg progress", value: showPlanningShowcase ? "68%" : `${averageTargetProgress}%` },
                ],
              };

    const composerIntro = (
      <div className="planning-composer-head">
        <div>
          <p className="planning-composer-eyebrow">{composerConfig.eyebrow}</p>
          <h4>{composerConfig.title}</h4>
          <p className="planning-composer-detail">{composerConfig.detail}</p>
        </div>
        <div className="planning-composer-stats" aria-label="Composer context">
          {composerConfig.stats.map((item) => (
            <span key={item.label}>
              <strong>{item.value}</strong>
              <small>{item.label}</small>
            </span>
          ))}
        </div>
      </div>
    );

    const composerFoot =
      planningTab === "tasks" ? (
        <p className="planning-composer-foot">Start with the next task, then connect it to a list only if the structure helps.</p>
      ) : planningTab === "lists" ? (
        <p className="planning-composer-foot">A good list reduces friction for the week instead of adding another maintenance surface.</p>
      ) : planningTab === "goals" ? (
        <p className="planning-composer-foot">If a goal feels vague, let the target clarify it before you create more structure around it.</p>
      ) : (
        <p className="planning-composer-foot">The best target is simple enough that you can explain progress in one sentence.</p>
      );

    if (planningTab === "tasks") {
      return taskComposerListId === UNASSIGNED_COLUMN_ID ? (
        <div className="planning-canonical-composer">
          {composerIntro}
          {renderTaskComposer(UNASSIGNED_COLUMN_ID, "Add task to weekly plan")}
          {composerFoot}
        </div>
      ) : null;
    }

    if (planningTab === "lists") {
      return (
        <form className="planning-canonical-composer form-grid" onSubmit={createList}>
          {composerIntro}
          <label className="field">
            <span>Name</span>
            <input
              className="list-row"
              type="text"
              value={newListName}
              onChange={(event) => setNewListName(event.target.value)}
              placeholder="Example: Launch plan"
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
          {composerFoot}
        </form>
      );
    }

    if (planningTab === "goals") {
      return (
        <form className="planning-canonical-composer form-grid" onSubmit={createGoal}>
          {composerIntro}
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
          {composerFoot}
        </form>
      );
    }

    return (
      <form className="planning-canonical-composer form-grid" onSubmit={createTarget}>
        {composerIntro}
        {goals.length === 0 ? (
          <p className="callout state-empty">Create at least one goal before saving a target.</p>
        ) : null}
        <label className="field">
          <span>Goal</span>
          <select
            className="list-row"
            value={newTargetGoalId}
            onChange={(event) => setNewTargetGoalId(event.target.value)}
            disabled={isCreatingTarget || goals.length === 0}
          >
            <option value="">Select goal</option>
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
            disabled={isCreatingTarget || goals.length === 0}
          />
        </label>
        <div className="form-grid form-grid-three">
          <label className="field">
            <span>Metric type</span>
            <input
              className="list-row"
              type="text"
              value={newTargetMetricType}
              onChange={(event) => setNewTargetMetricType(event.target.value)}
              disabled={isCreatingTarget || goals.length === 0}
            />
          </label>
          <label className="field">
            <span>Target value</span>
            <input
              className="list-row"
              type="number"
              value={newTargetValueTarget}
              onChange={(event) => setNewTargetValueTarget(event.target.value)}
              min="0"
              step="1"
              disabled={isCreatingTarget || goals.length === 0}
            />
          </label>
          <label className="field">
            <span>Unit</span>
            <input
              className="list-row"
              type="text"
              value={newTargetUnit}
              onChange={(event) => setNewTargetUnit(event.target.value)}
              disabled={isCreatingTarget || goals.length === 0}
            />
          </label>
        </div>
        <button type="submit" className="btn-primary" disabled={isCreatingTarget || goals.length === 0}>
          {isCreatingTarget ? "Adding..." : "Add target"}
        </button>
        {composerFoot}
      </form>
    );
  }

  function renderCanonicalTaskTools() {
    if (planningTab !== "tasks") {
      return null;
    }

    return (
      <div className="planning-canonical-tools">
        <div className="planning-canonical-summary" aria-label="Planning board summary">
          {[
            { label: "Open", value: showPlanningShowcase ? 6 : openTasksCount },
            { label: "Today", value: showPlanningShowcase ? 4 : dueTodayCount },
            { label: "Overdue", value: showPlanningShowcase ? 0 : overdueCount },
            { label: "Standalone", value: showPlanningShowcase ? 2 : unassignedTasksCount },
            { label: "Context lists", value: showPlanningShowcase ? 4 : contextualListsCount },
          ].map((item) => (
            <span key={item.label}>
              <strong>{item.value}</strong>
              <small>{item.label}</small>
            </span>
          ))}
        </div>

        <details className="planning-canonical-filters">
          <summary>Board tools</summary>
          <div className="planning-canonical-filter-grid">
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
              {[
                { key: "all", label: "All" },
                { key: "open", label: "Open" },
                { key: "done", label: "Done" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`filter-chip ${statusFilter === item.key ? "is-active" : ""}`}
                  onClick={() => setStatusFilter(item.key as "all" | "open" | "done")}
                >
                  {item.label}
                </button>
              ))}
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

            <div className="row-inline">
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
        </details>
      </div>
    );
  }

  function renderCanonicalDeepPanel() {
    const section =
      planningTab === "tasks"
        ? {
            title: "Execution signals",
            summary: "Make sure the week is moving, not just getting fuller.",
            notePrimary: showPlanningShowcase ? "Current anchor: commit to the right plan." : `Current anchor: ${nextTask?.title ?? "Choose the next meaningful task."}`,
            noteSecondary: showPlanningShowcase ? "Review remains visible because closure matters as much as capture." : `${inProgressTasksCount} tasks are already in motion.`,
            items: [
              { label: "Completed", value: showPlanningShowcase ? "2" : String(completedTasksCount), tone: "done" },
              { label: "In progress", value: showPlanningShowcase ? "1" : String(inProgressTasksCount), tone: "accent" },
              { label: "Due today", value: showPlanningShowcase ? "4" : String(dueTodayCount), tone: "neutral" },
              { label: "Unassigned", value: showPlanningShowcase ? "2" : String(unassignedTasksCount), tone: "soft" },
            ],
          }
        : planningTab === "lists"
          ? {
              title: "List structure",
              summary: "Use parent links only where they sharpen the week.",
              notePrimary: showPlanningShowcase ? "Strong lists usually point toward a goal, a target, or a life area." : `${listsWithTasksCount} of ${Math.max(lists.length, 1)} lists already hold active work.`,
              noteSecondary: showPlanningShowcase ? "The rest can stay light and flexible." : `${Math.max(lists.length - contextualListsCount, 0)} lists stay intentionally unscoped.`,
              items: [
                { label: "Context linked", value: showPlanningShowcase ? "4" : String(contextualListsCount), tone: "accent" },
                { label: "Goal linked", value: showPlanningShowcase ? "2" : String(goalLinkedListsCount), tone: "neutral" },
                { label: "Target linked", value: showPlanningShowcase ? "1" : String(targetLinkedListsCount), tone: "neutral" },
                { label: "Life area linked", value: showPlanningShowcase ? "2" : String(lifeAreaLinkedListsCount), tone: "soft" },
              ],
            }
          : planningTab === "goals"
            ? {
                title: "Goal momentum",
                summary: "A goal becomes believable when it has a path under it.",
                notePrimary: showPlanningShowcase ? "The healthiest goals already break into targets and lists." : `${goalsWithTargetsCount} goals already have target paths.`,
                noteSecondary: showPlanningShowcase ? "Paused goals should stay visible, but quiet." : `${Math.max(goals.length - goalsWithTargetsCount, 0)} goals still need measurable checkpoints.`,
                items: [
                  { label: "Active", value: showPlanningShowcase ? "3" : String(activeGoalsCount), tone: "accent" },
                  { label: "With targets", value: showPlanningShowcase ? "2" : String(goalsWithTargetsCount), tone: "neutral" },
                  { label: "With lists", value: showPlanningShowcase ? "3" : String(goalsWithListsCount), tone: "soft" },
                  { label: "Paused or done", value: showPlanningShowcase ? "1" : String(pausedGoalsCount + completedGoalsCount), tone: "done" },
                ],
              }
            : {
                title: "Target health",
                summary: "Targets should be measurable, dated, and attached to real work.",
                notePrimary: showPlanningShowcase ? "The next checkpoint should always be easy to explain in one line." : `${targetsWithListsCount} targets already connect to a working list.`,
                noteSecondary: showPlanningShowcase ? "Progress works best when the metric stays legible at a glance." : `${overdueTargetsCount} active targets are overdue and need review.`,
                items: [
                  { label: "Active", value: showPlanningShowcase ? "7" : String(activeTargetsCount), tone: "accent" },
                  { label: "Avg progress", value: showPlanningShowcase ? "68%" : `${averageTargetProgress}%`, tone: "neutral" },
                  { label: "Due soon", value: showPlanningShowcase ? "2" : String(dueSoonTargetsCount), tone: "soft" },
                  { label: "With lists", value: showPlanningShowcase ? "5" : String(targetsWithListsCount), tone: "done" },
                ],
              };

    return (
      <Panel title={section.title} className="planning-deep-panel">
        <div className="planning-deep-head">
          <p>{section.summary}</p>
          <button type="button" className="pill-link" onClick={() => focusPlanningComposer(planningTab)}>
            {planningActionLabel}
          </button>
        </div>
        <div className="planning-deep-grid">
          {section.items.map((item) => (
            <article key={item.label} className={`planning-deep-card is-${item.tone}`}>
              <small>{item.label}</small>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
        <div className="planning-deep-notes">
          <span>{section.notePrimary}</span>
          <span>{section.noteSecondary}</span>
        </div>
      </Panel>
    );
  }

  function renderPlanningStatusStrip() {
    const isPreviewState = showPlanningShowcase && Boolean(errorMessage);
    const message = isPreviewState
      ? "Live planning data is unavailable. Canonical preview is shown."
      : errorMessage ?? feedback;
    if (!message) {
      return null;
    }

    return (
      <section className={`planning-status-strip ${errorMessage ? "is-error" : "is-success"}`} aria-live="polite">
        <div className="planning-status-copy">
          <small>{errorMessage ? (isPreviewState ? "Preview mode" : "Planning status") : "Saved state"}</small>
          <strong>{message}</strong>
        </div>
        <div className="planning-status-actions">
          <button type="button" className="pill-link" onClick={() => void loadWorkspace()} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>
    );
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

  function focusPlanningComposer(tab: PlanningTab) {
    if (tab === "tasks") {
      openPlanningTab("tasks");
      setTaskComposerListId(UNASSIGNED_COLUMN_ID);
      return;
    }

    openPlanningTab(tab);
    window.setTimeout(() => {
      document.querySelector(".planning-canonical-composer")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  const planningActionLabel =
    planningTab === "tasks"
      ? "+ Add task"
      : planningTab === "lists"
        ? "+ Add list"
        : planningTab === "goals"
          ? "+ Add goal"
          : "+ Add target";

  return (
    <WorkspaceShell
      title="Planning"
      subtitle="Shape the week around what matters."
      module="tasks"
      contentLayout="single"
      shellTone="dashboard-canonical"
      utilityDateLabel="Friday, May 23, 2025"
      utilityWeatherLabel="18°C"
      hideAssistantNav
      hideRailFooterActions
    >
      <section className={`planning-canonical-shell is-canonical-dashboard ${isLoading ? "is-loading" : ""}`}>
        <div className="planning-canonical-main">
          <DashboardHeroBand
            title="This week's direction"
            summary="Focus on a few meaningful moves."
            progressLabel="Weekly direction"
            progressPercent={planningHeroProgress}
            metrics={planningHeroMetrics}
          />

          <div className="planning-canonical-middle">
            <DashboardFocusCard
              kicker={focusCard.kicker}
              kickerIcon={<PlanningGlyph name="goal" />}
              title={focusCard.title}
              detail={focusCard.detail}
              supportingLabel="High impact"
              supportingValue="45 min"
              href={focusCard.href}
              cta={focusCard.cta}
              rationaleHref="#planning-ladder"
              rationaleLabel="Why this?"
            />

            <section className="planning-flow-panel" aria-label="Weekly planning flow">
              <div className="planning-flow-stages">
                {[
                  { icon: "task" as const, title: "Capture", detail: "Collect ideas and tasks" },
                  { icon: "note" as const, title: "Shape", detail: "Organize and prioritize" },
                  { icon: "goal" as const, title: "Commit", detail: "Plan and time what matters" },
                  { icon: "list" as const, title: "Review", detail: "Reflect and adjust" },
                ].map((stage) => (
                  <article key={stage.title} className="planning-flow-stage">
                    <span className="planning-flow-icon">
                      <PlanningGlyph name={stage.icon} />
                    </span>
                    <strong>{stage.title}</strong>
                    <small>{stage.detail}</small>
                  </article>
                ))}
              </div>

              <div className="planning-week-rail" aria-hidden="true">
                {["Mon", "Tue", "Now", "Wed", "Thu", "Fri"].map((day) => (
                  <span key={day} className={day === "Now" ? "is-now" : ""}>
                    {day}
                  </span>
                ))}
              </div>

              <div className="planning-flow-cards">
                {planningFlowCards.map((item) => (
                  <article key={item.title} className={`planning-flow-card ${item.now ? "is-now" : ""}`}>
                    <span>
                      <PlanningGlyph name={item.icon} />
                    </span>
                    <strong>{item.title}</strong>
                    <small>{item.count}</small>
                  </article>
                ))}
              </div>

              <div className="planning-flow-footer">
                <button type="button" className="pill-link" onClick={() => openPlanningTab("tasks")}>
                  View full week
                </button>
                <button type="button" className="pill-link" onClick={() => void loadWorkspace()} disabled={isLoading}>
                  {isLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </section>
          </div>
        </div>

        <aside className="planning-support-rail" aria-label="Planning support">
          <article className="dashboard-sidebar-card planning-clarity-card">
            <div className="dashboard-sidebar-card-head">
              <h3>
                <PlanningGlyph name="note" />
                <span>Plan with clarity</span>
              </h3>
              <span>...</span>
            </div>
            <p className="planning-clarity-script">Choose the few moves that make the rest easier.</p>
            <div className="planning-clarity-lines">
              <p><strong>Today:</strong> protect deep work</p>
              <p><strong>Later:</strong> review budget</p>
            </div>
            <button type="button" className="dashboard-floating-action" aria-label="Open planning note">
              <PlanningGlyph name="note" />
            </button>
          </article>

          <article className="dashboard-sidebar-card planning-quick-add-card">
            <div className="dashboard-sidebar-card-head">
              <h3>Quick add</h3>
            </div>
            <div className="dashboard-quick-add-grid">
              {[
                { label: "Task", icon: "task" as const, action: () => setTaskComposerListId(UNASSIGNED_COLUMN_ID) },
                { label: "List", icon: "list" as const, action: () => focusPlanningComposer("lists") },
                { label: "Goal", icon: "goal" as const, action: () => focusPlanningComposer("goals") },
                { label: "Target", icon: "target" as const, action: () => focusPlanningComposer("targets") },
              ].map((item) => (
                <button key={item.label} type="button" className="dashboard-quick-add-tile" onClick={item.action}>
                  <span className="dashboard-quick-add-icon" aria-hidden="true">
                    <PlanningGlyph name={item.icon} />
                  </span>
                  <small>{item.label}</small>
                </button>
              ))}
            </div>
          </article>

          <article className="dashboard-sidebar-card planning-pressure-card">
            <div className="dashboard-sidebar-card-head">
              <h3>
                <PlanningGlyph name="pressure" />
                <span>Planning pressure</span>
              </h3>
              <button type="button" className="pill-link" onClick={() => openPlanningTab("targets")}>View all</button>
            </div>
            <div className="dashboard-balance-grid">
              <div className="dashboard-balance-donut planning-pressure-donut">
                <div className="dashboard-balance-donut-inner" aria-hidden="true" />
              </div>
              <ul className="dashboard-balance-legend">
                {[
                  { label: "Health", value: 8.2, color: "#89946c" },
                  { label: "Work", value: 7.6, color: "#d9b75e" },
                  { label: "Relationships", value: 7.0, color: "#c87b49" },
                  { label: "Finance", value: 6.6, color: "#b8b8ca" },
                  { label: "Growth", value: 6.9, color: "#91a0a0" },
                ].map((item) => (
                  <li key={item.label}>
                    <span className="dashboard-balance-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
                    <small>{item.label}</small>
                    <strong>{item.value.toFixed(1)}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <p className="dashboard-balance-caption">Balance across your life areas.</p>
          </article>
        </aside>
      </section>

      <Panel title="Planning workspace" className="planning-view-panel planning-relational-panel">
        <div className="planning-workspace-head">
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
          <button type="button" className="pill-link" onClick={() => focusPlanningComposer(planningTab)}>
            {planningActionLabel}
          </button>
        </div>

        <div className="planning-relational-table">
          <div className="planning-relational-header">
            {planningWorkspaceColumns.map((column) => (
              <span key={column}>{column}</span>
            ))}
          </div>
          {renderPlanningWorkspaceRows()}
          {renderCanonicalComposer()}
          {renderCanonicalTaskTools()}
          <div className="planning-relational-footer">
            <button type="button" className="pill-link" onClick={() => openPlanningTab(planningTab)}>
              View all {planningTab}
            </button>
            <button
              type="button"
              className="pill-link"
              onClick={() => focusPlanningComposer(planningTab)}
            >
              {planningActionLabel}
            </button>
          </div>
        </div>
      </Panel>

      <section id="planning-ladder" className="planning-ladder" aria-label="Planning ladder">
        <div className="planning-ladder-copy">
          <h3>Planning ladder</h3>
          <p>See how direction moves into daily action.</p>
        </div>
        <div className="planning-ladder-chain">
          <article className="planning-ladder-node">
            <small>Goal</small>
            <strong>{hottestGoal?.title ?? "Build a healthier me"}</strong>
            <div className="planning-ladder-progress" style={{ "--progress-value": `${activeGoalsCount > 0 ? 72 : 34}%` } as CSSProperties}>
              <span />
            </div>
          </article>
          <article className="planning-ladder-node">
            <small>Target</small>
            <strong>{targets[0]?.title ?? "Workout 3x per week"}</strong>
            <div className="planning-ladder-progress" style={{ "--progress-value": `${activeTargetsCount > 0 ? 80 : 28}%` } as CSSProperties}>
              <span />
            </div>
          </article>
          <article className="planning-ladder-node">
            <small>List</small>
            <strong>{lists[0]?.name ?? "Training program"}</strong>
            <span>{lists[0] ? `${tasksByListId.get(lists[0].id)?.length ?? 0} tasks` : "8 tasks"}</span>
          </article>
          <article className="planning-ladder-node">
            <small>Next task</small>
            <strong>{nextTask?.title ?? "Leg day workout"}</strong>
            <span>{nextTask?.due_date ? `Due ${toDateInputValue(nextTask.due_date)}` : "Due tomorrow"}</span>
          </article>
        </div>
      </section>

      {renderCanonicalDeepPanel()}

      {renderPlanningStatusStrip()}

      {planningTab === "tasks" ? (
        <Panel id="planning-today-focus" title="Today Focus" className="planning-focus-primary">
          <p className="callout">
            Capture work fast in <strong>No List</strong>, then organize only what needs structure.
          </p>
          <div className="row-inline">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setTaskComposerListId(UNASSIGNED_COLUMN_ID)}
            >
              Add task now
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => openPlanningTab("lists")}
            >
              Add list
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setHideEmptyColumns(false)}
            >
              Show empty columns
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
      <Panel title="Setup (Optional)" className="planning-secondary-tools">
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
          <summary>Show filters</summary>
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

      <section className={`panel planning-board-primary ${showPlanningShowcase ? "is-preview-hidden" : ""}`}>
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
              No lists yet. Use <strong>+ Add list</strong> in the canonical workspace, or start immediately with
              standalone tasks in <strong>No List</strong>.
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
          <Panel id="planning-lists-composer" title="Create List">
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

          <Panel title="List Library" className={`planning-library-panel ${showPlanningShowcase ? "is-preview-hidden" : ""}`}>
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
          <Panel id="planning-goals-composer" title="Add Goal">
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

          <Panel title="Goal Roadmaps" className={`planning-library-panel ${showPlanningShowcase ? "is-preview-hidden" : ""}`}>
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
          <Panel id="planning-targets-composer" title="Add Target">
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

          <Panel title="Target Checkpoints" className={`planning-library-panel ${showPlanningShowcase ? "is-preview-hidden" : ""}`}>
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
