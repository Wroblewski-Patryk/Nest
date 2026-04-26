# Task

## Header

- ID: NEST-212
- Title: Publish shell-level canonical alignment plan for dashboard and assistant surfaces
- Task Type: design
- Current Stage: release
- Status: DONE
- Owner: Documentation Agent
- Depends on: NEST-201, NEST-209, NEST-210, NEST-211
- Priority: P1

## Context

The founder-approved dashboard target has already driven several dashboard
implementation passes, but production still shows remaining divergence from the
reference. The gap is now broader than one screen:

- the global workspace shell still needs a stronger canonical contract,
- the dashboard still has residual parity differences,
- the future assistant/chat surface is not yet modeled as a first-class room in
  the same system,
- other modules still need a shared layout recipe so the product feels like one
  coherent sanctuary.

The repository needed one detailed planning artifact that compares the current
web reality against the target and turns the difference into a reusable
execution model.

## Goal

Publish one detailed shell-and-dashboard parity plan that explains:

- what is still different today,
- how the canonical workspace model should work,
- how chat/assistant should be accounted for in the shared shell,
- how this becomes the base for the next module rebuild wave.

## Deliverable For This Stage

A released documentation package containing:

- a detailed workspace-shell and dashboard gap analysis,
- a reusable canonical workspace model for future modules,
- a recommended execution sequence for shell, dashboard, assistant, and module
  propagation work,
- synchronized task board and project state references.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] The shell-level gap is documented, not only the dashboard-level gap.
- [x] The assistant/chat surface is explicitly included in the canonical plan.
- [x] The plan is detailed enough to drive later module rebuilds.

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
  - not applicable (`docs only`)
- Manual checks:
  - reviewed the current web root layout, workspace shell, dashboard route, and
    embedded copilot surface
  - compared current implementation responsibilities against the founder target
    composition
  - separated shell, dashboard, assistant, and module-propagation concerns so
    the next implementation slices can stay reusable
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`
- High-risk checks:
  - ensured the plan does not invent a parallel navigation system
  - ensured the assistant/chat direction stays inside the existing Nest
    architecture and shell reuse model

## Architecture Evidence (required for architecture-impacting tasks)

- Architecture source reviewed:
  - `docs/architecture/architecture-source-of-truth.md`
  - `docs/architecture/system-architecture.md`
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
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`
- Stitch used: no
- Exception workflow reference (if stitch_exception):
  - not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: yes
- Existing shared pattern reused:
  - canonical dashboard direction
  - dashboard parity plan
  - workspace shell
  - shared workspace primitives
- New shared pattern introduced: yes
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: no
- State checks: planning artifact only
- Responsive checks: desktop-target-driven planning for later implementation
- Input-mode checks: planning artifact only
- Accessibility checks:
  - plan explicitly preserves maintainability and accessibility over screenshot
    cloning
- Parity evidence:
  - this task extends parity planning from dashboard-only to shell-level system
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

- Recommended next execution slice:
  `shell canonicalization + dashboard residual parity closure + assistant surface framing`.
