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

export type IntegrationEventIngestionItem = {
  id: string;
  provider: "trello" | "todoist" | "google_calendar" | "clickup" | "microsoft_todo";
  event_id: string;
  event_type: string;
  internal_entity_type: string;
  internal_entity_id: string;
  status: "queued" | "processed" | "dropped";
  lag_ms: number | null;
  drop_reason: string | null;
  replay_count: number;
  event_occurred_at: string | null;
  received_at: string | null;
  queued_at: string | null;
  processed_at: string | null;
  queue_job_id: string | null;
};

export type IntegrationMarketplaceProviderItem = {
  provider: string;
  display_name: string;
  category: string;
  description: string;
  auth_type: string;
  default_scopes: string[];
  supports_webhook: boolean;
  sync_modes: string[];
  install_status: "not_installed" | "installed" | "uninstalled";
  is_installed: boolean;
  installed_at: string | null;
  uninstalled_at: string | null;
  connection: {
    status: "not_connected" | "connected" | "revoked";
    is_connected: boolean;
    scopes: string[];
    expires_at: string | null;
    updated_at: string | null;
  };
};

export type IntegrationMarketplaceAuditItem = {
  id: string;
  provider: string;
  action: "install" | "uninstall";
  status: string;
  reason: string | null;
  audit_payload: Record<string, unknown>;
  occurred_at: string | null;
  created_at: string | null;
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

export type NotificationChannel = "push" | "email" | "in_app";
export type NotificationDeliveryStatus = "sent" | "suppressed" | "failed";

export type NotificationChannelMap = {
  push: boolean;
  email: boolean;
  in_app: boolean;
};

export type NotificationPreferencesItem = {
  channels: NotificationChannelMap;
  event_channels: Record<string, NotificationChannelMap>;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  locale: string;
  supported_event_types: string[];
};

export type NotificationChannelDeliveryItem = {
  id: string;
  channel: NotificationChannel;
  event_type: string;
  status: NotificationDeliveryStatus;
  failure_reason: string | null;
  title: string;
  payload: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AiContextGraphTaskEntity = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  starts_at: string | null;
  assignee_user_id: string | null;
  reminder_owner_user_id: string | null;
  has_description: boolean;
};

export type AiContextGraphCalendarEventEntity = {
  id: string;
  title: string;
  start_at: string | null;
  end_at: string | null;
  timezone: string;
  all_day: boolean;
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  assignee_user_id: string | null;
  reminder_owner_user_id: string | null;
  has_description: boolean;
};

export type AiContextGraphHabitEntity = {
  id: string;
  title: string;
  type: string;
  is_active: boolean;
  cadence_type: string;
  window_log_count: number;
  last_logged_at: string | null;
  has_description: boolean;
};

export type AiContextGraphGoalEntity = {
  id: string;
  title: string;
  status: string;
  target_date: string | null;
  has_description: boolean;
};

export type AiContextGraphJournalEntryEntity = {
  id: string;
  title: string;
  mood: string | null;
  entry_date: string | null;
  life_area_ids: string[];
  has_body: boolean;
};

export type AiContextGraphResponse = {
  data: {
    schema_version: string;
    snapshot: {
      as_of: string;
      window_days: number;
      window_start: string;
      window_end: string;
      fingerprint: string;
    };
    privacy: {
      redaction_policy_version: string;
      mode: "strict";
      redacted_fields: Record<string, string[]>;
    };
    signals: {
      tasks: Record<string, unknown>;
      calendar_events: Record<string, unknown>;
      habits: Record<string, unknown>;
      goals: Record<string, unknown>;
      journal_entries: Record<string, unknown>;
    };
    entities: {
      tasks: AiContextGraphTaskEntity[];
      calendar_events: AiContextGraphCalendarEventEntity[];
      habits: AiContextGraphHabitEntity[];
      goals: AiContextGraphGoalEntity[];
      journal_entries: AiContextGraphJournalEntryEntity[];
    };
  };
};

export type AiCopilotSourceReference = {
  module: string;
  entity_type: string;
  entity_id: string | null;
  title: string | null;
};

export type AiCopilotConversationResponse = {
  data: {
    conversation_id: string;
    intent: "planning" | "execution" | "reflection" | "general" | string;
    message: string;
    answer: string;
    provider: {
      mode: "primary" | "fallback";
      reason: string;
    };
    context_snapshot: {
      schema_version: string;
      as_of: string;
      fingerprint: string;
    };
    explainability: {
      strategy: string;
      reason_codes: string[];
      source_references: AiCopilotSourceReference[];
    };
    source_references: AiCopilotSourceReference[];
    generated_at: string;
  };
};

export type AiActionProposalStatus = "pending" | "approved" | "rejected" | "executed" | "failed";

export type AiActionProposalItem = {
  id: string;
  action_type: "create_task" | "update_task_status";
  proposal_payload: Record<string, unknown>;
  requires_approval: boolean;
  status: AiActionProposalStatus;
  note: string | null;
  rejection_reason: string | null;
  execution_result: Record<string, unknown> | null;
  failure_reason: string | null;
  approved_by_user_id: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  executed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AiBriefingPreferenceItem = {
  id: string;
  daily_enabled: boolean;
  weekly_enabled: boolean;
  scope_modules: string[];
  timezone: string;
  created_at: string | null;
  updated_at: string | null;
};

export type AiBriefingItem = {
  id: string;
  cadence: "daily" | "weekly";
  scope_modules: string[];
  summary: string;
  sections: Array<Record<string, unknown>>;
  context_fingerprint: string | null;
  generated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type NestApiClient = {
  request(path: string, init?: RequestInit & { query?: Record<string, unknown> }): Promise<unknown>;
  getLocalizationOptions(): Promise<{ data: LocalizationOptionsResponse }>;
  completeOnboarding(payload: {
    display_name: string;
    language: SupportedLanguage;
    locale?: string | null;
  }): Promise<{ data: Record<string, unknown> }>;
  getAiContextGraph(query?: { window_days?: number; entity_limit?: number; as_of?: string }): Promise<AiContextGraphResponse>;
  askAiCopilot(payload: {
    message: string;
    context?: {
      window_days?: number;
      entity_limit?: number;
      as_of?: string;
    };
  }): Promise<AiCopilotConversationResponse>;
  getAiActionProposals(query?: {
    status?: AiActionProposalStatus;
    per_page?: number;
  }): Promise<{ data: AiActionProposalItem[]; meta: { total: number; per_page: number } }>;
  proposeAiAction(payload: {
    action_type: "create_task" | "update_task_status";
    proposal_payload: Record<string, unknown>;
    note?: string;
  }): Promise<{ data: AiActionProposalItem }>;
  approveAiActionProposal(proposalId: string): Promise<{ data: AiActionProposalItem }>;
  rejectAiActionProposal(
    proposalId: string,
    payload?: { reason?: string }
  ): Promise<{ data: AiActionProposalItem }>;
  getAiBriefingPreferences(): Promise<{ data: AiBriefingPreferenceItem }>;
  updateAiBriefingPreferences(payload: {
    daily_enabled?: boolean;
    weekly_enabled?: boolean;
    scope_modules?: string[];
    timezone?: string;
  }): Promise<{ data: AiBriefingPreferenceItem }>;
  getAiBriefings(query?: {
    cadence?: "daily" | "weekly";
    per_page?: number;
  }): Promise<{ data: AiBriefingItem[]; meta: { total: number; per_page: number } }>;
  getAiBriefing(briefingId: string): Promise<{ data: AiBriefingItem }>;
  generateAiBriefing(payload: {
    cadence: "daily" | "weekly";
    scope_modules?: string[];
    window_days?: number;
    as_of?: string;
  }): Promise<{ data: AiBriefingItem }>;
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
  syncListTasks(provider: "trello" | "google_tasks" | "todoist" | "clickup" | "microsoft_todo"): Promise<{ data: Record<string, unknown> }>;
  syncCalendar(provider: "google_calendar"): Promise<{ data: Record<string, unknown> }>;
  syncJournal(provider: "obsidian"): Promise<{ data: Record<string, unknown> }>;
  ingestIntegrationEvent(
    provider: "trello" | "todoist" | "google_calendar" | "clickup" | "microsoft_todo",
    payload: {
      event_id: string;
      event_type: string;
      internal_entity_type: string;
      internal_entity_id: string;
      external_id?: string | null;
      event_occurred_at: string;
      entity_payload?: Record<string, unknown>;
    }
  ): Promise<{
    data: {
      status: "queued" | "duplicate";
      provider: string;
      event_id: string;
      ingestion_id: string;
      replay_protected: boolean;
      queued: boolean;
      lag_ms?: number;
      queue_job_id?: string | null;
    };
  }>;
  getIntegrationEventIngestions(query?: {
    provider?: "trello" | "todoist" | "google_calendar" | "clickup" | "microsoft_todo";
    status?: "queued" | "processed" | "dropped";
    per_page?: number;
  }): Promise<{
    data: IntegrationEventIngestionItem[];
    meta: { total: number };
  }>;
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
  getNotificationPreferences(): Promise<{ data: NotificationPreferencesItem }>;
  updateNotificationPreferences(payload: {
    channels?: Partial<NotificationChannelMap>;
    event_channels?: Record<string, Partial<NotificationChannelMap>>;
    quiet_hours?: {
      enabled?: boolean;
      start?: string;
      end?: string;
      timezone?: string;
    };
    locale?: string;
  }): Promise<{ data: NotificationPreferencesItem }>;
  getNotificationChannelDeliveries(query?: {
    per_page?: number;
    channel?: NotificationChannel;
    event_type?: string;
    status?: NotificationDeliveryStatus;
  }): Promise<{
    data: NotificationChannelDeliveryItem[];
    meta: { total: number; per_page: number };
  }>;
  getIntegrationMarketplaceProviders(): Promise<{
    data: IntegrationMarketplaceProviderItem[];
    meta: { total: number; installed: number };
  }>;
  installIntegrationMarketplaceProvider(
    provider: "trello" | "google_tasks" | "todoist" | "clickup" | "microsoft_todo" | "google_calendar" | "obsidian",
    payload?: { install_metadata?: Record<string, unknown> }
  ): Promise<{ data: IntegrationMarketplaceProviderItem }>;
  uninstallIntegrationMarketplaceProvider(
    provider: "trello" | "google_tasks" | "todoist" | "clickup" | "microsoft_todo" | "google_calendar" | "obsidian",
    payload?: { reason?: string | null }
  ): Promise<{ data: IntegrationMarketplaceProviderItem }>;
  getIntegrationMarketplaceAudits(query?: {
    per_page?: number;
  }): Promise<{
    data: IntegrationMarketplaceAuditItem[];
    meta: { total: number };
  }>;
  getIntegrationConnections(): Promise<{ data: IntegrationConnectionItem[] }>;
  upsertIntegrationConnection(
    provider: "trello" | "google_tasks" | "todoist" | "clickup" | "microsoft_todo" | "google_calendar" | "obsidian",
    payload: {
      access_token: string;
      refresh_token?: string | null;
      scopes?: string[];
      expires_at?: string | null;
    }
  ): Promise<{ data: IntegrationConnectionItem }>;
  revokeIntegrationConnection(
    provider: "trello" | "google_tasks" | "todoist" | "clickup" | "microsoft_todo" | "google_calendar" | "obsidian"
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
