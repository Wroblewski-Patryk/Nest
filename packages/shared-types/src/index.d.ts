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
  | "insights"
  | "automations"
  | "billing";

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
  per_page: number;
  /**
   * @deprecated Use `per_page`. This alias remains optional for transitional compatibility.
   */
  perPage?: number;
  total: number;
}

export type UiAsyncState = "loading" | "empty" | "error" | "success";
export type SupportedLanguage = "en" | "pl";

export type TelemetryEventName =
  | "screen.tasks.view"
  | "screen.habits.view"
  | "screen.goals.view"
  | "screen.journal.view"
  | "screen.calendar.view"
  | "screen.insights.view"
  | "screen.automations.view"
  | "screen.billing.view";

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

export type CollaborationMemberRole = "owner" | "editor" | "viewer" | "member";

export type CollaborationSpaceMemberItem = {
  id: string;
  tenant_id: string;
  space_id: string;
  user_id: string;
  role: CollaborationMemberRole;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export type CollaborationSpaceItem = {
  id: string;
  tenant_id: string;
  owner_user_id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  members?: CollaborationSpaceMemberItem[];
};

export type CollaborationInviteItem = {
  id: string;
  tenant_id: string;
  space_id: string;
  invited_by_user_id: string;
  accepted_by_user_id: string | null;
  email: string;
  role: CollaborationMemberRole;
  status: "pending" | "accepted" | "expired" | "revoked";
  token: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
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
  merge_state?: "manual_required" | "auto_merged";
  merge_policy?: {
    manual_queue_fields: string[];
    auto_merge_fields: string[];
  };
  comparison?: Record<string, { base: string; local: string; remote: string }>;
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

export type AutomationRuleItem = {
  id: string;
  name: string;
  status: "active" | "paused";
  trigger: Record<string, unknown>;
  conditions: Array<Record<string, unknown>>;
  actions: Array<Record<string, unknown>>;
  created_at: string;
  updated_at: string;
};

export type AutomationRunItem = {
  id: string;
  rule_id: string;
  status: "success" | "failed" | "skipped" | "running";
  trigger_payload?: Record<string, unknown> | null;
  action_results?: Array<Record<string, unknown>> | null;
  started_at: string;
  finished_at: string | null;
  error_code: string | null;
  error_message?: string | null;
};

export type BillingEntitlementItem = {
  key: string;
  type: "boolean" | "limit";
  value: string;
  soft_limit?: number | null;
};

export type BillingSubscriptionItem = {
  id: string;
  tenant_id: string;
  plan_id: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "paused" | "expired";
  provider: string;
  provider_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  canceled_at: string | null;
  plan?: {
    id: string;
    plan_code: string;
    display_name: string;
    billing_interval: string;
    currency: string;
    price_minor: number;
    trial_days: number;
    entitlements?: BillingEntitlementItem[];
  };
};

export type BillingEventItem = {
  id: string;
  tenant_id: string;
  subscription_id: string | null;
  plan_code: string | null;
  event_name: string;
  event_version: string;
  provider: string;
  provider_event_id: string | null;
  occurred_at: string;
  payload: Record<string, unknown> | null;
};

export type LocalizationOptionsResponse = {
  detected_language: SupportedLanguage;
  supported_languages: Array<{
    code: SupportedLanguage;
    label: string;
  }>;
};

export type ApiErrorCode =
  | "validation_failed"
  | "auth_required"
  | "forbidden"
  | "resource_not_found"
  | "rate_limited"
  | "tenant_quota_exceeded"
  | "entitlement_denied"
  | "entitlement_limit_exceeded"
  | "internal_error";

export type ApiErrorEnvelope = {
  message: string;
  error: {
    code: ApiErrorCode | string;
    retryable: boolean;
    http_status: number;
    details: Record<string, unknown>;
  };
  errors?: Record<string, string[]>;
  meta: {
    contract_version: string;
  };
};

export type AuraVariant = "default" | "tasks" | "journal" | "calendar" | "insights";

export type UiTokenContract = {
  palette: {
    surface: string;
    surfaceLow: string;
    surfaceHigh: string;
    ink: string;
    muted: string;
    accent: string;
    accentSoft: string;
    outlineGhost: string;
    error: string;
  };
  typography: {
    family: string;
    titleWeight: number;
    bodyWeight: number;
    labelWeight: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  motion: {
    auraTransitionMs: number;
    reduceMotionQuery: string;
  };
  aura: Record<AuraVariant, [string, string, string]>;
};

export const uiTokens: UiTokenContract;
export function resolveAuraVariant(moduleKey?: ModuleKey | string | null): AuraVariant;
export function resolveAuraPalette(variant?: AuraVariant | string | null): [string, string, string];

export function resolveLanguage(value: unknown): SupportedLanguage;
export function resolveLocale(language?: SupportedLanguage | string | null, override?: string | null): string;
export function translate(key: string, language?: SupportedLanguage | string | null, fallback?: string): string;
export function formatLocalizedDateTime(
  value: string | number | Date,
  language?: SupportedLanguage | string | null,
  localeOverride?: string | null
): string;

export type NestApiClient = {
  request(path: string, init?: RequestInit & { query?: Record<string, unknown> }): Promise<unknown>;
  getLocalizationOptions(): Promise<{ data: LocalizationOptionsResponse }>;
  completeOnboarding(payload: {
    display_name: string;
    language: SupportedLanguage;
    locale?: string | null;
  }): Promise<{ data: Record<string, unknown> }>;
  getCollaborationSpaces(): Promise<{ data: CollaborationSpaceItem[] }>;
  createCollaborationSpace(payload: { name: string }): Promise<{ data: CollaborationSpaceItem }>;
  getCollaborationSpaceMembers(spaceId: string): Promise<{ data: CollaborationSpaceMemberItem[] }>;
  inviteCollaborationMember(
    spaceId: string,
    payload: { email: string; role?: Exclude<CollaborationMemberRole, "owner" | "member"> }
  ): Promise<{ data: CollaborationInviteItem }>;
  acceptCollaborationInvite(token: string): Promise<{ data: { space_id: string; status: "accepted" } }>;
  updateCollaborationMemberRole(
    spaceId: string,
    memberUserId: string,
    payload: { role: Exclude<CollaborationMemberRole, "owner" | "member"> }
  ): Promise<{ data: CollaborationSpaceMemberItem }>;
  removeCollaborationMember(spaceId: string, memberUserId: string): Promise<void>;
  shareListToCollaborationSpace(spaceId: string, listId: string): Promise<{ data: ListItem }>;
  shareGoalToCollaborationSpace(spaceId: string, goalId: string): Promise<{ data: GoalItem }>;
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
  syncCalendar(provider: "google_calendar"): Promise<{ data: Record<string, unknown> }>;
  syncJournal(provider: "obsidian"): Promise<{ data: Record<string, unknown> }>;
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
