const DEFAULT_TIMEOUT_MS = 10000;

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
    getLists: (query = {}) => request("/lists", { query }),
    getTasks: (query = {}) => request("/tasks", { query }),
    getHabits: (query = {}) => request("/habits", { query }),
    getGoals: (query = {}) => request("/goals", { query }),
    getJournalEntries: (query = {}) => request("/journal-entries", { query }),
    getCalendarEvents: (query = {}) => request("/calendar-events", { query }),
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
    syncListTasks: (provider) =>
      request("/integrations/list-task-sync", {
        method: "POST",
        body: { provider },
      }),
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
