## Summary
- Scope:
- Risk level: Low / Medium / High

## Automated Checks
- [ ] `cd apps/api && php artisan test --testsuite=Integration --env=testing`
- [ ] `cd apps/api && php artisan test --testsuite=Unit --env=testing`
- [ ] `cd apps/api && php artisan test --testsuite=Feature --env=testing`
- [ ] `cd apps/api && php artisan security:controls:verify --json --env=testing`
- [ ] `cd apps/web && pnpm lint`
- [ ] `cd apps/web && pnpm exec tsc --noEmit`
- [ ] `cd apps/web && pnpm build`
- [ ] `cd apps/mobile && pnpm exec tsc --noEmit`
- [ ] `cd apps/mobile && pnpm exec expo export --platform web`
- Commands run:
  -
- Results:
  -

## Manual Smoke
- [ ] Authenticated dashboard or core module route checked
- [ ] Localized flow checked if language or locale behavior changed
- [ ] Web/mobile parity checked if shared module behavior changed
- [ ] OpenAPI lint run if contracts changed
- [ ] If this was a canonical-visual UI task, browser screenshots were compared
  to the approved reference and remaining mismatches were documented

Flows executed:
-

## Evidence Links
- Artifact folder or location:
- Screenshots:
- Canonical comparison notes:
- Logs:

## Context Updated
- [ ] `.codex/context/TASK_BOARD.md`
- [ ] `.codex/context/PROJECT_STATE.md`
- [ ] `docs/` updated where relevant

## Rollback Plan
-

## Production Hardening Checklist

- [ ] `DEFINITION_OF_DONE.md` satisfied.
- [ ] `INTEGRATION_CHECKLIST.md` satisfied where applicable.
- [ ] `NO_TEMPORARY_SOLUTIONS.md` satisfied.
- [ ] `DEPLOYMENT_GATE.md` reviewed for release/deploy impact.
- [ ] No mock, placeholder, fake, or temporary path remains.
- [ ] Feature uses real data/API/service paths.
- [ ] Feature works after refresh, reload, or restart where applicable.
- [ ] Result report includes what was done, files changed, how tested, what is incomplete, next steps, and decisions made.

## AI Safety Checklist

- [ ] Not applicable.
- [ ] `AI_TESTING_PROTOCOL.md` scenarios executed.
- [ ] Prompt injection checks passed.
- [ ] Data leakage checks passed.
- [ ] Unauthorized access checks passed.
- [ ] AI red-team findings resolved or explicitly accepted.
