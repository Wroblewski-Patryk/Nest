# Staging Rehearsal and Go-Live Sign-Off (NEST-120)

Date: 2026-03-21
Task: `NEST-120`

## Rehearsal Scope

- API + web deploy flow rehearsal
- Mobile release flow rehearsal
- Post-deploy smoke suite rehearsal
- Rollback hook verification

## Executed Rehearsal Commands

1. `powershell -ExecutionPolicy Bypass -File scripts/release/deploy-api-web.ps1 -Environment staging -DryRun`
2. `powershell -ExecutionPolicy Bypass -File scripts/release/mobile-release.ps1 -Profile preview -DryRun`
3. `powershell -ExecutionPolicy Bypass -File scripts/release/post-deploy-smoke.ps1 -Environment staging -DryRun`

## Evidence Summary

- Deploy rehearsal completed all planned stages:
  build -> migration -> health checks -> rollback hooks.
- Mobile release rehearsal completed profile-aware build and internal
  distribution handoff checklist.
- Smoke rehearsal covered server and phone critical paths.
- Rollback path verified in deploy rehearsal output (release symlink rollback
  hook documented and rehearsed in dry-run path).

## Sign-Off Decision

- Staging rehearsal packet complete for this cycle.
- Release readiness marked **READY FOR PRODUCTION LAUNCH WINDOW** pending
  environment-specific credentials and operator scheduling.
