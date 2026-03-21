# Database Decision

## Decision

Use PostgreSQL as the primary database.

Default target for new environments: PostgreSQL 17.
Allow PostgreSQL 18 where managed provider support and tooling are stable.

## Why PostgreSQL Fits Nest

- Strong relational integrity for interconnected entities (tasks, goals,
  habits, routines, calendar events, sync mappings).
- Advanced indexing and query features for timeline and analytics workloads.
- JSONB for flexible metadata without abandoning relational consistency.
- Mature migration/replication/backup story in cloud providers.

## Alternatives Considered

### MySQL

Pros:

- Very common in managed hosting.
- Good performance for simple CRUD.

Cons:

- Fewer advanced query/data features useful for complex planning and
  analytics use cases.

Conclusion: viable fallback, not first choice.

### MongoDB

Pros:

- Flexible schema for rapidly changing documents.

Cons:

- Harder to enforce relational constraints across strongly connected modules.
- More complexity for cross-module reporting and transaction integrity.

Conclusion: not recommended as primary DB for Nest core domain.

### SQLite

Pros:

- Great for local prototyping.

Cons:

- Not suitable as primary production database for multi-tenant SaaS.

Conclusion: local development/testing only.

## Best-Practice Defaults

- UUID/ULID primary identifiers.
- Strict foreign keys and cascading rules.
- Audit timestamps and soft deletes only where domain-appropriate.
- Composite indexes for tenant + status + due_date/time queries.
- Explicit migration strategy for zero-downtime deploys.

## MVP Schema Reference

- `docs/engineering/mvp_database_schema.md`

