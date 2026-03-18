# Automation Execution History & Debugging (NEST-059)

Last updated: 2026-03-19

## Scope

Provide operator-facing visibility into automation runs and replay tooling.

## Web UI

Route: `/automations`

Added capabilities:

- status filtering for recent runs
- per-run inspection (action results + error message)
- replay button for selected run payload

## API

- `GET /api/v1/automations/runs`
- `GET /api/v1/automations/runs/{runId}`
- `POST /api/v1/automations/runs/{runId}/replay`

## Debug Baseline

- Run payload includes action trace (`action_results`) and error metadata.
- Replay creates a new run entry instead of mutating existing records.
- History remains append-only for auditability.
