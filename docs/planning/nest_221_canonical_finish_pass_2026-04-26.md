# Task

## Header

- ID: NEST-221
- Title: Apply canonical finish pass to dashboard shell and assistant idle state
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-220
- Priority: P1

## Context

The living parity pass materially improved atmosphere and subtle liveness, but
the app still needed a narrow final-softness iteration:

- the dashboard hero still carried a little too much typographic boldness,
- the left rail still asked for slightly more quietness,
- the focus card still held a touch too much contrast,
- the assistant room needed more warmth and emotional density before a reply
  appears.

## Goal

Further reduce the remaining boldness and utility feel so the dashboard and
assistant move closer to canonical founder polish.

## Deliverable For This Stage

A verified web implementation that:

- softens hero typography and metrics,
- quiets the rail/footer/account zones,
- slightly reduces focus-card dominance,
- enriches the assistant idle state,
- stores fresh capture evidence.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] hero and rail are visibly quieter
- [x] assistant idle state feels warmer and more useful
- [x] relevant web validations pass
- [x] new dashboard and assistant captures are stored

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
  - reviewed refreshed local dashboard and assistant captures after the
    canonical finish pass
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseG.png`
  - `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseG.png`
- High-risk checks:
  - all motion remains decorative and non-blocking
  - no new shell or routing systems were introduced

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
- New shared pattern introduced: no
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: no
- State checks: success and idle states
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - semantic sections preserved
  - decorative motion remains optional to comprehension
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

- This pass is intentionally narrow and finish-oriented; the remaining work is
  now mostly about final canonical closure and propagation rules.
