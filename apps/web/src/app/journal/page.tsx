"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { Panel, WorkspaceShell } from "@/components/workspace-shell";
import {
  DashboardContextRibbon,
  DashboardFocusCard,
  DashboardHeroBand,
} from "@/components/workspace-primitives";
import { clearAuthSession } from "@/lib/auth-session";
import { apiRequest, nestApiClient } from "@/lib/api-client";
import { useTranslator } from "@/lib/ui-language";
import { getUserSafeErrorMessage } from "@/lib/ux-contract";

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

const JOURNAL_SHOWCASE_REFERENCE = new Date("2025-05-23T12:00:00");
const JOURNAL_SHOWCASE_ENTRY_COUNT = 18;
const JOURNAL_SHOWCASE_CADENCE = 68;

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
  return getUserSafeErrorMessage(error, "We couldn't update journal right now");
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

function formatMoodLabel(mood: JournalEntryMood, translateLabel: (key: string, fallback?: string) => string): string {
  return translateLabel(`web.journal.mood.${mood ?? "none"}`, formatMood(mood));
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
  labelText,
  active,
  onClick,
}: {
  labelText: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`journal-mood-chip ${active ? "is-active" : ""}`} onClick={onClick}>
      <span className="journal-mood-chip-icon" aria-hidden="true">
        <JournalGlyph name="mood" />
      </span>
      <span>{labelText}</span>
    </button>
  );
}

function shiftDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  next.setHours(12, 0, 0, 0);
  return next;
}

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function createShowcaseLifeAreas(): LifeAreaItem[] {
  return [
    { id: "showcase-area-health", name: "Health", color: "#83915c", weight: 82 },
    { id: "showcase-area-work", name: "Work", color: "#9bb2b5", weight: 75 },
    { id: "showcase-area-relationships", name: "Relationships", color: "#d7b35a", weight: 68 },
    { id: "showcase-area-finance", name: "Finance", color: "#c9a65f", weight: 70 },
  ];
}

function createShowcaseJournalEntries(referenceDate: Date, lifeAreas: LifeAreaItem[]): JournalEntryItem[] {
  return [
    {
      id: "showcase-entry-1",
      title: "A lighter morning changed the whole day",
      body: "Started slow with a walk and no rush. It gave me clarity before the work even began.",
      mood: "good",
      entry_date: toDateOnly(referenceDate),
      life_areas: [lifeAreas[0], lifeAreas[1]],
    },
    {
      id: "showcase-entry-2",
      title: "Hard conversation, honest outcome",
      body: "It was not easy to speak up, but we both left better understood and less guarded.",
      mood: "neutral",
      entry_date: toDateOnly(shiftDays(referenceDate, -1)),
      life_areas: [lifeAreas[2]],
    },
    {
      id: "showcase-entry-3",
      title: "Deep focus and real progress",
      body: "Protected focus blocks helped me finish what mattered without carrying the usual background noise.",
      mood: "good",
      entry_date: toDateOnly(shiftDays(referenceDate, -2)),
      life_areas: [lifeAreas[1], lifeAreas[3]],
    },
    {
      id: "showcase-entry-4",
      title: "An evening reset restored perspective",
      body: "I stopped pushing, cooked slowly, and could finally hear what had been tense all week.",
      mood: "great",
      entry_date: toDateOnly(shiftDays(referenceDate, -4)),
      life_areas: [lifeAreas[0]],
    },
  ];
}

function createShowcaseBalance(lifeAreas: LifeAreaItem[]): LifeAreaBalanceResponse {
  return {
    data: lifeAreas.map((area) => ({
      life_area_id: area.id,
      name: area.name,
      target_share: area.weight,
      actual_share: Math.max(40, area.weight - 7),
      balance_score: area.weight,
    })),
    meta: {
      global_balance_score: 74,
    },
  };
}

export default function JournalPage() {
  const router = useRouter();
  const t = useTranslator();
  const { confirm, confirmDialog } = useConfirmDialog();
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
  const [feedback, setFeedback] = useState(() => t("web.journal.feedback.initial", "Capture one honest note and let the pattern emerge over time."));
  const [errorMessage, setErrorMessage] = useState("");
  const [entryFilter, setEntryFilter] = useState<JournalFilter>("all");
  const [isLoading, setIsLoading] = useState(true);

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
        setFeedback(t("web.journal.feedback.loaded", "Journal and life areas loaded."));
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
  }, [handleUnauthorized, loadData, t]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "create-entry") {
      window.setTimeout(() => {
        document.getElementById("journal-composer")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        document.querySelector<HTMLElement>("[data-journal-entry-autofocus='true']")?.focus();
      }, 0);
    }
  }, []);

  const showcaseReferenceDate = useMemo(() => new Date(JOURNAL_SHOWCASE_REFERENCE), []);
  const showcaseLifeAreas = useMemo(() => createShowcaseLifeAreas(), []);
  const showcaseEntries = useMemo(
    () => createShowcaseJournalEntries(showcaseReferenceDate, showcaseLifeAreas),
    [showcaseLifeAreas, showcaseReferenceDate]
  );
  const showcaseBalance = useMemo(
    () => createShowcaseBalance(showcaseLifeAreas),
    [showcaseLifeAreas]
  );
  const hasMeaningfulLiveJournal =
    entries.length >= 3 &&
    lifeAreas.length >= 2 &&
    Boolean(balance?.data.length);
  const useJournalShowcase =
    !isLoading &&
    !isCreatingEntry &&
    !isCreatingArea &&
    !errorMessage && !hasMeaningfulLiveJournal;
  const displayEntries = useJournalShowcase ? showcaseEntries : entries;
  const displayLifeAreas = useJournalShowcase ? showcaseLifeAreas : lifeAreas;
  const displayBalance = useJournalShowcase ? showcaseBalance : balance;

  async function createJournalEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!entryTitle.trim()) {
      setErrorMessage(t("web.journal.validation.title_required", "Entry title is required."));
      return;
    }
    if (!entryBody.trim()) {
      setErrorMessage(t("web.journal.validation.body_required", "Reflection body is required."));
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
      setFeedback(t("web.journal.feedback.created", "Journal entry created."));
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
      setErrorMessage(t("web.life_areas.validation.name_required", "Life area name is required."));
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
      setFeedback(t("web.life_areas.feedback.created", "Life area created."));
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
      setErrorMessage(t("web.journal.validation.title_required", "Entry title is required."));
      return;
    }
    if (!editEntryBody.trim()) {
      setErrorMessage(t("web.journal.validation.body_required", "Reflection body is required."));
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
      setFeedback(t("web.journal.feedback.updated", "Journal entry updated."));
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
    if (
      !(await confirm({
        title: t("web.journal.confirm.delete_title", "Delete journal entry?"),
        description: t("web.journal.confirm.delete_body", "This removes the reflection from your journal timeline."),
        confirmLabel: t("web.journal.action.delete_entry", "Delete entry"),
        tone: "danger",
      }))
    ) {
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
      setFeedback(t("web.journal.feedback.deleted", "Journal entry deleted."));
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
      setErrorMessage(t("web.life_areas.validation.name_required", "Life area name is required."));
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
      setFeedback(t("web.life_areas.feedback.updated", "Life area updated."));
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
    if (
      !(await confirm({
        title: t("web.life_areas.confirm.delete_title", "Delete life area?"),
        description: t("web.journal.life_area.confirm_delete_body", "This removes the life area from balance and journal context."),
        confirmLabel: t("web.life_areas.action.delete_area", "Delete life area"),
        tone: "danger",
      }))
    ) {
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
      setFeedback(t("web.life_areas.feedback.deleted", "Life area deleted."));
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

  const latestEntry = displayEntries[0] ?? null;
  const latestEntryAreas = latestEntry ? latestEntry.life_areas ?? latestEntry.lifeAreas ?? [] : [];
  const latestEntryDate = latestEntry?.entry_date ? formatEntryDate(latestEntry.entry_date) : t("web.journal.empty.no_entry_yet", "No entry yet");
  const topLifeArea = useMemo(() => {
    if (displayLifeAreas.length === 0) {
      return null;
    }

    return [...displayLifeAreas].sort((a, b) => b.weight - a.weight)[0] ?? null;
  }, [displayLifeAreas]);
  const strongestBalanceDrift = useMemo(() => {
    if (!displayBalance?.data.length) {
      return null;
    }

    return [...displayBalance.data].sort(
      (left, right) =>
        Math.abs(right.actual_share - right.target_share) -
        Math.abs(left.actual_share - left.target_share)
    )[0];
  }, [displayBalance]);

  const recentMoodTrend = useMemo(
    () =>
      [...displayEntries]
        .slice(0, 7)
        .reverse()
        .map((entry) => ({
          id: entry.id,
          label: formatEntryDate(entry.entry_date),
          value: moodNumericValue(entry.mood),
        })),
    [displayEntries]
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
    if (!displayBalance?.data.length) {
      return [];
    }

    return displayBalance.data.slice(0, 4).map((item, index) => ({
      label: item.name,
      value: item.balance_score,
      color: ["#83915c", "#9bb2b5", "#d7b35a", "#c9a65f"][index % 4],
    }));
  }, [displayBalance]);

  const balanceGradient = balanceSlices
    .map((slice, index) => {
      const start = (index / Math.max(balanceSlices.length, 1)) * 360;
      const end = ((index + 1) / Math.max(balanceSlices.length, 1)) * 360;
      return `${slice.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  const filteredEntries = useMemo(() => {
    return displayEntries.filter((entry) => {
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
  }, [displayEntries, entryFilter]);
  const visibleEntries = useJournalShowcase ? filteredEntries.slice(0, 3) : filteredEntries;

  const heroSummary =
    displayEntries.length > 0
      ? t("web.journal.hero.summary.with_entries", "Return to what the day actually felt like, then write the smallest honest note that helps tomorrow.")
      : t("web.journal.hero.summary.empty", "This room should feel like a warm checkpoint, not homework. One useful sentence is enough to begin.");

  const focusPrompt = useJournalShowcase
    ? t("web.journal.focus.default_prompt", "What felt lighter after you slowed down?")
    : latestEntry
      ? latestEntry.body.slice(0, 120)
      : t("web.journal.focus.default_prompt", "What felt lighter after you slowed down?");

  const contextItems = [
    {
      label: t("web.journal.context.latest_reflection", "Latest reflection"),
      value: latestEntry ? latestEntryDate : t("web.journal.context.fresh_start", "Fresh start"),
      detail: latestEntry ? latestEntry.title : t("web.journal.context.no_note", "No note yet. Start with a small true thing."),
    },
    {
      label: t("web.journal.context.life_area_gravity", "Life-area gravity"),
      value: topLifeArea ? topLifeArea.name : t("web.journal.context.unmapped", "Unmapped"),
      detail: topLifeArea
        ? t("web.journal.context.declared_weight", "{weight}% declared weight is currently anchored there.").replace("{weight}", String(topLifeArea.weight))
        : t("web.journal.context.add_life_area", "Add a life area to give reflections more context."),
      href: "#journal-life-areas",
    },
    {
      label: t("web.journal.context.balance_signal", "Balance signal"),
      value: displayBalance ? `${displayBalance.meta.global_balance_score.toFixed(0)}` : t("web.journal.context.pending", "Pending"),
      detail: strongestBalanceDrift
        ? t("web.journal.context.drifting", "{name} is drifting most from target share.").replace("{name}", strongestBalanceDrift.name)
        : t("web.journal.context.balance_wakes", "Balance insight wakes up as more lived data arrives."),
      href: "/life-areas",
    },
  ];

  const journalStatusMessage = errorMessage || feedback;
  const showJournalStatusStrip = !useJournalShowcase;
  const composerDateValue = useJournalShowcase && !entryDate ? "2025-05-23" : entryDate;
  const showcaseReflectionCount = useJournalShowcase ? entryBody.length : null;

  return (
    <WorkspaceShell
      title={t("web.journal.title", "Journal")}
      subtitle={t("web.journal.subtitle", "Capture what happened and what it meant.")}
      module="journal"
      shellTone="dashboard-canonical"
      utilityDateLabel="Friday, May 23, 2025"
      utilityWeatherLabel="18 degC"
      hideAssistantNav
      hideRailFooterActions
    >
      <div className={`journal-canonical-shell ${useJournalShowcase ? "is-showcase" : ""}`}>
        {showJournalStatusStrip ? (
          <section className={`calendar-status-strip ${errorMessage ? "is-error" : "is-success"}`} aria-live="polite">
            <div className="calendar-status-copy">
              <small>{errorMessage ? t("web.journal.status.error_label", "Journal status") : t("web.journal.status.live_view", "Live view")}</small>
              <strong>{journalStatusMessage}</strong>
            </div>
            <div className="planning-status-actions">
              <button type="button" className="pill-link" onClick={() => void loadData()}>
                {t("web.common.action.refresh", "Refresh")}
              </button>
            </div>
          </section>
        ) : null}

        <div className="journal-canonical-grid">
          <div className="journal-canonical-main">
            <DashboardHeroBand
              dateLabel="Friday, May 23, 2025"
              weatherLabel={t("web.journal.hero.entries_count", "{count} entries").replace("{count}", String(useJournalShowcase ? JOURNAL_SHOWCASE_ENTRY_COUNT : displayEntries.length))}
              title={t("web.journal.hero.title", "Today's reflection room")}
              summary={heroSummary}
              progressLabel={t("web.journal.hero.progress", "Reflection cadence")}
              progressPercent={
                useJournalShowcase
                  ? JOURNAL_SHOWCASE_CADENCE
                  : Math.min(92, Math.max(22, displayEntries.length * 9))
              }
              metrics={[
                {
                  label: t("web.journal.metric.entries", "Entries"),
                  value: `${useJournalShowcase ? JOURNAL_SHOWCASE_ENTRY_COUNT : displayEntries.length}`,
                  icon: <JournalGlyph name="journal" />,
                },
                { label: t("web.journal.metric.life_areas", "Life areas"), value: `${displayLifeAreas.length}`, icon: <JournalGlyph name="spark" /> },
                { label: t("web.journal.metric.mood", "Mood"), value: formatMoodLabel(latestEntry?.mood ?? null, t), icon: <JournalGlyph name="mood" /> },
                {
                  label: t("web.journal.metric.balance", "Balance"),
                  value: displayBalance ? `${displayBalance.meta.global_balance_score.toFixed(0)}` : "74",
                  icon: <JournalGlyph name="balance" />,
                },
              ]}
            />

            {useJournalShowcase ? (
              <section className="journal-showcase-focus" aria-label={t("web.journal.focus.aria", "Reflection focus")}>
                <div className="journal-showcase-focus-copy">
                  <p className="journal-showcase-focus-kicker">
                    <span className="journal-showcase-focus-kicker-icon" aria-hidden="true">
                      <JournalGlyph name="spark" />
                    </span>
                    <span>{t("web.journal.focus.kicker", "Reflection focus")}</span>
                  </p>
                  <h2>{focusPrompt}</h2>
                  <div className="journal-showcase-focus-chips">
                    <span className="journal-showcase-focus-chip">{t("web.journal.meta.today", "Today")}</span>
                    <span className="journal-showcase-focus-chip">{t("web.journal.focus.mood_chip", "{mood} mood").replace("{mood}", formatMoodLabel(latestEntry?.mood ?? "good", t))}</span>
                    <span className="journal-showcase-focus-chip">
                      {latestEntryAreas.length > 0 ? latestEntryAreas.map((area) => area.name).join(" + ") : t("web.journal.showcase.health_work", "Health + Work")}
                    </span>
                  </div>
                  <p className="journal-showcase-focus-detail">
                    {t("web.journal.focus.detail", "Use one gentle prompt, name the feeling honestly, and let the entry stay human instead of polished.")}
                  </p>
                </div>
                <div className="journal-showcase-focus-actions">
                  <a href="#journal-composer" className="btn-primary">
                    {t("web.journal.action.start_reflection", "Start reflection")}
                  </a>
                </div>
              </section>
            ) : (
              <DashboardFocusCard
                kicker={t("web.journal.focus.kicker", "Reflection focus")}
                kickerIcon={<JournalGlyph name="spark" />}
                title={focusPrompt}
                detail={
                  latestEntry
                    ? t("web.journal.focus.live_detail", "Return to {title} and notice what still matters after the first feeling passed.").replace("{title}", latestEntry.title.toLowerCase())
                    : t("web.journal.focus.detail_mood", "Use one gentle prompt, name the mood honestly, and let the entry stay human instead of polished.")
                }
                supportingLabel={t("web.journal.focus.current_context", "Current context")}
                supportingValue={
                  latestEntryAreas.length > 0
                    ? latestEntryAreas.map((area) => area.name).join(" + ")
                    : t("web.journal.focus.default_context", "Today + Good mood + Health + Work")
                }
                meta={[
                  { label: t("web.journal.field.date", "Date"), value: latestEntry ? latestEntryDate : t("web.journal.meta.today", "Today") },
                  { label: t("web.journal.metric.mood", "Mood"), value: formatMoodLabel(latestEntry?.mood ?? "good", t) },
                ]}
                href="#journal-composer"
                cta={t("web.journal.action.start_reflection", "Start reflection")}
                rationaleHref="#journal-reflection-ladder"
                rationaleLabel={t("web.journal.action.why_this", "Why this?")}
              />
            )}

            <Panel
              id="journal-composer"
              title={t("web.journal.panel.write_reflection", "Write your reflection")}
              className={`journal-canonical-composer ${useJournalShowcase ? "is-showcase" : ""}`}
            >
              <form className="form-grid" onSubmit={createJournalEntry}>
                <div className="journal-composer-topline">
                  <label className="field">
                    <span>{t("web.common.field.title", "Title")}</span>
                    <input
                      className="list-row"
                      data-journal-entry-autofocus="true"
                      type="text"
                      value={entryTitle}
                      onChange={(event) => setEntryTitle(event.target.value)}
                      placeholder={t("web.journal.placeholder.title", "Give this entry a title...")}
                      disabled={isCreatingEntry}
                    />
                  </label>

                  <label className="field journal-date-field">
                    <span>{t("web.journal.field.entry_date", "Entry date")}</span>
                    <input
                      className="list-row"
                      type="date"
                      value={composerDateValue}
                      onChange={(event) => setEntryDate(event.target.value)}
                      disabled={isCreatingEntry}
                    />
                  </label>
                </div>

                <label className="field">
                  <span>{t("web.journal.field.reflection", "Reflection")}</span>
                  <textarea
                    className="list-row journal-canonical-textarea"
                    value={entryBody}
                    onChange={(event) => setEntryBody(event.target.value)}
                    placeholder={t("web.journal.placeholder.body", "What happened today? How did it feel? What mattered most?")}
                    rows={useJournalShowcase ? 3 : 5}
                    disabled={isCreatingEntry}
                  />
                  {useJournalShowcase ? <small className="journal-textarea-count">{showcaseReflectionCount}</small> : null}
                </label>

                <div className="journal-composer-context">
                  <div className="field">
                    <span>{t("web.journal.metric.mood", "Mood")}</span>
                    <div className="journal-mood-chip-row" role="group" aria-label={t("web.journal.mood.selection", "Mood selection")}>
                      {(["low", "neutral", "good", "great"] as const).map((mood) => (
                        <MoodChip key={mood} labelText={formatMoodLabel(mood, t)} active={entryMood === mood} onClick={() => setEntryMood(mood)} />
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <span>{t("web.journal.metric.life_areas", "Life areas")}</span>
                    <div className="journal-chip-row journal-chip-row-canonical">
                      {lifeAreas.length === 0 ? (
                        useJournalShowcase ? (
                          displayLifeAreas.map((area) => (
                            <span
                              key={`preview-${area.id}`}
                              className="journal-chip journal-chip-canonical is-active is-preview"
                              style={{ "--chip-accent": area.color } as CSSProperties}
                            >
                              <span>{area.name}</span>
                            </span>
                          ))
                        ) : (
                          <p className="journal-empty-copy">{t("web.journal.empty.life_areas_for_entry", "No life areas yet. Add one below and the reflections will gain more shape.")}</p>
                        )
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
                    {isCreatingEntry ? t("web.common.action.saving", "Saving...") : t("web.journal.action.save_entry", "Save entry")}
                  </button>
                </div>
              </form>
            </Panel>

            <Panel
              title={t("web.journal.panel.recent_entries", "Recent entries")}
              className={`journal-canonical-entries ${useJournalShowcase ? "is-showcase" : ""}`}
              actions={useJournalShowcase ? <a href="/journal" className="dashboard-inline-action">{t("web.journal.action.view_all_entries", "View all entries")}</a> : undefined}
            >
              <div className={`journal-entry-toolbar ${useJournalShowcase ? "is-showcase" : ""}`}>
                <div className="journal-entry-filters" role="group" aria-label={t("web.journal.filters.aria", "Journal entry filters")}>
                  {([
                    { key: "all" as const, label: t("web.journal.filters.all", "All") },
                    { key: "good" as const, label: t("web.journal.filters.good", "Good") },
                    { key: "heavy" as const, label: t("web.journal.filters.heavy", "Heavy") },
                    { key: "week" as const, label: t("web.journal.filters.week", "This week") },
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
                  <a href="#journal-life-areas" className="filter-chip">{t("web.journal.metric.life_areas", "Life areas")}</a>
                </div>
              </div>

              <div className="journal-entry-feed">
                {visibleEntries.length === 0 ? (
                  <div className="journal-entry-row journal-entry-row-empty">
                    <p>{t("web.journal.empty.no_matching_entries", "No entries match this view yet.")}</p>
                  </div>
                ) : (
                  visibleEntries.map((entry) => {
                    const linkedAreas = entry.life_areas ?? entry.lifeAreas ?? [];
                    return (
                      <article key={entry.id} className={`journal-entry-row ${useJournalShowcase ? "is-showcase" : ""}`}>
                        {editingEntryId === entry.id ? (
                          <div className="form-grid">
                            <label className="field">
                              <span>{t("web.common.field.title", "Title")}</span>
                              <input
                                className="list-row"
                                type="text"
                                value={editEntryTitle}
                                onChange={(event) => setEditEntryTitle(event.target.value)}
                                disabled={busyEntryId === entry.id}
                              />
                            </label>
                            <label className="field">
                              <span>{t("web.journal.field.reflection", "Reflection")}</span>
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
                                <span>{t("web.journal.metric.mood", "Mood")}</span>
                                <select
                                  className="list-row"
                                  value={editEntryMood}
                                  onChange={(event) =>
                                    setEditEntryMood(event.target.value as "low" | "neutral" | "good" | "great")
                                  }
                                  disabled={busyEntryId === entry.id}
                                >
                                  <option value="low">{t("web.journal.mood.low", "Low")}</option>
                                  <option value="neutral">{t("web.journal.mood.neutral", "Neutral")}</option>
                                  <option value="good">{t("web.journal.mood.good", "Good")}</option>
                                  <option value="great">{t("web.journal.mood.great", "Great")}</option>
                                </select>
                              </label>
                              <label className="field">
                                <span>{t("web.journal.field.entry_date", "Entry date")}</span>
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
                              <span>{t("web.journal.metric.life_areas", "Life areas")}</span>
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
                                {t("web.common.action.save", "Save")}
                              </button>
                              <button
                                type="button"
                                className="pill-link"
                                onClick={() => setEditingEntryId(null)}
                                disabled={busyEntryId === entry.id}
                              >
                                {t("web.common.action.cancel", "Cancel")}
                              </button>
                            </div>
                          </div>
                        ) : useJournalShowcase ? (
                          <>
                            <div className={`journal-entry-mood-badge is-${entry.mood ?? "none"}`}>
                              <JournalGlyph name="mood" />
                            </div>
                            <div className="journal-entry-main">
                              <strong>{entry.title}</strong>
                              <div className="journal-entry-meta">
                                <span>{formatEntryDate(entry.entry_date)}</span>
                                <span className={`journal-inline-mood is-${entry.mood ?? "none"}`}>{formatMoodLabel(entry.mood, t)}</span>
                                {linkedAreas.map((area) => (
                                  <span key={area.id} className="journal-inline-chip" style={{ "--chip-accent": area.color } as CSSProperties}>
                                    {area.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <p className="journal-entry-excerpt">{entry.body.slice(0, 112)}...</p>
                            <div className="journal-entry-actions" aria-hidden="true">
                              <span className="journal-entry-preview-icon">
                                <JournalGlyph name="edit" />
                              </span>
                              <span className="journal-entry-preview-icon">
                                <JournalGlyph name="trash" />
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={`journal-entry-mood-badge is-${entry.mood ?? "none"}`}>
                              <JournalGlyph name="mood" />
                            </div>
                            <div className="journal-entry-main">
                              <strong>{entry.title}</strong>
                              <div className="journal-entry-meta">
                                <span>{formatEntryDate(entry.entry_date)}</span>
                                <span className={`journal-inline-mood is-${entry.mood ?? "none"}`}>{formatMoodLabel(entry.mood, t)}</span>
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
                                aria-label={t("web.journal.action.edit_entry", "Edit entry")}
                              >
                                <JournalGlyph name="edit" />
                              </button>
                              <button
                                type="button"
                                className="journal-icon-action"
                                onClick={() => void deleteEntry(entry.id)}
                                disabled={busyEntryId === entry.id}
                                aria-label={t("web.journal.action.delete_entry", "Delete entry")}
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

            <section
              id="journal-reflection-ladder"
              className={`planning-ladder journal-reflection-ladder ${useJournalShowcase ? "is-preview-hidden" : ""}`}
              aria-label={t("web.journal.ladder.aria", "Reflection ladder")}
            >
              <div className="planning-ladder-copy">
                <h3>{t("web.journal.ladder.title", "Your reflection ladder")}</h3>
                <p>{t("web.journal.ladder.copy", "Connect the day to feeling, context, and next intention.")}</p>
              </div>
              <div className="planning-ladder-chain">
                <article className="planning-ladder-node">
                  <small>{t("web.journal.ladder.day_event", "Day event")}</small>
                  <strong>{latestEntry?.title ?? t("web.journal.showcase.entry_lighter_morning", "A lighter morning changed the whole day")}</strong>
                </article>
                <article className="planning-ladder-node">
                  <small>{t("web.journal.ladder.feeling", "Feeling")}</small>
                  <strong>{formatMoodLabel(latestEntry?.mood ?? "good", t)}</strong>
                </article>
                <article className="planning-ladder-node">
                  <small>{t("web.journal.ladder.life_area", "Life area")}</small>
                  <strong>{latestEntryAreas[0]?.name ?? topLifeArea?.name ?? t("web.journal.showcase.health", "Health")}</strong>
                </article>
                <article className="planning-ladder-node">
                  <small>{t("web.journal.ladder.next_intention", "Next intention")}</small>
                  <strong>{t("web.journal.ladder.next_intention_value", "Carry one calmer move into tomorrow")}</strong>
                </article>
              </div>
            </section>

            <details id="journal-life-areas" className={`collapsible-panel ${useJournalShowcase ? "is-preview-hidden" : ""}`}>
              <summary>{t("web.journal.life_area.manage", "Manage life areas")}</summary>
              <div className="collapsible-content journal-life-area-management">
                <Panel title={t("web.journal.metric.life_areas", "Life areas")} className="journal-management-panel">
                  <p className="journal-intro">
                    {t("web.journal.life_area.intro", "Life areas keep reflection tied to reality. Weight shows what should matter; balance shows what is actually getting time.")}
                  </p>
                  <form className="form-grid" onSubmit={createLifeArea}>
                    <label className="field">
                      <span>{t("web.life_areas.field.name", "Name")}</span>
                      <input
                        className="list-row"
                        type="text"
                        value={newAreaName}
                        onChange={(event) => setNewAreaName(event.target.value)}
                        placeholder={t("web.life_areas.placeholder.name", "Example: Relationships")}
                        disabled={isCreatingArea}
                      />
                    </label>
                    <div className="journal-form-grid journal-life-area-form">
                      <label className="field">
                        <span>{t("web.life_areas.field.color", "Color")}</span>
                        <input
                          className="list-row"
                          type="color"
                          value={newAreaColor}
                          onChange={(event) => setNewAreaColor(event.target.value)}
                          disabled={isCreatingArea}
                        />
                      </label>
                      <label className="field">
                        <span>{t("web.life_areas.field.weight", "Weight")}</span>
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
                        {isCreatingArea ? t("web.common.action.adding", "Adding...") : t("web.life_areas.action.add", "Add area")}
                      </button>
                    </div>
                  </form>

                  <ul className="list journal-life-area-list">
                    {lifeAreas.length === 0 ? (
                      <li className="list-row journal-life-area-card">
                        <p>{t("web.journal.empty.no_life_areas_create", "No life areas yet. Create one above.")}</p>
                      </li>
                    ) : (
                      lifeAreas.map((area) => (
                        <li key={area.id} className="list-row journal-life-area-card">
                          {editingAreaId === area.id ? (
                            <div className="form-grid">
                              <label className="field">
                                <span>{t("web.life_areas.field.name", "Name")}</span>
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
                                  <span>{t("web.life_areas.field.color", "Color")}</span>
                                  <input
                                    className="list-row"
                                    type="color"
                                    value={editAreaColor}
                                    onChange={(event) => setEditAreaColor(event.target.value)}
                                    disabled={busyAreaId === area.id}
                                  />
                                </label>
                                <label className="field">
                                  <span>{t("web.life_areas.field.weight", "Weight")}</span>
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
                                  {t("web.common.action.save", "Save")}
                                </button>
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => setEditingAreaId(null)}
                                  disabled={busyAreaId === area.id}
                                >
                                  {t("web.common.action.cancel", "Cancel")}
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
                                  {t("web.life_areas.field.weight", "Weight")}: {area.weight}%{balance?.data ? ` | ${t("web.journal.life_area.balance", "balance")} ${balance.data.find((item) => item.life_area_id === area.id)?.balance_score.toFixed(1) ?? "n/a"}` : ""}
                                </p>
                              </div>
                              <div className="row-inline">
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => startLifeAreaEdit(area)}
                                  disabled={busyAreaId === area.id}
                                >
                                  {t("web.common.action.edit", "Edit")}
                                </button>
                                <button
                                  type="button"
                                  className="pill-link"
                                  onClick={() => void deleteLifeArea(area.id)}
                                  disabled={busyAreaId === area.id}
                                >
                                  {t("web.common.action.delete", "Delete")}
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
                <h3>{t("web.journal.sidebar.write_with_care", "Write with care")}</h3>
                <span>...</span>
              </div>
              <p className="dashboard-sidebar-card-script">
                {t("web.journal.sidebar.write_copy", "Your words are seeds. Give them honesty, not perfection.")}
              </p>
              <div className="journal-writing-divider" aria-hidden="true" />
            </article>

            <article className="dashboard-sidebar-card journal-prompts-card">
              <div className="dashboard-sidebar-card-head">
                <h3>
                  <JournalGlyph name="prompt" />
                  <span>{t("web.journal.sidebar.quick_prompts", "Quick prompts")}</span>
                </h3>
              </div>
              <div className="journal-prompt-list">
                {[
                  t("web.journal.prompt.grateful", "What am I grateful for today?"),
                  t("web.journal.prompt.challenge", "What challenged me today?"),
                  t("web.journal.prompt.tomorrow", "What would make tomorrow better?"),
                  t("web.journal.prompt.learned", "What did I learn about myself?"),
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
                    <small className="journal-prompt-arrow">{">"}</small>
                  </button>
                ))}
              </div>
            </article>

            <article className="dashboard-sidebar-card journal-mood-trend-card">
              <div className="dashboard-sidebar-card-head">
                <h3>{t("web.journal.sidebar.mood_over_time", "Mood over time")}</h3>
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
                    <span>{t("web.journal.sidebar.trend_empty", "Trend wakes up after the first entries.")}</span>
                  ) : (
                    <>
                      <span>{recentMoodTrend[0]?.label}</span>
                      <span>{recentMoodTrend[recentMoodTrend.length - 1]?.label}</span>
                    </>
                  )}
                </div>
              </div>
            </article>

            <article className="dashboard-sidebar-card journal-life-reflection-card">
              <div className="dashboard-sidebar-card-head">
                <h3>{t("web.journal.sidebar.life_area_reflection", "Life-area reflection")}</h3>
              </div>
              <div className="dashboard-balance-grid">
                <div className="dashboard-balance-donut" style={{ background: balanceGradient ? `conic-gradient(${balanceGradient})` : "conic-gradient(#83915c 0deg 360deg)" }}>
                  <div className="dashboard-balance-donut-inner">
                    <strong>{displayBalance ? `${displayBalance.meta.global_balance_score.toFixed(0)}%` : "74%"}</strong>
                  </div>
                </div>
                <ul className="dashboard-balance-legend">
                  {balanceSlices.length === 0 ? (
                    <li>
                      <small>{t("web.journal.sidebar.balance_empty", "Reflection balance appears after life-area activity accumulates.")}</small>
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

            {useJournalShowcase ? (
              <article className="dashboard-sidebar-card journal-ladder-card">
                <div className="dashboard-sidebar-card-head">
                  <h3>{t("web.journal.ladder.title", "Your reflection ladder")}</h3>
                </div>
                <div className="journal-ladder-mini">
                  {[
                    { label: t("web.journal.ladder.day_event", "Day event"), value: latestEntry?.title ?? t("web.journal.showcase.lighter_morning_short", "A lighter morning") },
                    { label: t("web.journal.ladder.feeling", "Feeling"), value: formatMoodLabel(latestEntry?.mood ?? "good", t) },
                    { label: t("web.journal.ladder.life_area", "Life area"), value: latestEntryAreas[0]?.name ?? topLifeArea?.name ?? t("web.journal.showcase.health", "Health") },
                    { label: t("web.journal.ladder.next_intention", "Next intention"), value: t("web.journal.ladder.next_intention_value", "Carry one calmer move into tomorrow") },
                  ].map((item) => (
                    <div key={item.label} className="journal-ladder-mini-item">
                      <small>{item.label}</small>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
                <p className="dashboard-sidebar-card-note">{t("web.journal.sidebar.connected_note", "Connected to Calendar, Life Areas and Planning.")}</p>
              </article>
            ) : null}
          </aside>
        </div>

        {useJournalShowcase ? null : <DashboardContextRibbon title={t("web.journal.context.ribbon_title", "Journal context")} items={contextItems} />}
      </div>
      {confirmDialog}
    </WorkspaceShell>
  );
}
