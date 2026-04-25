# Architecture Source Of Truth

This document defines how architecture decisions should be treated in Nest.

## Purpose

The `docs/architecture/` folder is the canonical record of approved
architecture:

- system boundaries
- state and data ownership
- module and integration contracts
- runtime topology and lifecycle contracts
- confirmed technology choices

Treat these files as implementation constraints.

## Default Rule

- Build implementation to match approved architecture.
- Do not silently change architecture during implementation.
- If implementation exposes a mismatch, stop and escalate before coding around
  it.
- Prefer asking for direction over shipping a workaround.

## What Agents May Do Without Re-Approving Architecture

- implement work that fits documented boundaries
- add clarifying detail without changing ownership or behavior
- document discovered inconsistencies
- propose follow-up tasks inside approved architecture

## What Requires Explicit User Approval First

- changing module boundaries or responsibilities
- moving source-of-truth ownership for data or state
- replacing approved integration patterns
- changing deployment topology or runtime shape
- changing confirmed stack decisions that affect architecture
- introducing a new cross-cutting pattern that conflicts with current docs

## Mandatory Decision Flow For Mismatches

When implementation does not fit approved architecture:

1. describe the problem
2. propose 2 to 3 valid options with tradeoffs
3. wait for explicit user decision

Agents must not self-approve a workaround or architecture rewrite.

## Required Architecture Files

At minimum, keep these files aligned:

- `docs/architecture/system-architecture.md`
- `docs/architecture/tech-stack.md`

## Implementation Contract

Before architecture-impacting work is marked complete, confirm:

- the task still fits approved architecture
- any deviation was explicitly approved
- architecture docs and implementation are synchronized
- no workaround path bypasses architecture constraints
- existing mechanisms were reused before proposing new structures
