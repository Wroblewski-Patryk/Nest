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
};

const STORAGE_KEY = 'nest.offlineQueue.v1';
let memoryQueue: MobileOfflineQueueItem[] = [];

function readFromStorage(): MobileOfflineQueueItem[] {
  const storage = (globalThis as { localStorage?: Storage }).localStorage;
  if (!storage) {
    return memoryQueue;
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(queue: MobileOfflineQueueItem[]): void {
  const storage = (globalThis as { localStorage?: Storage }).localStorage;
  memoryQueue = queue;
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function loadOfflineQueue(): MobileOfflineQueueItem[] {
  return readFromStorage();
}

export function saveOfflineQueue(queue: MobileOfflineQueueItem[]): void {
  writeToStorage(queue);
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
