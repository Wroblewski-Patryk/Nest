export function getApiErrorStatus(error: unknown): number | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status?: unknown }).status === 'number'
  ) {
    return (error as { status: number }).status;
  }

  return null;
}

export function getApiPayloadMessage(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'payload' in error &&
    typeof (error as { payload?: unknown }).payload === 'object' &&
    typeof (error as { payload: { message?: unknown } }).payload?.message === 'string'
  ) {
    return (error as { payload: { message: string } }).payload.message;
  }

  return null;
}

export function describeApiIssue(error: unknown): string {
  const status = getApiErrorStatus(error);

  if (status === 401) {
    return 'Please sign in again and retry.';
  }

  if (status === 403) {
    return 'Your account does not currently have access to this action.';
  }

  if (status === 404) {
    return 'The requested data is no longer available.';
  }

  if (status === 422) {
    return 'Some details need attention before this can be saved.';
  }

  if (status === 429) {
    return 'Too many requests were sent at once. Please retry in a moment.';
  }

  if (status !== null && status >= 500) {
    return 'Nest is having trouble completing this request right now. Please try again shortly.';
  }

  return 'Please try again in a moment.';
}

export function getUserSafeErrorMessage(error: unknown): string {
  return getApiPayloadMessage(error) ?? 'Something went wrong. Please try again.';
}
