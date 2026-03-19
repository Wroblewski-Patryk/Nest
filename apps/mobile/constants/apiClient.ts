import { createNestApiClient } from '@nest/shared-types';

const apiBaseUrl = process.env.EXPO_PUBLIC_NEST_API_URL ?? 'http://127.0.0.1:9000/api/v1';

export const nestApiClient = createNestApiClient({ baseUrl: apiBaseUrl });
