# Release Train and Change Management Workflow (NEST-079)

## Scope

- Introduced repeatable release-train workflow with explicit quality gates.
- Added change-management checklist for release readiness and traceability.
- Added release manifest artifact generation for auditability.

## Cadence

- Target cadence: weekly release train for normal product updates.
- Emergency patches: out-of-band, but must still pass the same mandatory gates.

## Workflow

- GitHub Actions workflow:
  - `.github/workflows/release-train.yml`
- Trigger:
  - manual `workflow_dispatch`
- Inputs:
  - `release_tag`
  - `release_notes`
  - `run_staging_checks`

## Mandatory Gates

- code style check (`pint --test`)
- full backend suites (`Integration`, `Unit`, `Feature`)
- security control verification:
  - `php artisan security:controls:verify --json`
- integration sync SLO/error-budget gate (strict):
  - `php artisan integrations:sync-slo-check --json --strict`
  - release train is blocked on both `warning` and `critical` severity in strict
    mode.

## Staging-Oriented Optional Gates

- retention dry-run:
  - `php artisan tenants:retention-prune --dry-run --json`
- secrets rotation dry-run:
  - `php artisan secrets:rotate --dry-run --json`

## Change Management Checklist

- local checklist helper:
  - `scripts/release/release-train-checklist.ps1`
- required checklist dimensions:
  - quality gates status,
  - security controls status,
  - data lifecycle and secret operations readiness,
  - resilience drill review,
  - diff/changelog scope validation.

## Release Traceability

- workflow writes `release/manifest.txt` with:
  - release tag,
  - release notes,
  - UTC release timestamp,
  - commit SHA,
  - workflow metadata.
- manifest is uploaded as CI artifact (`release-manifest`).
