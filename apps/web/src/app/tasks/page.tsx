"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";
import { clearAuthSession, getAuthToken, setAuthSession } from "@/lib/auth-session";

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

const DEFAULT_LOGIN_EMAIL = "test@example.com";
const DEFAULT_LOGIN_PASSWORD = "password";

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

export default function TasksPage() {
  const router = useRouter();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const [lists, setLists] = useState<ListItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");

  const [loginEmail, setLoginEmail] = useState(DEFAULT_LOGIN_EMAIL);
  const [loginPassword, setLoginPassword] = useState(DEFAULT_LOGIN_PASSWORD);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [newListName, setNewListName] = useState("");
  const [newListColor, setNewListColor] = useState("#789262");
  const [isCreatingList, setIsCreatingList] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem["priority"]>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const [feedback, setFeedback] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const openTasksCount = useMemo(
    () => tasks.filter((task) => task.status !== "done" && task.status !== "canceled").length,
    [tasks]
  );

  const selectedListTasks = useMemo(() => {
    if (!selectedListId) {
      return tasks;
    }

    return tasks.filter((task) => task.list_id === selectedListId);
  }, [selectedListId, tasks]);

  const refreshWorkspaceData = useCallback(async () => {
    const [listsResponse, tasksResponse] = await Promise.all([
      nestApiClient.getLists({ per_page: 200 }),
      nestApiClient.getTasks({ per_page: 200, sort: "-created_at" }),
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
      setIsAuthenticated(false);
      setUser(null);
      setIsBootstrapping(false);
      return;
    }

    try {
      const meResponse = await apiRequest<{ data: AuthUser }>("/auth/me");
      setUser(meResponse.data);
      setIsAuthenticated(true);
      await refreshWorkspaceData();
    } catch {
      clearAuthSession();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsBootstrapping(false);
    }
  }, [refreshWorkspaceData]);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoggingIn(true);
    setErrorMessage("");
    setFeedback("");

    try {
      const response = await apiRequest<{ data: { token: string; user: AuthUser } }>("/auth/login", {
        method: "POST",
        body: {
          email: loginEmail.trim(),
          password: loginPassword,
        },
      });

      setAuthSession(response.data.token, Boolean(response.data.user.onboarding_required));
      setUser(response.data.user);
      setIsAuthenticated(true);
      if (response.data.user.onboarding_required) {
        router.replace("/onboarding");
        return;
      }
      await refreshWorkspaceData();
      setFeedback("Signed in. You can now add lists and tasks.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    setErrorMessage("");
    setFeedback("");

    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // no-op
    }

    clearAuthSession();
    setIsAuthenticated(false);
    setUser(null);
    setLists([]);
    setTasks([]);
    setSelectedListId("");
    setFeedback("Signed out.");
    router.replace("/auth");
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
      await apiRequest("/lists", {
        method: "POST",
        body: {
          name: newListName.trim(),
          color: newListColor,
        },
      });

      setNewListName("");
      await refreshWorkspaceData();
      setFeedback("List created.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        clearAuthSession();
        setIsAuthenticated(false);
        setUser(null);
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreatingList(false);
    }
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTaskTitle.trim()) {
      setErrorMessage("Task title is required.");
      return;
    }

    if (!selectedListId) {
      setErrorMessage("Create or select a list first.");
      return;
    }

    setIsCreatingTask(true);
    setErrorMessage("");
    setFeedback("");

    try {
      await apiRequest("/tasks", {
        method: "POST",
        body: {
          list_id: selectedListId,
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
        clearAuthSession();
        setIsAuthenticated(false);
        setUser(null);
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreatingTask(false);
    }
  }

  async function updateTaskStatus(taskId: string, status: TaskItem["status"]) {
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
        clearAuthSession();
        setIsAuthenticated(false);
        setUser(null);
      }
      setErrorMessage(getErrorMessage(error));
    }
  }

  return (
    <WorkspaceShell
      title="Tasks + Lists"
      subtitle="Capture commitments, sort them into lists, and execute with clarity."
      module="tasks"
    >
      <div className="stack">
        <MetricCard label="Open tasks" value={String(openTasksCount)} />
        <MetricCard label="Lists active" value={String(lists.length)} />
        <MetricCard label="Signed user" value={user?.name ?? "Not signed in"} />
      </div>

      <Panel
        title="Session"
        actions={
          isAuthenticated ? (
            <button type="button" className="btn-secondary" onClick={handleLogout}>
              Sign out
            </button>
          ) : null
        }
      >
        <div className="panel-content">
          <p className="callout">
            Use account credentials to work with real API data. Default seeded account:{" "}
            <strong>test@example.com / password</strong>.
          </p>
          {!isAuthenticated ? (
            <form className="form-grid" onSubmit={handleLogin}>
              <label className="field">
                <span>Email</span>
                <input
                  className="list-row"
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  className="list-row"
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  required
                />
              </label>
              <button type="submit" className="btn-primary" disabled={isLoggingIn || isBootstrapping}>
                {isLoggingIn ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <p className="mono-note">Signed in as {user?.email}</p>
          )}
        </div>
      </Panel>

      <Panel title="Task Lists">
        <div className="panel-content">
          <form className="form-grid" onSubmit={handleCreateList}>
            <label className="field">
              <span>List name</span>
              <input
                className="list-row"
                type="text"
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                placeholder="Example: Home Ops"
                disabled={!isAuthenticated || isBootstrapping}
              />
            </label>
            <label className="field">
              <span>Color</span>
              <input
                className="list-row"
                type="color"
                value={newListColor}
                onChange={(event) => setNewListColor(event.target.value)}
                disabled={!isAuthenticated || isBootstrapping}
              />
            </label>
            <button
              type="submit"
              className="btn-secondary"
              disabled={!isAuthenticated || isCreatingList || isBootstrapping}
            >
              {isCreatingList ? "Adding..." : "Add list"}
            </button>
          </form>

          <div className="row-inline">
            <label className="mono-note" htmlFor="selected-list-id">
              Active list
            </label>
            <select
              id="selected-list-id"
              className="list-row"
              value={selectedListId}
              onChange={(event) => setSelectedListId(event.target.value)}
              disabled={lists.length === 0}
            >
              {lists.length === 0 ? <option value="">No lists</option> : null}
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          <ul className="list">
            {lists.length === 0 ? (
              <li className="list-row">
                <p>Create your first list to start planning.</p>
              </li>
            ) : (
              lists.map((list) => (
                <li className="list-row" key={list.id}>
                  <div className="row-inline">
                    <span className="dot" style={{ backgroundColor: list.color }} />
                    <strong>{list.name}</strong>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </Panel>

      <Panel title="Tasks">
        <div className="panel-content">
          <form className="form-grid" onSubmit={handleCreateTask}>
            <label className="field">
              <span>Task title</span>
              <input
                className="list-row"
                type="text"
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="Example: Plan Thursday top 3"
                disabled={!isAuthenticated || isBootstrapping}
              />
            </label>

            <label className="field">
              <span>Priority</span>
              <select
                className="list-row"
                value={newTaskPriority}
                onChange={(event) => setNewTaskPriority(event.target.value as TaskItem["priority"])}
                disabled={!isAuthenticated || isBootstrapping}
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
                disabled={!isAuthenticated || isBootstrapping}
              />
            </label>

            <button
              type="submit"
              className="btn-primary"
              disabled={!isAuthenticated || isCreatingTask || !selectedListId || isBootstrapping}
            >
              {isCreatingTask ? "Adding..." : "Add task"}
            </button>
          </form>

          <ul className="list">
            {selectedListTasks.length === 0 ? (
              <li className="list-row">
                <p>No tasks in this list yet.</p>
              </li>
            ) : (
              selectedListTasks.map((task) => (
                <li className="list-row" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>
                      {task.priority} priority
                      {task.due_date ? ` • due ${task.due_date.slice(0, 10)}` : ""}
                    </p>
                  </div>
                  <div className="row-inline">
                    <span className={`pill ${task.status === "done" ? "state-success" : ""}`}>
                      {task.status}
                    </span>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() =>
                        updateTaskStatus(task.id, task.status === "done" ? "todo" : "done")
                      }
                      disabled={!isAuthenticated || isBootstrapping}
                    >
                      {task.status === "done" ? "Reopen" : "Mark done"}
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
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
