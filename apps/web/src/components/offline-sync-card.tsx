"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { nestApiClient } from "@/lib/api-client";
import {
  clearOfflineSyncSchedulerState,
  evaluateOfflineSyncSchedulerHealth,
  loadOfflineSyncSchedulerState,
  saveOfflineSyncSchedulerState,
  type OfflineSyncSchedulerState,
} from "@/lib/offline-sync-scheduler";
import {
  decryptOfflineCachePayload,
  encryptOfflineCachePayload,
} from "@/lib/offline-cache-crypto";
import {
  describeApiIssue,
  getApiErrorCode,
  getApiErrorRetryable,
  getApiErrorStatus,
} from "@/lib/ux-contract";

type OfflineAction = "sync_list_tasks" | "sync_calendar" | "sync_journal";
type QueueStatus = "pending" | "synced" | "failed";

type QueueItem = {
  id: string;
  created_at: string;
  action: OfflineAction;
  status: QueueStatus;
  last_error?: string;
  retry_count?: number;
  next_retry_at?: string;
  retryable?: boolean;
};

const STORAGE_KEY = "nest.offlineQueue.v1";
const AUTO_SYNC_INTERVAL_MS = 15000;
const BASE_RETRY_SECONDS = 15;
const MAX_RETRY_SECONDS = 300;
const DEFAULT_RETENTION_DAYS = 30;
const MAX_QUEUE_ITEMS = 500;

function retentionDays(): number {
  const raw = Number(process.env.NEXT_PUBLIC_NEST_OFFLINE_CACHE_RETENTION_DAYS ?? DEFAULT_RETENTION_DAYS);
  if (!Number.isFinite(raw)) {
    return DEFAULT_RETENTION_DAYS;
  }

  return Math.min(365, Math.max(1, Math.floor(raw)));
}

function sanitizeQueue(queue: QueueItem[]): QueueItem[] {
  const parsed = queue.filter((item) =>
    typeof item.id === "string" &&
    typeof item.created_at === "string" &&
    typeof item.action === "string" &&
    typeof item.status === "string"
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

function loadQueue(): QueueItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  const parsed = decryptOfflineCachePayload<unknown>(raw, []);
  if (!Array.isArray(parsed)) {
    return [];
  }

  const sanitized = sanitizeQueue(parsed as QueueItem[]);
  if (sanitized.length !== parsed.length) {
    window.localStorage.setItem(STORAGE_KEY, encryptOfflineCachePayload(sanitized));
  }

  return sanitized;
}

function saveQueue(queue: QueueItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const sanitized = sanitizeQueue(queue);
  window.localStorage.setItem(STORAGE_KEY, encryptOfflineCachePayload(sanitized));
}

function clearQueueStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

function computeJitterSeconds(seed: string, retryCount: number): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }

  return Math.abs(hash + retryCount * 17) % 5;
}

function computeRetryDelaySeconds(retryCount: number, seed: string): number {
  const delay = BASE_RETRY_SECONDS * Math.pow(2, Math.max(0, retryCount - 1));
  const withJitter = delay + computeJitterSeconds(seed, retryCount);
  return Math.min(MAX_RETRY_SECONDS, withJitter);
}

function isRetryDue(item: QueueItem, nowMs: number): boolean {
  if (item.retryable === false) {
    return false;
  }

  if (!item.next_retry_at) {
    return true;
  }

  const nextAt = Date.parse(item.next_retry_at);
  if (Number.isNaN(nextAt)) {
    return true;
  }

  return nextAt <= nowMs;
}

export function OfflineSyncCard() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [detail, setDetail] = useState("Queue offline changes here and run a manual sync when you're ready.");
  const [isSyncing, setIsSyncing] = useState(false);
  const [scheduler, setScheduler] = useState<OfflineSyncSchedulerState>(() =>
    loadOfflineSyncSchedulerState()
  );

  const autoSyncEnabled = scheduler.auto_sync_enabled;

  useEffect(() => {
    setQueue(loadQueue());
    setScheduler(loadOfflineSyncSchedulerState());
  }, []);

  const updateScheduler = useCallback(
    (updater: (previous: OfflineSyncSchedulerState) => OfflineSyncSchedulerState) => {
      setScheduler((previous) => {
        const next = updater(previous);
        saveOfflineSyncSchedulerState(next);
        return next;
      });
    },
    []
  );

  const pendingCount = useMemo(
    () => queue.filter((item) => item.status === "pending").length,
    [queue]
  );

  const enqueue = (action: OfflineAction) => {
    const duplicatePending = queue.some(
      (item) => item.action === action && item.status === "pending"
    );
    if (duplicatePending) {
      setDetail(`A pending ${action} sync is already queued.`);
      return;
    }

    const next: QueueItem[] = [
      ...queue,
      {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        action,
        status: "pending" as const,
      },
    ];
    setQueue(next);
    saveQueue(next);
  };

  const forceSync = useCallback(
    async (
      queueSource: QueueItem[] = queue,
      options: { stopOnError: boolean; source: "manual" | "auto" } = {
        stopOnError: true,
        source: "manual",
      }
    ) => {
      const runStartedAt = new Date().toISOString();
      let hadFailure = false;
      let hadSuccess = false;
      let lastError = "";

      setIsSyncing(true);
      updateScheduler((previous) => ({
        ...previous,
        last_run_at: runStartedAt,
      }));
      const nextQueue = [...queueSource].sort((a, b) => a.created_at.localeCompare(b.created_at));

      try {
        for (const item of nextQueue) {
          if (item.status !== "pending") continue;

          try {
            if (item.action === "sync_list_tasks") {
              await nestApiClient.syncListTasks("todoist");
            }
            if (item.action === "sync_calendar") {
              await nestApiClient.syncCalendar("google_calendar");
            }
            if (item.action === "sync_journal") {
              await nestApiClient.syncJournal("obsidian");
            }

            item.status = "synced";
            delete item.last_error;
            delete item.retry_count;
            delete item.next_retry_at;
            hadSuccess = true;
            setDetail(`${item.action} synced successfully.`);
          } catch (error) {
            const status = getApiErrorStatus(error);
            const code = getApiErrorCode(error);
            const retryable = getApiErrorRetryable(error);
            const shouldRetryAutomatically = retryable !== false;
            const retryCount = (item.retry_count ?? 0) + 1;
            const retryDelaySeconds = computeRetryDelaySeconds(retryCount, item.id);
            item.status = "failed";
            item.retry_count = retryCount;
            item.retryable = retryable ?? true;
            if (shouldRetryAutomatically) {
              item.next_retry_at = new Date(Date.now() + retryDelaySeconds * 1000).toISOString();
            } else {
              delete item.next_retry_at;
            }
            item.last_error = code ?? (status === null ? "request_failed" : `HTTP ${status}`);
            hadFailure = true;
            lastError = item.last_error;
            setDetail(
              `${options.source === "auto" ? "Auto-sync" : "Manual sync"} could not finish ${item.action}. ${describeApiIssue(error)} ${
                shouldRetryAutomatically
                  ? `Next retry in ${retryDelaySeconds}s.`
                  : "Resolve the issue, then use Retry Sync to try again."
              }`
            );
            if (options.stopOnError) {
              break;
            }
          }
        }
      } finally {
        saveQueue(nextQueue);
        setQueue(nextQueue);
        const health = evaluateOfflineSyncSchedulerHealth(nextQueue);
        updateScheduler((previous) => ({
          ...previous,
          ...health,
          last_run_at: runStartedAt,
          last_success_at: hadSuccess ? new Date().toISOString() : previous.last_success_at,
          consecutive_failures: hadFailure
            ? previous.consecutive_failures + 1
            : hadSuccess
              ? 0
              : previous.consecutive_failures,
          last_error: hadFailure ? lastError : undefined,
        }));
        setIsSyncing(false);
      }
    },
    [queue, updateScheduler]
  );

  const retrySync = useCallback(async () => {
    const retriable = queue.map((item) =>
      item.status === "failed"
        ? {
            ...item,
            status: "pending" as const,
            last_error: undefined,
            next_retry_at: undefined,
            retryable: undefined,
          }
        : item
    );
    setQueue(retriable);
    saveQueue(retriable);
    await forceSync(retriable);
  }, [forceSync, queue]);

  const secureWipeCache = useCallback(() => {
    clearQueueStorage();
    clearOfflineSyncSchedulerState();
    setQueue([]);
    setScheduler(loadOfflineSyncSchedulerState());
    setDetail("Offline cache was securely removed from this device.");
  }, []);

  useEffect(() => {
    if (!autoSyncEnabled || typeof window === "undefined") {
      return;
    }

    const interval = window.setInterval(() => {
      if (isSyncing) {
        return;
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return;
      }

      const nowMs = Date.now();
      const hasPending = queue.some((item) => item.status === "pending");
      const hasDueRetries = queue.some(
        (item) => item.status === "failed" && isRetryDue(item, nowMs)
      );

      if (!hasPending && !hasDueRetries) {
        return;
      }

      const autoPrepared = queue.map((item) =>
        item.status === "failed" && isRetryDue(item, nowMs)
          ? { ...item, status: "pending" as const }
          : item
      );

      if (hasDueRetries) {
        setQueue(autoPrepared);
        saveQueue(autoPrepared);
      }

      void forceSync(autoPrepared, { stopOnError: false, source: "auto" });
    }, AUTO_SYNC_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [autoSyncEnabled, forceSync, isSyncing, queue]);

  return (
    <div className="panel-content">
      <p className="callout">{detail}</p>
      <div className="row-inline">
        <button type="button" className="btn-secondary" onClick={() => enqueue("sync_list_tasks")}>
          Queue Tasks Sync
        </button>
        <button type="button" className="btn-secondary" onClick={() => enqueue("sync_calendar")}>
          Queue Calendar Sync
        </button>
        <button type="button" className="btn-secondary" onClick={() => enqueue("sync_journal")}>
          Queue Journal Sync
        </button>
        <button type="button" className="btn-primary" onClick={() => void forceSync()} disabled={isSyncing || pendingCount === 0}>
          {isSyncing ? "Syncing..." : "Force Sync"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => void retrySync()} disabled={isSyncing}>
          Retry Sync
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            updateScheduler((previous) => ({
              ...previous,
              auto_sync_enabled: !previous.auto_sync_enabled,
            }))
          }
          disabled={isSyncing}
        >
          {autoSyncEnabled ? "Pause Auto Sync" : "Resume Auto Sync"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={secureWipeCache}
          disabled={isSyncing}
        >
          Secure Wipe Cache
        </button>
      </div>
      <p className="mono-note">
        Pending: {pendingCount} | Total: {queue.length} | Auto: {autoSyncEnabled ? "on" : "off"} |
        Lag: {scheduler.scheduler_lag_seconds}s | Retention: {retentionDays()}d
      </p>
      {scheduler.stuck_detected ? (
        <p className="mono-note">Scheduler alert: stuck queue ({scheduler.stuck_reason ?? "unknown"}).</p>
      ) : null}
    </div>
  );
}
