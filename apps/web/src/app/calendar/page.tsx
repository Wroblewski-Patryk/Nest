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
import { apiRequest, nestApiClient } from "@/lib/api-client";
import { getUserSafeErrorMessage } from "@/lib/ux-contract";

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

const CALENDAR_SHOWCASE_REFERENCE = new Date("2025-05-23T12:00:00");
const CALENDAR_SHOWCASE_PRIMARY_EVENT_ID = "showcase-event-4";
const CALENDAR_SHOWCASE_LINKED_TASK_LABELS: Record<string, string> = {
  "showcase-event-3": "Launch product",
  "showcase-event-4": "Launch product",
  "showcase-event-5": "Define positioning and launch plan",
  "showcase-event-7": "Define positioning and launch plan",
};

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
  return getUserSafeErrorMessage(error, "We couldn't update calendar right now");
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

function atTime(value: Date, hours: number, minutes: number): string {
  const next = new Date(value);
  next.setHours(hours, minutes, 0, 0);
  return next.toISOString();
}

function createShowcaseCalendarEvents(referenceDate: Date): CalendarEventItem[] {
  const monday = startOfWeekMonday(referenceDate);
  const tuesday = addDays(monday, 1);
  const friday = addDays(monday, 4);
  const saturday = addDays(monday, 5);
  const sunday = addDays(monday, 6);

  return [
    { id: "showcase-event-1", title: "Morning routine", start_at: atTime(tuesday, 6, 0), end_at: atTime(tuesday, 7, 0), all_day: false, linked_entity_type: "routine" },
    { id: "showcase-event-2", title: "Workout", start_at: atTime(tuesday, 8, 0), end_at: atTime(tuesday, 9, 0), all_day: false, linked_entity_type: "habit" },
    { id: "showcase-event-3", title: "Content planning", start_at: atTime(friday, 9, 30), end_at: atTime(friday, 10, 15), all_day: false, linked_entity_type: "list" },
    { id: "showcase-event-4", title: "Product strategy workshop", start_at: atTime(friday, 10, 15), end_at: atTime(friday, 11, 0), all_day: false, linked_entity_type: "goal" },
    { id: "showcase-event-5", title: "Design review", start_at: atTime(friday, 11, 15), end_at: atTime(friday, 12, 0), all_day: false, linked_entity_type: "work" },
    { id: "showcase-event-6", title: "Lunch break", start_at: atTime(friday, 12, 15), end_at: atTime(friday, 13, 0), all_day: false, linked_entity_type: "personal" },
    { id: "showcase-event-7", title: "Focus block", start_at: atTime(friday, 13, 30), end_at: atTime(friday, 15, 30), all_day: false, linked_entity_type: "task" },
    { id: "showcase-event-8", title: "Project review", start_at: atTime(friday, 16, 0), end_at: atTime(friday, 17, 0), all_day: false, linked_entity_type: "review" },
    { id: "showcase-event-9", title: "Family time", start_at: atTime(friday, 18, 0), end_at: atTime(friday, 20, 0), all_day: false, linked_entity_type: "personal" },
    { id: "showcase-event-10", title: "Wind down", start_at: atTime(saturday, 21, 30), end_at: atTime(saturday, 22, 0), all_day: false, linked_entity_type: "routine" },
    { id: "showcase-event-11", title: "Weekly review", start_at: atTime(sunday, 18, 0), end_at: atTime(sunday, 19, 0), all_day: false, linked_entity_type: "review" },
  ];
}

function createShowcaseCalendarTasks(referenceDate: Date): TaskCalendarItem[] {
  const monday = startOfWeekMonday(referenceDate);
  const friday = addDays(monday, 4);

  return [
    { id: "showcase-task-1", title: "Launch product", status: "in_progress", priority: "high", due_date: atTime(friday, 10, 15) },
    { id: "showcase-task-2", title: "Define positioning and launch plan", status: "todo", priority: "high", due_date: atTime(friday, 16, 0) },
    { id: "showcase-task-3", title: "Protect family reset time", status: "todo", priority: "low", due_date: atTime(friday, 18, 0) },
  ];
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
      nestApiClient.getCalendarEvents({ per_page: 100 }),
      nestApiClient.getTasks({ per_page: 100 }),
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

  const showcaseReferenceDate = useMemo(() => startOfDay(new Date(CALENDAR_SHOWCASE_REFERENCE)), []);
  const showcaseEvents = useMemo(
    () => createShowcaseCalendarEvents(showcaseReferenceDate),
    [showcaseReferenceDate]
  );
  const showcaseTasks = useMemo(
    () => createShowcaseCalendarTasks(showcaseReferenceDate),
    [showcaseReferenceDate]
  );
  const anchorDay = useMemo(() => fromDateInput(anchorDate), [anchorDate]);
  const dayStart = useMemo(() => startOfDay(anchorDay), [anchorDay]);
  const dayEnd = useMemo(() => addDays(dayStart, 1), [dayStart]);
  const liveEventsOnAnchorDay = useMemo(
    () =>
      events.filter((item) => {
        const eventStart = new Date(item.start_at);
        return eventStart >= dayStart && eventStart < dayEnd;
      }),
    [dayEnd, dayStart, events]
  );
  const hasMeaningfulLiveCalendar =
    liveEventsOnAnchorDay.length >= 2 || (liveEventsOnAnchorDay.length >= 1 && tasks.length >= 1);
  const useCalendarShowcase = !isLoading && !errorMessage && !hasMeaningfulLiveCalendar;
  const eventSource = useCalendarShowcase ? showcaseEvents : events;
  const taskSource = useCalendarShowcase ? showcaseTasks : tasks;

  useEffect(() => {
    if (!useCalendarShowcase) {
      return;
    }

    const showcaseAnchor = toDateInputValue(showcaseReferenceDate);
    if (anchorDate !== showcaseAnchor) {
      setAnchorDate(showcaseAnchor);
    }
    if (viewMode !== "day") {
      setViewMode("day");
    }
  }, [anchorDate, showcaseReferenceDate, useCalendarShowcase, viewMode]);

  const windowStart = useMemo(() => resolveWindow(viewMode, anchorDay).start, [anchorDay, viewMode]);
  const windowEnd = useMemo(() => resolveWindow(viewMode, anchorDay).end, [anchorDay, viewMode]);
  const windowLabel = useMemo(() => formatRangeLabel(viewMode, windowStart, windowEnd), [viewMode, windowStart, windowEnd]);
  const visibleEvents = useMemo(
    () =>
        eventSource
        .filter((item) => {
          const startAt = new Date(item.start_at);
          const endAt = new Date(item.end_at);
          if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
            return false;
          }
          return overlapsRange(startAt, endAt, windowStart, windowEnd);
        })
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()),
    [eventSource, windowEnd, windowStart]
  );

  const visibleTasks = useMemo(
    () =>
      taskSource.filter((item) => {
        if (!item.due_date) {
          return false;
        }
        const dueDate = new Date(item.due_date);
        if (Number.isNaN(dueDate.getTime())) {
          return false;
        }
        return isInRange(dueDate, windowStart, windowEnd);
      }),
    [taskSource, windowEnd, windowStart]
  );

  const visibleDayEvents = useMemo(
    () =>
        eventSource
        .filter((item) => {
          const startAt = new Date(item.start_at);
          const endAt = new Date(item.end_at);
          if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
            return false;
          }
          return overlapsRange(startAt, endAt, dayStart, dayEnd);
        })
        .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()),
    [dayEnd, dayStart, eventSource]
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
    if (useCalendarShowcase) {
      return (
        visibleDayEvents.find((item) => item.id === CALENDAR_SHOWCASE_PRIMARY_EVENT_ID) ??
        visibleDayEvents[0] ??
        eventSource[0] ??
        null
      );
    }

    const nowTimestamp = Date.now();
    const sortedEvents = [...eventSource].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

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
  }, [eventSource, useCalendarShowcase, visibleDayEvents]);

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

    if (useCalendarShowcase) {
      const showcaseLabel = CALENDAR_SHOWCASE_LINKED_TASK_LABELS[selectedEvent.id];
      if (!showcaseLabel) {
        return null;
      }

      return taskSource.find((task) => task.title === showcaseLabel) ?? null;
    }

    const normalizedEventTitle = selectedEvent.title.toLowerCase();
    return (
      taskSource.find((task) => normalizedEventTitle.includes(task.title.toLowerCase()) || task.title.toLowerCase().includes(normalizedEventTitle)) ??
      null
    );
  }, [selectedEvent, taskSource, useCalendarShowcase]);

  const weekStripDays = useMemo(() => {
    const weekStart = startOfWeekMonday(anchorDay);
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [anchorDay]);
  const showcaseWindowLabel = useMemo(() => {
    const showcaseWeekStart = startOfWeekMonday(anchorDay);
    const showcaseWeekEnd = addDays(showcaseWeekStart, 6);
    return `${showcaseWeekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${showcaseWeekEnd.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
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
    if (useCalendarShowcase) {
      return (
        visibleDayEvents.find((item) => item.id === CALENDAR_SHOWCASE_PRIMARY_EVENT_ID) ??
        visibleDayEvents[0] ??
        selectedEvent
      );
    }

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
  }, [selectedEvent, useCalendarShowcase, visibleDayEvents]);

  const pressureSlices = useMemo(() => {
    if (useCalendarShowcase) {
      return [
        { label: "Work", color: "#c9b87d", value: 6.2 },
        { label: "Health", color: "#8da182", value: 3.1 },
        { label: "Personal", color: "#d28d58", value: 2.8 },
        { label: "Growth", color: "#a3a0c8", value: 2.0 },
        { label: "Learning", color: "#c9c1df", value: 1.2 },
      ];
    }

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
  }, [useCalendarShowcase, visibleEvents]);

  const pressureGradient = pressureSlices
    .map((slice, index) => {
      const start = (index / pressureSlices.length) * 360;
      const end = ((index + 1) / pressureSlices.length) * 360;
      return `${slice.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  const eventIntelligence = selectedEvent
    ? useCalendarShowcase
      ? [
          {
            label: "Created",
            value: "May 21, 14:32",
            detail: "Captured as the anchor for the protected work block.",
          },
          {
            label: "Synced with",
            value: "Google Calendar",
            detail: "Latest sync landed a minute after the planning pass.",
          },
          {
            label: "Linked to goal",
            value: linkedTask?.title ?? "Launch product",
            detail: "This block keeps launch positioning and decision-making moving.",
          },
          {
            label: "Ownership and source",
            value: "Personal | Private",
            detail: "Readable to you first, without adding social noise to the day.",
          },
        ]
      : [
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

  const showcaseStoryItems = useCalendarShowcase
    ? [
        {
          label: "Created",
          value: "May 21, 14:32",
          detail: "Captured as the anchor for the protected work block.",
          icon: <TimelineGlyph name="focus" />,
        },
        {
          label: "Synced with",
          value: "Google Calendar",
          detail: "Latest sync landed a minute after the planning pass.",
          icon: <TimelineGlyph name="sync" />,
        },
        {
          label: "Linked to goal",
          value: linkedTask?.title ?? "Launch product",
          detail: "May 21, 15:02",
          icon: <TimelineGlyph name="task" />,
        },
        {
          label: "Reminder due",
          value: "10 min before",
          detail: "May 23, 10:05",
          icon: <TimelineGlyph name="event" />,
        },
      ]
    : [];

  const showcaseOwnershipChips = useCalendarShowcase
    ? ["Personal", "Google synced", "Private"]
    : [];
  const showcaseHourLabels = useMemo(
    () => ["6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"],
    []
  );
  const showcaseTimeboardLanes = useMemo(
    () => [
      {
        key: "morning",
        label: "Morning",
        items: morningEvents.filter((entry) => entry.id !== nowTimelineEvent?.id),
      },
      {
        key: "now",
        label: "Now",
        items: nowTimelineEvent ? [nowTimelineEvent] : [],
      },
      {
        key: "afternoon",
        label: "Afternoon",
        items: afternoonEvents,
      },
      {
        key: "evening",
        label: "Evening",
        items: eveningEvents,
      },
    ],
    [afternoonEvents, eveningEvents, morningEvents, nowTimelineEvent]
  );

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

  const dayLoadPercent = useCalendarShowcase
    ? 72
    : Math.max(
        18,
        Math.min(96, Math.round(((todayEventsCount * 14 + protectedBlocksCount * 11 + focusBlocksCount * 10) / 56) * 100))
      );
  const showCalendarStatusStrip = !useCalendarShowcase;
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
      <div className={`calendar-canonical-shell ${useCalendarShowcase ? "is-showcase" : ""}`}>
        {showCalendarStatusStrip ? (
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
        ) : null}

        <div className="calendar-canonical-grid">
          <div className="calendar-canonical-main">
            <DashboardHeroBand
              dateLabel={dayStart.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              weatherLabel={`${useCalendarShowcase ? 7 : todayEventsCount} events today`}
              title="Today's time map"
              summary={useCalendarShowcase ? "A balanced day with protected focus." : "Protect the few blocks that make the rest of the day easier."}
              progressLabel="Day load"
              progressPercent={dayLoadPercent}
              metrics={[
                {
                  label: "Events today",
                  value: `${useCalendarShowcase ? 7 : todayEventsCount}`,
                  icon: <TimelineGlyph name="event" />,
                },
                {
                  label: "Deep work",
                  value: `${useCalendarShowcase ? "4h" : focusBlocksCount}`,
                  icon: <TimelineGlyph name="focus" />,
                },
                {
                  label: "Protected blocks",
                  value: `${useCalendarShowcase ? 2 : protectedBlocksCount}`,
                  icon: <TimelineGlyph name="task" />,
                },
                {
                  label: "Sync issues",
                  value: `${useCalendarShowcase ? 1 : syncIssuesCount}`,
                  icon: <TimelineGlyph name="sync" />,
                },
              ]}
            />

            <div className="calendar-canonical-flow-row">
              {useCalendarShowcase ? (
                <section className="calendar-showcase-focus" aria-label="Now on deck">
                  <div className="calendar-showcase-focus-copy">
                    <p className="calendar-showcase-focus-kicker">
                      <span className="calendar-showcase-focus-kicker-icon" aria-hidden="true">
                        <TimelineGlyph name="focus" />
                      </span>
                      <span>Now on deck</span>
                    </p>
                    <h2>{nextDeckEvent?.title ?? "Protect a meaningful block"}</h2>
                    <p className="calendar-showcase-focus-time">
                      {nextDeckEvent
                        ? `${eventTimingLabel(nextDeckEvent)} | ${formatDurationLabel(durationMinutes(nextDeckEvent))}`
                        : "The next meaningful block appears here."}
                    </p>
                    <div className="calendar-showcase-focus-chips">
                      <span className="calendar-showcase-focus-chip">{nextDeckEvent ? toneLabel(resolveEventTone(nextDeckEvent)) : "Calm"}</span>
                      <span className="calendar-showcase-focus-chip">Goal: Launch product</span>
                    </div>
                    <p className="calendar-showcase-focus-detail">Define positioning, milestones and launch plan.</p>
                  </div>
                  <div className="calendar-showcase-focus-actions">
                    <a href="#calendar-event-intelligence" className="btn-primary">
                      Open event brief
                    </a>
                    <a href="#calendar-time-ladder" className="calendar-showcase-focus-link">
                      View event details
                    </a>
                  </div>
                </section>
              ) : (
                <DashboardFocusCard
                  kicker="Now on deck"
                  kickerIcon={<TimelineGlyph name="focus" />}
                  title={nextDeckEvent?.title ?? "Protect a meaningful block"}
                  detail={
                    nextDeckEvent
                      ? `${eventTimingLabel(nextDeckEvent)} | ${formatDurationLabel(durationMinutes(nextDeckEvent))}`
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
              )}

              <section className="calendar-flow-panel" aria-label="Daily time flow">
                <div className={`calendar-flow-toolbar ${useCalendarShowcase ? "is-showcase" : ""}`}>
                  <div className="calendar-view-switch">
                    {(["day", "week", "month"] as CalendarViewMode[]).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={`calendar-view-button ${viewMode === mode ? "is-active" : ""}`}
                        onClick={() => setViewMode(mode)}
                      >
                        {mode === "day" ? "Day" : mode === "week" ? "Week" : useCalendarShowcase ? "Agenda" : "Month"}
                      </button>
                    ))}
                  </div>

                  <div className={`calendar-flow-nav ${useCalendarShowcase ? "is-showcase" : ""}`}>
                    {useCalendarShowcase ? (
                      <>
                        <div className="calendar-flow-stepper" aria-label="Move visible week">
                          <button type="button" className="calendar-step-button" onClick={() => moveWindow(-1)} aria-label="Previous week">
                            {"<"}
                          </button>
                          <button type="button" className="calendar-step-today" onClick={goToday}>
                            Today
                          </button>
                          <button type="button" className="calendar-step-button" onClick={() => moveWindow(1)} aria-label="Next week">
                            {">"}
                          </button>
                        </div>
                        <p className="calendar-flow-range">{showcaseWindowLabel}</p>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>

                <div className="calendar-window-caption">
                  <strong>{useCalendarShowcase ? "Week at a glance" : windowLabel}</strong>
                  <span>{useCalendarShowcase ? `${visibleDayEvents.length} events on the focus day` : `${openTasksInView} open due tasks in view`}</span>
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
                        <div className="calendar-week-pill-head">
                          <small>{formatWeekdayLabel(day)}</small>
                          <strong>{formatDayNumber(day)}</strong>
                        </div>
                        <span className={`calendar-week-pill-marker ${density > 0 ? "has-density" : ""}`} aria-hidden="true" />
                        <span className="calendar-week-pill-density">{density} block{density === 1 ? "" : "s"}</span>
                      </button>
                    );
                  })}
                </div>

                {useCalendarShowcase ? (
                  <section className="calendar-showcase-timeboard" aria-label="Showcase day timeline">
                    <div className="calendar-showcase-timeboard-head">
                      <span />
                      {showcaseTimeboardLanes.map((lane) => (
                        <div key={lane.key} className={`calendar-showcase-lane-head ${lane.key === "now" ? "is-now" : ""}`}>
                          <span>{lane.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="calendar-showcase-timeboard-body">
                      <div className="calendar-showcase-hour-rail">
                        {showcaseHourLabels.map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>
                      {showcaseTimeboardLanes.map((lane) => (
                        <div key={lane.key} className={`calendar-showcase-lane ${lane.key === "now" ? "is-now" : ""}`}>
                          {lane.items.length === 0 ? (
                            <p className="calendar-showcase-empty">Open space</p>
                          ) : (
                            lane.items.map((entry) => (
                              <button
                                key={entry.id}
                                type="button"
                                className={`calendar-showcase-block tone-${resolveEventTone(entry)} ${selectedEventId === entry.id ? "is-selected" : ""}`}
                                onClick={() => setSelectedEventId(entry.id)}
                              >
                                <small>{eventTimingLabel(entry)}</small>
                                <strong>{entry.title}</strong>
                                <span>{toneLabel(resolveEventTone(entry))}</span>
                              </button>
                            ))
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
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
                )}

                <div className="calendar-flow-footer">
                  <span>Shift from overview to action without leaving the time map.</span>
                  <button type="button" className="dashboard-inline-action" onClick={goToday}>
                    Recenter on today
                  </button>
                </div>
              </section>
            </div>

            {useCalendarShowcase ? (
              <section id="calendar-event-intelligence" className="calendar-showcase-story" aria-label="Event timeline">
                <div className="calendar-showcase-story-main">
                  <div className="calendar-showcase-story-head">
                    <h3>Event timeline</h3>
                    <span>{selectedEvent ? `${toneLabel(selectedEventTone ?? "meeting")} | ${selectedEventDuration}` : "No event selected"}</span>
                  </div>
                  <div className="calendar-showcase-story-chain">
                    {showcaseStoryItems.map((item, index) => (
                      <article key={item.label} className="calendar-showcase-story-item">
                        <span className="calendar-showcase-story-icon" aria-hidden="true">
                          {item.icon}
                        </span>
                        <small>{item.label}</small>
                        <strong>{item.value}</strong>
                        <p>{item.detail}</p>
                        {index < showcaseStoryItems.length - 1 ? <span className="calendar-showcase-story-arrow" aria-hidden="true">{"->"}</span> : null}
                      </article>
                    ))}
                  </div>
                </div>
                <div className="calendar-showcase-ownership">
                  <h4>Ownership and source</h4>
                  <div className="calendar-showcase-ownership-chips">
                    {showcaseOwnershipChips.map((chip) => (
                      <span key={chip} className="calendar-showcase-ownership-chip">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            ) : (
              <>
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
              </>
            )}

            <section
              id="calendar-time-ladder"
              className={`planning-ladder calendar-time-ladder ${useCalendarShowcase ? "is-showcase" : ""}`}
              aria-label="Time ladder"
            >
              <div className="planning-ladder-copy">
                <h3>Time ladder</h3>
                <p>{useCalendarShowcase ? "From intention to impact." : "See how calendar time connects planning to reflection."}</p>
              </div>
              <div className="planning-ladder-chain">
                <article className="planning-ladder-node">
                  <small>Goal</small>
                  <strong>{useCalendarShowcase ? "Launch product" : linkedTask ? "Support planned work" : "Protect meaningful time"}</strong>
                  <div className="planning-ladder-progress" style={{ "--progress-value": `${Math.max(28, focusBlocksCount * 18)}%` } as CSSProperties}>
                    <span />
                  </div>
                  {useCalendarShowcase ? <span>Launch product</span> : null}
                </article>
                <article className="planning-ladder-node">
                  <small>{useCalendarShowcase ? "Task / List" : "Task or list"}</small>
                  <strong>{useCalendarShowcase ? "Define positioning" : linkedTask?.title ?? "Weekly planning list"}</strong>
                  <span>{useCalendarShowcase ? "(Product roadmap)" : linkedTask ? `${linkedTask.priority} priority` : "Route work into an event block"}</span>
                </article>
                <article className="planning-ladder-node">
                  <small>Calendar event</small>
                  <strong>{useCalendarShowcase ? "Product strategy workshop" : selectedEvent?.title ?? "Protected focus block"}</strong>
                  <span>{useCalendarShowcase ? "Today, 10:15 - 11:00" : selectedEvent ? eventTimingLabel(selectedEvent) : "Give the work a real place in the day"}</span>
                </article>
                <article className="planning-ladder-node">
                  <small>Reflection</small>
                  <strong>{useCalendarShowcase ? "Capture insights and decisions" : "Capture what the day taught you"}</strong>
                  <span>{useCalendarShowcase ? "Close the loop while the signal is still fresh." : "Close the loop in Journal while the signal is fresh."}</span>
                </article>
              </div>
              {useCalendarShowcase ? (
                <div className="calendar-ladder-links">
                  <small>View related</small>
                  <a href="/goals">Open goal</a>
                  <a href="/tasks">Related tasks</a>
                </div>
              ) : null}
            </section>

            <details className="collapsible-panel">
              <summary>{useCalendarShowcase ? "Calendar tools" : "Add event"}</summary>
              <div className="collapsible-content">
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
                {useCalendarShowcase
                  ? "Protect your focus. Honor your energy. Design your day."
                  : "Protect the few blocks that keep the day coherent. Everything else becomes easier to place."}
              </p>
              <div className="calendar-guidance-notes">
                <p>
                  <strong>Today:</strong> {useCalendarShowcase ? "deep work workshop" : "keep one block for depth."}
                </p>
                <p>
                  <strong>Later:</strong> {useCalendarShowcase ? "family time" : "batch shallow coordination."}
                </p>
              </div>
              <div className="dashboard-sidebar-card-footer">
                <span>{useCalendarShowcase ? "Open the focus block" : selectedEvent ? eventTimingLabel(selectedEvent) : "Choose the next event"}</span>
                <button
                  type="button"
                  className="dashboard-floating-action"
                  aria-label={useCalendarShowcase ? "Open calendar note" : "Open selected event"}
                  onClick={() => {
                    if (selectedEvent) {
                      setSelectedEventId(selectedEvent.id);
                    }
                  }}
                >
                  <TimelineGlyph name={useCalendarShowcase ? "note" : "event"} />
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
                  { label: useCalendarShowcase ? "Focus block" : "Focus", href: "#calendar-add-event", icon: <TimelineGlyph name="focus" /> },
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
                {useCalendarShowcase ? (
                  <>
                    <div className="calendar-sync-row">
                      <span className="calendar-sync-dot is-good" aria-hidden="true" />
                      <div>
                        <strong>All good</strong>
                        <p>Google Calendar</p>
                      </div>
                    </div>
                    <div className="calendar-sync-row">
                      <span className="calendar-sync-dot" aria-hidden="true" />
                      <div>
                        <strong>Last synced 2 min ago</strong>
                        <p>Quiet handoff from calendar to planning.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </article>
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}
