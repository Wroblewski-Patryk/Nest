# Mobile Staged Rollout Rehearsal (NEST-128)

Date: 2026-03-31
Task: `NEST-128`

## Rehearsal Command

- `powershell -ExecutionPolicy Bypass -File scripts/release/mobile-release.ps1 -Profile preview -Channel beta -RolloutPercent 10 -RollbackOnFailure true -DryRun`

## Evidence Summary

- Release flow supports channel-aware staged rollout:
  - `internal`, `beta`, `production`.
- Rollout percentage is explicit and configurable for staged channels.
- Halt criteria are explicit and configurable:
  - crash-rate threshold,
  - install-failure threshold,
  - API-error threshold.
- Rollback path is encoded and can be auto-invoked when halt criteria breach.

## Remaining Live Validation

- Physical-device rollout and rollback verification must still be executed in
  non-dry-run environment for full task closure:
  - install + launch on iOS and Android phones,
  - staged exposure validation in selected channel,
  - rollback decision and execution evidence capture.
