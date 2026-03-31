# Deterministic Offline Merge Policy v2 (NEST-132)

Date: 2026-03-31
Task: `NEST-132`

## Scope

- Expose deterministic merge policy partitions (`manual` vs `auto`) in conflict
  queue API.
- Surface merge-state visibility in web/mobile conflict UI.
- Add regression coverage for repeated concurrent-style conflict updates.

## Backend Changes

- Policy service updates:
  - `apps/api/app/Integrations/Services/IntegrationConflictPolicyMatrixService.php`
  - Added conflict field partitioning:
    - `manual_queue_fields`
    - `auto_merge_fields`
  - Added merge-policy payload helpers.
- Queue service updates:
  - `apps/api/app/Integrations/Services/IntegrationConflictQueueService.php`
  - Persist merge-policy metadata in `resolution_payload` for open conflicts.
- API response updates:
  - `apps/api/app/Http/Controllers/Api/IntegrationConflictController.php`
  - Response now includes:
    - `merge_state`,
    - `merge_policy.manual_queue_fields`,
    - `merge_policy.auto_merge_fields`.

## Client Changes

- Shared type contract:
  - `packages/shared-types/src/index.d.ts`
- Web conflict UI:
  - `apps/web/src/components/conflict-queue-card.tsx`
  - Added merge state and auto-merged field display.
- Mobile conflict UI:
  - `apps/mobile/components/mvp/ModuleScreen.tsx`
  - `apps/mobile/app/(tabs)/calendar.tsx`
  - Added merge state and auto-merged field display.

## Regression Coverage

- `apps/api/tests/Unit/IntegrationConflictPolicyMatrixServiceTest.php`
  - partition behavior
  - merge-policy payload behavior
- `apps/api/tests/Feature/IntegrationConflictPolicyEnforcementTest.php`
  - deterministic repeated conflict-update behavior
- `apps/api/tests/Feature/IntegrationConflictQueueApiTest.php`
  - merge-state and merge-policy response contract checks

## Validation

- `php artisan test --filter IntegrationConflictPolicyMatrixServiceTest`
- `php artisan test --filter IntegrationConflictPolicyEnforcementTest`
- `php artisan test --filter IntegrationConflictQueueApiTest`
- `pnpm --dir apps/web build`
- `pnpm --dir apps/mobile test:smoke`

All checks passed in current cycle.
