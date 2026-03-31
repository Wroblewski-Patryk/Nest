# Mobile Release Pipeline for Physical Devices (NEST-117)

Date: 2026-03-21
Task: `NEST-117`

## Pipeline Assets

- Workflow: `.github/workflows/mobile-release.yml`
- Script: `scripts/release/mobile-release.ps1`

## Build Profiles

- `preview`: internal distribution for physical-device testing.
- `production`: signed release candidate profile.
- Rollout channels:
  - `internal`: internal tester distribution,
  - `beta`: staged rollout to limited audience,
  - `production`: staged/full production rollout.

## Internal Distribution Flow

1. Trigger workflow in `preview` profile.
2. Generate iOS/Android builds through EAS profile.
3. Select rollout channel and staged percentage when channel is `beta` or
   `production`.
4. Share install links / rollout exposure based on channel.
5. Run artifact verification checklist before sign-off.
6. Evaluate halt criteria and trigger rollback path when thresholds are
   breached.

## Release Checklist Additions

- App install succeeds on physical iOS and Android devices.
- Auth/onboarding screens open after install.
- API connectivity path is verified.
- Sync/options controls are visible in app modal/settings surface.

## Validation

- Dry-run execution is supported:
  - `powershell -ExecutionPolicy Bypass -File scripts/release/mobile-release.ps1 -Profile preview -Channel beta -RolloutPercent 10 -RollbackOnFailure true -DryRun`
- Halt criteria (configurable in script params):
  - crash rate threshold,
  - install failure threshold,
  - API error rate threshold.
