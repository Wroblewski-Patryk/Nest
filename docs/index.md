# Nest Engineering Documentation Index

Last updated: 2026-05-03

This is the technical entrypoint for agents and engineers who need to
understand how Nest fits together. It complements `docs/README.md`, which is
the broader documentation catalog.

## Start Here

1. Product and scope: `docs/product/overview.md`,
   `docs/architecture/v1_v2_delivery_split.md`.
2. Architecture source of truth: `docs/architecture/architecture-source-of-truth.md`,
   `docs/architecture/system-architecture.md`, `docs/architecture/tech-stack.md`.
3. Codebase map: `docs/architecture/codebase-map.md`.
4. Feature traceability: `docs/architecture/traceability-matrix.md`.
5. Module registry: `docs/modules/index.md`.
6. Pipeline registry: `docs/pipelines/index.md`.
7. Drift report: `docs/analysis/documentation-drift.md`.
8. Documentation maintenance rules: `docs/CONTRIBUTING-DOCS.md`.

## Documentation System Model

Nest documentation is maintained as a system map, not as loose notes.

- Architecture docs define approved structure and constraints.
- Module docs describe bounded responsibilities and dependencies.
- Pipeline docs describe cross-module flows.
- Traceability connects feature -> UI -> API -> services -> data -> tests ->
  docs.
- Drift reports identify places where code and docs are not yet connected.

## Canonical Registries

- Documentation inventory: `docs/analysis/documentation-inventory.md`
- Codebase map: `docs/architecture/codebase-map.md`
- Traceability matrix: `docs/architecture/traceability-matrix.md`
- Pipeline registry: `docs/pipelines/index.md`
- Module registry: `docs/modules/index.md`

## Existing Documentation Areas

- Product: `docs/product/`
- Architecture: `docs/architecture/`
- Engineering and contracts: `docs/engineering/`
- Modules: `docs/modules/`
- Operations: `docs/operations/`
- Planning and execution reports: `docs/planning/`
- Security: `docs/security/`
- UX and evidence: `docs/ux/`, `docs/ux_parity_evidence/`,
  `docs/ux_audit_evidence/`
- Governance and agent workflow: `docs/governance/`, `.agents/`, `.codex/`
- ADRs: `docs/adr/`

## Current Release Truth

As of 2026-05-03, the active release posture is web-first V1. Mobile runtime
surfaces exist and are documented, but native mobile application work is V2
scope after the 2026-05-02 decision. AI surfaces exist behind guarded API
capabilities and must preserve actor, tenant, and approval boundaries.

## Update Rule

Any feature, module, route, schema, pipeline, deployment, or test change must
update the relevant registry and traceability row in the same task slice.
