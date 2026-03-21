# Repository Structure Policy

## Purpose

Define stable rules for repository documentation layout, root minimalism, and
cross-project isolation.

## Root Minimalism Rules

Keep only true repository-level files in the root:

- `README.md`
- `AGENTS.md`
- `LICENSE`
- `.gitignore`
- top-level configuration or tooling files

Do not place product, architecture, planning, or module documents in root.
Such files must live under `docs/`.

## Documentation Placement Rules

Place documentation by domain:

- `docs/architecture/`: architecture decisions and system design
- `docs/engineering/`: implementation contracts, testing, dev standards
- `docs/planning/`: execution plans, milestones, open decisions
- `docs/product/`: product scope, roadmap, vision, product policy
- `docs/operations/`: runbooks, release operations, drills, readiness
- `docs/security/`: security controls, identity, tenancy, verification
- `docs/ux/`: UX/UI standards, MCP workflows, parity evidence
- `docs/governance/`: repository policies and collaboration rules
- `docs/adr/`: architecture decision records
- `docs/modules/`: module-specific deep dives

`docs/README.md` is the canonical docs index and must be updated whenever the
structure changes.

## Migration Rules

When relocating docs:

1. Do not delete important content.
2. Preserve meaning when merging and document merge targets.
3. Record migration mapping (`old -> new`) in a governance artifact.
4. Update internal links immediately after moves.
5. Keep historical records in categorized folders instead of root.

## Root-to-Docs Migration Rule

If a non-repo-level markdown file appears in root, move it to an appropriate
`docs/` category in the same change set and update all references.

## Cross-Project Isolation Rules

Do not reference:

- external repositories outside this project,
- machine-local absolute paths,
- template include markers.

Use repository-relative paths only.

## Validation Checklist

Before completing doc-structure changes:

- Confirm root contains only repository-level files.
- Confirm `docs/README.md` reflects current structure.
- Confirm `AGENTS.md` points to valid canonical docs and workflows.
- Scan for invalid references (template include markers, absolute local paths,
  external-repository paths).
- Verify internal links in changed files.
