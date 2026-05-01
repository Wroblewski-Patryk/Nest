import { createNestApiClient } from '@nest/shared-types';

const apiBaseUrl = process.env.EXPO_PUBLIC_NEST_API_URL ?? 'http://127.0.0.1:9000/api/v1';

export const nestApiClient = createNestApiClient({ baseUrl: apiBaseUrl });

export type ApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
};

export async function apiRequest<TResponse>(path: string, init?: ApiRequestInit): Promise<TResponse> {
  const requestFn = nestApiClient.request as unknown as (
    requestPath: string,
    requestInit?: ApiRequestInit
  ) => Promise<unknown>;

  return (await requestFn(path, init)) as TResponse;
}
