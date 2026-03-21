# Insights Trends API (Phase 3, v1)

Last updated: 2026-03-16

## Purpose

Provide trend endpoints for tasks, habits, and goals as the analytics insight
baseline for Phase 3.

## Endpoints

All endpoints are tenant/user scoped and require `auth:sanctum`.

- `GET /api/v1/insights/trends/tasks`
- `GET /api/v1/insights/trends/habits`
- `GET /api/v1/insights/trends/goals`

Query parameters:

- `period`: `weekly` or `monthly` (default `weekly`)
- `points`: number of buckets (default `8` weekly, `6` monthly, range `1..52`)

## Response Shape

- `data[]`:
  - `bucket_start` (`YYYY-MM-DD`)
  - `bucket_end` (`YYYY-MM-DD`)
  - `value` (integer count)
- `meta`:
  - `module`, `period`, `points`
  - `window_start`, `window_end` (ISO-8601)
  - `total` (sum of all bucket values)

## Data Sources (v1)

- `tasks`: completions from `tasks.completed_at` (fallback to `updated_at` when
  status is `done`)
- `habits`: logs from `habit_logs.logged_at`
- `goals`: analytics events where `module=goals` from `analytics_events`

## Notes

- Buckets are returned in ascending chronological order.
- Weekly buckets start on Monday.
- This API is a baseline feeding insights UI (`NEST-050`) and AI planning
  signals (`NEST-051+`).
