"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { InAppNotificationItem } from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";

type LoadState = "loading" | "success" | "error";

function groupNotifications(items: InAppNotificationItem[]): Array<[string, InAppNotificationItem[]]> {
  const map = new Map<string, InAppNotificationItem[]>();
  for (const item of items) {
    const key = item.module ?? "general";
    const existing = map.get(key) ?? [];
    existing.push(item);
    map.set(key, existing);
  }

  return Array.from(map.entries());
}

export function NotificationCenterCard() {
  const [state, setState] = useState<LoadState>("loading");
  const [detail, setDetail] = useState("Loading your notifications...");
  const [items, setItems] = useState<InAppNotificationItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async () => {
    setState("loading");
    try {
      const response = await nestApiClient.getInAppNotifications({
        per_page: 20,
        include_snoozed: false,
      });
      setItems(response.data);
      setState("success");
      setDetail(
        response.data.length > 0
          ? `${response.data.length} notification(s) are ready.`
          : "No notifications need attention right now."
      );
    } catch {
      setState("error");
      setDetail("We couldn't load notifications right now.");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const grouped = useMemo(() => groupNotifications(items), [items]);

  const markRead = async (item: InAppNotificationItem) => {
    setBusyId(item.id);
    try {
      await nestApiClient.markInAppNotificationRead(item.id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  const markUnread = async (item: InAppNotificationItem) => {
    setBusyId(item.id);
    try {
      await nestApiClient.markInAppNotificationUnread(item.id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  const snooze = async (item: InAppNotificationItem) => {
    setBusyId(item.id);
    try {
      await nestApiClient.snoozeInAppNotification(item.id, {
        snoozed_until: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      });
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="stack">
      <p className="mono-note">{detail}</p>
      {state === "loading" ? <p>Loading…</p> : null}
      {state === "error" ? <p>Please try again in a moment.</p> : null}
      {state === "success" && grouped.length === 0 ? <p>No notifications need attention right now.</p> : null}
      {grouped.map(([group, notifications]) => (
        <div key={group} className="stack">
          <h3>{group.toUpperCase()}</h3>
          <ul className="list">
            {notifications.map((item) => (
              <li key={item.id} className="list-row">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <p className="mono-note">
                    {item.is_read ? "Read" : "Unread"} | {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="stack">
                  {item.deep_link ? (
                    <Link href={item.deep_link} className="pill-link">
                      Open
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="pill-link"
                    onClick={() => void (item.is_read ? markUnread(item) : markRead(item))}
                    disabled={busyId === item.id}
                  >
                    {item.is_read ? "Mark unread" : "Mark read"}
                  </button>
                  <button
                    type="button"
                    className="pill-link"
                    onClick={() => void snooze(item)}
                    disabled={busyId === item.id}
                  >
                    Snooze 1h
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
