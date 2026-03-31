import type {
  ApiCollectionMeta,
  AutomationRuleItem,
  AutomationRunItem,
  BillingEventItem,
  BillingSubscriptionItem,
  CollaborationInviteItem,
  CollaborationMemberRole,
  CollaborationSpaceItem,
  CollaborationSpaceMemberItem,
  InsightsTrendResponse,
  LifeAreaBalanceResponse,
  LocalizationOptionsResponse,
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
  assignee_user_id?: string | null;
  reminder_owner_user_id?: string | null;
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
  assignee_user_id?: string | null;
  reminder_owner_user_id?: string | null;
};

export type AssignmentTimelineItem = {
  id: string;
  entity_type: "task" | "calendar_event";
  entity_id: string;
  action: "assigned" | "handoff" | "reminder_owner_changed";
  from_user_id: string | null;
  to_user_id: string | null;
  changed_by_user_id: string | null;
  note: string | null;
  occurred_at: string;
};

export type IntegrationConflictItem = {
  id: string;
  provider: string;
  internal_entity_type: string;
  internal_entity_id: string;
  external_id: string | null;
  status: "open" | "resolved";
  conflict_fields: string[];
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

export type InAppNotificationItem = {
  id: string;
  event_type: string;
  title: string;
  body: string;
  module: string | null;
  entity_type: string | null;
  entity_id: string | null;
  deep_link: string | null;
  payload: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  snoozed_until: string | null;
  created_at: string;
  updated_at: string;
};

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
  getTaskAssignmentTimeline(taskId: string): Promise<{ data: AssignmentTimelineItem[] }>;
  getHabits(query?: Record<string, unknown>): Promise<ApiCollectionResponse<HabitItem>>;
  getGoals(query?: Record<string, unknown>): Promise<ApiCollectionResponse<GoalItem>>;
  getJournalEntries(query?: Record<string, unknown>): Promise<ApiCollectionResponse<JournalEntryItem>>;
  getCalendarEvents(query?: Record<string, unknown>): Promise<ApiCollectionResponse<CalendarEventItem>>;
  getCalendarEventAssignmentTimeline(eventId: string): Promise<{ data: AssignmentTimelineItem[] }>;
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
  getInAppNotifications(query?: {
    per_page?: number;
    unread_only?: boolean;
    include_snoozed?: boolean;
    module?: string;
  }): Promise<{
    data: InAppNotificationItem[];
    meta: { total: number; unread: number };
    groups: Array<{ group: string; total: number; unread: number }>;
  }>;
  markInAppNotificationRead(notificationId: string): Promise<{ data: InAppNotificationItem }>;
  markInAppNotificationUnread(notificationId: string): Promise<{ data: InAppNotificationItem }>;
  snoozeInAppNotification(
    notificationId: string,
    payload: { snoozed_until: string }
  ): Promise<{ data: InAppNotificationItem }>;
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
