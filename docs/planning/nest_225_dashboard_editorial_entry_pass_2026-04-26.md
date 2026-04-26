# Task

## Header

- ID: NEST-225
- Title: Apply dashboard editorial entry and shell serenity pass
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-224
- Priority: P1

## Context

After phase H the dashboard was already structurally close to the canonical
target, but the remaining gap still showed up in editorial feel:

- the entry header still read a little too product-like,
- the left rail remained slightly more assertive than the founder reference,
- the hero and lower cards needed one more calm-compression pass.

## Goal

Bring the dashboard closer to the canonical reference by refining shell
serenity, header rhythm, hero compression, and lower-zone softness without
changing the route architecture or component system.

## Deliverable For This Stage

A verified dashboard polish pass with:

- softer shell navigation emphasis,
- calmer editorial header proportions,
- slightly tighter hero and focus-card composition,
- refreshed local screenshot evidence for direct comparison.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] dashboard shell feels calmer and closer to the canonical image
- [x] hero and focus composition are slightly tighter
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
  - compared refreshed local dashboard capture against the canonical founder
    target
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseI.png`
- High-risk checks:
  - no new route or shell system introduced

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
  - global dashboard finish language
- New shared pattern introduced: no
- Design-memory update required: no
- State checks: default dashboard state
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - semantic sections preserved
  - motion remains decorative, not required
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

- This pass intentionally focused on shell calm and editorial softness rather
  than introducing new interactive behavior.
