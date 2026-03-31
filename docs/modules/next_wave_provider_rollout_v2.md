# Next-Wave Provider Rollout V2 (NEST-146)

Last updated: 2026-03-31

## Demand Scoring Decision

Selected top-demand providers for this wave:

1. `clickup`
2. `microsoft_todo`

Scoring inputs used for this cycle:

- user request concentration for task/workspace providers,
- overlap with current planning workflows (lists/tasks first),
- implementation leverage from existing list/task sync pipeline.

## Delivered Providers

- `clickup`
  - adapter: `apps/api/app/Integrations/Adapters/ClickUpAdapter.php`
  - mapping version: `clickup.v1`
- `microsoft_todo`
  - adapter: `apps/api/app/Integrations/Adapters/MicrosoftTodoAdapter.php`
  - mapping version: `microsoft_todo.v1`

Both providers are wired end-to-end through:

- provider registry (`IntegrationAdapterRegistry`),
- list/task sync route validation (`POST /api/v1/integrations/list-task-sync`),
- connection management APIs,
- marketplace catalog/install/uninstall APIs.

## Quality Bar Coverage

- idempotent queue-first list/task sync path reused for both providers.
- audit trail coverage through `integration_sync_audits`.
- provider-specific mapping/version metadata included in sync audit payload.
- regression suite coverage:
  - `tests/Feature/IntegrationListTaskSyncApiTest.php`
  - `tests/Feature/IntegrationConnectionApiTest.php`
  - `tests/Feature/IntegrationMarketplaceApiTest.php`

## Rollout Limits and Caveats

- Provider adapters in this wave use deterministic mapping stubs aligned to
  current sync architecture; full remote API shape parity remains a follow-up.
- OAuth/token exchange UX for these providers is still manual-token based in
  current UI test flow.
- Webhook-triggered near-real-time ingestion is not part of this task and is
  tracked in `NEST-147`.

