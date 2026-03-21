"use client";

import { useEffect, useMemo, useState } from "react";
import { nestApiClient } from "@/lib/api-client";

type OfflineAction = "sync_list_tasks" | "sync_calendar" | "sync_journal";
type QueueStatus = "pending" | "synced" | "failed";

type QueueItem = {
  id: string;
  created_at: string;
  action: OfflineAction;
  status: QueueStatus;
  last_error?: string;
};

const STORAGE_KEY = "nest.offlineQueue.v1";

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

export function OfflineSyncCard() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [detail, setDetail] = useState("Queue offline changes and run manual force sync.");
  const [isSyncing, setIsSyncing] = useState(false);

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

  const forceSync = async (queueSource: QueueItem[] = queue) => {
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
          setDetail(`Synced ${item.action} from ${item.created_at}.`);
        } catch (error) {
          const status =
            typeof error === "object" &&
            error !== null &&
            "status" in error &&
            typeof (error as { status?: unknown }).status === "number"
              ? String((error as { status: number }).status)
              : "n/a";
          item.status = "failed";
          item.last_error = `HTTP ${status}`;
          setDetail(`Force sync stopped on first error at ${item.action} (HTTP ${status}).`);
          break;
        }
      }
    } finally {
      saveQueue(nextQueue);
      setQueue(nextQueue);
      setIsSyncing(false);
    }
  };

  const retrySync = async () => {
    const retriable = queue.map((item) =>
      item.status === "failed"
        ? { ...item, status: "pending" as const, last_error: undefined }
        : item
    );
    setQueue(retriable);
    saveQueue(retriable);
    await forceSync(retriable);
  };

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
      </div>
      <p className="mono-note">
        Pending: {pendingCount} | Total: {queue.length}
      </p>
    </div>
  );
}
