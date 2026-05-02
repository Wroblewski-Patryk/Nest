# Policy Coverage Ledger

Date: 2026-05-02
Stage: analysis + first fix

## Purpose

Track where Nest API record actions rely on query scoping only and where they
also have explicit policy-layer checks. This ledger exists to avoid turning
every partial coverage row into broad refactor work; fixes should be narrow and
evidence-led.

## Coverage Rows

| Surface | Query scoping | Policy coverage | Status | Follow-up |
| --- | --- | --- | --- | --- |
| Tasks | Tenant, owner, assignee, collaboration space | `TaskPolicy`, `TaskListPolicy` | Covered | Keep regression tests. |
| Lists | Tenant, owner, collaboration space | `TaskListPolicy` | Covered | Keep regression tests. |
| Life areas | Tenant and user | `LifeAreaPolicy` | Covered | Keep regression tests. |
| Integration conflicts | Tenant and user | `IntegrationSyncConflictPolicy` | Covered | Keep regression tests. |
| Integration failures | Tenant and user | `IntegrationSyncFailurePolicy` | Covered | Keep regression tests. |
| Habits | Tenant and user | `HabitPolicy` added in `NEST-305` | Covered | Add deeper actor-context regression if AI/delegated habit writes become release scope. |
| Routines | Tenant and user | None yet | Acceptable query-scope-only for MVP private-user actions | Add `RoutinePolicy` if delegated or shared routine writes become release scope. |
| Calendar events | Tenant and user | None yet | Acceptable query-scope-only for MVP private-user actions | Add policy before shared calendars or delegated event writes. |
| Journal entries | Tenant and user | None yet | Acceptable query-scope-only for MVP private-user actions | Add policy before delegated journal writes or shared reflection features. |
| Goals and targets | Tenant and user | `GoalPolicy` for goal actions | Partially covered | Review target-specific policy before shared target edits expand. |
| Organizations/workspaces | Tenant/org membership/RBAC checks | Inline RBAC/service checks | Covered by service-level checks | Consider policy wrappers only if controller complexity grows. |
| AI proposals/actions | Tenant, user, proposal state, approval checks | Service and feature-test enforced | Covered | Keep AI red-team scenarios before enabling AI surface. |

## Fix Applied

`HabitPolicy` now adds explicit policy-layer checks for habit list, create,
view, update, delete, and log actions. The controller still keeps tenant/user
query scoping, so policy checks are layered rather than replacing data-access
constraints.

## Next Fix Candidates

1. `RoutinePolicy` once routines enter delegated or shared actor scope.
2. `CalendarEventPolicy` before shared calendars or AI/delegated event writes.
3. `JournalEntryPolicy` before delegated writing or collaboration features.

## Validation Target

- `php artisan test --filter=HabitsAndRoutinesApiTest --env=testing`
- Full API feature suite before release.
