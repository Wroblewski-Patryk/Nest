"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AutomationRuleItem, AutomationRunItem, UiAsyncState } from "@nest/shared-types";
import { MetricCard, Panel, WorkspaceShell } from "@/components/workspace-shell";
import { nestApiClient } from "@/lib/api-client";
import { STATE_LABELS } from "@/lib/ux-contract";

const ACTION_OPTIONS = [
  "create_journal_entry",
  "send_notification",
] as const;
type ActionOption = (typeof ACTION_OPTIONS)[number];

export default function AutomationsPage() {
  const [state, setState] = useState<UiAsyncState>("loading");
  const [detail, setDetail] = useState("Loading automation rules...");
  const [rules, setRules] = useState<AutomationRuleItem[]>([]);
  const [runs, setRuns] = useState<AutomationRunItem[]>([]);
  const [selectedRun, setSelectedRun] = useState<AutomationRunItem | null>(null);
  const [name, setName] = useState("Weekly reflection automation");
  const [actionType, setActionType] = useState<ActionOption>("create_journal_entry");
  const [runStatusFilter, setRunStatusFilter] = useState<"all" | "success" | "failed" | "skipped">("all");
  const [busyRuleId, setBusyRuleId] = useState<string | null>(null);
  const [busyRunId, setBusyRunId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadData = useCallback(async (statusFilter: "all" | "success" | "failed" | "skipped" = runStatusFilter) => {
    const [rulesResponse, runsResponse] = await Promise.all([
      nestApiClient.getAutomationRules({ per_page: 20 }),
      nestApiClient.getAutomationRuns({
        per_page: 10,
        ...(statusFilter === "all" ? {} : { status: statusFilter }),
      }),
    ]);
    setRules(rulesResponse.data ?? []);
    setRuns(runsResponse.data ?? []);
  }, [runStatusFilter]);

  useEffect(() => {
    let mounted = true;

    loadData(runStatusFilter)
      .then(() => {
        if (!mounted) return;
        setState("success");
        setDetail("Automation API calls succeeded.");
      })
      .catch((error) => {
        if (!mounted) return;

        const status =
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          typeof (error as { status?: unknown }).status === "number"
            ? String((error as { status: number }).status)
            : "n/a";

        setState("error");
        setDetail(`Automation API calls failed (HTTP ${status}).`);
      });

    return () => {
      mounted = false;
    };
  }, [loadData, runStatusFilter]);

  const createRule = useCallback(async () => {
    setIsCreating(true);
    try {
      const actions =
        actionType === "create_journal_entry"
          ? [
              {
                type: "create_journal_entry",
                payload: {
                  title: "Automation {{event.task_title}}",
                  body: "Auto-generated weekly reflection note.",
                },
              },
            ]
          : [
              {
                type: "send_notification",
                payload: {
                  channel: "in_app",
                  message: "Automation executed for {{event.task_title}}.",
                },
              },
            ];

      await nestApiClient.createAutomationRule({
        name,
        status: "active",
        trigger: {
          type: "event",
          event_name: "tasks.task.completed",
        },
        conditions: [
          {
            field: "event.module",
            operator: "equals",
            value: "tasks",
          },
        ],
        actions,
      });

      await loadData();
      setState("success");
      setDetail("Rule created and list refreshed.");
    } catch (error) {
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status?: unknown }).status === "number"
          ? String((error as { status: number }).status)
          : "n/a";
      setState("error");
      setDetail(`Rule creation failed (HTTP ${status}).`);
    } finally {
      setIsCreating(false);
    }
  }, [actionType, loadData, name]);

  const toggleRule = useCallback(
    async (rule: AutomationRuleItem) => {
      setBusyRuleId(rule.id);
      try {
        await nestApiClient.updateAutomationRule(rule.id, {
          status: rule.status === "active" ? "paused" : "active",
        });
        await loadData();
      } finally {
        setBusyRuleId(null);
      }
    },
    [loadData]
  );

  const executeRule = useCallback(
    async (ruleId: string) => {
      setBusyRuleId(ruleId);
      try {
        await nestApiClient.executeAutomationRule(ruleId, {
          trigger_payload: {
            event: {
              module: "tasks",
              task_title: "Manual execution",
            },
          },
        });
        await loadData();
      } finally {
        setBusyRuleId(null);
      }
    },
    [loadData]
  );

  const inspectRun = useCallback(async (runId: string) => {
    setBusyRunId(runId);
    try {
      const response = await nestApiClient.getAutomationRun(runId);
      setSelectedRun(response.data);
    } finally {
      setBusyRunId(null);
    }
  }, []);

  const replayRun = useCallback(
    async (runId: string) => {
      setBusyRunId(runId);
      try {
        await nestApiClient.replayAutomationRun(runId);
        await loadData();
      } finally {
        setBusyRunId(null);
      }
    },
    [loadData]
  );

  const metrics = useMemo(
    () => [
      { label: "Rules", value: String(rules.length) },
      { label: "Active", value: String(rules.filter((rule) => rule.status === "active").length) },
      { label: "Runs", value: String(runs.length) },
    ],
    [rules, runs]
  );

  return (
    <WorkspaceShell
      title="Automations"
      subtitle="Create trigger-based workflows and control active/paused execution."
    >
      <div className="stack">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      <Panel title="Builder">
        <div className="panel-content">
          <p className="callout">Create a basic automation and run it manually for verification.</p>
          <label className="mono-note" htmlFor="rule-name">
            Rule name
          </label>
          <input
            id="rule-name"
            className="list-row"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <label className="mono-note" htmlFor="rule-action">
            Action type
          </label>
          <select
            id="rule-action"
            className="list-row"
            value={actionType}
            onChange={(event) => setActionType(event.target.value as ActionOption)}
          >
            {ACTION_OPTIONS.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
          <button className="pill-link" onClick={createRule} disabled={isCreating || name.trim().length === 0}>
            {isCreating ? "Creating..." : "Create Rule"}
          </button>
        </div>
      </Panel>

      <Panel title="Rule Control">
        <ul className="list">
          {rules.map((rule) => (
            <li className="list-row" key={rule.id}>
              <div>
                <strong>{rule.name}</strong>
                <p>Status: {rule.status}</p>
              </div>
              <div className="row-inline">
                <button className="pill-link" onClick={() => toggleRule(rule)} disabled={busyRuleId === rule.id}>
                  {rule.status === "active" ? "Pause" : "Activate"}
                </button>
                <button className="pill-link" onClick={() => executeRule(rule.id)} disabled={busyRuleId === rule.id}>
                  Run
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Recent Runs">
        <div className="panel-content">
          <label className="mono-note" htmlFor="run-filter">
            Run status filter
          </label>
          <select
            id="run-filter"
            className="list-row"
            value={runStatusFilter}
            onChange={(event) => {
              const value = event.target.value as "all" | "success" | "failed" | "skipped";
              setRunStatusFilter(value);
              loadData(value).catch(() => {
                setState("error");
                setDetail("Failed to refresh run list with selected filter.");
              });
            }}
          >
            <option value="all">all</option>
            <option value="success">success</option>
            <option value="failed">failed</option>
            <option value="skipped">skipped</option>
          </select>
        </div>
        <ul className="list">
          {runs.map((run) => (
            <li className="list-row" key={run.id}>
              <div>
                <strong>{run.status}</strong>
                <p>Rule: {run.rule_id}</p>
                {run.error_code ? <p>Error: {run.error_code}</p> : null}
              </div>
              <div className="row-inline">
                <span className="pill">{new Date(run.started_at).toLocaleTimeString("pl-PL")}</span>
                <button className="pill-link" onClick={() => inspectRun(run.id)} disabled={busyRunId === run.id}>
                  Inspect
                </button>
                <button className="pill-link" onClick={() => replayRun(run.id)} disabled={busyRunId === run.id}>
                  Replay
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Run Debug">
        {selectedRun ? (
          <div className="panel-content">
            <p className="callout">
              Selected run: {selectedRun.id} ({selectedRun.status})
            </p>
            <pre className="mono-note">{JSON.stringify(selectedRun.action_results ?? [], null, 2)}</pre>
            {selectedRun.error_message ? <pre className="mono-note">{selectedRun.error_message}</pre> : null}
          </div>
        ) : (
          <p className="callout">Choose a run with Inspect to view action trace and errors.</p>
        )}
      </Panel>

      <Panel title="Automation API Status">
        <div className="panel-content">
          <span className={`pill state-${state}`}>{STATE_LABELS[state]}</span>
          <p className="callout">{detail}</p>
        </div>
      </Panel>
    </WorkspaceShell>
  );
}
