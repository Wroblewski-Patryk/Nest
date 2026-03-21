# MVP Execution Plan

Last updated: 2026-03-21

## Goal

Ship a deployable MVP that runs reliably:

- backend and web on a production server,
- mobile build installable and testable on a real phone,
- release process repeatable with rollback.

## Rules

- Keep tasks small, testable, and reversible.
- One main concern per commit.
- Run quality gate before every commit.
- Update `TASK_BOARD` and `PROJECT_STATE` after meaningful completion.

## Workstream A: Remaining Product Gaps

- [x] NEST-103 Build MCP screenshot parity packs for legacy UX-heavy tasks.
- [x] NEST-106 Execute legacy UX visual parity fixes and re-run UX evidence gate.
- [x] NEST-113 Re-run full UX evidence gate after parity fixes.

## Workstream B: Localization and User Preference Baseline

- [x] NEST-109 Deliver localization foundation (`en`, `pl`) across API/web/mobile.
- [x] NEST-110 Implement onboarding + account localization preference flows.

## Workstream C: Offline Queue + Manual Sync Baseline

- [x] NEST-111 Implement offline queue and manual force-sync baseline.
- [x] NEST-112 Implement manual sync retry + conflict resolution baseline.

## Workstream D: Production Deployment Readiness (Server + Phone)

- [x] NEST-115 Define production topology and environment contracts
  (domains, TLS, secrets, DB/Redis, queues, storage, cron, workers).
- [x] NEST-116 Implement production deploy pipeline for API + web
  (build, migrate, health checks, rollback hooks).
- [x] NEST-117 Prepare mobile production build/distribution pipeline
  (environment injection, signing, internal distribution).
- [x] NEST-118 Create end-to-end smoke suite for post-deploy verification
  (auth, tasks, sync trigger, critical UX paths).
- [x] NEST-119 Finalize production operations runbook
  (alerts, incident flow, backup restore steps, release ownership).
- [x] NEST-120 Execute staging rehearsal and production go-live sign-off.

## Exit Criteria

- Server deployment is reproducible from documented pipeline.
- Mobile build is installable on physical device from documented flow.
- Smoke checks pass on staging and production candidate.
- Rollback path is tested and documented.

## Progress Log

- 2026-03-21: plan expanded to full MVP execution-to-deploy path.
- 2026-03-21: execution wave `NEST-103..NEST-121` completed and reconciled.
