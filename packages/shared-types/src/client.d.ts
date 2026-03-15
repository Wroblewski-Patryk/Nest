import type { ApiCollectionMeta } from "./index";

export type ApiCollectionResponse<TItem> = {
  data: TItem[];
  meta: ApiCollectionMeta;
};

export type ListItem = {
  id: string;
  name: string;
  color: string;
};

export type TaskItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
};

export type HabitItem = {
  id: string;
  title: string;
  is_active: boolean;
};

export type GoalItem = {
  id: string;
  title: string;
  status: string;
};

export type JournalEntryItem = {
  id: string;
  title: string;
  mood: string | null;
};

export type CalendarEventItem = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
};

export type NestApiClient = {
  request(path: string, init?: RequestInit & { query?: Record<string, unknown> }): Promise<unknown>;
  getLists(query?: Record<string, unknown>): Promise<ApiCollectionResponse<ListItem>>;
  getTasks(query?: Record<string, unknown>): Promise<ApiCollectionResponse<TaskItem>>;
  getHabits(query?: Record<string, unknown>): Promise<ApiCollectionResponse<HabitItem>>;
  getGoals(query?: Record<string, unknown>): Promise<ApiCollectionResponse<GoalItem>>;
  getJournalEntries(query?: Record<string, unknown>): Promise<ApiCollectionResponse<JournalEntryItem>>;
  getCalendarEvents(query?: Record<string, unknown>): Promise<ApiCollectionResponse<CalendarEventItem>>;
  syncListTasks(provider: "trello" | "google_tasks"): Promise<{ data: Record<string, unknown> }>;
};

export function createNestApiClient(options: {
  baseUrl: string;
  token?: string;
  getToken?: () => string | undefined | null;
  timeoutMs?: number;
}): NestApiClient;
