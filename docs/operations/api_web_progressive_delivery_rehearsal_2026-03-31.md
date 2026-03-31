# API/Web Progressive Delivery Rehearsal (NEST-127)

Date: 2026-03-31
Task: `NEST-127`

## Rehearsal Command

- `powershell -ExecutionPolicy Bypass -File scripts/release/deploy-api-web.ps1 -Environment staging -RolloutStrategy canary -CanaryPercent 10 -AutoPromote true -RollbackOnFailure true -DryRun`

## Evidence Summary

- Progressive rollout path executes explicit partial rollout stage (`10%` canary).
- Canary verification gates include:
  - API/web health checks,
  - strict SLO gate command (`integrations:sync-slo-check --json --strict`).
- Promotion stage is explicit and can be auto-promoted or manually gated.
- Post-promotion verification re-runs health + SLO gates.
- Rollback hook is automatically invoked on gate failure when
  `-RollbackOnFailure` is enabled.

## Result

- Dry-run rehearsal completed and validated progressive deployment sequence,
  monitored promotion, and rollback decision path.
