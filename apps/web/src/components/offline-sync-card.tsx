"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { nestApiClient } from "@/lib/api-client";

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
};

const STORAGE_KEY = "nest.offlineQueue.v1";
const AUTO_SYNC_INTERVAL_MS = 15000;
const BASE_RETRY_SECONDS = 15;
const MAX_RETRY_SECONDS = 300;

function loadQueue(): QueueItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueueItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
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
  const [detail, setDetail] = useState("Queue offline changes and run manual force sync.");
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  useEffect(() => {
    setQueue(loadQueue());
  }, []);

  const pendingCount = useMemo(
    () => queue.filter((item) => item.status === "pending").length,
    [queue]
  );

  const enqueue = (action: OfflineAction) => {
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
      setIsSyncing(true);
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
            setDetail(`Synced ${item.action} from ${item.created_at}.`);
          } catch (error) {
            const status =
              typeof error === "object" &&
              error !== null &&
              "status" in error &&
              typeof (error as { status?: unknown }).status === "number"
                ? String((error as { status: number }).status)
                : "n/a";
            const retryCount = (item.retry_count ?? 0) + 1;
            const retryDelaySeconds = computeRetryDelaySeconds(retryCount, item.id);
            item.status = "failed";
            item.retry_count = retryCount;
            item.next_retry_at = new Date(Date.now() + retryDelaySeconds * 1000).toISOString();
            item.last_error = `HTTP ${status}`;
            setDetail(
              `${options.source === "auto" ? "Auto" : "Force"} sync error at ${item.action} (HTTP ${status}); retry in ${retryDelaySeconds}s.`
            );
            if (options.stopOnError) {
              break;
            }
          }
        }
      } finally {
        saveQueue(nextQueue);
        setQueue(nextQueue);
        setIsSyncing(false);
      }
    },
    [queue]
  );

  const retrySync = useCallback(async () => {
    const retriable = queue.map((item) =>
      item.status === "failed"
        ? {
            ...item,
            status: "pending" as const,
            last_error: undefined,
            next_retry_at: undefined,
          }
        : item
    );
    setQueue(retriable);
    saveQueue(retriable);
    await forceSync(retriable);
  }, [forceSync, queue]);

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
          onClick={() => setAutoSyncEnabled((value) => !value)}
          disabled={isSyncing}
        >
          {autoSyncEnabled ? "Pause Auto Sync" : "Resume Auto Sync"}
        </button>
      </div>
      <p className="mono-note">
        Pending: {pendingCount} | Total: {queue.length} | Auto: {autoSyncEnabled ? "on" : "off"}
      </p>
    </div>
  );
}
