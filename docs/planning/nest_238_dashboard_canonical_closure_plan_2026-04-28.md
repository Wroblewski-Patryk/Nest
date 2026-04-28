# Task

## Header

- ID: NEST-238
- Title: Record full canonical dashboard closure plan
- Task Type: design
- Current Stage: planning
- Status: DONE
- Owner: Planning Agent
- Depends on: NEST-236
- Priority: P1

## Context

Repeated dashboard parity passes improved the implementation substantially, but
remaining differences were still being handled too incrementally. A full
element-by-element audit was needed so future implementation work could close
the canonical gap with fewer loops.

## Goal

Produce a precise canonical closure plan that compares the approved founder
reference against the current implementation one element at a time and turns
the remaining gap into an execution sequence.

## Deliverable For This Stage

A planning package that:

- audits the dashboard element by element,
- identifies root causes instead of isolated symptoms,
- defines the correct implementation order,
- names the next concrete execution slices.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] canonical dashboard is decomposed into concrete UI regions
- [x] current-vs-target gap is written per region
- [x] root causes are identified
- [x] next execution sequence is recorded

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
  - not applicable for planning-only task
- Manual checks:
  - compared canonical dashboard image with phase N implementation artifact
  - reviewed current shell, dashboard primitives, and dashboard CSS
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`
  - `docs/ux_canonical_artifacts/2026-04-28/nest-dashboard-web-parity-preview-phaseN.png`
- High-risk checks:
  - avoided introducing unapproved architecture changes

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
- Canonical visual target:
  - founder dashboard image
- Fidelity target: pixel_close
- Stitch used: no
- Exception workflow reference (if stitch_exception):
  - not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: yes
- Existing shared pattern reused:
  - workspace shell
  - dashboard primitives
  - canonical dashboard parity documentation flow
- New shared pattern introduced: no
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: no
- Visual gap audit completed: yes
- Background or decorative asset strategy:
  - reviewed to determine when painterly regions should use real assets
- Canonical asset extraction required: yes
- Screenshot comparison pass completed: yes
- Remaining mismatches:
  - documented in the detailed audit
- State checks: success reference state only
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - not applicable for planning-only task
- Parity evidence:
  - side-by-side review of canonical image and phase N capture
- MCP evidence links:
  - artifact paths above

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

- This plan should be treated as the canonical closure map for dashboard
  parity, not as optional polish guidance.
