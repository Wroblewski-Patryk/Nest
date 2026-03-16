export type ModuleKey =
  | "tasks"
  | "lists"
  | "habits"
  | "routines"
  | "goals"
  | "targets"
  | "journal"
  | "life_areas"
  | "calendar"
  | "insights";

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

export type UiAsyncState = "loading" | "empty" | "error" | "success";

export type TelemetryEventName =
  | "screen.tasks.view"
  | "screen.habits.view"
  | "screen.goals.view"
  | "screen.journal.view"
  | "screen.calendar.view"
  | "screen.insights.view";

export interface ClientTelemetryEvent {
  name: TelemetryEventName;
  module: ModuleKey;
  state: UiAsyncState;
  platform: "web" | "mobile";
}

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

export type IntegrationConflictItem = {
  id: string;
  provider: string;
  internal_entity_type: string;
  internal_entity_id: string;
  external_id: string | null;
  status: "open" | "resolved";
  conflict_fields: string[];
  detected_at: string;
  last_seen_at: string;
};

export type IntegrationConnectionItem = {
  provider: string;
  status: "not_connected" | "connected" | "revoked";
  is_connected: boolean;
  scopes: string[];
  expires_at: string | null;
  revoked_at: string | null;
  connected_at: string | null;
  updated_at: string | null;
};

export type LifeAreaBalanceItem = {
  life_area_id: string;
  name: string;
  weight: number;
  target_share: number;
  actual_share: number;
  journal_entries: number;
  completed_tasks: number;
  habit_logs: number;
  activity_count: number;
  alignment_score: number;
  journal_score: number;
  task_score: number;
  balance_score: number;
};

export type LifeAreaBalanceResponse = {
  data: LifeAreaBalanceItem[];
  meta: {
    window_days: number;
    window_start: string;
    window_end: string;
    global_balance_score: number;
  };
};

export type InsightsTrendBucket = {
  bucket_start: string;
  bucket_end: string;
  value: number;
};

export type InsightsTrendResponse = {
  data: InsightsTrendBucket[];
  meta: {
    module: "tasks" | "habits" | "goals";
    period: "weekly" | "monthly";
    points: number;
    window_start: string;
    window_end: string;
    total: number;
  };
};

export type NestApiClient = {
  request(path: string, init?: RequestInit & { query?: Record<string, unknown> }): Promise<unknown>;
  getLists(query?: Record<string, unknown>): Promise<ApiCollectionResponse<ListItem>>;
  getTasks(query?: Record<string, unknown>): Promise<ApiCollectionResponse<TaskItem>>;
  getHabits(query?: Record<string, unknown>): Promise<ApiCollectionResponse<HabitItem>>;
  getGoals(query?: Record<string, unknown>): Promise<ApiCollectionResponse<GoalItem>>;
  getJournalEntries(query?: Record<string, unknown>): Promise<ApiCollectionResponse<JournalEntryItem>>;
  getCalendarEvents(query?: Record<string, unknown>): Promise<ApiCollectionResponse<CalendarEventItem>>;
  getLifeAreaBalance(query?: {
    window_days?: number;
  }): Promise<LifeAreaBalanceResponse>;
  getInsightsTrends(
    module: "tasks" | "habits" | "goals",
    query?: { period?: "weekly" | "monthly"; points?: number }
  ): Promise<InsightsTrendResponse>;
  syncListTasks(provider: "trello" | "google_tasks" | "todoist"): Promise<{ data: Record<string, unknown> }>;
  getIntegrationConflicts(query?: Record<string, unknown>): Promise<ApiCollectionResponse<IntegrationConflictItem>>;
  getIntegrationConnections(): Promise<{ data: IntegrationConnectionItem[] }>;
  upsertIntegrationConnection(
    provider: "trello" | "google_tasks" | "todoist" | "google_calendar" | "obsidian",
    payload: {
      access_token: string;
      refresh_token?: string | null;
      scopes?: string[];
      expires_at?: string | null;
    }
  ): Promise<{ data: IntegrationConnectionItem }>;
  revokeIntegrationConnection(
    provider: "trello" | "google_tasks" | "todoist" | "google_calendar" | "obsidian"
  ): Promise<{ data: IntegrationConnectionItem }>;
  resolveIntegrationConflict(
    conflictId: string,
    action: "accept" | "override",
    resolutionPayload?: Record<string, unknown>
  ): Promise<{ data: Record<string, unknown> }>;
};

export function createNestApiClient(options: {
  baseUrl: string;
  token?: string;
  getToken?: () => string | undefined | null;
  timeoutMs?: number;
}): NestApiClient;
