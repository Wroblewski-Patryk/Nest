type QueueStatus = 'pending' | 'synced' | 'failed';

export type MobileOfflineQueueSchedulerItem = {
  created_at: string;
  status: QueueStatus;
  retry_count?: number;
};

export type MobileOfflineSyncSchedulerState = {
  auto_sync_enabled: boolean;
  last_run_at?: string;
  last_success_at?: string;
  consecutive_failures: number;
  scheduler_lag_seconds: number;
  stuck_detected: boolean;
  stuck_reason?: string;
  last_error?: string;
};

const STORAGE_KEY = 'nest.offlineScheduler.v1';
const STUCK_LAG_THRESHOLD_SECONDS = 600;
const STUCK_RETRY_THRESHOLD = 5;
let memoryState: MobileOfflineSyncSchedulerState | null = null;

function getDefaultState(autoSyncEnabled = true): MobileOfflineSyncSchedulerState {
  return {
    auto_sync_enabled: autoSyncEnabled,
    consecutive_failures: 0,
    scheduler_lag_seconds: 0,
    stuck_detected: false,
  };
}

export function loadOfflineSyncSchedulerState(): MobileOfflineSyncSchedulerState {
  const storage = (globalThis as { localStorage?: Storage }).localStorage;
  if (!storage) {
    return memoryState ?? getDefaultState(true);
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return getDefaultState(true);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MobileOfflineSyncSchedulerState>;
    return {
      ...getDefaultState(true),
      ...parsed,
    };
  } catch {
    return getDefaultState(true);
  }
}

export function saveOfflineSyncSchedulerState(state: MobileOfflineSyncSchedulerState): void {
  memoryState = state;
  const storage = (globalThis as { localStorage?: Storage }).localStorage;
  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function evaluateOfflineSyncSchedulerHealth(
  queue: MobileOfflineQueueSchedulerItem[],
  nowMs: number = Date.now()
): Pick<MobileOfflineSyncSchedulerState, 'scheduler_lag_seconds' | 'stuck_detected' | 'stuck_reason'> {
  const active = queue.filter((item) => item.status !== 'synced');
  if (active.length === 0) {
    return {
      scheduler_lag_seconds: 0,
      stuck_detected: false,
      stuck_reason: undefined,
    };
  }

  const oldestMs = active.reduce<number>((oldest, item) => {
    const parsed = Date.parse(item.created_at);
    if (Number.isNaN(parsed)) {
      return oldest;
    }
    return Math.min(oldest, parsed);
  }, nowMs);

  const schedulerLagSeconds = Math.max(0, Math.floor((nowMs - oldestMs) / 1000));
  const stuckByLag = schedulerLagSeconds >= STUCK_LAG_THRESHOLD_SECONDS;
  const stuckByRetry = active.some((item) => (item.retry_count ?? 0) >= STUCK_RETRY_THRESHOLD);

  let stuckReason: string | undefined;
  if (stuckByRetry) {
    stuckReason = 'retry-threshold-breached';
  } else if (stuckByLag) {
    stuckReason = 'lag-threshold-breached';
  }

  return {
    scheduler_lag_seconds: schedulerLagSeconds,
    stuck_detected: stuckByLag || stuckByRetry,
    stuck_reason: stuckReason,
  };
}
