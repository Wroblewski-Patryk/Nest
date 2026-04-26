# Task

## Header

- ID: NEST-231
- Title: Apply dashboard ultra-narrow finish pass
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-230
- Priority: P1

## Context

After phase K the dashboard was already very close to the canonical founder
view. The remaining differences were concentrated in very small rhythm and tone
details:

- entry title cadence,
- hero story proportion,
- hero metric spacing,
- lower-card ornamental restraint.

## Goal

Move the dashboard one step closer to the canonical image by refining only the
smallest typographic and compositional details, with no architectural or
behavioral change.

## Deliverable For This Stage

A verified ultra-narrow finish pass with:

- calmer top entry proportions,
- lighter `Today at a glance` rhythm,
- tighter hero metric balance,
- softer lower-card finish,
- refreshed screenshot evidence.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] top entry is calmer
- [x] hero rhythm is tighter
- [x] fresh local screenshot evidence exists
- [x] relevant web validations pass

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
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit`
- Manual checks:
  - compared refreshed local dashboard capture against the founder reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseL.png`
- High-risk checks:
  - no new systems introduced

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
  - workspace shell
  - dashboard primitives
  - global finish language
- New shared pattern introduced: no
- Design-memory update required: no
- State checks: default dashboard state
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - semantic structure preserved
  - decorative motion remains non-essential
- Parity evidence:
  - browser-captured local screenshot after the pass
- MCP evidence links:
  - local screenshot artifact path above

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

- This pass intentionally focused on final visual rhythm only.
