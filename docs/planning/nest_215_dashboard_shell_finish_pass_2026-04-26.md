# Task

## Header

- ID: NEST-215
- Title: Apply dashboard shell finish pass and assistant conversational polish on web
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-213, NEST-214
- Priority: P1

## Context

After shell-truth implementation, the product was clearly closer to the
founder target, but the parity review still showed visible gaps in:

- shell finish quality,
- hero density,
- right-rail softness,
- assistant conversational grammar.

This pass focused on those smaller but high-signal details.

## Goal

Refine the web shell, dashboard hero/support rail, and assistant conversation
surface so the product feels calmer, tighter, and less mechanically assembled.

## Deliverable For This Stage

A verified implementation pass with:

- tightened shell spacing and stronger premium finish,
- denser dashboard hero and softer support rail,
- richer assistant conversation staging,
- refreshed screenshot evidence for dashboard and assistant.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] dashboard hero and support rail are visually tighter than before
- [x] assistant surface feels more like a Nest room than a plain utility panel
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
  - captured refreshed local dashboard and assistant screenshots after the pass
  - compared the new render with the founder target image
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseB.png`
  - `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseB.png`
- High-risk checks:
  - kept all polish inside the shared shell and reused the existing UI grammar

## Architecture Evidence (required for architecture-impacting tasks)

- Architecture source reviewed:
  - `docs/architecture/architecture-source-of-truth.md`
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
  - sanctuary shell
  - editorial dashboard hero
  - support rail family
  - assistant room
- New shared pattern introduced: yes
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: no
- State checks: success surface only
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - semantic sections preserved
- Parity evidence:
  - fresh phase B screenshots
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

- This pass intentionally narrows the remaining gap, but the dashboard still
  requires another parity-focused iteration before it can be called
  canonical-founder-close.
