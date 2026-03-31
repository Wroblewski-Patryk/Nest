# V2 Real-Traffic Observability Baseline Pack (NEST-125)

Date: 2026-03-31  
Task: `NEST-125 Establish real-traffic observability baseline for V2 planning`

## Purpose

Provide an executor-ready dashboard and evidence pack for collecting the first
7-day and 14-day real-traffic baseline for API/web/mobile, plus quantified top
failure modes and reliability priorities.

## Mandatory Dashboard Pack

1. Traffic volume by platform (`web`, `mobile`) from `analytics_events.platform`.
2. API request health from `api.requests.total` and `api.requests.error` metrics.
3. Queue health from `queue.jobs.processed` and `queue.jobs.failed` metrics.
4. Integration reliability from sync SLO and failure logs.
5. Notification delivery health from push/channel delivery tables.
6. Billing recovery health from dunning attempts and recoveries.

## Required Command Snapshot

Run in `apps/api` against production profile and capture JSON outputs:

```powershell
php artisan integrations:sync-slo-check --json
php artisan integrations:event-ingestion-stats --json
php artisan security:controls:verify --json
```

## SQL Extracts (7d and 14d windows)

Replace `:window_start` with `now() - interval` equivalent for your DB.

```sql
-- Traffic by platform
select platform, count(*) as events
from analytics_events
where occurred_at >= :window_start
group by platform
order by events desc;
```

```sql
-- Top integration sync failures
select provider, count(*) as failures
from integration_sync_failures
where failed_at >= :window_start
group by provider
order by failures desc
limit 10;
```

```sql
-- Notification delivery failures by channel/reason
select channel, coalesce(failure_reason, 'unknown') as failure_reason, count(*) as failures
from notification_channel_deliveries
where status = 'failed' and created_at >= :window_start
group by channel, coalesce(failure_reason, 'unknown')
order by failures desc
limit 10;
```

```sql
-- Mobile push failures
select notification_type, count(*) as failures
from mobile_push_deliveries
where status = 'failed' and created_at >= :window_start
group by notification_type
order by failures desc
limit 10;
```

```sql
-- Billing dunning and recovery outcomes
select status, count(*) as attempts
from billing_dunning_attempts
where created_at >= :window_start
group by status
order by attempts desc;
```

## Reliability Priority Scoring

For each failure mode in top-10 list, assign:

- Frequency score: `1..5` (event count percentile in the observed window),
- Impact score: `1..5` (user-facing severity, data risk, revenue risk),
- Owner: engineering/ops/product.

Priority score formula:

`priority_score = (frequency_score * 0.6) + (impact_score * 0.4)`

Sort descending and publish top priorities as V2 reliability actions.

## Output Checklist (for task closure)

1. 7-day baseline export attached.
2. 14-day baseline export attached.
3. Top-10 failure modes with frequency + impact + owner.
4. Reliability priority memo published in operations docs.

## Current Status

Dashboard/query/reliability template is ready.  
`NEST-125` remains open until real production traffic exports (7d + 14d) are
captured and attached as evidence.
