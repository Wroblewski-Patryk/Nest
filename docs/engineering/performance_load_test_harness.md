# Performance and Load Test Harness (NEST-077)

## Scope

- Added repeatable load harness for API baseline throughput and latency checks.
- Added representative read and optional write scenarios for core module traffic.
- Added threshold guardrails for p95/p99 latency and error rate.

## Harness Artifacts

- k6 scenario file:
  - `apps/api/tests/Performance/k6-load-harness.js`
- Local run script (PowerShell):
  - `scripts/performance/run-k6-harness.ps1`

## Default Scenarios

- `read_core_modules`:
  - constant arrival rate traffic for:
    - `GET /lists`
    - `GET /tasks`
    - `GET /goals`
- `write_task_light` (optional):
  - light-rate task creation on `POST /tasks`
  - enabled only when `ENABLE_WRITES=1` and `LIST_ID` is provided.

## Thresholds

- error budget:
  - `http_req_failed < 1%`
- latency:
  - `p95 < 500ms`
  - `p99 < 900ms`

## Run Examples

- Read-only baseline:
  - `pwsh ./scripts/performance/run-k6-harness.ps1`
- Read + write:
  - `pwsh ./scripts/performance/run-k6-harness.ps1 -ApiToken "<token>" -ListId "<list-id>" -EnableWrites`
- Custom duration:
  - `pwsh ./scripts/performance/run-k6-harness.ps1 -Duration "5m"`

## Output

- k6 summary export:
  - `apps/api/tests/Performance/k6-summary.json`

## Staging Practice

- Run read-only profile daily.
- Run write-enabled profile before release candidates.
- Track p95/p99 drift and error-rate trend across runs.
