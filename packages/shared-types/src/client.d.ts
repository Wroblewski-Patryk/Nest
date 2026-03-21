import type {
  ApiCollectionMeta,
  AutomationRuleItem,
  AutomationRunItem,
  BillingEventItem,
  BillingSubscriptionItem,
  InsightsTrendResponse,
  LifeAreaBalanceResponse,
  SupportedLanguage,
} from "./index";

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
  getAutomationRules(query?: Record<string, unknown>): Promise<ApiCollectionResponse<AutomationRuleItem>>;
  createAutomationRule(payload: {
    name: string;
    status?: "active" | "paused";
    trigger: Record<string, unknown>;
    conditions: Array<Record<string, unknown>>;
    actions: Array<Record<string, unknown>>;
  }): Promise<{ data: AutomationRuleItem }>;
  updateAutomationRule(
    ruleId: string,
    payload: {
      name?: string;
      status?: "active" | "paused";
      trigger?: Record<string, unknown>;
      conditions?: Array<Record<string, unknown>>;
      actions?: Array<Record<string, unknown>>;
    }
  ): Promise<{ data: AutomationRuleItem }>;
  deleteAutomationRule(ruleId: string): Promise<void>;
  executeAutomationRule(
    ruleId: string,
    payload?: { trigger_payload?: Record<string, unknown> }
  ): Promise<{ data: Record<string, unknown> }>;
  getAutomationRuns(query?: Record<string, unknown>): Promise<ApiCollectionResponse<AutomationRunItem>>;
  getAutomationRun(runId: string): Promise<{ data: AutomationRunItem }>;
  replayAutomationRun(runId: string): Promise<{ data: AutomationRunItem }>;
  getBillingSubscription(): Promise<{ data: BillingSubscriptionItem | null }>;
  getBillingEvents(query?: Record<string, unknown>): Promise<ApiCollectionResponse<BillingEventItem>>;
  startBillingTrial(planCode: string): Promise<{ data: BillingSubscriptionItem }>;
  activateBillingSubscription(): Promise<{ data: BillingSubscriptionItem }>;
  markBillingSubscriptionPastDue(): Promise<{ data: BillingSubscriptionItem }>;
  cancelBillingSubscription(): Promise<{ data: BillingSubscriptionItem }>;
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

export function resolveLanguage(value: unknown): SupportedLanguage;
export function resolveLocale(language?: SupportedLanguage | string | null, override?: string | null): string;
export function translate(key: string, language?: SupportedLanguage | string | null, fallback?: string): string;
export function formatLocalizedDateTime(
  value: string | number | Date,
  language?: SupportedLanguage | string | null,
  localeOverride?: string | null
): string;
