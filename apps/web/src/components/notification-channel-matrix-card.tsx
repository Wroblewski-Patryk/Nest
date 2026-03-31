"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  NotificationChannel,
  NotificationChannelDeliveryItem,
  NotificationPreferencesItem,
} from "@nest/shared-types";
import { nestApiClient } from "@/lib/api-client";

const CHANNELS: NotificationChannel[] = ["in_app", "push", "email"];
const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  in_app: "In-app",
  push: "Push",
  email: "Email",
};

export function NotificationChannelMatrixCard() {
  const [preferences, setPreferences] = useState<NotificationPreferencesItem | null>(null);
  const [deliveries, setDeliveries] = useState<NotificationChannelDeliveryItem[]>([]);
  const [detail, setDetail] = useState("Loading notification preferences...");
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    try {
      const [preferenceResponse, deliveriesResponse] = await Promise.all([
        nestApiClient.getNotificationPreferences(),
        nestApiClient.getNotificationChannelDeliveries({ per_page: 12 }),
      ]);
      setPreferences(preferenceResponse.data);
      setDeliveries(deliveriesResponse.data);
      setDetail("Notification matrix loaded.");
    } catch {
      setDetail("Could not load notification matrix.");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const sortedEvents = useMemo(() => {
    if (!preferences) return [];
    return [...preferences.supported_event_types].sort((a, b) => a.localeCompare(b));
  }, [preferences]);

  const toggleGlobalChannel = (channel: NotificationChannel) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel],
      },
    });
  };

  const toggleEventChannel = (eventType: string, channel: NotificationChannel) => {
    if (!preferences) return;
    const eventChannelMap = preferences.event_channels[eventType] ?? preferences.channels;
    setPreferences({
      ...preferences,
      event_channels: {
        ...preferences.event_channels,
        [eventType]: {
          ...eventChannelMap,
          [channel]: !eventChannelMap[channel],
        },
      },
    });
  };

  const updateQuietHours = (field: "start" | "end" | "timezone", value: string) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      quiet_hours: {
        ...preferences.quiet_hours,
        [field]: value,
      },
    });
  };

  const save = async () => {
    if (!preferences) return;
    setIsSaving(true);
    try {
      const response = await nestApiClient.updateNotificationPreferences({
        channels: preferences.channels,
        event_channels: preferences.event_channels,
        quiet_hours: preferences.quiet_hours,
        locale: preferences.locale,
      });
      setPreferences(response.data);
      setDetail("Notification preferences saved.");
      const telemetry = await nestApiClient.getNotificationChannelDeliveries({ per_page: 12 });
      setDeliveries(telemetry.data);
    } catch {
      setDetail("Could not save notification preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!preferences) {
    return <p className="mono-note">{detail}</p>;
  }

  return (
    <div className="stack">
      <p className="mono-note">{detail}</p>
      <div className="list-row">
        <strong>Global channels</strong>
      </div>
      <div className="list-row">
        {CHANNELS.map((channel) => (
          <label key={channel} className="mono-note">
            <input
              type="checkbox"
              checked={preferences.channels[channel]}
              onChange={() => toggleGlobalChannel(channel)}
              disabled={isSaving}
            />{" "}
            {CHANNEL_LABEL[channel]}
          </label>
        ))}
      </div>

      <div className="list-row">
        <strong>Quiet hours</strong>
      </div>
      <label className="mono-note">
        <input
          type="checkbox"
          checked={preferences.quiet_hours.enabled}
          onChange={() =>
            setPreferences({
              ...preferences,
              quiet_hours: {
                ...preferences.quiet_hours,
                enabled: !preferences.quiet_hours.enabled,
              },
            })
          }
          disabled={isSaving}
        />{" "}
        Enabled
      </label>
      <label className="mono-note">
        Start
        <input
          type="time"
          value={preferences.quiet_hours.start}
          onChange={(event) => updateQuietHours("start", event.target.value)}
          disabled={isSaving}
        />
      </label>
      <label className="mono-note">
        End
        <input
          type="time"
          value={preferences.quiet_hours.end}
          onChange={(event) => updateQuietHours("end", event.target.value)}
          disabled={isSaving}
        />
      </label>
      <label className="mono-note">
        Timezone
        <input
          type="text"
          value={preferences.quiet_hours.timezone}
          onChange={(event) => updateQuietHours("timezone", event.target.value)}
          disabled={isSaving}
        />
      </label>

      <div className="list-row">
        <strong>Per-event channel matrix</strong>
      </div>
      {sortedEvents.map((eventType) => {
        const eventChannelMap = preferences.event_channels[eventType] ?? preferences.channels;
        return (
          <div key={eventType} className="list-row">
            <span className="mono-note">{eventType}</span>
            <div>
              {CHANNELS.map((channel) => (
                <label key={channel} className="mono-note">
                  <input
                    type="checkbox"
                    checked={eventChannelMap[channel]}
                    onChange={() => toggleEventChannel(eventType, channel)}
                    disabled={isSaving}
                  />{" "}
                  {CHANNEL_LABEL[channel]}
                </label>
              ))}
            </div>
          </div>
        );
      })}

      <button type="button" className="pill-link" onClick={() => void save()} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save notification preferences"}
      </button>

      <div className="list-row">
        <strong>Recent channel telemetry</strong>
      </div>
      {deliveries.length === 0 ? <p className="mono-note">No telemetry entries yet.</p> : null}
      <ul className="list">
        {deliveries.map((entry) => (
          <li key={entry.id} className="list-row">
            <div>
              <strong>{entry.title}</strong>
              <p className="mono-note">
                {entry.channel} | {entry.event_type} | {entry.status}
                {entry.failure_reason ? ` | ${entry.failure_reason}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
