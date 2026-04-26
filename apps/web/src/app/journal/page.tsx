"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { clearAuthSession } from "@/lib/auth-session";
import { nestApiClient } from "@/lib/api-client";

type LifeAreaItem = {
  id: string;
  name: string;
  color: string;
  weight: number;
  is_archived?: boolean;
};

type JournalEntryItem = {
  id: string;
  title: string;
  body: string;
  mood: "low" | "neutral" | "good" | "great" | null;
  entry_date: string;
  life_areas?: LifeAreaItem[];
  lifeAreas?: LifeAreaItem[];
};

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

function formatMood(mood: JournalEntryItem["mood"]): string {
  if (!mood) {
    return "none";
  }

  return mood;
}

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [lifeAreas, setLifeAreas] = useState<LifeAreaItem[]>([]);
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
  const [feedback, setFeedback] = useState("Add a reflection and tag life areas to make your balance easier to review.");
  const [errorMessage, setErrorMessage] = useState("");

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
    const [entriesResponse, lifeAreasResponse] = await Promise.all([
      nestApiClient.getJournalEntries({ per_page: 100 }),
      apiRequest<{ data: LifeAreaItem[] }>("/life-areas"),
    ]);

    setEntries((entriesResponse.data ?? []) as JournalEntryItem[]);
    setLifeAreas((lifeAreasResponse.data ?? []) as LifeAreaItem[]);
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
      })
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

  const topLifeArea = useMemo(() => {
    if (lifeAreas.length === 0) {
      return "n/a";
    }

    return [...lifeAreas].sort((a, b) => b.weight - a.weight)[0]?.name ?? "n/a";
  }, [lifeAreas]);

  return (
    <WorkspaceShell
      title="Journal + Reflection"
      subtitle="Capture what happened, how you felt, and which life areas need attention."
      module="journal"
    >
      <div className="stack">
        <MetricCard label="Entries total" value={String(entries.length)} />
        <MetricCard label="Life areas" value={String(lifeAreas.length)} />
        <MetricCard label="Top weighted area" value={topLifeArea} />
      </div>

      <Panel title="Quick Reflection">
        <form className="form-grid" onSubmit={createJournalEntry}>
          <label className="field">
            <span>Title</span>
            <input
              className="list-row"
              type="text"
              value={entryTitle}
              onChange={(event) => setEntryTitle(event.target.value)}
              placeholder="Example: Calm planning evening"
              disabled={isCreatingEntry}
            />
          </label>
          <label className="field">
            <span>Reflection</span>
            <textarea
              className="list-row"
              value={entryBody}
              onChange={(event) => setEntryBody(event.target.value)}
              placeholder="What worked? What felt heavy? What to improve tomorrow?"
              rows={4}
              disabled={isCreatingEntry}
            />
          </label>
          <div className="row-inline">
            <label className="field">
              <span>Mood</span>
              <select
                className="list-row"
                value={entryMood}
                onChange={(event) =>
                  setEntryMood(event.target.value as "low" | "neutral" | "good" | "great")
                }
                disabled={isCreatingEntry}
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
                value={entryDate}
                onChange={(event) => setEntryDate(event.target.value)}
                disabled={isCreatingEntry}
              />
            </label>
          </div>
          <div className="field">
            <span>Life areas</span>
            <div className="row-inline">
              {lifeAreas.map((area) => (
                <label key={area.id} className="pill-link">
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
                  />{" "}
                  {area.name}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={isCreatingEntry}>
            {isCreatingEntry ? "Saving..." : "Save reflection"}
          </button>
        </form>
      </Panel>

      <Panel title="Life Areas">
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
          <div className="row-inline">
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
            <button type="submit" className="btn-secondary" disabled={isCreatingArea}>
              {isCreatingArea ? "Adding..." : "Add area"}
            </button>
          </div>
        </form>

        <ul className="list">
          {lifeAreas.length === 0 ? (
            <li className="list-row">
              <p>No life areas yet. Create one above.</p>
            </li>
          ) : (
            lifeAreas.map((area) => (
              <li key={area.id} className="list-row">
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
                    <div className="row-inline">
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
                      <p>Weight: {area.weight}%</p>
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

      <Panel title="Recent Entries">
        <ul className="list">
          {entries.length === 0 ? (
            <li className="list-row">
              <p>No entries yet. Add the first one above.</p>
            </li>
          ) : (
            entries.map((entry) => {
              const linkedAreas = entry.life_areas ?? entry.lifeAreas ?? [];
              return (
                <li key={entry.id} className="list-row">
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
                      <div className="row-inline">
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
                        <div className="row-inline">
                          {lifeAreas.map((area) => (
                            <label key={`edit-${entry.id}-${area.id}`} className="pill-link">
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
                              />{" "}
                              {area.name}
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
                      <div>
                        <strong>{entry.title}</strong>
                        <p>
                          {entry.entry_date?.slice(0, 10)} | mood: {formatMood(entry.mood)}
                        </p>
                        <p>{entry.body.slice(0, 140)}</p>
                        {linkedAreas.length > 0 ? (
                          <p>Areas: {linkedAreas.map((area) => area.name).join(", ")}</p>
                        ) : null}
                      </div>
                      <div className="row-inline">
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => startEntryEdit(entry)}
                          disabled={busyEntryId === entry.id}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="pill-link"
                          onClick={() => void deleteEntry(entry.id)}
                          disabled={busyEntryId === entry.id}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </Panel>

      {feedback ? (
        <Panel title="Status">
          <p className="callout">{feedback}</p>
        </Panel>
      ) : null}

      {errorMessage ? (
        <Panel title="Error">
          <p className="callout state-error">{errorMessage}</p>
        </Panel>
      ) : null}
    </WorkspaceShell>
  );
}
