# Day0/Day1 Operational Validation Packet (NEST-123)

Date: 2026-03-31
Task: `NEST-123`

## Scope

- Prepare and execute Day0/Day1 validation checklist using available
  environment evidence.
- Record incidents and regression outcomes.
- Document first stabilization patch decision.

## Executed Validation Commands

1. `powershell -ExecutionPolicy Bypass -File scripts/release/post-deploy-smoke.ps1 -Environment production -DryRun`
2. `pnpm --dir apps/web test:smoke`
3. `php artisan test --testsuite=Feature` (run in `apps/api`)

## Day0 Checklist Snapshot

- Monitoring checklist executed and logged from available runbooks:
  - API/web smoke endpoint checklist: executed (dry-run production profile).
  - web critical routes smoke: passed.
  - phone build checklist: available in smoke runbook output, requires live
    device pass capture during production window.
- First real user loop validation:
  - not executed in live production context in this environment.
- Notification/localization behavior:
  - localization flow covered by web build and feature suite pass for auth and
    onboarding localization endpoints.

## Day1 Incident and Regression Review

### Incident 1: Web module resolution failure

- Symptom: `Module not found: Can't resolve '@nest/shared-types'`.
- Impact: blocked web boot in dev for affected local installs.
- Root cause: fragile `link:` workspace specifier behavior in local dependency
  state.
- Remediation: switched `@nest/shared-types` to `file:` in web/mobile package
  manifests and refreshed lockfiles.
- Status: resolved in commit `8f2f25f`.

### Incident 2: API feature regression

- Symptom: `Tests\\Feature\\InsightsTrendApiTest` monthly habits bucket
  assertion mismatch.
- Impact: feature suite not fully green (`151 passed, 1 failed`).
- Current state: open for triage before next stabilization promote decision.

## First Stabilization Patch Decision

- Decision date: 2026-03-31.
- Proposed first stabilization patch scope:
  1. include workspace resolution fix for `@nest/shared-types` (resolved),
  2. triage and resolve/accept `InsightsTrendApiTest` monthly bucket failure.
- Release posture:
  - do not promote as fully stabilized until the open feature-test regression is
    resolved or explicitly accepted with risk sign-off.

## Completion Status

- This packet captures Day0/Day1 validation preparation and current regression
  review evidence.
- `NEST-123` remains open until live post-launch Day0/Day1 monitoring evidence
  and decision sign-off are captured in non-dry-run production operations.
