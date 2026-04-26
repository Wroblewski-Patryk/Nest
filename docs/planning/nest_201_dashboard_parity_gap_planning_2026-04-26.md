# Task

## Header

- ID: NEST-201
- Title: Capture dashboard parity gap plan against founder target reference
- Task Type: design
- Current Stage: release
- Status: DONE
- Owner: Documentation Agent
- Depends on: NEST-197, NEST-198, NEST-199, NEST-200
- Priority: P1

## Context

The current dashboard implementation is directionally aligned with the Nest
canon, but the founder provided a stronger target image that represents the
desired premium "wow" level. The repository needed one explicit gap analysis so
future work can close the difference deliberately and reuse the result across
other modules.

## Goal

Publish one repository-native parity plan that documents:

- what currently differs,
- what target quality looks like,
- which reusable UI-system changes are required,
- how the dashboard plan should drive future module rebuilds.

## Deliverable For This Stage

A released documentation package containing:

- the founder target image stored in repository artifacts,
- a detailed dashboard gap analysis,
- a reusable component/token rollout model,
- synchronized task board and project state references.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] Founder target image is stored in repository docs artifacts.
- [x] Dashboard gap plan explicitly compares current implementation vs target.
- [x] The resulting plan is usable as a UI-system basis for later module work.

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
  - not applicable (`docs + artifact only`)
- Manual checks:
  - compared founder target image against current dashboard implementation files
  - grouped differences into shell, hero, focus, timeline, support column, and
    material/finish layers
  - verified the plan produces reusable primitives rather than one-off dashboard
    hacks
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`
- High-risk checks:
  - ensured the plan protects reuse discipline and accessibility instead of
    encouraging a screenshot-only clone

## Architecture Evidence (required for architecture-impacting tasks)

- Architecture source reviewed:
  - `docs/architecture/modules.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed:
  - not applicable
- Follow-up architecture doc updates:
  - none

## UX/UI Evidence (required for UX/UI tasks)

- Source of truth type: approved_snapshot
- Design source reference:
  - founder-provided target image on 2026-04-26
- Stitch used: no
- Exception workflow reference (if stitch_exception):
  - not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: yes
- Existing shared pattern reused:
  - canonical dashboard direction
  - shared workspace primitives
  - dense desktop surfaces
- New shared pattern introduced: yes
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: no
- State checks: planning artifact only
- Responsive checks: desktop target drives later propagation plan
- Input-mode checks: planning artifact only
- Accessibility checks:
  - plan explicitly rejects screenshot-only cloning that harms accessibility
- Parity evidence:
  - this task is the explicit parity planning baseline
- MCP evidence links:
  - founder target artifact path above

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

- Recommended next implementation slice:
  `dashboard parity phase 1: shell + hero + right-rail support stack`.
