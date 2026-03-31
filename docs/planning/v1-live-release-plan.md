# V1 Live Release Plan

Last updated: 2026-03-21

## Release Goal

Deliver a production-ready V1 that can be:

- deployed on server infrastructure (API + web),
- installed and used on real phones,
- operated safely with monitoring and rollback.

## Pre-Release Gates

### Product and UX

- [x] Legacy UX parity remediation complete (`NEST-103`, `NEST-106`, `NEST-113`).
- [x] Localization baseline complete for `en` + `pl` (`NEST-109`, `NEST-110`).
- [x] Offline/manual-sync baseline complete (`NEST-111`, `NEST-112`).

### Engineering and Security

- [ ] CI green for backend/web/mobile and OpenAPI checks.
- [ ] Security control verification passes.
- [ ] Database migration plan reviewed (including rollback strategy).
- [ ] Required environment secrets validated in staging.

### Deployment Readiness

- [x] Server topology contract finalized (`NEST-115`).
- [x] Deploy pipeline ready for API + web (`NEST-116`).
- [x] Mobile release pipeline ready (`NEST-117`).
- [x] Smoke suite available (`NEST-118`).
- [x] Operations runbook finalized (`NEST-119`).

## Staging Rehearsal (Hard Gate)

- [x] Execute full staging rehearsal (`NEST-120`) with:
  - deploy from clean commit,
  - migration execution,
  - smoke checks,
  - synthetic user journey (web + mobile),
  - rollback drill.
- [x] Record rehearsal evidence and sign-off packet.

## Production Launch Checklist

### T-7 to T-1 Days

- [ ] Freeze release scope and branch/tag policy.
- [ ] Confirm on-call owner and incident escalation chain.
- [ ] Confirm backup freshness and restore path.
- [ ] Confirm observability dashboards and alerts.

### Launch Window

- [ ] Run release-train workflow for target tag (`NEST-122`).
- [ ] Deploy API and web in controlled order (`NEST-122`).
- [ ] Run DB migrations (`NEST-122`).
- [ ] Execute smoke suite immediately post-deploy (`NEST-122`).
- [ ] Publish mobile release/internal distribution build and verify install (`NEST-122`).

Execution evidence (2026-03-21):
- `docs/operations/production_launch_window_execution_2026-03-21.md`
- Current packet is production-profile dry-run evidence; live sign-off is still
  required to close `NEST-122`.

### Immediate Rollback Criteria

- P0 auth or data integrity failures.
- Reproducible sync corruption or blocked task/calendar flows.
- Critical crash loops on web/mobile core paths.

## Post-Launch

### Day 0

- [ ] Monitor error rates, API latency, queue depth, sync failures (`NEST-123`).
- [ ] Validate first real user loops (tasks/calendar/habits/journal) (`NEST-123`).
- [ ] Validate notification and localization behavior (`NEST-123`).

### Day 1

- [ ] Review incident log and unresolved warnings (`NEST-123`).
- [ ] Review parity/a11y/regression follow-up items (`NEST-123`).
- [ ] Decide on first stabilization patch release (`NEST-123`).

### Week 1

- [ ] Publish post-launch summary and follow-up backlog (`NEST-124`).
- [ ] Confirm if release train cadence remains weekly or moves to hotfix mode (`NEST-124`).

## Post-V1 Handoff

- V2 target execution backlog is maintained in
  `docs/planning/v2-target-execution-plan.md` (`NEST-125..NEST-152`).
