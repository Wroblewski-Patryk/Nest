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
