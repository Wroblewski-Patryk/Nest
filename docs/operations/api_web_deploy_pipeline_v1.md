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
4. Execute API and web health checks.
5. Expose rollback hook path (release symlink strategy).

## Paths

- Staging: `-Environment staging`
- Production: `-Environment production`
- Dry-run supported in both paths (`-DryRun`).

## Validation

- Pipeline script supports deterministic dry-run for both environments.
- Deployment steps and rollback hooks are explicit and versioned in repo.
