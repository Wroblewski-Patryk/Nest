"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";
import { clearAuthSession, getAuthToken, setOnboardingRequired } from "@/lib/auth-session";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  onboarding_required?: boolean;
};

type ListItem = {
  id: string;
  name: string;
  color: string;
};

type TaskItem = {
  id: string;
  list_id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "canceled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
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
    (error as { payload: { message?: unknown } }).payload?.message &&
    typeof (error as { payload: { message: unknown } }).payload.message === "string"
  ) {
    return (error as { payload: { message: string } }).payload.message;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unexpected API error.";
}

function toDateInputValue(value: string | null): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function formatPriority(priority: TaskItem["priority"]): string {
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
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [lists, setLists] = useState<ListItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");

  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState("#789262");
  const [isCreatingList, setIsCreatingList] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem["priority"]>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editListName, setEditListName] = useState("");
  const [editListColor, setEditListColor] = useState("#789262");
  const [busyListId, setBusyListId] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState<TaskItem["priority"]>("medium");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isAuthenticated = user !== null;

  const openTasksCount = useMemo(
    () => tasks.filter((task) => task.status !== "done" && task.status !== "canceled").length,
    [tasks]
  );

  const doneTasksCount = useMemo(() => tasks.filter((task) => task.status === "done").length, [tasks]);

  const selectedListTasks = useMemo(() => {
    if (!selectedListId) {
      return tasks;
    }

    return tasks.filter((task) => task.list_id === selectedListId);
  }, [selectedListId, tasks]);

  const selectedList = useMemo(
    () => lists.find((list) => list.id === selectedListId) ?? null,
    [lists, selectedListId]
  );

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    setOnboardingRequired(false);
    setUser(null);
    setLists([]);
    setTasks([]);
    setSelectedListId("");
    router.replace("/auth");
  }, [router]);

  const refreshWorkspaceData = useCallback(async () => {
    const [listsResponse, tasksResponse] = await Promise.all([
      nestApiClient.getLists({ per_page: 100 }),
      nestApiClient.getTasks({ per_page: 100, sort: "-created_at" }),
    ]);

    const normalizedLists = (listsResponse.data ?? []) as ListItem[];
    const normalizedTasks = (tasksResponse.data ?? []) as TaskItem[];

    setLists(normalizedLists);
    setTasks(normalizedTasks);
    setSelectedListId((current) => {
      if (current && normalizedLists.some((list) => list.id === current)) {
        return current;
      }

      return normalizedLists[0]?.id ?? "";
    });
  }, []);

  const bootstrapSession = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      handleUnauthorized();
      setIsBootstrapping(false);
      return;
    }

    try {
      const meResponse = await apiRequest<{ data: AuthUser }>("/auth/me");
      setOnboardingRequired(Boolean(meResponse.data.onboarding_required));
      setUser(meResponse.data);
      await refreshWorkspaceData();
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsBootstrapping(false);
    }
  }, [handleUnauthorized, refreshWorkspaceData, router]);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  async function handleLogout() {
    setErrorMessage("");
    setFeedback("");

    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // no-op
    }

    handleUnauthorized();
  }

  async function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newListName.trim()) {
      setErrorMessage("List name is required.");
      return;
    }

    setIsCreatingList(true);
    setErrorMessage("");
    setFeedback("");

    try {
      const response = await apiRequest<{ data: ListItem }>("/lists", {
        method: "POST",
        body: {
          name: newListName.trim(),
          color: newListColor,
        },
      });

      setNewListName("");
      setSelectedListId(response.data.id);
      await refreshWorkspaceData();
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

  async function ensureListForTask(): Promise<string> {
    if (selectedListId) {
      return selectedListId;
    }

    if (lists.length > 0) {
      const fallbackId = lists[0].id;
      setSelectedListId(fallbackId);
      return fallbackId;
    }

    const response = await apiRequest<{ data: ListItem }>("/lists", {
      method: "POST",
      body: {
        name: "Inbox",
        color: "#789262",
      },
    });

    setSelectedListId(response.data.id);
    await refreshWorkspaceData();
    return response.data.id;
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTaskTitle.trim()) {
      setErrorMessage("Task title is required.");
      return;
    }

    setIsCreatingTask(true);
    setErrorMessage("");
    setFeedback("");

    try {
      const listId = await ensureListForTask();

      await apiRequest("/tasks", {
        method: "POST",
        body: {
          list_id: listId,
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
          ...(newTaskDueDate ? { due_date: newTaskDueDate } : {}),
        },
      });

      setNewTaskTitle("");
      setNewTaskPriority("medium");
      setNewTaskDueDate("");
      await refreshWorkspaceData();
      setFeedback("Task added.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreatingTask(false);
    }
  }

  function startListEdit(list: ListItem) {
    setEditingListId(list.id);
    setEditListName(list.name);
    setEditListColor(list.color);
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
        },
      });
      setEditingListId(null);
      await refreshWorkspaceData();
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
    if (!window.confirm("Delete this list and remove it from active planning view?")) {
      return;
    }

    setBusyListId(listId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/lists/${listId}`, {
        method: "DELETE",
      });
      if (selectedListId === listId) {
        setSelectedListId("");
      }
      await refreshWorkspaceData();
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

  function startTaskEdit(task: TaskItem) {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(toDateInputValue(task.due_date));
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
          due_date: editTaskDueDate.length > 0 ? editTaskDueDate : null,
        },
      });
      setEditingTaskId(null);
      await refreshWorkspaceData();
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

  async function updateTaskStatus(taskId: string, status: TaskItem["status"]) {
    setBusyTaskId(taskId);
    setErrorMessage("");
    setFeedback("");

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: "PATCH",
        body: { status },
      });

      await refreshWorkspaceData();
      setFeedback(status === "done" ? "Task marked as done." : "Task reopened.");
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
      await apiRequest(`/tasks/${taskId}`, {
        method: "DELETE",
      });

      await refreshWorkspaceData();
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
      title="Tasks + Lists Command"
      subtitle="Capture fast, choose focus list, and close daily loops without friction."
      module="tasks"
    >
      <div className="stack">
        <MetricCard label="Open tasks" value={String(openTasksCount)} />
        <MetricCard label="Completed" value={String(doneTasksCount)} />
        <MetricCard label="Lists active" value={String(lists.length)} />
        <MetricCard label="Signed user" value={user?.name ?? "Loading..."} />
      </div>

      <Panel
        title="Session"
        actions={
          <button type="button" className="btn-secondary" onClick={handleLogout} disabled={isBootstrapping}>
            Sign out
          </button>
        }
      >
        <p className="callout">
          Signed in as <strong>{user?.email ?? "..."}</strong>. Task create/edit/delete is fully API-backed.
        </p>
      </Panel>

      <Panel title="Quick Capture">
        <form className="form-grid" onSubmit={handleCreateTask}>
          <label className="field">
            <span>Task title</span>
            <input
              className="list-row"
              type="text"
              value={newTaskTitle}
              onChange={(event) => setNewTaskTitle(event.target.value)}
              placeholder="Example: Plan tomorrow top 3"
              disabled={!isAuthenticated || isCreatingTask || isBootstrapping}
            />
          </label>
          <div className="row-inline">
            <label className="field">
              <span>Priority</span>
              <select
                className="list-row"
                value={newTaskPriority}
                onChange={(event) => setNewTaskPriority(event.target.value as TaskItem["priority"])}
                disabled={!isAuthenticated || isCreatingTask || isBootstrapping}
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
                value={newTaskDueDate}
                onChange={(event) => setNewTaskDueDate(event.target.value)}
                disabled={!isAuthenticated || isCreatingTask || isBootstrapping}
              />
            </label>
          </div>
          <button type="submit" className="btn-primary" disabled={!isAuthenticated || isCreatingTask || isBootstrapping}>
            {isCreatingTask ? "Adding..." : "Add task"}
          </button>
        </form>
      </Panel>

      <Panel title="Lists Command">
        <form className="form-grid" onSubmit={handleCreateList}>
          <label className="field">
            <span>New list</span>
            <input
              className="list-row"
              type="text"
              value={newListName}
              onChange={(event) => setNewListName(event.target.value)}
              placeholder="Example: Home Ops"
              disabled={!isAuthenticated || isCreatingList || isBootstrapping}
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
                disabled={!isAuthenticated || isCreatingList || isBootstrapping}
              />
            </label>
            <button
              type="submit"
              className="btn-secondary"
              disabled={!isAuthenticated || isCreatingList || isBootstrapping}
            >
              {isCreatingList ? "Adding..." : "Add list"}
            </button>
          </div>
        </form>

        <ul className="list">
          {lists.length === 0 ? (
            <li className="list-row">
              <p>No list yet. Add one above or just add a task, and we will create Inbox automatically.</p>
            </li>
          ) : (
            lists.map((list) => (
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
                      <div className="row-inline">
                        <span className="dot" style={{ backgroundColor: list.color }} />
                        <strong>{list.name}</strong>
                        {selectedListId === list.id ? <span className="pill state-success">active</span> : null}
                      </div>
                      <p>
                        {tasks.filter((task) => task.list_id === list.id).length} tasks in this list
                      </p>
                    </div>
                    <div className="row-inline">
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => setSelectedListId(list.id)}
                        disabled={busyListId === list.id}
                      >
                        Focus
                      </button>
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
            ))
          )}
        </ul>
      </Panel>

      <Panel title={`Task Queue${selectedList ? `: ${selectedList.name}` : ""}`}>
        <ul className="list">
          {selectedListTasks.length === 0 ? (
            <li className="list-row">
              <p>No tasks in this scope yet. Add the first one above.</p>
            </li>
          ) : (
            selectedListTasks.map((task) => (
              <li className="list-row" key={task.id}>
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
                        <span>Priority</span>
                        <select
                          className="list-row"
                          value={editTaskPriority}
                          onChange={(event) =>
                            setEditTaskPriority(event.target.value as TaskItem["priority"])
                          }
                          disabled={busyTaskId === task.id}
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
                          disabled={busyTaskId === task.id}
                        />
                      </label>
                    </div>
                    <div className="row-inline">
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
                    <div>
                      <strong>{task.title}</strong>
                      <p>
                        {formatPriority(task.priority)}
                        {task.due_date ? ` | due ${toDateInputValue(task.due_date)}` : ""}
                      </p>
                    </div>
                    <div className="row-inline">
                      <span className={`pill ${task.status === "done" ? "state-success" : ""}`}>
                        {task.status}
                      </span>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => void updateTaskStatus(task.id, task.status === "done" ? "todo" : "done")}
                        disabled={busyTaskId === task.id || isBootstrapping}
                      >
                        {task.status === "done" ? "Reopen" : "Done"}
                      </button>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => startTaskEdit(task)}
                        disabled={busyTaskId === task.id || isBootstrapping}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="pill-link"
                        onClick={() => void deleteTask(task.id)}
                        disabled={busyTaskId === task.id || isBootstrapping}
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
