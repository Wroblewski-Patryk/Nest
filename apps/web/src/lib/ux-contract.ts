import {
  describeApiIssue as sharedDescribeApiIssue,
  getApiErrorCode as sharedGetApiErrorCode,
  getApiErrorRetryable as sharedGetApiErrorRetryable,
  getApiErrorStatus as sharedGetApiErrorStatus,
  getUserSafeErrorMessage as sharedGetUserSafeErrorMessage,
  type UiAsyncState,
} from "@nest/shared-types";

export const STATE_LABELS: Record<UiAsyncState, string> = {
  loading: "Loading",
  empty: "Empty",
  error: "Error",
  success: "Success",
};

export function getApiErrorStatus(error: unknown): number | null {
  return sharedGetApiErrorStatus(error);
}

export function getApiErrorCode(error: unknown): string | null {
  return sharedGetApiErrorCode(error);
}

export function getApiErrorRetryable(error: unknown): boolean | null {
  return sharedGetApiErrorRetryable(error);
}

export function describeApiIssue(error: unknown): string {
  return sharedDescribeApiIssue(error);
}

export function getUserSafeErrorMessage(error: unknown, fallbackAction?: string): string {
  return sharedGetUserSafeErrorMessage(error, fallbackAction);
}
