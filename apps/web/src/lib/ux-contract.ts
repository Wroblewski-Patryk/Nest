import type { UiAsyncState } from "@nest/shared-types";

export const STATE_LABELS: Record<UiAsyncState, string> = {
  loading: "Loading",
  empty: "Empty",
  error: "Error",
  success: "Success",
};
