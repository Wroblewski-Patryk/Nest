# Deployment Gate

Deployment is blocked unless every required gate is satisfied with evidence.

## Hard Blocks

- [ ] Build fails.
- [ ] Required tests fail.
- [ ] Environment variables or secrets are missing.
- [ ] Runtime service configuration is incomplete.
- [ ] Database migrations are missing, failing, or not applied.
- [ ] API contracts do not match deployed clients.
- [ ] Runtime errors appear in startup, smoke, worker, or browser logs.
- [ ] Health checks fail or are missing for a deployable service.
- [ ] Observability, alert route, or owner is missing for a critical runtime
  path.
- [ ] Rollback path is unknown or untested for the risk level.
- [ ] Feature flag, staged rollout, or disable path is missing for a high-blast
  radius change.
- [ ] Security validation is incomplete for auth, AI, money, or data ownership
  changes.

## Required Evidence

Before deployment, record:

- commit or build artifact
- environment target
- exact checks run
- migration status
- smoke test result
- observability or alerting expectation
- rollback procedure
- feature flag, staged rollout, or disable path when applicable
- known residual risks
- completed web-first runbook checklist:
  `docs/operations/nest_web_first_release_runbook_2026-05-02.md`

## Web-First Runtime Baseline

The current approved web-first deployment baseline is:

- API: PHP 8.4 / Laravel 12
- Web: Node 24 / Next.js 16
- Database: PostgreSQL 17
- Cache/session/queue: Redis 7
- Worker: Laravel `queue:work` against the configured Redis queue

Any deployment using a lower runtime or database version must be captured as an
explicit architecture decision before release.

## Release Rule

If any hard block exists, do not deploy. Move the task to `BLOCKED` or
`CHANGES_REQUIRED` and report the missing evidence.
