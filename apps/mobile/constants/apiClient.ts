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
    syncListTasks: (provider) =>
      request('/integrations/list-task-sync', {
        method: 'POST',
        body: { provider },
      }) as ReturnType<NestApiClient['syncListTasks']>,
  };
}

export const nestApiClient = createClient(apiBaseUrl);
