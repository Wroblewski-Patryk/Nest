import type { NestApiClient } from '@nest/shared-types';

const apiBaseUrl = process.env.EXPO_PUBLIC_NEST_API_URL ?? 'http://127.0.0.1:9000/api/v1';

function createClient(baseUrl: string): NestApiClient {
  type RequestOptions = Omit<RequestInit, 'body'> & {
    query?: Record<string, unknown>;
    body?: unknown;
  };

  const request = async (path: string, init: RequestOptions = {}) => {
    const query = init.query ?? {};
    const search = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      search.set(key, String(value));
    });

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    };

    const response = await fetch(
      `${baseUrl}${path}${search.toString() ? `?${search.toString()}` : ''}`,
      {
        method: init.method ?? 'GET',
        headers,
        body: init.body ? JSON.stringify(init.body) : undefined,
      }
    );

    const payload = response.headers.get('content-type')?.includes('application/json')
      ? await response.json()
      : null;

    if (!response.ok) {
      const error = new Error(`Nest API request failed with status ${response.status}.`);
      (error as Error & { status: number; payload: unknown }).status = response.status;
      (error as Error & { status: number; payload: unknown }).payload = payload;
      throw error;
    }

    return payload;
  };

  return {
    request: request as NestApiClient['request'],
    getLists: (query = {}) => request('/lists', { query }) as ReturnType<NestApiClient['getLists']>,
    getTasks: (query = {}) => request('/tasks', { query }) as ReturnType<NestApiClient['getTasks']>,
    getHabits: (query = {}) =>
      request('/habits', { query }) as ReturnType<NestApiClient['getHabits']>,
    getGoals: (query = {}) => request('/goals', { query }) as ReturnType<NestApiClient['getGoals']>,
    getJournalEntries: (query = {}) =>
      request('/journal-entries', { query }) as ReturnType<NestApiClient['getJournalEntries']>,
    getCalendarEvents: (query = {}) =>
      request('/calendar-events', { query }) as ReturnType<NestApiClient['getCalendarEvents']>,
    getLifeAreaBalance: (query = {}) =>
      request('/insights/life-area-balance', { query }) as ReturnType<NestApiClient['getLifeAreaBalance']>,
    getInsightsTrends: (module, query = {}) =>
      request(`/insights/trends/${module}`, { query }) as ReturnType<NestApiClient['getInsightsTrends']>,
    getAutomationRules: (query = {}) =>
      request('/automations/rules', { query }) as ReturnType<NestApiClient['getAutomationRules']>,
    createAutomationRule: (payload) =>
      request('/automations/rules', {
        method: 'POST',
        body: payload,
      }) as ReturnType<NestApiClient['createAutomationRule']>,
    updateAutomationRule: (ruleId, payload) =>
      request(`/automations/rules/${ruleId}`, {
        method: 'PATCH',
        body: payload,
      }) as ReturnType<NestApiClient['updateAutomationRule']>,
    deleteAutomationRule: (ruleId) =>
      request(`/automations/rules/${ruleId}`, {
        method: 'DELETE',
      }) as ReturnType<NestApiClient['deleteAutomationRule']>,
    executeAutomationRule: (ruleId, payload) =>
      request(`/automations/rules/${ruleId}/execute`, {
        method: 'POST',
        ...(payload ? { body: payload } : {}),
      }) as ReturnType<NestApiClient['executeAutomationRule']>,
    getAutomationRuns: (query = {}) =>
      request('/automations/runs', { query }) as ReturnType<NestApiClient['getAutomationRuns']>,
    getAutomationRun: (runId) =>
      request(`/automations/runs/${runId}`) as ReturnType<NestApiClient['getAutomationRun']>,
    replayAutomationRun: (runId) =>
      request(`/automations/runs/${runId}/replay`, {
        method: 'POST',
      }) as ReturnType<NestApiClient['replayAutomationRun']>,
    syncListTasks: (provider) =>
      request('/integrations/list-task-sync', {
        method: 'POST',
        body: { provider },
      }) as ReturnType<NestApiClient['syncListTasks']>,
    getIntegrationConnections: () =>
      request('/integrations/connections') as ReturnType<NestApiClient['getIntegrationConnections']>,
    upsertIntegrationConnection: (provider, payload) =>
      request(`/integrations/connections/${provider}`, {
        method: 'PUT',
        body: payload,
      }) as ReturnType<NestApiClient['upsertIntegrationConnection']>,
    revokeIntegrationConnection: (provider) =>
      request(`/integrations/connections/${provider}`, {
        method: 'DELETE',
      }) as ReturnType<NestApiClient['revokeIntegrationConnection']>,
    getIntegrationConflicts: (query = {}) =>
      request('/integrations/conflicts', { query }) as ReturnType<NestApiClient['getIntegrationConflicts']>,
    resolveIntegrationConflict: (conflictId, action, resolutionPayload) =>
      request(`/integrations/conflicts/${conflictId}/resolve`, {
        method: 'POST',
        body: {
          action,
          ...(resolutionPayload ? { resolution_payload: resolutionPayload } : {}),
        },
      }) as ReturnType<NestApiClient['resolveIntegrationConflict']>,
  };
}

export const nestApiClient = createClient(apiBaseUrl);
