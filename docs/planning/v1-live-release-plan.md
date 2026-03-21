# V1 Live Release Plan

Last updated: 2026-03-21

## Release Goal

Deliver a production-ready V1 that can be:

- deployed on server infrastructure (API + web),
- installed and used on real phones,
- operated safely with monitoring and rollback.

## Pre-Release Gates

### Product and UX

- [ ] Legacy UX parity remediation complete (`NEST-103`, `NEST-106`, `NEST-113`).
- [ ] Localization baseline complete for `en` + `pl` (`NEST-109`, `NEST-110`).
- [ ] Offline/manual-sync baseline complete (`NEST-111`, `NEST-112`).

### Engineering and Security

- [ ] CI green for backend/web/mobile and OpenAPI checks.
- [ ] Security control verification passes.
- [ ] Database migration plan reviewed (including rollback strategy).
- [ ] Required environment secrets validated in staging.

### Deployment Readiness

- [ ] Server topology contract finalized (`NEST-115`).
- [ ] Deploy pipeline ready for API + web (`NEST-116`).
- [ ] Mobile release pipeline ready (`NEST-117`).
- [ ] Smoke suite available (`NEST-118`).
- [ ] Operations runbook finalized (`NEST-119`).

## Staging Rehearsal (Hard Gate)

- [ ] Execute full staging rehearsal (`NEST-120`) with:
  - deploy from clean commit,
  - migration execution,
  - smoke checks,
  - synthetic user journey (web + mobile),
  - rollback drill.
- [ ] Record rehearsal evidence and sign-off packet.

## Production Launch Checklist

### T-7 to T-1 Days

- [ ] Freeze release scope and branch/tag policy.
- [ ] Confirm on-call owner and incident escalation chain.
- [ ] Confirm backup freshness and restore path.
- [ ] Confirm observability dashboards and alerts.

### Launch Window

- [ ] Run release-train workflow for target tag.
- [ ] Deploy API and web in controlled order.
- [ ] Run DB migrations.
- [ ] Execute smoke suite immediately post-deploy.
- [ ] Publish mobile release/internal distribution build and verify install.

### Immediate Rollback Criteria

- P0 auth or data integrity failures.
- Reproducible sync corruption or blocked task/calendar flows.
- Critical crash loops on web/mobile core paths.

## Post-Launch

### Day 0

- [ ] Monitor error rates, API latency, queue depth, sync failures.
- [ ] Validate first real user loops (tasks/calendar/habits/journal).
- [ ] Validate notification and localization behavior.

### Day 1

- [ ] Review incident log and unresolved warnings.
- [ ] Review parity/a11y/regression follow-up items.
- [ ] Decide on first stabilization patch release.

### Week 1

- [ ] Publish post-launch summary and follow-up backlog.
- [ ] Confirm if release train cadence remains weekly or moves to hotfix mode.
