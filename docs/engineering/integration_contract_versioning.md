# Integration Contract Versioning Strategy

Last updated: 2026-03-16

## Purpose

Define a stable versioning policy for post-MVP integration contracts so provider
adapters can evolve without breaking sync reliability.

## Scope

This strategy applies to:

- provider payload normalizers and mappers,
- outbound provider write payload builders,
- webhook/event parsers,
- sync metadata shape used by retry/replay tooling.

## Versioning Model

- Contract identifier format:
  `{provider}:{domain}:{major}.{minor}` (example: `trello:list_task:2.1`).
- `major` changes indicate breaking schema or behavior updates.
- `minor` changes indicate backward-compatible additive changes.
- Patch-level internal fixes do not change contract identifier; they must keep
  behavior compatible with the declared `{major}.{minor}`.

## Compatibility Rules

- Runtime accepts current `major` and previous `major - 1` during migration.
- New writes use latest stable contract for the provider/domain.
- Reads/parsing must remain backward-compatible for all supported versions.
- Unsupported major versions are rejected with explicit sync failure reason and
  audit entry.

## Migration Rules

1. Publish a migration note in provider adapter docs and changelog.
2. Add parser/mapper support for old and new versions.
3. Enable dual-read + single-write mode.
4. Backfill `sync_mappings` version marker in batches.
5. Switch writes to new major version behind rollout flag.
6. Remove old major support only after two stable release cycles.

## Deprecation Policy

- Minimum support window: two release cycles for previous major version.
- Deprecation must include:
  - affected provider/domain contracts,
  - rollout window and cutoff date,
  - rollback path and operational owner.

## Rollback Rules

- Keep previous major write path behind feature flag until sign-off.
- On elevated sync error rate, revert write path to previous major.
- Preserve migrated metadata; replay tooling must tolerate mixed versions during
  rollback window.

## Validation and Quality Gates

- Contract fixture tests per provider/version pair.
- Mapping integrity tests for required fields and identifiers.
- Replay/idempotency tests across version transitions.
- CI must fail if a breaking change is introduced without major bump.

## References

- `docs/modules/integrations.md`
- `docs/planning/implementation_plan_full.md` (`NEST-031`)

