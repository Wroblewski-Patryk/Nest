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

type LifeAreaItem = {
  id: string;
  name: string;
  color: string;
  weight: number;
  is_archived?: boolean;
};

type JournalEntryMood = "low" | "neutral" | "good" | "great" | null;

type JournalEntryItem = {
  id: string;
  title: string;
  body: string;
  mood: JournalEntryMood;
  entry_date: string;
  life_areas?: LifeAreaItem[];
  lifeAreas?: LifeAreaItem[];
};

type LifeAreaBalanceResponse = {
  data: Array<{
    life_area_id: string;
    name: string;
    target_share: number;
    actual_share: number;
    balance_score: number;
  }>;
  meta: {
    global_balance_score: number;
  };
};

type JournalFilter = "all" | "good" | "heavy" | "week";

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

  return "Journal request failed.";
}

function formatMood(mood: JournalEntryMood): string {
  if (mood === "great") {
    return "Great";
  }
  if (mood === "good") {
    return "Good";
  }
  if (mood === "neutral") {
    return "Neutral";
  }
  if (mood === "low") {
    return "Low";
  }
  return "None";
}

function moodNumericValue(mood: JournalEntryMood): number {
  if (mood === "great") {
    return 4;
  }
  if (mood === "good") {
    return 3;
  }
  if (mood === "neutral") {
    return 2;
  }
  if (mood === "low") {
    return 1;
  }
  return 0;
}

function formatEntryDate(value: string | null | undefined): string {
  if (!value) {
    return "No entry yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isSameWeek(value: string): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  const startOfWeek = new Date(now);
  const weekDay = startOfWeek.getDay();
  const diff = weekDay === 0 ? -6 : 1 - weekDay;
  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
}

function JournalGlyph({ name }: { name: "journal" | "spark" | "mood" | "balance" | "date" | "prompt" | "edit" | "trash" }) {
  if (name === "spark") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M18.5 15.5 19 17l1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5.5-1.5ZM5.5 15l.6 1.9L8 17.5l-1.9.6L5.5 20l-.6-1.9L3 17.5l1.9-.6.6-1.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "mood") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 14.5c.9 1 2 1.5 3.5 1.5s2.6-.5 3.5-1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="9.25" cy="10" r="1" fill="currentColor" />
        <circle cx="14.75" cy="10" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (name === "balance") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4v14M7 8h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M5.5 8 3 12h5l-2.5-4ZM18.5 8 16 12h5l-2.5-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "date") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 3v4M16 3v4M4 9h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "prompt") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H19v18H8.5A2.5 2.5 0 0 0 6 23V5.5Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9.5 8.5H16M9.5 12H16M9.5 15.5H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 18h3.2l8.5-8.5a1.7 1.7 0 0 0 0-2.4l-.8-.8a1.7 1.7 0 0 0-2.4 0L6 14.8V18Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="m13.2 7.8 3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 7h14M9 7V5.7A1.7 1.7 0 0 1 10.7 4h2.6A1.7 1.7 0 0 1 15 5.7V7m-8.5 0 .6 11a1.6 1.6 0 0 0 1.6 1.5h6.6a1.6 1.6 0 0 0 1.6-1.5L17.5 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 11v4M14 11v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H19v18H8.5A2.5 2.5 0 0 0 6 23V5.5Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.5 8.5H16M9.5 12H16M9.5 15.5H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MoodChip({
  label,
  active,
  onClick,
}: {
  label: "low" | "neutral" | "good" | "great";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`journal-mood-chip ${active ? "is-active" : ""}`} onClick={onClick}>
      <span className="journal-mood-chip-icon" aria-hidden="true">
        <JournalGlyph name="mood" />
      </span>
      <span>{formatMood(label)}</span>
    </button>
  );
}

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [lifeAreas, setLifeAreas] = useState<LifeAreaItem[]>([]);
  const [balance, setBalance] = useState<LifeAreaBalanceResponse | null>(null);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [isCreatingArea, setIsCreatingArea] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editEntryTitle, setEditEntryTitle] = useState("");
  const [editEntryBody, setEditEntryBody] = useState("");
  const [editEntryMood, setEditEntryMood] = useState<"low" | "neutral" | "good" | "great">("good");
  const [editEntryDate, setEditEntryDate] = useState("");
  const [editEntryLifeAreaIds, setEditEntryLifeAreaIds] = useState<string[]>([]);
  const [busyEntryId, setBusyEntryId] = useState<string | null>(null);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editAreaName, setEditAreaName] = useState("");
  const [editAreaColor, setEditAreaColor] = useState("#789262");
  const [editAreaWeight, setEditAreaWeight] = useState("50");
  const [busyAreaId, setBusyAreaId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Capture one honest note and let the pattern emerge over time.");
  const [errorMessage, setErrorMessage] = useState("");
  const [entryFilter, setEntryFilter] = useState<JournalFilter>("all");

  const [entryTitle, setEntryTitle] = useState("");
  const [entryBody, setEntryBody] = useState("");
  const [entryMood, setEntryMood] = useState<"low" | "neutral" | "good" | "great">("good");
  const [entryDate, setEntryDate] = useState("");
  const [entryLifeAreaIds, setEntryLifeAreaIds] = useState<string[]>([]);

  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaColor, setNewAreaColor] = useState("#789262");
  const [newAreaWeight, setNewAreaWeight] = useState("50");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadData = useCallback(async () => {
    const [entriesResponse, lifeAreasResponse, balanceResponse] = await Promise.all([
      nestApiClient.getJournalEntries({ per_page: 100 }),
      apiRequest<{ data: LifeAreaItem[] }>("/life-areas"),
      nestApiClient.getLifeAreaBalance({ window_days: 30 }),
    ]);

    setEntries((entriesResponse.data ?? []) as JournalEntryItem[]);
    setLifeAreas((lifeAreasResponse.data ?? []) as LifeAreaItem[]);
    setBalance(balanceResponse as LifeAreaBalanceResponse);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadData()
      .then(() => {
        if (!mounted) {
          return;
        }
        setFeedback("Journal and life areas loaded.");
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
      });
    return () => {
      mounted = false;
    };
  }, [handleUnauthorized, loadData]);

  async function createJournalEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!entryTitle.trim()) {
      setErrorMessage("Entry title is required.");
      return;
    }
    if (!entryBody.trim()) {
      setErrorMessage("Reflection body is required.");
      return;
    }

    setIsCreatingEntry(true);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest("/journal-entries", {
        method: "POST",
        body: {
          title: entryTitle.trim(),
          body: entryBody.trim(),
          mood: entryMood,
          ...(entryDate ? { entry_date: entryDate } : {}),
          ...(entryLifeAreaIds.length > 0 ? { life_area_ids: entryLifeAreaIds } : {}),
        },
      });

      setEntryTitle("");
      setEntryBody("");
      setEntryMood("good");
      setEntryDate("");
      setEntryLifeAreaIds([]);
      await loadData();
      setFeedback("Journal entry created.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreatingEntry(false);
    }
  }

  async function createLifeArea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newAreaName.trim()) {
      setErrorMessage("Life area name is required.");
      return;
    }

    setIsCreatingArea(true);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest("/life-areas", {
        method: "POST",
        body: {
          name: newAreaName.trim(),
          color: newAreaColor,
          weight: Number(newAreaWeight) || 0,
        },
      });

      setNewAreaName("");
      setNewAreaWeight("50");
      await loadData();
      setFeedback("Life area created.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreatingArea(false);
    }
  }

  function startEntryEdit(entry: JournalEntryItem) {
    const linkedAreas = entry.life_areas ?? entry.lifeAreas ?? [];
    setEditingEntryId(entry.id);
    setEditEntryTitle(entry.title);
    setEditEntryBody(entry.body);
    setEditEntryMood(entry.mood ?? "neutral");
    setEditEntryDate(entry.entry_date ? entry.entry_date.slice(0, 10) : "");
    setEditEntryLifeAreaIds(linkedAreas.map((area) => area.id));
  }

  async function saveEntryEdit(entryId: string) {
    if (!editEntryTitle.trim()) {
      setErrorMessage("Entry title is required.");
      return;
    }
    if (!editEntryBody.trim()) {
      setErrorMessage("Reflection body is required.");
      return;
    }

    setBusyEntryId(entryId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/journal-entries/${entryId}`, {
        method: "PATCH",
        body: {
          title: editEntryTitle.trim(),
          body: editEntryBody.trim(),
          mood: editEntryMood,
          entry_date: editEntryDate || undefined,
          life_area_ids: editEntryLifeAreaIds,
        },
      });
      setEditingEntryId(null);
      await loadData();
      setFeedback("Journal entry updated.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyEntryId(null);
    }
  }

  async function deleteEntry(entryId: string) {
    if (!window.confirm("Delete this journal entry?")) {
      return;
    }

    setBusyEntryId(entryId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/journal-entries/${entryId}`, {
        method: "DELETE",
      });
      if (editingEntryId === entryId) {
        setEditingEntryId(null);
      }
      await loadData();
      setFeedback("Journal entry deleted.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyEntryId(null);
    }
  }

  function startLifeAreaEdit(area: LifeAreaItem) {
    setEditingAreaId(area.id);
    setEditAreaName(area.name);
    setEditAreaColor(area.color);
    setEditAreaWeight(String(area.weight));
  }

  async function saveLifeAreaEdit(areaId: string) {
    if (!editAreaName.trim()) {
      setErrorMessage("Life area name is required.");
      return;
    }

    setBusyAreaId(areaId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/life-areas/${areaId}`, {
        method: "PATCH",
        body: {
          name: editAreaName.trim(),
          color: editAreaColor,
          weight: Number(editAreaWeight) || 0,
        },
      });
      setEditingAreaId(null);
      await loadData();
      setFeedback("Life area updated.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyAreaId(null);
    }
  }

  async function deleteLifeArea(areaId: string) {
    if (!window.confirm("Delete this life area?")) {
      return;
    }

    setBusyAreaId(areaId);
    setErrorMessage("");
    setFeedback("");
    try {
      await apiRequest(`/life-areas/${areaId}`, {
        method: "DELETE",
      });
      if (editingAreaId === areaId) {
        setEditingAreaId(null);
      }
      await loadData();
      setFeedback("Life area deleted.");
    } catch (error) {
      if (getErrorStatus(error) === 401) {
        handleUnauthorized();
        return;
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyAreaId(null);
    }
  }

  const latestEntry = entries[0] ?? null;
  const latestEntryAreas = latestEntry ? latestEntry.life_areas ?? latestEntry.lifeAreas ?? [] : [];
  const latestEntryDate = latestEntry?.entry_date ? formatEntryDate(latestEntry.entry_date) : "No entry yet";
  const topLifeArea = useMemo(() => {
    if (lifeAreas.length === 0) {
      return null;
    }

    return [...lifeAreas].sort((a, b) => b.weight - a.weight)[0] ?? null;
  }, [lifeAreas]);
  const strongestBalanceDrift = useMemo(() => {
    if (!balance?.data.length) {
      return null;
    }

    return [...balance.data].sort(
      (left, right) =>
        Math.abs(right.actual_share - right.target_share) -
        Math.abs(left.actual_share - left.target_share)
    )[0];
  }, [balance]);

  const recentMoodTrend = useMemo(
    () =>
      [...entries]
        .slice(0, 7)
        .reverse()
        .map((entry) => ({
          id: entry.id,
          label: formatEntryDate(entry.entry_date),
          value: moodNumericValue(entry.mood),
        })),
    [entries]
  );

  const moodPath = useMemo(() => {
    if (recentMoodTrend.length === 0) {
      return "";
    }

    return recentMoodTrend
      .map((point, index) => {
        const x = recentMoodTrend.length === 1 ? 120 : (index / (recentMoodTrend.length - 1)) * 240;
        const y = 90 - point.value * 16;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [recentMoodTrend]);

  const balanceSlices = useMemo(() => {
    if (!balance?.data.length) {
      return [];
    }

    return balance.data.slice(0, 4).map((item, index) => ({
      label: item.name,
      value: item.balance_score,
      color: ["#83915c", "#9bb2b5", "#d7b35a", "#c9a65f"][index % 4],
    }));
  }, [balance]);

  const balanceGradient = balanceSlices
    .map((slice, index) => {
      const start = (index / Math.max(balanceSlices.length, 1)) * 360;
      const end = ((index + 1) / Math.max(balanceSlices.length, 1)) * 360;
      return `${slice.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (entryFilter === "good") {
        return entry.mood === "good" || entry.mood === "great";
      }
      if (entryFilter === "heavy") {
        return entry.mood === "low" || entry.mood === "neutral";
      }
      if (entryFilter === "week") {
        return isSameWeek(entry.entry_date);
      }
      return true;
    });
  }, [entries, entryFilter]);

  const heroSummary =
    entries.length > 0
      ? "Return to what the day actually felt like, then write the smallest honest note that helps tomorrow."
      : "This room should feel like a warm checkpoint, not homework. One useful sentence is enough to begin.";

  const focusPrompt = latestEntry
    ? latestEntry.body.slice(0, 120)
    : "What felt lighter after you slowed down?";

  const contextItems = [
    {
      label: "Latest reflection",
      value: latestEntry ? latestEntryDate : "Fresh start",
      detail: latestEntry ? latestEntry.title : "No note yet. Start with a small true thing.",
    },
    {
      label: "Life-area gravity",
      value: topLifeArea ? topLifeArea.name : "Unmapped",
      detail: topLifeArea
        ? `${topLifeArea.weight}% declared weight is currently anchored there.`
        : "Add a life area to give reflections more context.",
      href: "#journal-life-areas",
    },
    {
      label: "Balance signal",
      value: balance ? `${balance.meta.global_balance_score.toFixed(0)}` : "Pending",
      detail: strongestBalanceDrift
        ? `${strongestBalanceDrift.name} is drifting most from target share.`
        : "Balance insight wakes up as more lived data arrives.",
      href: "/life-areas",
    },
  ];

  const journalStatusMessage = errorMessage || feedback;

  return (
    <WorkspaceShell
      title="Journal"
      subtitle="Capture what happened and what it meant."
      module="journal"
      shellTone="dashboard-canonical"
      utilityDateLabel="Friday, May 23, 2025"
      utilityWeatherLabel="18 degC"
      hideAssistantNav
      hideRailFooterActions
    >
      <div className="journal-canonical-shell">
        <section className={`calendar-status-strip ${errorMessage ? "is-error" : "is-success"}`} aria-live="polite">
          <div className="calendar-status-copy">
            <small>{errorMessage ? "Journal status" : "Live view"}</small>
            <strong>{journalStatusMessage}</strong>
          </div>
          <div className="planning-status-actions">
            <button type="button" className="pill-link" onClick={() => void loadData()}>
              Refresh
            </button>
          </div>
        </section>

        <div className="journal-canonical-grid">
          <div className="journal-canonical-main">
            <DashboardHeroBand
              dateLabel="Friday, May 23, 2025"
              weatherLabel={`${entries.length} entries`}
              title="Today's reflection room"
              summary={heroSummary}
              progressLabel="Reflection cadence"
              progressPercent={Math.min(92, Math.max(22, entries.length * 9))}
              metrics={[
                { label: "Entries", value: `${entries.length}`, icon: <JournalGlyph name="journal" /> },
                { label: "Life areas", value: `${lifeAreas.length}`, icon: <JournalGlyph name="spark" /> },
                { label: "Mood", value: formatMood(latestEntry?.mood ?? null), icon: <JournalGlyph name="mood" /> },
                {
                  label: "Balance",
                  value: balance ? `${balance.meta.global_balance_score.toFixed(0)}` : "74",
                  icon: <JournalGlyph name="balance" />,
                },
              ]}
            />

            <DashboardFocusCard
              kicker="Reflection focus"
              kickerIcon={<JournalGlyph name="spark" />}
              title={focusPrompt}
              detail={
                latestEntry
                  ? `Return to ${latestEntry.title.toLowerCase()} and notice what still matters after the first feeling passed.`
                  : "Use one gentle prompt, name the mood honestly, and let the entry stay human instead of polished."
              }
              supportingLabel="Current context"
              supportingValue={
                latestEntryAreas.length > 0
                  ? latestEntryAreas.map((area) => area.name).join(" + ")
                  : "Today + Good mood + Health + Work"
              }
              meta={[
                { label: "Date", value: latestEntry ? latestEntryDate : "Today" },
                { label: "Mood", value: formatMood(latestEntry?.mood ?? "good") },
              ]}
              href="#journal-composer"
              cta="Start reflection"
              rationaleHref="#journal-reflection-ladder"
              rationaleLabel="Why this?"
            />

            <Panel id="journal-composer" title="Write your reflection" className="journal-canonical-composer">
              <form className="form-grid" onSubmit={createJournalEntry}>
                <div className="journal-composer-topline">
                  <label className="field">
                    <span>Title</span>
                    <input
                      className="list-row"
                      type="text"
                      value={entryTitle}
                      onChange={(event) => setEntryTitle(event.target.value)}
                      placeholder="Give this entry a title..."
                      disabled={isCreatingEntry}
                    />
                  </label>

                  <label className="field journal-date-field">
                    <span>Entry date</span>
                    <input
                      className="list-row"
                      type="date"
                      value={entryDate}
                      onChange={(event) => setEntryDate(event.target.value)}
                      disabled={isCreatingEntry}
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Reflection</span>
                  <textarea
                    className="list-row journal-canonical-textarea"
                    value={entryBody}
                    onChange={(event) => setEntryBody(event.target.value)}
                    placeholder="What happened today? How did it feel? What mattered most?"
                    rows={5}
                    disabled={isCreatingEntry}
                  />
                </label>

                <div className="journal-composer-context">
                  <div className="field">
                    <span>Mood</span>
                    <div className="journal-mood-chip-row" role="group" aria-label="Mood selection">
                      {(["low", "neutral", "good", "great"] as const).map((mood) => (
                        <MoodChip key={mood} label={mood} active={entryMood === mood} onClick={() => setEntryMood(mood)} />
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <span>Life areas</span>
                    <div className="journal-chip-row journal-chip-row-canonical">
                      {lifeAreas.length === 0 ? (
                        <p className="journal-empty-copy">No life areas yet. Add one below and the reflections will gain more shape.</p>
                      ) : (
                        lifeAreas.map((area) => (
                          <label
                            key={area.id}
                            className={`journal-chip journal-chip-canonical ${entryLifeAreaIds.includes(area.id) ? "is-active" : ""}`}
                            style={{ "--chip-accent": area.color } as CSSProperties}
                          >
                            <input
                              type="checkbox"
                              checked={entryLifeAreaIds.includes(area.id)}
                              onChange={() =>
                                setEntryLifeAreaIds((current) =>
                                  current.includes(area.id)
                                    ? current.filter((id) => id !== area.id)
                                    : [...current, area.id]
                                )
                              }
                              disabled={isCreatingEntry}
                            />
                            <span>{area.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="journal-composer-actions">
                  <div className="journal-composer-utilities" aria-hidden="true">
                    <span><JournalGlyph name="edit" /></span>
                    <span><JournalGlyph name="prompt" /></span>
                    <span><JournalGlyph name="date" /></span>
                  </div>
                  <button type="submit" className="btn-primary" disabled={isCreatingEntry}>
                    {isCreatingEntry ? "Saving..." : "Save entry"}
                  </button>
                </div>
              </form>
            </Panel>

            <Panel title="Recent entries" className="journal-canonical-entries">
              <div className="journal-entry-toolbar">
                <div className="journal-entry-filters" role="group" aria-label="Journal entry filters">
                  {([
                    { key: "all" as const, label: "All" },
                    { key: "good" as const, label: "Good" },
                    { key: "heavy" as const, label: "Heavy" },
                    { key: "week" as const, label: "This week" },
                  ]).map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      className={`filter-chip ${entryFilter === filter.key ? "is-active" : ""}`}
                      onClick={() => setEntryFilter(filter.key)}
                    >
                      {filter.label}
                    </button>
                  ))}
                  <a href="#journal-life-areas" className="filter-chip">Life areas</a>
                </div>
              </div>

              <div className="journal-entry-feed">
                {filteredEntries.length === 0 ? (
                  <div className="journal-entry-row journal-entry-row-empty">
                    <p>No entries match this view yet.</p>
                  </div>
                ) : (
                  filteredEntries.map((entry) => {
                    const linkedAreas = entry.life_areas ?? entry.lifeAreas ?? [];
                    return (
                      <article key={entry.id} className="journal-entry-row">
                        {editingEntryId === entry.id ? (
                          <div className="form-grid">
                            <label className="field">
                              <span>Title</span>
                              <input
                                className="list-row"
                                type="text"
                                value={editEntryTitle}
                                onChange={(event) => setEditEntryTitle(event.target.value)}
                                disabled={busyEntryId === entry.id}
                              />
                            </label>
                            <label className="field">
                              <span>Reflection</span>
                              <textarea
                                className="list-row"
                                rows={4}
                                value={editEntryBody}
                                onChange={(event) => setEditEntryBody(event.target.value)}
                                disabled={busyEntryId === entry.id}
                              />
                            </label>
                            <div className="journal-form-grid">
                              <label className="field">
                                <span>Mood</span>
                                <select
                                  className="list-row"
                                  value={editEntryMood}
                                  onChange={(event) =>
                                    setEditEntryMood(event.target.value as "low" | "neutral" | "good" | "great")
                                  }
                                  disabled={busyEntryId === entry.id}
                                >
                                  <option value="low">Low</option>
                                  <option value="neutral">Neutral</option>
                                  <option value="good">Good</option>
                                  <option value="great">Great</option>
                                </select>
                              </label>
                              <label className="field">
                                <span>Entry date</span>
                                <input
                                  className="list-row"
                                  type="date"
                                  value={editEntryDate}
                                  onChange={(event) => setEditEntryDate(event.target.value)}
                                  disabled={busyEntryId === entry.id}
                                />
                              </label>
                            </div>
                            <div className="field">
                              <span>Life areas</span>
                              <div className="journal-chip-row">
                                {lifeAreas.map((area) => (
                                  <label key={`edit-${entry.id}-${area.id}`} className="journal-chip">
                                    <input
                                      type="checkbox"
                                      checked={editEntryLifeAreaIds.includes(area.id)}
                                      onChange={() =>
                                        setEditEntryLifeAreaIds((current) =>
                                          current.includes(area.id)
                                            ? current.filter((id) => id !== area.id)
                                            : [...current, area.id]
                                        )
                                      }
                                      disabled={busyEntryId === entry.id}
                                    />
                                    <span>{area.name}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="row-inline">
                              <button
                                type="button"
                                className="pill-link"
                                onClick={() => void saveEntryEdit(entry.id)}
                                disabled={busyEntryId === entry.id}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="pill-link"
                                onClick={() => setEditingEntryId(null)}
                                disabled={busyEntryId === entry.id}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className={`journal-entry-mood-badge is-${entry.mood ?? "none"}`}>
                              <JournalGlyph name="mood" />
                            </div>
                            <div className="journal-entry-main">
                              <strong>{entry.title}</strong>
                              <div className="journal-entry-meta">
                                <span>{formatEntryDate(entry.entry_date)}</span>
                                <span className={`journal-inline-mood is-${entry.mood ?? "none"}`}>{formatMood(entry.mood)}</span>
                                {linkedAreas.map((area) => (
                                  <span key={area.id} className="journal-inline-chip" style={{ "--chip-accent": area.color } as CSSProperties}>
                                    {area.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="journal-entry-excerpt">{entry.body.slice(0, 160)}</p>
                            <div className="journal-entry-actions">
                              <button
                                type="button"
                                className="journal-icon-action"
                                onClick={() => startEntryEdit(entry)}
                                disabled={busyEntryId === entry.id}
                                aria-label="Edit entry"
                              >
                                <JournalGlyph name="edit" />
                              </button>
                              <button
                                type="button"
                                className="journal-icon-action"
                                onClick={() => void deleteEntry(entry.id)}
                                disabled={busyEntryId === entry.id}
                                aria-label="Delete entry"
                              >
                                <JournalGlyph name="trash" />
                              </button>
                            </div>
                          </>
                        )}
                      </article>
                    );
                  })
                )}
              </div>
            </Panel>

            <section id="journal-reflection-ladder" className="planning-ladder journal-reflection-ladder" aria-label="Reflection ladder">
              <div className="planning-ladder-copy">
                <h3>Your reflection ladder</h3>
                <p>Connect the day to feeling, context, and next intention.</p>
              </div>
              <div className="planning-ladder-chain">
                <article className="planning-ladder-node">
                  <small>Day event</small>
                  <strong>{latestEntry?.title ?? "A lighter morning changed the whole day"}</strong>
                </article>
                <article className="planning-ladder-node">
                  <small>Feeling</small>
                  <strong>{formatMood(latestEntry?.mood ?? "good")}</strong>
                </article>
                <article className="planning-ladder-node">
                  <small>Life area</small>
                  <strong>{latestEntryAreas[0]?.name ?? topLifeArea?.name ?? "Health"}</strong>
                </article>
                <article className="planning-ladder-node">
                  <small>Next intention</small>
                  <strong>Carry one calmer move into tomorrow</strong>
                </article>
              </div>
            </section>

            <details id="journal-life-areas" className="collapsible-panel">
              <summary>Manage life areas</summary>
              <div className="collapsible-content journal-life-area-management">
                <Panel title="Life areas" className="journal-management-panel">
                  <p className="journal-intro">
                    Life areas keep reflection tied to reality. Weight shows what should matter; balance shows what is actually getting time.
                  </p>
                  <form className="form-grid" onSubmit={createLifeArea}>
                    <label className="field">
                      <span>Name</span>
                      <input
                        className="list-row"
                        type="text"
                        value={newAreaName}
                        onChange={(event) => setNewAreaName(event.target.value)}
                        placeholder="Example: Relationships"
                        disabled={isCreatingArea}
                      />
                    </label>
                    <div className="journal-form-grid journal-life-area-form">
                      <label className="field">
                        <span>Color</span>
                        <input
                          className="list-row"
                          type="color"
                          value={newAreaColor}
                          onChange={(event) => setNewAreaColor(event.target.value)}
                          disabled={isCreatingArea}
                        />
                      </label>
                      <label className="field">
                        <span>Weight</span>
                        <input
                          className="list-row"
                          type="number"
                          min={0}
                          max={100}
                          value={newAreaWeight}
                          onChange={(event) => setNewAreaWeight(event.target.value)}
                          disabled={isCreatingArea}
                        />
                      </label>
                    </div>
                    <div className="journal-action-row">
                      <button type="submit" className="btn-secondary" disabled={isCreatingArea}>
                        {isCreatingArea ? "Adding..." : "Add area"}
                      </button>
                    </div>
                  </form>

                  <ul className="list journal-life-area-list">
                    {lifeAreas.length === 0 ? (
                      <li className="list-row journal-life-area-card">
                        <p>No life areas yet. Create one above.</p>
                      </li>
                    ) : (
                      lifeAreas.map((area) => (
                        <li key={area.id} className="list-row journal-life-area-card">
                          {editingAreaId === area.id ? (
                            <div className="form-grid">
                              <label className="field">
                                <span>Name</span>
                                <input
                                  className="list-row"
                                  type="text"
                                  value={editAreaName}
                                  onChange={(event) => setEditAreaName(event.target.value)}
                                  disabled={busyAreaId === area.id}
                                />
                              </label>
                              <div className="journal-form-grid">
                                <label className="field">
                                  <span>Color</span>
                                  <input
                                    className="list-row"
                                    type="color"
                                    value={editAreaColor}
                                    onChange={(event) => setEditAreaColor(event.target.value)}
                                    disabled={busyAreaId === area.id}
                                  />
                                </label>
                                <label className="field">
                                  <span>Weight</span>
                                  <input
                                    className="list-row"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={editAreaWeight}
                                    onChange={(event) => setEditAreaWeight(event.target.value)}
                                    disabled={busyAreaId === area.id}
                                  />
                                </label>
                              </div>
                              <div className="row-inline">
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => void saveLifeAreaEdit(area.id)}
                                  disabled={busyAreaId === area.id}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => setEditingAreaId(null)}
                                  disabled={busyAreaId === area.id}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="row-inline">
                                  <span className="dot" style={{ backgroundColor: area.color }} />
                                  <strong>{area.name}</strong>
                                </div>
                                <p>
                                  Weight: {area.weight}%{balance?.data ? ` | balance ${balance.data.find((item) => item.life_area_id === area.id)?.balance_score.toFixed(1) ?? "n/a"}` : ""}
                                </p>
                              </div>
                              <div className="row-inline">
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => startLifeAreaEdit(area)}
                                  disabled={busyAreaId === area.id}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => void deleteLifeArea(area.id)}
                                  disabled={busyAreaId === area.id}
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

          <aside className="journal-canonical-rail">
            <article className="dashboard-sidebar-card journal-writing-card">
              <div className="dashboard-sidebar-card-head">
                <h3>Write with care</h3>
                <span>...</span>
              </div>
              <p className="dashboard-sidebar-card-script">
                Your words are seeds. Give them honesty, not perfection.
              </p>
            </article>

            <article className="dashboard-sidebar-card">
              <div className="dashboard-sidebar-card-head">
                <h3>
                  <JournalGlyph name="prompt" />
                  <span>Quick prompts</span>
                </h3>
              </div>
              <div className="journal-prompt-list">
                {[
                  "What am I grateful for today?",
                  "What challenged me today?",
                  "What would make tomorrow better?",
                  "What did I learn about myself?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="journal-prompt-item"
                    onClick={() => {
                      setEntryBody(prompt);
                      document.getElementById("journal-composer")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    <span>{prompt}</span>
                    <small>{">"}</small>
                  </button>
                ))}
              </div>
            </article>

            <article className="dashboard-sidebar-card">
              <div className="dashboard-sidebar-card-head">
                <h3>Mood over time</h3>
              </div>
              <div className="journal-mood-chart">
                <svg viewBox="0 0 240 96" aria-hidden="true">
                  <path d="M0 90H240" className="journal-chart-axis" />
                  <path d="M0 58H240" className="journal-chart-axis is-soft" />
                  <path d="M0 26H240" className="journal-chart-axis is-soft" />
                  {moodPath ? <path d={moodPath} className="journal-chart-line" /> : null}
                  {recentMoodTrend.map((point, index) => {
                    const x = recentMoodTrend.length === 1 ? 120 : (index / (recentMoodTrend.length - 1)) * 240;
                    const y = 90 - point.value * 16;
                    return <circle key={point.id} cx={x} cy={y} r="4.6" className={`journal-chart-point is-${point.value}`} />;
                  })}
                </svg>
                <div className="journal-chart-labels">
                  {recentMoodTrend.length === 0 ? (
                    <span>Trend wakes up after the first entries.</span>
                  ) : (
                    <>
                      <span>{recentMoodTrend[0]?.label}</span>
                      <span>{recentMoodTrend[recentMoodTrend.length - 1]?.label}</span>
                    </>
                  )}
                </div>
              </div>
            </article>

            <article className="dashboard-sidebar-card">
              <div className="dashboard-sidebar-card-head">
                <h3>Life-area reflection</h3>
              </div>
              <div className="dashboard-balance-grid">
                <div className="dashboard-balance-donut" style={{ background: balanceGradient ? `conic-gradient(${balanceGradient})` : "conic-gradient(#83915c 0deg 360deg)" }}>
                  <div className="dashboard-balance-donut-inner">
                    <strong>{balance ? `${balance.meta.global_balance_score.toFixed(0)}%` : "74%"}</strong>
                  </div>
                </div>
                <ul className="dashboard-balance-legend">
                  {balanceSlices.length === 0 ? (
                    <li>
                      <small>Reflection balance appears after life-area activity accumulates.</small>
                    </li>
                  ) : (
                    balanceSlices.map((item) => (
                      <li key={item.label}>
                        <span className="dashboard-balance-dot" style={{ backgroundColor: item.color }} aria-hidden="true" />
                        <small>{item.label}</small>
                        <strong>{item.value.toFixed(0)}%</strong>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </article>
          </aside>
        </div>

        <DashboardContextRibbon title="Journal context" items={contextItems} />
      </div>
    </WorkspaceShell>
  );
}
