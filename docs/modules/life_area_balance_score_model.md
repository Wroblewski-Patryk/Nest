# Life-Area Balance Score Model (v1)

Last updated: 2026-03-16

## Purpose

Define the first scoring model for life-area balance insights and expose it via
API for web/mobile clients.

## API Surface

- Endpoint: `GET /api/v1/insights/life-area-balance`
- Auth: `auth:sanctum`
- Query params:
  - `window_days` (optional, integer `1..180`, default `30`)
- Response:
  - `data[]` rows per life area
  - `meta` with window bounds and `global_balance_score`

## Inputs (Within Window)

For each active life area (`is_archived=false`) for current user:

- journal activity: count of tagged entries
- task activity: count of completed tasks
- habit activity: count of habit logs
- configured life-area `weight`

## Formula (v1)

Per life area:

- `target_share = weight / sum(weights)`
- `activity_count = journal_entries + completed_tasks + habit_logs`
- `actual_share = activity_count / total_activity` (fallback to `target_share`
  when `total_activity=0`)
- `alignment_score = max(0, 1 - abs(actual_share - target_share))`
- `journal_score = journal_entries / total_journal_entries` (0 when no journal activity)
- `task_score = completed_tasks / total_completed_tasks` (0 when no completed tasks)
- `balance_score = (0.50 * alignment_score + 0.30 * journal_score + 0.20 * task_score) * 100`

Global score:

- `global_balance_score = sum(balance_score * target_share)`

All score outputs are rounded for API readability:

- shares: 4 decimals
- percentage scores: 2 decimals

## Guardrails

- Tenant/user scoped queries only.
- Window is clamped to `1..180` days.
- Archived life areas are excluded.
- Score range remains `0..100`.

## Next Iteration Hooks

- Add cadence normalization for habits (`NEST-049+`).
- Add goal/target progress contribution after trend APIs land.
- Add confidence/coverage metadata for sparse windows.
