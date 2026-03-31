# API + Web Deploy Pipeline (NEST-116)

Date: 2026-03-21
Task: `NEST-116`

## Pipeline Assets

- Workflow: `.github/workflows/deploy-api-web.yml`
- Script: `scripts/release/deploy-api-web.ps1`

## Flow

1. Build/test API.
2. Build web artifact.
3. Run DB migration (`php artisan migrate --force`).
4. Deploy partial traffic target (`canary` percent or `bluegreen` green stack).
5. Execute canary/partial verification gates:
   - API/web health checks,
   - strict integration SLO gate (`integrations:sync-slo-check --strict`).
6. Promote rollout (auto or manual gate).
7. Execute post-promotion verification and keep rollback hook armed.

## Paths

- Staging: `-Environment staging`
- Production: `-Environment production`
- Dry-run supported in both paths (`-DryRun`).
- Progressive options:
  - `-RolloutStrategy canary|bluegreen`
  - `-CanaryPercent <1-50>` (canary only)
  - `-AutoPromote $true|$false`
  - `-RollbackOnFailure $true|$false`

## Validation

- Pipeline script supports deterministic dry-run for both environments.
- Deployment steps include partial rollout, monitored promotion, and automated
  rollback hooks.
