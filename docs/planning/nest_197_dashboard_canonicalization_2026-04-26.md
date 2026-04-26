# Task

## Header

- ID: NEST-197
- Title: Capture canonical dashboard direction and reusable implementation plan
- Task Type: design
- Current Stage: release
- Status: DONE
- Owner: Documentation Agent
- Depends on: NEST-190, NEST-196
- Priority: P1

## Context

Nest needed one founder-approved post-login dashboard direction that could act
as both the implementation target for `/dashboard` and the reusable visual
baseline for module refresh work. Existing repo truth already defined the
product character, shell direction, and quality bar, but did not yet contain a
single canonical dashboard artifact with explicit reuse and rollout rules.

## Goal

Publish one repository-native dashboard canon package: approved preview image,
UX specification, reusable component grammar, rollout plan, and synchronized
context references.

## Deliverable For This Stage

A released documentation package that:

- stores the canonical dashboard preview in the repository,
- documents the dashboard direction as implementation truth,
- defines reusable primitives and rollout order,
- updates task board, project state, and UX foundation references.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] Founder-approved dashboard preview is stored as a repository artifact.
- [x] Canonical dashboard direction doc defines IA, hierarchy, reuse rules, and
  rollout order.
- [x] Project context files reflect the new dashboard source of truth.

## Stage Exit Criteria

- [x] The output matches the declared `Current Stage`.
- [x] Work from later stages was not mixed in without explicit approval.
- [x] Risks and assumptions for this stage are stated clearly.

## Forbidden

- new systems without approval
- duplicated logic or parallel implementations of the same contract
- temporary bypasses, hacks, or workaround-only paths
- architecture changes without explicit approval
- implicit stage skipping

## Validation Evidence

- Tests:
  - not applicable (`docs + image artifact only`)
- Manual checks:
  - verified canonical image copied into repository docs artifact path
  - reviewed dashboard doc against current web dashboard structure and UX
    governance docs
  - verified task board and project state synchronization
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-canonical-preview.png`
- High-risk checks:
  - confirmed the new documentation promotes reusable shared primitives rather
    than dashboard-only styling

## Architecture Evidence (required for architecture-impacting tasks)

- Architecture source reviewed:
  - `docs/architecture/modules.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed:
  - not applicable
- Follow-up architecture doc updates:
  - none required for this docs-only dashboard direction package

## UX/UI Evidence (required for UX/UI tasks)

- Source of truth type: approved_snapshot
- Design source reference:
  - founder-approved generated preview from 2026-04-26
- Stitch used: no
- Exception workflow reference (if stitch_exception):
  - not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: yes
- Existing shared pattern reused:
  - split-view workspace
  - dense desktop surfaces
  - empty-state clarity
- New shared pattern introduced: yes
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: yes
- State checks: loading | empty | error | success | high-load
- Responsive checks: desktop | tablet | mobile
- Input-mode checks: touch | pointer | keyboard
- Accessibility checks:
  - documentation-level hierarchy and state visibility requirements captured for
    later implementation tasks
- Parity evidence:
  - dashboard canon explicitly preserves one cross-surface mental model
- MCP evidence links:
  - canonical preview stored in repository artifact path above

## Review Checklist (mandatory)

- [x] Current stage is declared and respected.
- [x] Deliverable for the current stage is complete.
- [x] Architecture alignment confirmed.
- [x] Existing systems were reused where applicable.
- [x] No workaround paths were introduced.
- [x] No logic duplication was introduced.
- [x] Definition of Done evidence is attached.
- [x] Relevant validations were run.
- [x] Docs or context were updated if repository truth changed.
- [x] Learning journal was updated if a recurring pitfall was confirmed.

## Notes

- This task intentionally stops at released documentation and artifact truth.
- Implementation should follow with dashboard execution tasks that reuse the
  shared primitive list from `docs/ux/nest_197_dashboard_canonical_direction_2026-04-26.md`.
