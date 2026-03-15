export type ModuleKey =
  | "tasks"
  | "lists"
  | "habits"
  | "routines"
  | "goals"
  | "targets"
  | "journal"
  | "life_areas"
  | "calendar";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface TaskSummary {
  id: string;
  listId: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "canceled";
  priority: Priority;
  dueDate: string | null;
}

export interface ListSummary {
  id: string;
  name: string;
  color: string;
}

export interface GoalSummary {
  id: string;
  title: string;
  status: "active" | "paused" | "completed" | "archived";
}

export interface ApiCollectionMeta {
  page: number;
  perPage: number;
  total: number;
}
