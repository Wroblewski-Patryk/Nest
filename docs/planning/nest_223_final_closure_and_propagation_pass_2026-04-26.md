# Task

## Header

- ID: NEST-223
- Title: Apply final dashboard closure pass and propagation rules
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-222
- Priority: P1

## Context

The canonical gap after phase G was narrow enough that the next slice needed to
do two things at once:

- close the remaining dashboard micro-softness gaps,
- turn the latest finish language into reusable propagation rules for other
  modules.

## Goal

Further reduce the remaining hero/rail/right-rail/focus contrast gap while
publishing explicit finish-language propagation guidance for future module
refreshes.

## Deliverable For This Stage

A verified web implementation and doc update that:

- further softens dashboard composition,
- slightly reduces remaining shell attention,
- records reusable finish propagation rules in design memory,
- stores fresh preview evidence.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] dashboard is softer and closer to canonical calm
- [x] propagation rules are explicitly recorded
- [x] relevant web validations pass
- [x] fresh preview evidence is stored

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
  - reviewed refreshed local dashboard and assistant captures after the closure
    pass
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseH.png`
  - `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseH.png`
- High-risk checks:
  - no new shell or route systems introduced

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
  - assistant room
- New shared pattern introduced: yes
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: yes
- State checks: success and idle states
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - semantic sections preserved
  - decorative motion remains non-essential
- Parity evidence:
  - browser-captured local screenshots after the pass
- MCP evidence links:
  - local screenshot artifact paths above

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

- The remaining visual gap is now mostly a matter of future iterative
  refinement, not structural mismatch.
