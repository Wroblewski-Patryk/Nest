import {
  describeApiIssue as sharedDescribeApiIssue,
  getApiErrorStatus as sharedGetApiErrorStatus,
  getApiPayloadMessage as sharedGetApiPayloadMessage,
  getUserSafeErrorMessage as sharedGetUserSafeErrorMessage,
} from '@nest/shared-types';

export function getApiErrorStatus(error: unknown): number | null {
  return sharedGetApiErrorStatus(error);
}

export function getApiPayloadMessage(error: unknown): string | null {
  return sharedGetApiPayloadMessage(error);
}

export function describeApiIssue(error: unknown): string {
  return sharedDescribeApiIssue(error);
}

export function getUserSafeErrorMessage(error: unknown, fallbackAction?: string): string {
  return sharedGetUserSafeErrorMessage(error, fallbackAction);
}
