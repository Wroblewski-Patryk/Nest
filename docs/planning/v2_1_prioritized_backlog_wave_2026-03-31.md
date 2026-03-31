# V2.1 Prioritized Backlog Wave

Date: 2026-03-31  
Source tasks: `NEST-151`, `NEST-152`

## Purpose

Define the first V2.1 execution wave based on current V2 readiness and
stabilization findings, with strict priority on live-evidence closure and
operational risk reduction.

## Inputs

- `docs/operations/v2_production_readiness_review_2026-03-31.md`
- `docs/operations/v2_ga_30_day_stabilization_execution_packet_2026-03-31.md`
- `docs/operations/week1_stabilization_summary_2026-03-31.md`
- `.codex/context/TASK_BOARD.md` open reliability/release tasks

## Priority Order

### P0 - Launch and live-evidence closure (blocking V2 GA closure)

1. `NEST-122` Execute production launch window checklist in non-dry-run path.
2. `NEST-123` Capture Day0/Day1 live operational validation.
3. `NEST-125` Establish real-traffic observability baseline and top failure
   modes.
4. `NEST-128` Validate mobile staged rollout rollback on physical devices.
5. `NEST-129` Publish updated stabilization gate decision from live evidence.
6. `NEST-152` Append GA + Day0/Day1/Week1/Week4 live checkpoints and close.

### P1 - Reliability hardening from current incidents

1. Resolve `InsightsTrendApiTest` monthly habits bucket mismatch and add
   boundary regression coverage.
2. Add deterministic time-window test fixtures for insights trend aggregation
   (month/week bucket edge dates).
3. Re-run production-profile smoke suite after trend fix and attach results to
   stabilization docs.

### P2 - Post-closure optimization wave

1. Tune activation funnel instrumentation quality based on first live-traffic
   baseline (`NEST-150` follow-up).
2. Refine dunning recovery thresholds and failure diagnostics from live billing
   recovery outcomes (`NEST-149` follow-up).
3. Improve copilot safety regression fixture maintenance workflow to prevent
   schema drift reoccurrence (`NEST-144` follow-up).

## Execution Policy

- Keep one primary task per commit.
- No task closure without attached evidence artifacts.
- Live-environment steps must be explicitly marked as non-dry-run.
- Keep `.codex/context/TASK_BOARD.md` and `.codex/context/PROJECT_STATE.md`
  synchronized after each completed item.

## Exit Criteria for This Wave

- All P0 items are closed with live evidence attached.
- P1 reliability incidents are either fixed and validated or explicitly risk
  accepted with owners and due dates.
- A refreshed V2.1 continuation queue is published for the next execution round.
