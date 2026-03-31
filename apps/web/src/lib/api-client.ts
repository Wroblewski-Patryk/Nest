import { createNestApiClient } from "@nest/shared-types";
import { getAuthToken } from "@/lib/auth-session";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_NEST_API_URL ?? "http://127.0.0.1:9000/api/v1";

export const nestApiClient = createNestApiClient({
  baseUrl: apiBaseUrl,
  getToken: () => getAuthToken(),
});
