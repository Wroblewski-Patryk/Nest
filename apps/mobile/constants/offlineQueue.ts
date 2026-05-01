import {
  decryptOfflineCachePayload,
  encryptOfflineCachePayload,
} from '@/constants/offlineCacheCrypto';

type OfflineAction = 'sync_list_tasks' | 'sync_calendar' | 'sync_journal';
type QueueStatus = 'pending' | 'synced' | 'failed';

export type MobileOfflineQueueItem = {
  id: string;
  created_at: string;
  action: OfflineAction;
  status: QueueStatus;
  last_error?: string;
  retry_count?: number;
  next_retry_at?: string;
  retryable?: boolean;
};

const STORAGE_KEY = 'nest.offlineQueue.v1';
const DEFAULT_RETENTION_DAYS = 30;
const MAX_QUEUE_ITEMS = 500;
let memoryQueue: MobileOfflineQueueItem[] = [];

function retentionDays(): number {
  const raw = Number(process.env.EXPO_PUBLIC_NEST_OFFLINE_CACHE_RETENTION_DAYS ?? DEFAULT_RETENTION_DAYS);
  if (!Number.isFinite(raw)) {
    return DEFAULT_RETENTION_DAYS;
  }

  return Math.min(365, Math.max(1, Math.floor(raw)));
}

export function getOfflineQueueRetentionDays(): number {
  return retentionDays();
}

function sanitizeQueue(queue: MobileOfflineQueueItem[]): MobileOfflineQueueItem[] {
  const parsed = queue.filter((item) =>
    typeof item.id === 'string' &&
    typeof item.created_at === 'string' &&
    typeof item.action === 'string' &&
    typeof item.status === 'string'
  );

  const cutoffMs = Date.now() - retentionDays() * 24 * 60 * 60 * 1000;
  const retained = parsed.filter((item) => {
    const createdAtMs = Date.parse(item.created_at);
    if (Number.isNaN(createdAtMs)) {
      return false;
    }

    return createdAtMs >= cutoffMs;
  });

  if (retained.length <= MAX_QUEUE_ITEMS) {
    return retained;
  }

  return retained
    .sort((left, right) => left.created_at.localeCompare(right.created_at))
    .slice(retained.length - MAX_QUEUE_ITEMS);
}

function readFromStorage(): MobileOfflineQueueItem[] {
  const storage = (globalThis as { localStorage?: Storage }).localStorage;
  if (!storage) {
    return sanitizeQueue(memoryQueue);
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];

  const parsed = decryptOfflineCachePayload<unknown>(raw, []);
  if (!Array.isArray(parsed)) {
    return [];
  }

  const sanitized = sanitizeQueue(parsed as MobileOfflineQueueItem[]);
  if (sanitized.length !== parsed.length) {
    storage.setItem(STORAGE_KEY, encryptOfflineCachePayload(sanitized));
  }

  return sanitized;
}

function writeToStorage(queue: MobileOfflineQueueItem[]): void {
  const sanitized = sanitizeQueue(queue);
  const storage = (globalThis as { localStorage?: Storage }).localStorage;
  memoryQueue = sanitized;
  if (!storage) return;
  storage.setItem(STORAGE_KEY, encryptOfflineCachePayload(sanitized));
}

export function loadOfflineQueue(): MobileOfflineQueueItem[] {
  return readFromStorage();
}

export function saveOfflineQueue(queue: MobileOfflineQueueItem[]): void {
  writeToStorage(queue);
}

export function clearOfflineQueue(): void {
  memoryQueue = [];
  const storage = (globalThis as { localStorage?: Storage }).localStorage;
  if (!storage) {
    return;
  }

  storage.removeItem(STORAGE_KEY);
}

export function enqueueOfflineAction(action: OfflineAction): MobileOfflineQueueItem[] {
  const queue = readFromStorage();
  const duplicatePending = queue.some((item) => item.action === action && item.status === 'pending');
  if (duplicatePending) {
    return queue;
  }

  const next = [
    ...queue,
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      created_at: new Date().toISOString(),
      action,
      status: 'pending' as const,
    },
  ];
  writeToStorage(next);
  return next;
}
