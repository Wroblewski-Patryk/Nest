# Code Quality Guardrails

Updated: 2026-04-25

## Purpose

Define which maintainability exceptions remain temporarily intentional and
which new debt is blocked by repository guardrails.

## Hard-Fail Guardrails

Quality gates should fail when:

- newly introduced prohibited patterns appear in production code
- changed files exceed agreed complexity thresholds without approved exception
- required evidence artifacts for guardrailed checks are missing
- allowlist entries point to non-existing files

## Temporary Allowlist Policy

Allowlist entries are permitted only when all conditions hold:

1. the issue already exists in the repository
2. the issue is inventoried in canonical docs
3. a tracked task exists to remove the exception
4. the allowlist entry is narrow and file-specific

## Forbidden Exceptions

- wildcard allowlists by directory or feature
- silent relabeling of new debt as temporary
- adding duplicate debt to avoid fixing existing debt
- undocumented cross-module duplicate helper seams

## Review Rule

When a guardrail requires a new allowlist entry, the same change must also:

- update inventory docs
- update planning and task-board context
- explain why same-turn cleanup was unsafe or out of scope

## Ownership And Cadence

- Define active owner of guardrail maintenance in each execution wave.
- Re-audit guardrails at least weekly and after large structural refactors.
