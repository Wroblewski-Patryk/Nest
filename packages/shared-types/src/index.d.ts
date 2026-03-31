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

export type IntegrationHealthStatus = "healthy" | "degraded" | "disconnected";

export type IntegrationHealthOneClickAction = {
  action: "replay_latest_failure";
  label: string;
  enabled: boolean;
};

export type IntegrationHealthGuidedFlow = {
  action: string;
  label: string;
  steps: string[];
};

export type IntegrationHealthProviderItem = {
  provider: string;
  display_name: string;
  category: string;
  connection: {
    status: "not_connected" | "connected" | "revoked";
    is_connected: boolean;
    scopes: string[];
    expires_at: string | null;
    updated_at: string | null;
  };
  health: {
    status: IntegrationHealthStatus;
    risk_level: "low" | "medium" | "high";
    summary: string;
    window_hours: number;
  };
  sync_window: {
    success_count: number;
    failed_count: number;
    success_rate_percent: number;
    last_success_at: string | null;
    last_failure_at: string | null;
  };
  failures: {
    open_count: number;
    latest: {
      id: string;
      error_message: string;
      failed_at: string | null;
      attempts: number;
      replay_count: number;
      last_replay_status: string | null;
    } | null;
  };
  events: {
    supports_webhook: boolean;
    received_count: number;
    dropped_count: number;
    drop_rate_percent: number;
    average_lag_ms: number;
    last_received_at: string | null;
  };
  remediation: {
    one_click_actions: IntegrationHealthOneClickAction[];
    guided_flows: IntegrationHealthGuidedFlow[];
    runbook_ref: string;
  };
};

export type IntegrationHealthRemediationResult = {
  provider: string;
  action: "replay_latest_failure" | "reconnect_provider";
  status: "completed" | "failed" | "noop" | "guided";
  message: string;
  result: Record<string, unknown> | null;
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

export type AnalyticsExperimentHookItem = {
  id: string;
  event_name: "experiments.onboarding.exposed" | "experiments.onboarding.converted" | "experiments.pricing.exposed" | "experiments.pricing.converted";
  context: "onboarding" | "pricing";
  action: "exposed" | "converted";
  experiment_key: string;
  variant_key: string;
  platform: "web" | "mobile" | "api" | "system";
  occurred_at: string;
};

export type AnalyticsExperimentVariantSummary = {
  variant_key: string;
  exposed: number;
  converted: number;
  conversion_rate_percent: number;
};

export type AnalyticsExperimentSummary = {
  context: "onboarding" | "pricing" | string;
  experiment_key: string;
  variants: AnalyticsExperimentVariantSummary[];
  winner_variant_key: string | null;
};

export type AnalyticsLoopDecisionDashboardResponse = {
  data: {
    generated_at: string;
    window_days: number;
    window_start: string;
    window_end: string;
    funnel: {
      signups: number;
      onboarding_completed: number;
      trial_started: number;
      activated: number;
      onboarding_completion_rate_percent: number;
      trial_conversion_rate_percent: number;
      activation_rate_percent: number;
    };
    retention: {
      current_active_users: number;
      previous_active_users: number;
      retained_users: number;
      churned_users: number;
      retention_rate_percent: number;
    };
    monetization: {
      active_subscriptions: number;
      past_due_subscriptions: number;
      canceled_subscriptions: number;
      estimated_mrr_minor: number;
      past_due_events: number;
      recovered_events: number;
      recovery_rate_percent: number;
    };
    experiments: AnalyticsExperimentSummary[];
    weekly_actions: string[];
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

export type BillingSelfServeSessionItem = {
  id: string;
  session_type: "checkout" | "portal";
  provider: string;
  provider_session_id: string;
  plan_code: string | null;
  url: string;
  status: string;
  expires_at: string | null;
  billing_event_id: string;
};

export type BillingDunningAttemptItem = {
  id: string;
  subscription_id: string;
  attempt_number: number;
  status: "notice_sent" | "recovered" | string;
  channel: string;
  failure_reason: string | null;
  scheduled_at: string | null;
  processed_at: string | null;
  recovered_at: string | null;
  billing_event_id: string | null;
};

export type BillingAuditReconciliationItem = {
  subscription: {
    id: string;
    status: string;
    provider: string;
    provider_subscription_id: string | null;
    plan_code: string | null;
  } | null;
  events: {
    total: number;
    latest_event: string | null;
    latest_event_at: string | null;
    status_event_expected: string | null;
    status_event_present: boolean;
  };
  dunning: {
    attempts_total: number;
    attempts_without_event_link: number;
  };
  is_reconciled: boolean;
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
  getAnalyticsDecisionDashboard(query?: { window_days?: number }): Promise<AnalyticsLoopDecisionDashboardResponse>;
  trackAnalyticsExperimentHook(payload: {
    context: "onboarding" | "pricing";
    action: "exposed" | "converted";
    experiment_key: string;
    variant_key: string;
    platform?: "web" | "mobile" | "api" | "system";
    session_id?: string | null;
    trace_id?: string | null;
    occurred_at?: string | null;
    properties?: Record<string, unknown>;
  }): Promise<{ data: AnalyticsExperimentHookItem }>;
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
  createBillingCheckoutSession(payload: {
    plan_code: string;
    success_url?: string | null;
    cancel_url?: string | null;
  }): Promise<{ data: BillingSelfServeSessionItem }>;
  createBillingPortalSession(payload?: {
    return_url?: string | null;
  }): Promise<{ data: BillingSelfServeSessionItem }>;
  recoverBillingSubscription(): Promise<{ data: BillingSubscriptionItem }>;
  getBillingDunningAttempts(query?: { per_page?: number }): Promise<{
    data: BillingDunningAttemptItem[];
    meta: { total: number };
  }>;
  getBillingAuditReconciliation(): Promise<{ data: BillingAuditReconciliationItem }>;
  startBillingTrial(planCode: string): Promise<{ data: BillingSubscriptionItem }>;
  activateBillingSubscription(): Promise<{ data: BillingSubscriptionItem }>;
  markBillingSubscriptionPastDue(): Promise<{ data: BillingSubscriptionItem }>;
  cancelBillingSubscription(): Promise<{ data: BillingSubscriptionItem }>;
  syncListTasks(provider: "trello" | "google_tasks" | "todoist" | "clickup" | "microsoft_todo"): Promise<{ data: Record<string, unknown> }>;
  syncCalendar(provider: "google_calendar"): Promise<{ data: Record<string, unknown> }>;
  syncJournal(provider: "obsidian"): Promise<{ data: Record<string, unknown> }>;
  getIntegrationHealth(query?: {
    window_hours?: number;
  }): Promise<{
    data: IntegrationHealthProviderItem[];
    meta: {
      total: number;
      healthy: number;
      degraded: number;
      disconnected: number;
      window_hours: number;
    };
  }>;
  remediateIntegrationHealth(
    provider: "trello" | "google_tasks" | "todoist" | "clickup" | "microsoft_todo" | "google_calendar" | "obsidian",
    action: "replay_latest_failure" | "reconnect_provider"
  ): Promise<{ data: IntegrationHealthRemediationResult }>;
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
