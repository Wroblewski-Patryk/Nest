---
name: add_provider_sync_adapter
description: Implement a new external provider sync adapter (mapping, idempotent jobs, retries, conflict handling, and audit trail). Use when integrating ClickUp, Google Calendar, Microsoft To Do, Obsidian, or another sync provider.
---

# Procedure

## Step 1
Define provider entities and mapping table requirements (internal ID <-> external ID) with tenant-aware keys.

## Step 2
Implement adapter contract methods for fetch, normalize, upsert, and delete handling. Keep provider-specific logic isolated from domain services.

## Step 3
Wire queue jobs with idempotency keys, retry/backoff policy, and dead-letter fallback. Emit structured sync events for observability.

## Step 4
Implement conflict strategy (latest-write with guardrails + manual resolution path for critical fields).

## Step 5
Add integration tests using mocked provider responses for create/update/delete/conflict scenarios.

## Validation
- simulate duplicate webhook/job delivery and verify idempotent outcome
- verify failed jobs are retriable and auditable
- verify mapping rows remain tenant-scoped and unique

## Output
- adapter implementation and sync job wiring
- mapping schema updates and tests
- short runbook note for operator troubleshooting
