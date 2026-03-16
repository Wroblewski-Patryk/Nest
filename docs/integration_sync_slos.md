# Integration Sync SLOs

## Purpose

Define measurable sync reliability targets and deterministic alert thresholds
for the current hourly metric window.

## SLO Targets

- Success rate target: `99.0%` (`integration.sync.processed / (processed + failed)`)
- P95 latency target: `<= 2000 ms` (approximate, bucket-based)

## Error Budget

- Allowed error rate: `1.0%` (derived from success target `99.0%`)
- Error budget burn:
  - `error_rate / allowed_error_rate * 100`
  - Example: `2.0%` error rate means `200%` burn.

## Alert Thresholds

Configured in `apps/api/config/observability.php`:

- Warning:
  - success rate `< 99.5%`
  - p95 latency `> 1800 ms`
  - error budget burn `> 50%`
- Critical:
  - success rate `< 99.0%`
  - p95 latency `> 2000 ms`
  - error budget burn `> 100%`

## Runtime Check

Run:

```bash
php artisan integrations:sync-slo-check
php artisan integrations:sync-slo-check --json
```

- Emits structured log entries (`info`/`warning`/`error`) by severity.
- Returns exit code `1` on `critical` severity for automation/CI hooks.
