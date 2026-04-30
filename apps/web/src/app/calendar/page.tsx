"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Panel, WorkspaceShell } from "@/components/workspace-shell";
import {
  DashboardContextRibbon,
  DashboardFocusCard,
  DashboardHeroBand,
} from "@/components/workspace-primitives";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";

type CalendarEventItem = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  linked_entity_type: string | null;
};

type TaskCalendarItem = {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "canceled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
};

type CalendarViewMode = "day" | "week" | "month";
type EventTone = "focus" | "meeting" | "personal" | "review";

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
};

async function apiRequest<TResponse>(path: string, init?: ApiRequestInit): Promise<TResponse> {
  const requestFn = nestApiClient.request as unknown as (
    requestPath: string,
    requestInit?: ApiRequestInit
  ) => Promise<unknown>;

  return (await requestFn(path, init)) as TResponse;
}

function getErrorStatus(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }
  return null;
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "payload" in error &&
    typeof (error as { payload?: unknown }).payload === "object" &&
    typeof (error as { payload: { message?: unknown } }).payload?.message === "string"
  ) {
    return (error as { payload: { message: string } }).payload.message;
  }
  return "Calendar request failed.";
}

function toIso(input: string): string | null {
  if (!input) {
    return null;
  }

  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function toLocalDateTimeInput(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function toDateInputValue(value: Date): string {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function fromDateInput(value: string): Date {
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
}

function addDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeekMonday(value: Date): Date {
  const base = startOfDay(value);
  const weekDay = base.getDay();
  const diff = weekDay === 0 ? -6 : 1 - weekDay;
  return addDays(base, diff);
}

function endForView(view: CalendarViewMode, start: Date): Date {
  if (view === "day") {
    return addDays(start, 1);
  }

  if (view === "week") {
    return addDays(start, 7);
  }

  return new Date(start.getFullYear(), start.getMonth() + 1, 1, 0, 0, 0, 0);
}

function resolveWindow(view: CalendarViewMode, anchor: Date): { start: Date; end: Date } {
  if (view === "day") {
    const start = startOfDay(anchor);
    return { start, end: endForView("day", start) };
  }

  if (view === "week") {
    const start = startOfWeekMonday(anchor);
    return { start, end: endForView("week", start) };
  }

  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 0, 0, 0, 0);
  return { start, end: endForView("month", start) };
}

function formatRangeLabel(view: CalendarViewMode, start: Date, end: Date): string {
  if (view === "day") {
    return start.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  }

  if (view === "week") {
    const lastDay = addDays(end, -1);
    return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${lastDay.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }

  return start.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function isInRange(value: Date, start: Date, end: Date): boolean {
  return value >= start && value < end;
}

function overlapsRange(startAt: Date, endAt: Date, start: Date, end: Date): boolean {
  return endAt > start && startAt < end;
}

function formatWhen(value: string): string {
  return new Date(value).toLocaleString();
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatWeekdayLabel(value: Date): string {
  return value.toLocaleDateString(undefined, { weekday: "short" });
}

function formatMonthDayLabel(value: Date): string {
  return value.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDayNumber(value: Date): string {
  return value.toLocaleDateString(undefined, { day: "numeric" });
}

function durationMinutes(entry: CalendarEventItem): number {
  const startAt = new Date(entry.start_at);
  const endAt = new Date(entry.end_at);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return 0;
  }
  return Math.max(0, Math.round((endAt.getTime() - startAt.getTime()) / 60000));
}

function formatDurationLabel(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (remainder === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainder}m`;
  }
  return `${minutes} min`;
}

function isClosedTask(status: TaskCalendarItem["status"]): boolean {
  return status === "done" || status === "canceled";
}

function resolveEventTone(entry: CalendarEventItem): EventTone {
  const haystack = `${entry.title} ${entry.linked_entity_type ?? ""}`.toLowerCase();

  if (
    haystack.includes("focus") ||
    haystack.includes("deep") ||
    haystack.includes("workshop") ||
    haystack.includes("strategy") ||
    haystack.includes("plan")
  ) {
    return "focus";
  }

  if (
    haystack.includes("family") ||
    haystack.includes("doctor") ||
    haystack.includes("travel") ||
    haystack.includes("personal")
  ) {
    return "personal";
  }

  if (haystack.includes("review") || haystack.includes("retro") || haystack.includes("reflect")) {
    return "review";
  }

  return "meeting";
}

function toneLabel(tone: EventTone): string {
  if (tone === "focus") {
    return "Focus";
  }
  if (tone === "personal") {
    return "Personal";
  }
  if (tone === "review") {
    return "Review";
  }
  return "Meeting";
}

function eventTimingLabel(entry: CalendarEventItem): string {
  return `${formatTime(entry.start_at)} - ${formatTime(entry.end_at)}`;
}

function TimelineGlyph({ name }: { name: "event" | "focus" | "sync" | "task" | "note" | "routine" }) {
  if (name === "focus") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      </svg>
    );
  }

  if (name === "sync") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 12a6 6 0 0 1 10.4-4.2L18 9.5V5h-4.5l1.8 1.8A8 8 0 0 0 4 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 12a6 6 0 0 1-10.4 4.2L6 14.5V19h4.5l-1.8-1.8A8 8 0 0 0 20 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "task") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "note") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H19v18H8.5A2.5 2.5 0 0 0 6 23V5.5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9.5 8.5H16M9.5 12H16M9.5 15.5H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "routine") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 6h12M8 12h12M8 18h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="5" cy="6" r="1.4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="5" cy="12" r="1.4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="5" cy="18" r="1.4" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 3v4M16 3v4M4 9h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [tasks, setTasks] = useState<TaskCalendarItem[]>([]);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("day");
  const [anchorDate, setAnchorDate] = useState(toDateInputValue(new Date()));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStartAt, setNewEventStartAt] = useState("");
  const [newEventEndAt, setNewEventEndAt] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventTitle, setEditEventTitle] = useState("");
  const [editEventStartAt, setEditEventStartAt] = useState("");
  const [editEventEndAt, setEditEventEndAt] = useState("");
  const [busyEventId, setBusyEventId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Create your first time block.");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadData = useCallback(async () => {
    const [eventsResponse, tasksResponse] = await Promise.all([
      nestApiClient.getCalendarEvents({ per_page: 200 }),
      nestApiClient.getTasks({ per_page: 200 }),
    ]);
    setEvents((eventsResponse.data ?? []) as CalendarEventItem[]);
    setTasks((tasksResponse.data ?? []) as TaskCalendarItem[]);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadData()
      .then(() => {
        if (!mounted) {
          return;
        }
        setFeedback("Calendar loaded.");
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }
        if (getErrorStatus(error) === 401) {
          handleUnauthorized();
          return;
        }
        setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [handleUnauthorized, loadData]);

  const anchorDay = useMemo(() => fromDateInput(anchorDate), [anchorDate]);
  const windowStart = useMemo(() => resolveWindow(viewMode, anchorDay).start, [anchorDay, viewMode]);
  const windowEnd = useMemo(() => resolveWindow(viewMode, anchorDay).end, [anchorDay, viewMode]);
  const windowLabel = useMemo(() => formatRangeLabel(viewMode, windowStart, windowEnd), [viewMode, windowStart, windowEnd]);
  const dayStart = useMemo(() => startOfDay(anchorDay), [anchorDay]);
  const dayEnd = useMemo(() => addDays(dayStart, 1), [dayStart]);
  const visibleEvents = useMemo(
    () =>
      events
        .filter((item) => {
          const startAt = new Date(item.start_at);
          const endAt = new Date(item.end_at);
          if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
            return false;
          }
          return overlapsRange(startAt, endAt, windowStart, windowEnd);
        })
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()),
    [events, windowEnd, windowStart]
  );

  const visibleTasks = useMemo(
    () =>
      tasks.filter((item) => {
        if (!item.due_date) {
          return false;
        }
        const dueDate = new Date(item.due_date);
        if (Number.isNaN(dueDate.getTime())) {
          return false;
        }
        return isInRange(dueDate, windowStart, windowEnd);
      }),
    [tasks, windowEnd, windowStart]
  );

  const visibleDayEvents = useMemo(
    () =>
      events
        .filter((item) => {
          const startAt = new Date(item.start_at);
          const endAt = new Date(item.end_at);
          if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
            return false;
          }
          return overlapsRange(startAt, endAt, dayStart, dayEnd);
        })
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()),
    [dayEnd, dayStart, events]
  );

  const planningFeed = useMemo(() => {
    const eventRows = visibleEvents.map((entry) => ({
      key: `event-${entry.id}`,
      type: "event" as const,
      at: new Date(entry.start_at),
      title: entry.title,
      detail: `${eventTimingLabel(entry)} | ${formatDurationLabel(durationMinutes(entry))}`,
      tag: toneLabel(resolveEventTone(entry)),
    }));

    const taskRows = visibleTasks.map((task) => ({
      key: `task-${task.id}`,
      type: "task" as const,
      at: new Date(task.due_date ?? ""),
      title: task.title,
      detail: `Due ${task.due_date?.slice(0, 10)} | ${task.priority} | ${task.status}`,
      tag: "Task",
    }));

    return [...eventRows, ...taskRows]
      .filter((entry) => !Number.isNaN(entry.at.getTime()))
      .sort((a, b) => a.at.getTime() - b.at.getTime());
  }, [visibleEvents, visibleTasks]);

  const openTasksInView = useMemo(
    () => visibleTasks.filter((item) => !isClosedTask(item.status)).length,
    [visibleTasks]
  );

  const todayEventsCount = visibleDayEvents.length;
  const focusBlocksCount = visibleDayEvents.filter((item) => resolveEventTone(item) === "focus").length;
  const protectedBlocksCount = visibleDayEvents.filter((item) => durationMinutes(item) >= 60).length;

  const syncIssuesCount = useMemo(() => {
    let overlaps = 0;
    for (let index = 0; index < visibleDayEvents.length - 1; index += 1) {
      const currentEnd = new Date(visibleDayEvents[index].end_at).getTime();
      const nextStart = new Date(visibleDayEvents[index + 1].start_at).getTime();
      if (currentEnd > nextStart) {
        overlaps += 1;
      }
    }
    return overlaps;
  }, [visibleDayEvents]);

  const nextDeckEvent = useMemo(() => {
    const nowTimestamp = Date.now();
    const sortedEvents = [...events].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

    const ongoing = sortedEvents.find((item) => {
      const startAt = new Date(item.start_at).getTime();
      const endAt = new Date(item.end_at).getTime();
      return startAt <= nowTimestamp && endAt >= nowTimestamp;
    });
    if (ongoing) {
      return ongoing;
    }

    const upcoming = sortedEvents.find((item) => new Date(item.start_at).getTime() >= nowTimestamp);
    return upcoming ?? visibleDayEvents[0] ?? null;
  }, [events, visibleDayEvents]);

  useEffect(() => {
    if (selectedEventId && visibleEvents.some((item) => item.id === selectedEventId)) {
      return;
    }
    setSelectedEventId(nextDeckEvent?.id ?? visibleDayEvents[0]?.id ?? visibleEvents[0]?.id ?? null);
  }, [nextDeckEvent, selectedEventId, visibleDayEvents, visibleEvents]);

  const selectedEvent =
    visibleEvents.find((item) => item.id === selectedEventId) ??
    visibleDayEvents.find((item) => item.id === selectedEventId) ??
    nextDeckEvent ??
    null;

  const selectedEventTone = selectedEvent ? resolveEventTone(selectedEvent) : null;
  const selectedEventDuration = selectedEvent ? formatDurationLabel(durationMinutes(selectedEvent)) : "45 min";

  const linkedTask = useMemo(() => {
    if (!selectedEvent) {
      return null;
    }

    const normalizedEventTitle = selectedEvent.title.toLowerCase();
    return (
      tasks.find((task) => normalizedEventTitle.includes(task.title.toLowerCase()) || task.title.toLowerCase().includes(normalizedEventTitle)) ??
      null
    );
  }, [selectedEvent, tasks]);

  const weekStripDays = useMemo(() => {
    const weekStart = startOfWeekMonday(anchorDay);
    return Array.from({ length: 5 }, (_, index) => addDays(weekStart, index));
  }, [anchorDay]);

  const dayDensity = useMemo(
    () =>
      weekStripDays.map((day) => {
        const nextDay = addDays(day, 1);
        return visibleEvents.filter((item) => {
          const startAt = new Date(item.start_at);
          const endAt = new Date(item.end_at);
          return overlapsRange(startAt, endAt, day, nextDay);
        }).length;
      }),
    [visibleEvents, weekStripDays]
  );

  const morningEvents = visibleDayEvents.filter((item) => new Date(item.start_at).getHours() < 12);
  const afternoonEvents = visibleDayEvents.filter((item) => {
    const hour = new Date(item.start_at).getHours();
    return hour >= 12 && hour < 17;
  });
  const eveningEvents = visibleDayEvents.filter((item) => new Date(item.start_at).getHours() >= 17);

  const nowTimelineEvent = useMemo(() => {
    const nowTimestamp = Date.now();
    const ongoing = visibleDayEvents.find((item) => {
      const startAt = new Date(item.start_at).getTime();
      const endAt = new Date(item.end_at).getTime();
      return startAt <= nowTimestamp && endAt >= nowTimestamp;
    });
    if (ongoing) {
      return ongoing;
    }

    return visibleDayEvents.find((item) => new Date(item.start_at).getTime() > nowTimestamp) ?? selectedEvent;
  }, [selectedEvent, visibleDayEvents]);

  const pressureSlices = useMemo(() => {
    const base = [
      { label: "Focus", color: "#83915c", count: 0 },
      { label: "Meetings", color: "#d7bf74", count: 0 },
      { label: "Personal", color: "#c7864d", count: 0 },
      { label: "Review", color: "#b5b9d9", count: 0 },
    ];

    visibleEvents.forEach((item) => {
      const tone = resolveEventTone(item);
      const target =
        tone === "focus"
          ? base[0]
          : tone === "personal"
            ? base[2]
            : tone === "review"
              ? base[3]
              : base[1];
      target.count += Math.max(1, durationMinutes(item));
    });

    const total = base.reduce((sum, item) => sum + item.count, 0) || 1;
    return base.map((item) => ({
      label: item.label,
      color: item.color,
      value: Number(((item.count / total) * 10).toFixed(1)),
    }));
  }, [visibleEvents]);

  const pressureGradient = pressureSlices
    .map((slice, index) => {
      const start = (index / pressureSlices.length) * 360;
      const end = ((index + 1) / pressureSlices.length) * 360;
      return `${slice.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  const eventIntelligence = selectedEvent
    ? [
        {
          label: "Source",
          value: selectedEvent.linked_entity_type ? `${selectedEvent.linked_entity_type} linked` : "Standalone block",
          detail: selectedEvent.all_day ? "All-day visibility is on." : "Timed event with direct schedule ownership.",
        },
        {
          label: "Linked work",
          value: linkedTask ? linkedTask.title : "No task linked yet",
          detail: linkedTask ? `${linkedTask.priority} priority, ${linkedTask.status} state.` : "Use this block as the bridge between planning and action.",
        },
        {
          label: "Privacy",
          value: selectedEvent.all_day ? "Broad visibility" : "Focused scope",
          detail: selectedEvent.all_day ? "Best for anchors, rituals, and travel." : "Keeps the day readable without over-sharing.",
        },
        {
          label: "Sync health",
          value: syncIssuesCount > 0 ? `${syncIssuesCount} conflict cue${syncIssuesCount === 1 ? "" : "s"}` : "Quiet and aligned",
          detail: syncIssuesCount > 0 ? "There is overlap pressure in this day window." : "No overlap or source drift detected in the visible day.",
        },
      ]
    : [
        {
          label: "Source",
          value: "Waiting for the first event",
          detail: "Create one event to unlock richer event intelligence.",
        },
      ];

  function moveWindow(direction: -1 | 1) {
    const anchor = fromDateInput(anchorDate);
    const next = new Date(anchor);

    if (viewMode === "day") {
      next.setDate(anchor.getDate() + direction);
    } else if (viewMode === "week") {
      next.setDate(anchor.getDate() + direction * 7);
    } else {
      next.setMonth(anchor.getMonth() + direction, 1);
    }

    setAnchorDate(toDateInputValue(next));
  }

  function goToday() {
    setAnchorDate(toDateInputValue(new Date()));
    setViewMode("day");
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newEventTitle.trim()) {
      setErrorMessage("Event title is required.");
      return;
    }

    const startAt = toIso(newEventStartAt);
    const endAt = toIso(newEventEndAt);
    if (!startAt || !endAt) {
      setErrorMessage("Start and end date-time are required.");
      return;
    }

    setIsCreating(true);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest("/calendar-events", {
        method: "POST",
        body: {
          title: newEventTitle.trim(),
          start_at: startAt,
          end_at: endAt,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          all_day: false,
        },
      });
      setNewEventTitle("");
      setNewEventStartAt("");
      setNewEventEndAt("");
      await loadData();
      setFeedback("Calendar event created.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  }

  function startEventEdit(entry: CalendarEventItem) {
    setEditingEventId(entry.id);
    setEditEventTitle(entry.title);
    setEditEventStartAt(toLocalDateTimeInput(entry.start_at));
    setEditEventEndAt(toLocalDateTimeInput(entry.end_at));
  }

  async function saveEventEdit(eventId: string) {
    if (!editEventTitle.trim()) {
      setErrorMessage("Event title is required.");
      return;
    }

    const startAt = toIso(editEventStartAt);
    const endAt = toIso(editEventEndAt);
    if (!startAt || !endAt) {
      setErrorMessage("Start and end date-time are required.");
      return;
    }

    setBusyEventId(eventId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/calendar-events/${eventId}`, {
        method: "PATCH",
        body: {
          title: editEventTitle.trim(),
          start_at: startAt,
          end_at: endAt,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        },
      });
      setEditingEventId(null);
      await loadData();
      setFeedback("Calendar event updated.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyEventId(null);
    }
  }

  async function deleteEvent(eventId: string) {
    if (!window.confirm("Delete this calendar event?")) {
      return;
    }

    setBusyEventId(eventId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/calendar-events/${eventId}`, {
        method: "DELETE",
      });
      if (editingEventId === eventId) {
        setEditingEventId(null);
      }
      await loadData();
      setFeedback("Calendar event deleted.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyEventId(null);
    }
  }

  const dayLoadPercent = Math.max(
    18,
    Math.min(96, Math.round(((todayEventsCount * 14 + protectedBlocksCount * 11 + focusBlocksCount * 10) / 56) * 100))
  );
  const statusMessage = errorMessage
    ? errorMessage
    : isLoading
      ? "Loading the time map and event details."
      : feedback || "Calendar is live.";

  return (
    <WorkspaceShell
      title="Calendar"
      subtitle="See the shape of the day before it turns noisy."
      module="calendar"
      shellTone="dashboard-canonical"
      utilityDateLabel="Friday, May 23, 2025"
      utilityWeatherLabel="18 degC"
      hideAssistantNav
      hideRailFooterActions
    >
      <div className="calendar-canonical-shell">
        <section className={`calendar-status-strip ${errorMessage ? "is-error" : "is-success"}`} aria-live="polite">
          <div className="calendar-status-copy">
            <small>{errorMessage ? "Calendar status" : isLoading ? "Loading state" : "Live view"}</small>
            <strong>{statusMessage}</strong>
          </div>
          <div className="planning-status-actions">
            <button type="button" className="pill-link" onClick={() => void loadData()} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        <div className="calendar-canonical-grid">
          <div className="calendar-canonical-main">
            <DashboardHeroBand
              dateLabel={dayStart.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              weatherLabel={`${todayEventsCount} events today`}
              title="Today's time map"
              summary="Protect the few blocks that make the rest of the day easier."
              progressLabel="Day load"
              progressPercent={dayLoadPercent}
              metrics={[
                {
                  label: "Events today",
                  value: `${todayEventsCount}`,
                  icon: <TimelineGlyph name="event" />,
                },
                {
                  label: "Deep work",
                  value: `${focusBlocksCount}`,
                  icon: <TimelineGlyph name="focus" />,
                },
                {
                  label: "Protected blocks",
                  value: `${protectedBlocksCount}`,
                  icon: <TimelineGlyph name="task" />,
                },
                {
                  label: "Sync issues",
                  value: `${syncIssuesCount}`,
                  icon: <TimelineGlyph name="sync" />,
                },
              ]}
            />

            <div className="calendar-canonical-flow-row">
              <DashboardFocusCard
                kicker="Now on deck"
                kickerIcon={<TimelineGlyph name="focus" />}
                title={nextDeckEvent?.title ?? "Protect a meaningful block"}
                detail={
                  nextDeckEvent
                    ? `${eventTimingLabel(nextDeckEvent)} • ${formatDurationLabel(durationMinutes(nextDeckEvent))}`
                    : "Your next event will become the dominant action card as soon as the day has one."
                }
                supportingLabel="Linked context"
                supportingValue={linkedTask?.title ?? "Calendar event"}
                meta={[
                  { label: "Energy", value: nextDeckEvent ? toneLabel(resolveEventTone(nextDeckEvent)) : "Calm" },
                  { label: "Window", value: nextDeckEvent ? formatMonthDayLabel(new Date(nextDeckEvent.start_at)) : "Today" },
                ]}
                href="#calendar-event-intelligence"
                cta="Open event brief"
                rationaleHref="#calendar-time-ladder"
                rationaleLabel="Why this?"
              />

              <section className="calendar-flow-panel" aria-label="Daily time flow">
                <div className="calendar-flow-toolbar">
                  <div className="calendar-view-switch">
                    {(["day", "week", "month"] as CalendarViewMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={`calendar-view-button ${viewMode === mode ? "is-active" : ""}`}
                        onClick={() => setViewMode(mode)}
                      >
                        {mode === "day" ? "Day" : mode === "week" ? "Week" : "Month"}
                      </button>
                    ))}
                  </div>

                  <div className="calendar-flow-nav">
                    <button type="button" className="btn-secondary" onClick={() => moveWindow(-1)}>
                      Prev
                    </button>
                    <button type="button" className="btn-secondary" onClick={goToday}>
                      Today
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => moveWindow(1)}>
                      Next
                    </button>
                    <label className="field calendar-anchor-field">
                      <span>Anchor</span>
                      <input
                        className="list-row"
                        type="date"
                        value={anchorDate}
                        onChange={(event) => setAnchorDate(event.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="calendar-window-caption">
                  <strong>{windowLabel}</strong>
                  <span>{openTasksInView} open due tasks in view</span>
                </div>

                <div className="calendar-week-strip" role="tablist" aria-label="Week strip">
                  {weekStripDays.map((day, index) => {
                    const dayKey = toDateInputValue(day);
                    const density = dayDensity[index];
                    const isActiveDay = dayKey === anchorDate;
                    return (
                      <button
                        key={dayKey}
                        type="button"
                        className={`calendar-week-pill ${isActiveDay ? "is-active" : ""}`}
                        onClick={() => {
                          setAnchorDate(dayKey);
                          setViewMode("day");
                        }}
                      >
                        <small>{formatWeekdayLabel(day)}</small>
                        <strong>{formatDayNumber(day)}</strong>
                        <span>{density} block{density === 1 ? "" : "s"}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="calendar-day-grid">
                  <section className="calendar-time-column">
                    <header>
                      <span>Morning</span>
                    </header>
                    <div className="calendar-time-stack">
                      {morningEvents.length === 0 ? (
                        <p className="calendar-time-empty">Nothing anchored yet.</p>
                      ) : (
                        morningEvents.map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            className={`calendar-time-card ${selectedEventId === entry.id ? "is-selected" : ""}`}
                            onClick={() => setSelectedEventId(entry.id)}
                          >
                            <small>{eventTimingLabel(entry)}</small>
                            <strong>{entry.title}</strong>
                            <span>{toneLabel(resolveEventTone(entry))}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="calendar-now-column">
                    <header>
                      <span>Now</span>
                    </header>
                    <article className="calendar-now-card">
                      <small>{nowTimelineEvent ? eventTimingLabel(nowTimelineEvent) : "Open time"}</small>
                      <strong>{nowTimelineEvent?.title ?? "The day still has room."}</strong>
                      <p>
                        {nowTimelineEvent
                          ? `${toneLabel(resolveEventTone(nowTimelineEvent))} block with ${formatDurationLabel(durationMinutes(nowTimelineEvent))} of protected time.`
                          : "Keep this pocket clear for the next meaningful action or a deliberate pause."}
                      </p>
                    </article>
                  </section>

                  <section className="calendar-time-column">
                    <header>
                      <span>Afternoon</span>
                    </header>
                    <div className="calendar-time-stack">
                      {afternoonEvents.length === 0 ? (
                        <p className="calendar-time-empty">Afternoon is still light.</p>
                      ) : (
                        afternoonEvents.map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            className={`calendar-time-card ${selectedEventId === entry.id ? "is-selected" : ""}`}
                            onClick={() => setSelectedEventId(entry.id)}
                          >
                            <small>{eventTimingLabel(entry)}</small>
                            <strong>{entry.title}</strong>
                            <span>{toneLabel(resolveEventTone(entry))}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </section>

                  <section className="calendar-time-column">
                    <header>
                      <span>Evening</span>
                    </header>
                    <div className="calendar-time-stack">
                      {eveningEvents.length === 0 ? (
                        <p className="calendar-time-empty">Evening is still open.</p>
                      ) : (
                        eveningEvents.map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            className={`calendar-time-card ${selectedEventId === entry.id ? "is-selected" : ""}`}
                            onClick={() => setSelectedEventId(entry.id)}
                          >
                            <small>{eventTimingLabel(entry)}</small>
                            <strong>{entry.title}</strong>
                            <span>{toneLabel(resolveEventTone(entry))}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                <div className="calendar-flow-footer">
                  <span>Shift from overview to action without leaving the time map.</span>
                  <button type="button" className="dashboard-inline-action" onClick={goToday}>
                    Recenter on today
                  </button>
                </div>
              </section>
            </div>

            <DashboardContextRibbon title="Event intelligence" items={eventIntelligence} />

            <Panel
              id="calendar-event-intelligence"
              title="Event timeline"
              className="dashboard-dayflow-panel calendar-management-panel calendar-event-timeline-panel"
              actions={
                <span className="dashboard-inline-link">
                  {selectedEvent ? `${toneLabel(selectedEventTone ?? "meeting")} | ${selectedEventDuration}` : "No event selected"}
                </span>
              }
            >
              <ul className="calendar-event-ledger">
                {planningFeed.length === 0 ? (
                  <li className="calendar-event-ledger-empty">No tasks or events in the selected window yet.</li>
                ) : (
                  planningFeed.map((entry) => (
                    <li key={entry.key} className="calendar-event-ledger-item">
                      <div>
                        <strong>{entry.title}</strong>
                        <p>{entry.detail}</p>
                      </div>
                      <span className="pill">{entry.tag}</span>
                    </li>
                  ))
                )}
              </ul>
            </Panel>

            <section id="calendar-time-ladder" className="planning-ladder calendar-time-ladder" aria-label="Time ladder">
              <div className="planning-ladder-copy">
                <h3>Time ladder</h3>
                <p>See how calendar time connects planning to reflection.</p>
              </div>
              <div className="planning-ladder-chain">
                <article className="planning-ladder-node">
                  <small>Goal</small>
                  <strong>{linkedTask ? "Support planned work" : "Protect meaningful time"}</strong>
                  <div className="planning-ladder-progress" style={{ "--progress-value": `${Math.max(28, focusBlocksCount * 18)}%` } as CSSProperties}>
                    <span />
                  </div>
                </article>
                <article className="planning-ladder-node">
                  <small>Task or list</small>
                  <strong>{linkedTask?.title ?? "Weekly planning list"}</strong>
                  <span>{linkedTask ? `${linkedTask.priority} priority` : "Route work into an event block"}</span>
                </article>
                <article className="planning-ladder-node">
                  <small>Calendar event</small>
                  <strong>{selectedEvent?.title ?? "Protected focus block"}</strong>
                  <span>{selectedEvent ? eventTimingLabel(selectedEvent) : "Give the work a real place in the day"}</span>
                </article>
                <article className="planning-ladder-node">
                  <small>Reflection</small>
                  <strong>Capture what the day taught you</strong>
                  <span>Close the loop in Journal while the signal is fresh.</span>
                </article>
              </div>
            </section>

            <Panel id="calendar-add-event" title="Add event" className="calendar-management-panel">
              <form className="form-grid" onSubmit={createEvent}>
                <label className="field">
                  <span>Title</span>
                  <input
                    className="list-row"
                    type="text"
                    value={newEventTitle}
                    onChange={(event) => setNewEventTitle(event.target.value)}
                    placeholder="Example: Weekly life planning"
                    disabled={isCreating}
                  />
                </label>
                <label className="field">
                  <span>Start</span>
                  <input
                    className="list-row"
                    type="datetime-local"
                    value={newEventStartAt}
                    onChange={(event) => setNewEventStartAt(event.target.value)}
                    disabled={isCreating}
                  />
                </label>
                <label className="field">
                  <span>End</span>
                  <input
                    className="list-row"
                    type="datetime-local"
                    value={newEventEndAt}
                    onChange={(event) => setNewEventEndAt(event.target.value)}
                    disabled={isCreating}
                  />
                </label>
                <button type="submit" className="btn-primary" disabled={isCreating}>
                  {isCreating ? "Adding..." : "Add event"}
                </button>
              </form>
            </Panel>

            <details className="collapsible-panel">
              <summary>Manage all events</summary>
              <div className="collapsible-content">
                <Panel title="All events" className="calendar-management-panel">
                  <ul className="list">
                    {events.length === 0 ? (
                      <li className="list-row">
                        <p>No events yet. Add your first time block above.</p>
                      </li>
                    ) : (
                      events.map((entry) => (
                        <li className="list-row" key={entry.id}>
                          {editingEventId === entry.id ? (
                            <div className="form-grid">
                              <label className="field">
                                <span>Title</span>
                                <input
                                  className="list-row"
                                  type="text"
                                  value={editEventTitle}
                                  onChange={(event) => setEditEventTitle(event.target.value)}
                                  disabled={busyEventId === entry.id}
                                />
                              </label>
                              <div className="row-inline">
                                <label className="field">
                                  <span>Start</span>
                                  <input
                                    className="list-row"
                                    type="datetime-local"
                                    value={editEventStartAt}
                                    onChange={(event) => setEditEventStartAt(event.target.value)}
                                    disabled={busyEventId === entry.id}
                                  />
                                </label>
                                <label className="field">
                                  <span>End</span>
                                  <input
                                    className="list-row"
                                    type="datetime-local"
                                    value={editEventEndAt}
                                    onChange={(event) => setEditEventEndAt(event.target.value)}
                                    disabled={busyEventId === entry.id}
                                  />
                                </label>
                              </div>
                              <div className="row-inline">
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => void saveEventEdit(entry.id)}
                                  disabled={busyEventId === entry.id}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => setEditingEventId(null)}
                                  disabled={busyEventId === entry.id}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <strong>{entry.title}</strong>
                                <p>
                                  {formatWhen(entry.start_at)} - {formatWhen(entry.end_at)}
                                </p>
                              </div>
                              <div className="row-inline">
                                <span className="pill">{entry.linked_entity_type ?? "standalone"}</span>
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => startEventEdit(entry)}
                                  disabled={busyEventId === entry.id}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => void deleteEvent(entry.id)}
                                  disabled={busyEventId === entry.id}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </Panel>
              </div>
            </details>
          </div>

          <aside className="calendar-canonical-rail">
            <article className="dashboard-sidebar-card calendar-guidance-card">
              <div className="dashboard-sidebar-card-head">
                <h3>
                  <TimelineGlyph name="note" />
                  <span>Time with clarity</span>
                </h3>
                <span>...</span>
              </div>
              <p className="dashboard-sidebar-card-script">
                Protect the few blocks that keep the day coherent. Everything else becomes easier to place.
              </p>
              <div className="calendar-guidance-notes">
                <p>
                  <strong>Today:</strong> keep one block for depth.
                </p>
                <p>
                  <strong>Later:</strong> batch shallow coordination.
                </p>
              </div>
              <div className="dashboard-sidebar-card-footer">
                <span>{selectedEvent ? eventTimingLabel(selectedEvent) : "Choose the next event"}</span>
                <button
                  type="button"
                  className="dashboard-floating-action"
                  aria-label="Open selected event"
                  onClick={() => {
                    if (selectedEvent) {
                      setSelectedEventId(selectedEvent.id);
                    }
                  }}
                >
                  <TimelineGlyph name="event" />
                </button>
              </div>
            </article>

            <article className="dashboard-sidebar-card calendar-quick-add-card">
              <div className="dashboard-sidebar-card-head">
                <h3>Quick add</h3>
              </div>
              <div className="dashboard-quick-add-grid">
                {[
                  { label: "Event", href: "#calendar-add-event", icon: <TimelineGlyph name="event" /> },
                  { label: "Focus", href: "#calendar-add-event", icon: <TimelineGlyph name="focus" /> },
                  { label: "Routine", href: "/routines", icon: <TimelineGlyph name="routine" /> },
                  { label: "Note", href: "/journal", icon: <TimelineGlyph name="note" /> },
                ].map((item) => (
                  <a key={item.label} href={item.href} className="dashboard-quick-add-tile">
                    <span className="dashboard-quick-add-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <small>{item.label}</small>
                  </a>
                ))}
              </div>
            </article>

            <article className="dashboard-sidebar-card calendar-pressure-card">
              <div className="dashboard-sidebar-card-head">
                <h3>Calendar pressure</h3>
                <span>View all</span>
              </div>
              <div className="dashboard-balance-grid">
                <div className="dashboard-balance-donut" style={{ background: `conic-gradient(${pressureGradient})` }}>
                  <div className="dashboard-balance-donut-inner" aria-hidden="true" />
                </div>
                <ul className="dashboard-balance-legend">
                  {pressureSlices.map((item) => (
                    <li key={item.label}>
                      <span className="dashboard-balance-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
                      <small>{item.label}</small>
                      <strong>{item.value.toFixed(1)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="dashboard-balance-caption">Balance across the visible time window.</p>
            </article>

            <article className="dashboard-sidebar-card calendar-sync-card">
              <div className="dashboard-sidebar-card-head">
                <h3>Sync health</h3>
              </div>
              <div className="calendar-sync-health">
                <div>
                  <strong>{syncIssuesCount === 0 ? "Quiet and aligned" : `${syncIssuesCount} conflict cue${syncIssuesCount === 1 ? "" : "s"}`}</strong>
                  <p>
                    {syncIssuesCount === 0
                      ? "The visible day is readable and no obvious overlap drift is showing."
                      : "Review the selected day to resolve overlap before it compounds."}
                  </p>
                </div>
                <div>
                  <strong>{openTasksInView}</strong>
                  <p>Open due tasks still need calendar placement.</p>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}
