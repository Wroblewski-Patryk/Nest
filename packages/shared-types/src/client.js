const DEFAULT_TIMEOUT_MS = 10000;

export {
  formatLocalizedDateTime,
  resolveLanguage,
  resolveLocale,
  translate,
} from "./localization.js";

export const uiTokens = Object.freeze({
  palette: {
    surface: "#FDFCF8",
    surfaceLow: "#F4F4F0",
    surfaceHigh: "#EFEEEA",
    ink: "#4B3F34",
    muted: "#8C7A67",
    accent: "#789262",
    accentSoft: "#DFE5DA",
    outlineGhost: "rgba(196, 200, 187, 0.35)",
    error: "#BA1A1A",
  },
  typography: {
    family: "Inter",
    titleWeight: 500,
    bodyWeight: 400,
    labelWeight: 600,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
  motion: {
    auraTransitionMs: 900,
    reduceMotionQuery: "(prefers-reduced-motion: reduce)",
  },
  aura: {
    default: ["rgba(120,146,98,0.12)", "rgba(191,166,138,0.1)", "rgba(223,229,218,0.14)"],
    tasks: ["rgba(120,146,98,0.18)", "rgba(223,229,218,0.12)", "rgba(191,166,138,0.08)"],
    journal: ["rgba(191,166,138,0.16)", "rgba(223,229,218,0.1)", "rgba(120,146,98,0.08)"],
    calendar: ["rgba(120,146,98,0.14)", "rgba(191,166,138,0.08)", "rgba(223,229,218,0.12)"],
    insights: ["rgba(120,146,98,0.16)", "rgba(223,229,218,0.14)", "rgba(191,166,138,0.06)"],
  },
});

const moduleAuraVariants = Object.freeze({
  tasks: "tasks",
  lists: "tasks",
  habits: "tasks",
  routines: "tasks",
  goals: "calendar",
  targets: "calendar",
  journal: "journal",
  life_areas: "journal",
  calendar: "calendar",
  insights: "insights",
  automations: "default",
  billing: "default",
});

/**
 * @param {string | null | undefined} moduleKey
 * @returns {"default" | "tasks" | "journal" | "calendar" | "insights"}
 */
export function resolveAuraVariant(moduleKey) {
  if (!moduleKey) {
    return "default";
  }

  return moduleAuraVariants[moduleKey] ?? "default";
}

/**
 * @param {"default" | "tasks" | "journal" | "calendar" | "insights" | string | null | undefined} variant
 * @returns {[string, string, string]}
 */
export function resolveAuraPalette(variant) {
  const safeVariant = variant && uiTokens.aura[variant] ? variant : "default";
  const palette = uiTokens.aura[safeVariant];
  return [palette[0], palette[1], palette[2]];
}

/**
 * @param {object} options
 * @param {string} options.baseUrl
 * @param {string=} options.token
 * @param {(() => string | undefined | null)=} options.getToken
 * @param {number=} options.timeoutMs
 */
export function createNestApiClient(options) {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  /**
   * @param {string} path
   * @param {RequestInit & { query?: Record<string, string | number | boolean | undefined | null> }} init
   */
  async function request(path, init = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const query = init.query ?? {};
      const search = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          return;
        }
        search.set(key, String(value));
      });

      const token = options.token ?? options.getToken?.();
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      };

      const url = `${options.baseUrl}${path}${search.toString() ? `?${search.toString()}` : ""}`;

      const response = await fetch(url, {
        method: init.method ?? "GET",
        headers,
        body: init.body ? JSON.stringify(init.body) : undefined,
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        const error = new Error(`Nest API request failed with status ${response.status}.`);
        // @ts-ignore runtime extension
        error.status = response.status;
        // @ts-ignore runtime extension
        error.payload = payload;
        throw error;
      }

      return payload;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    request,
    getLocalizationOptions: () => request("/auth/localization/options"),
    completeOnboarding: (payload) =>
      request("/auth/onboarding", {
        method: "POST",
        body: payload,
      }),
    getAiContextGraph: (query = {}) => request("/ai/context-graph", { query }),
    askAiCopilot: (payload) =>
      request("/ai/copilot/conversation", {
        method: "POST",
        body: payload,
      }),
    getAiActionProposals: (query = {}) => request("/ai/actions/proposals", { query }),
    proposeAiAction: (payload) =>
      request("/ai/actions/proposals", {
        method: "POST",
        body: payload,
      }),
    approveAiActionProposal: (proposalId) =>
      request(`/ai/actions/proposals/${proposalId}/approve`, {
        method: "POST",
      }),
    rejectAiActionProposal: (proposalId, payload = {}) =>
      request(`/ai/actions/proposals/${proposalId}/reject`, {
        method: "POST",
        body: payload,
      }),
    getAiBriefingPreferences: () => request("/ai/briefings/preferences"),
    updateAiBriefingPreferences: (payload) =>
      request("/ai/briefings/preferences", {
        method: "PATCH",
        body: payload,
      }),
    getAiBriefings: (query = {}) => request("/ai/briefings", { query }),
    getAiBriefing: (briefingId) => request(`/ai/briefings/${briefingId}`),
    generateAiBriefing: (payload) =>
      request("/ai/briefings/generate", {
        method: "POST",
        body: payload,
      }),
    getCollaborationSpaces: () => request("/collaboration/spaces"),
    createCollaborationSpace: (payload) =>
      request("/collaboration/spaces", {
        method: "POST",
        body: payload,
      }),
    getCollaborationSpaceMembers: (spaceId) => request(`/collaboration/spaces/${spaceId}/members`),
    inviteCollaborationMember: (spaceId, payload) =>
      request(`/collaboration/spaces/${spaceId}/invites`, {
        method: "POST",
        body: payload,
      }),
    acceptCollaborationInvite: (token) =>
      request(`/collaboration/invites/${token}/accept`, {
        method: "POST",
      }),
    updateCollaborationMemberRole: (spaceId, memberUserId, payload) =>
      request(`/collaboration/spaces/${spaceId}/members/${memberUserId}`, {
        method: "PATCH",
        body: payload,
      }),
    removeCollaborationMember: (spaceId, memberUserId) =>
      request(`/collaboration/spaces/${spaceId}/members/${memberUserId}`, {
        method: "DELETE",
      }),
    shareListToCollaborationSpace: (spaceId, listId) =>
      request(`/collaboration/spaces/${spaceId}/share/lists/${listId}`, {
        method: "POST",
      }),
    shareGoalToCollaborationSpace: (spaceId, goalId) =>
      request(`/collaboration/spaces/${spaceId}/share/goals/${goalId}`, {
        method: "POST",
      }),
    getLists: (query = {}) => request("/lists", { query }),
    getTasks: (query = {}) => request("/tasks", { query }),
    getTaskAssignmentTimeline: (taskId) => request(`/tasks/${taskId}/assignment-timeline`),
    getHabits: (query = {}) => request("/habits", { query }),
    getGoals: (query = {}) => request("/goals", { query }),
    getJournalEntries: (query = {}) => request("/journal-entries", { query }),
    getCalendarEvents: (query = {}) => request("/calendar-events", { query }),
    getCalendarEventAssignmentTimeline: (eventId) => request(`/calendar-events/${eventId}/assignment-timeline`),
    getLifeAreaBalance: (query = {}) => request("/insights/life-area-balance", { query }),
    getInsightsTrends: (module, query = {}) => request(`/insights/trends/${module}`, { query }),
    getAutomationRules: (query = {}) => request("/automations/rules", { query }),
    createAutomationRule: (payload) =>
      request("/automations/rules", {
        method: "POST",
        body: payload,
      }),
    updateAutomationRule: (ruleId, payload) =>
      request(`/automations/rules/${ruleId}`, {
        method: "PATCH",
        body: payload,
      }),
    deleteAutomationRule: (ruleId) =>
      request(`/automations/rules/${ruleId}`, {
        method: "DELETE",
      }),
    executeAutomationRule: (ruleId, payload = undefined) =>
      request(`/automations/rules/${ruleId}/execute`, {
        method: "POST",
        ...(payload ? { body: payload } : {}),
      }),
    getAutomationRuns: (query = {}) => request("/automations/runs", { query }),
    getAutomationRun: (runId) => request(`/automations/runs/${runId}`),
    replayAutomationRun: (runId) =>
      request(`/automations/runs/${runId}/replay`, {
        method: "POST",
      }),
    getBillingSubscription: () => request("/billing/subscription"),
    getBillingEvents: (query = {}) => request("/billing/events", { query }),
    startBillingTrial: (planCode) =>
      request("/billing/subscription/start-trial", {
        method: "POST",
        body: { plan_code: planCode },
      }),
    activateBillingSubscription: () =>
      request("/billing/subscription/activate", {
        method: "POST",
      }),
    markBillingSubscriptionPastDue: () =>
      request("/billing/subscription/past-due", {
        method: "POST",
      }),
    cancelBillingSubscription: () =>
      request("/billing/subscription/cancel", {
        method: "POST",
      }),
    syncListTasks: (provider) =>
      request("/integrations/list-task-sync", {
        method: "POST",
        body: { provider },
      }),
    syncCalendar: (provider) =>
      request("/integrations/calendar-sync", {
        method: "POST",
        body: { provider },
      }),
    syncJournal: (provider) =>
      request("/integrations/journal-sync", {
        method: "POST",
        body: { provider },
      }),
    getIntegrationHealth: (query = {}) =>
      request("/integrations/health", { query }),
    remediateIntegrationHealth: (provider, action) =>
      request(`/integrations/health/${provider}/remediate`, {
        method: "POST",
        body: { action },
      }),
    ingestIntegrationEvent: (provider, payload) =>
      request(`/integrations/events/${provider}/ingest`, {
        method: "POST",
        body: payload,
      }),
    getIntegrationEventIngestions: (query = {}) =>
      request("/integrations/events/ingestions", { query }),
    getIntegrationMarketplaceProviders: () =>
      request("/integrations/marketplace/providers"),
    installIntegrationMarketplaceProvider: (provider, payload = {}) =>
      request(`/integrations/marketplace/providers/${provider}/install`, {
        method: "POST",
        body: payload,
      }),
    uninstallIntegrationMarketplaceProvider: (provider, payload = {}) =>
      request(`/integrations/marketplace/providers/${provider}/uninstall`, {
        method: "POST",
        body: payload,
      }),
    getIntegrationMarketplaceAudits: (query = {}) =>
      request("/integrations/marketplace/audits", { query }),
    getInAppNotifications: (query = {}) => request("/notifications/in-app", { query }),
    markInAppNotificationRead: (notificationId) =>
      request(`/notifications/in-app/${notificationId}/read`, {
        method: "POST",
      }),
    markInAppNotificationUnread: (notificationId) =>
      request(`/notifications/in-app/${notificationId}/unread`, {
        method: "POST",
      }),
    snoozeInAppNotification: (notificationId, payload) =>
      request(`/notifications/in-app/${notificationId}/snooze`, {
        method: "POST",
        body: payload,
      }),
    getNotificationPreferences: () => request("/notifications/preferences"),
    updateNotificationPreferences: (payload) =>
      request("/notifications/preferences", {
        method: "PATCH",
        body: payload,
      }),
    getNotificationChannelDeliveries: (query = {}) =>
      request("/notifications/deliveries", { query }),
    getIntegrationConnections: () => request("/integrations/connections"),
    upsertIntegrationConnection: (provider, payload) =>
      request(`/integrations/connections/${provider}`, {
        method: "PUT",
        body: payload,
      }),
    revokeIntegrationConnection: (provider) =>
      request(`/integrations/connections/${provider}`, {
        method: "DELETE",
      }),
    getIntegrationConflicts: (query = {}) => request("/integrations/conflicts", { query }),
    resolveIntegrationConflict: (conflictId, action, resolutionPayload = undefined) =>
      request(`/integrations/conflicts/${conflictId}/resolve`, {
        method: "POST",
        body: {
          action,
          ...(resolutionPayload ? { resolution_payload: resolutionPayload } : {}),
        },
      }),
  };
}
