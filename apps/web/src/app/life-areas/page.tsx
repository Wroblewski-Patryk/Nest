"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConfirmDialog } from "@/components/confirm-dialog";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
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

type LifeAreaBalanceItem = {
  life_area_id: string;
  name: string;
  actual_share: number;
  target_share: number;
  balance_score: number;
};

type LifeAreaBalanceResponse = {
  data: LifeAreaBalanceItem[];
  meta: {
    global_balance_score: number;
  };
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
  return getUserSafeErrorMessage(error, "We couldn't update life areas right now");
}

export default function LifeAreasPage() {
  const router = useRouter();
  const t = useTranslator();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [lifeAreas, setLifeAreas] = useState<LifeAreaItem[]>([]);
  const [balance, setBalance] = useState<LifeAreaBalanceResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editAreaName, setEditAreaName] = useState("");
  const [editAreaColor, setEditAreaColor] = useState("#789262");
  const [editAreaWeight, setEditAreaWeight] = useState("50");
  const [busyAreaId, setBusyAreaId] = useState<string | null>(null);

  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaColor, setNewAreaColor] = useState("#789262");
  const [newAreaWeight, setNewAreaWeight] = useState("50");

  const [feedback, setFeedback] = useState(() => t("web.life_areas.feedback.initial", "Manage life areas here and keep an eye on your current balance."));
  const [errorMessage, setErrorMessage] = useState("");

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    router.replace("/auth");
  }, [router]);

  const loadData = useCallback(async () => {
    const [areasResponse, balanceResponse] = await Promise.all([
      apiRequest<{ data: LifeAreaItem[] }>("/life-areas"),
      nestApiClient.getLifeAreaBalance({ window_days: 30 }),
    ]);

    setLifeAreas(areasResponse.data ?? []);
    setBalance(balanceResponse as unknown as LifeAreaBalanceResponse);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadData()
      .then(() => {
        if (!mounted) {
          return;
        }
        setFeedback(t("web.life_areas.feedback.loaded", "Life areas loaded."));
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
  }, [handleUnauthorized, loadData, t]);

  async function createLifeArea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newAreaName.trim()) {
      setErrorMessage(t("web.life_areas.validation.name_required", "Life area name is required."));
      return;
    }

    setIsCreating(true);
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
      setIsCreating(false);
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
        description: t("web.life_areas.confirm.delete_body", "This removes the life area from balance and planning context. Use this only when the area is no longer part of the workspace."),
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

  const balanceMap = useMemo(() => {
    const entries = balance?.data ?? [];
    return new Map(entries.map((item) => [item.life_area_id, item]));
  }, [balance]);

  return (
    <WorkspaceShell
      title={t("web.life_areas.title", "Life Areas")}
      subtitle={t("web.life_areas.subtitle", "Set life priorities and see whether daily actions stay aligned.")}
      module="life_areas"
      shellTone="dashboard-canonical"
      utilityDateLabel="Friday, May 23, 2025"
      utilityWeatherLabel="18°C"
      hideRailFooterActions
    >
      <div className="daily-system-shell">
        <div className="stack daily-system-metrics">
          <MetricCard label={t("web.life_areas.metric.areas", "Areas")} value={String(lifeAreas.length)} />
          <MetricCard
            label={t("web.life_areas.metric.global_balance", "Global balance")}
            value={balance ? balance.meta.global_balance_score.toFixed(1) : "n/a"}
          />
          <MetricCard
            label={t("web.life_areas.metric.top_weight", "Top weight")}
            value={lifeAreas.length > 0 ? `${Math.max(...lifeAreas.map((item) => item.weight))}%` : "n/a"}
          />
        </div>

        <Panel title={t("web.life_areas.context.title", "Where life areas fit")} className="daily-system-panel daily-system-context">
          <p className="daily-system-context-copy">
            {t("web.life_areas.context.copy", "Life areas give Journal, Planning, and Dashboard balance cues a shared language without becoming a separate daily destination.")}
          </p>
          <div className="daily-system-context-links">
            <Link href="/journal?action=create-entry">{t("web.life_areas.context.reflect", "Reflect in Journal")}</Link>
            <Link href="/tasks">{t("web.life_areas.context.open_planning", "Open Planning")}</Link>
            <Link href="/dashboard">{t("web.common.link.dashboard", "Return to Dashboard")}</Link>
          </div>
        </Panel>

      <Panel title={t("web.life_areas.panel.create", "Create life area")} className="daily-system-panel daily-system-composer">
        <form className="form-grid" onSubmit={createLifeArea}>
          <label className="field">
            <span>{t("web.life_areas.field.name", "Name")}</span>
            <input
              className="list-row"
              type="text"
              value={newAreaName}
              onChange={(event) => setNewAreaName(event.target.value)}
              placeholder={t("web.life_areas.placeholder.name", "Example: Relationships")}
              disabled={isCreating}
            />
          </label>
          <div className="row-inline">
            <label className="field">
              <span>{t("web.life_areas.field.color", "Color")}</span>
              <input
                className="list-row"
                type="color"
                value={newAreaColor}
                onChange={(event) => setNewAreaColor(event.target.value)}
                disabled={isCreating}
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
                disabled={isCreating}
              />
            </label>
            <button type="submit" className="btn-primary" disabled={isCreating}>
              {isCreating ? t("web.common.action.adding", "Adding...") : t("web.life_areas.action.add", "Add area")}
            </button>
          </div>
        </form>
      </Panel>

      <Panel title={t("web.life_areas.panel.library", "Life area library")} className="daily-system-panel daily-system-list-panel">
        <ul className="list">
          {lifeAreas.length === 0 ? (
            <li className="list-row">
              <p>{t("web.life_areas.empty", "No life areas yet. Add your first one above.")}</p>
            </li>
          ) : (
            lifeAreas.map((area) => {
              const score = balanceMap.get(area.id);
              return (
                <li key={area.id} className="list-row">
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
                      <div className="row-inline">
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
                          {t("web.life_areas.target_share", "target")} {area.weight}%{score ? ` | ${t("web.life_areas.actual_share", "actual")} ${Math.round(score.actual_share * 100)}%` : ""}
                        </p>
                      </div>
                      <div className="row-inline">
                        <span className="pill">{score ? score.balance_score.toFixed(1) : "n/a"}</span>
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
              );
            })
          )}
        </ul>
      </Panel>

        {feedback ? (
          <Panel title={t("web.common.panel.status", "Status")} className="daily-system-panel daily-system-status">
            <p className="callout">{feedback}</p>
          </Panel>
        ) : null}
        {errorMessage ? (
          <Panel title={t("web.common.panel.error", "Error")} className="daily-system-panel daily-system-status">
            <p className="callout state-error">{errorMessage}</p>
          </Panel>
        ) : null}
      </div>
      {confirmDialog}
    </WorkspaceShell>
  );
}
