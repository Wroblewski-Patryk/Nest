# Post-Deploy Smoke Suite v1 (NEST-118)

Date: 2026-03-21
Task: `NEST-118`

## Assets

- Workflow: `.github/workflows/post-deploy-smoke.yml`
- Script: `scripts/release/post-deploy-smoke.ps1`

## Covered Critical Paths

- API health route
- Auth baseline route access behavior
- Web core routes (`/`, `/tasks`, `/calendar`)
- Mobile phone checklist: auth/onboarding, tasks, calendar conflict queue,
  manual sync controls

## Environments

- Staging candidate
- Production candidate

## Validation

- `powershell -ExecutionPolicy Bypass -File scripts/release/post-deploy-smoke.ps1 -Environment staging -DryRun`
