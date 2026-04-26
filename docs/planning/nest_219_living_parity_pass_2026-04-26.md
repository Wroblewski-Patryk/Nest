# Task

## Header

- ID: NEST-219
- Title: Apply living parity pass to dashboard shell and assistant on web
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-218
- Priority: P1

## Context

After the phase E shell pass, the app was closer to the founder reference but
still risked reading as a polished static mockup rather than a living product
surface. The remaining gaps were now mostly in subtlety:

- the sidebar still carried a little too much navigation weight,
- the hero still felt slightly too dense in title and metrics,
- the focus/timeline center still needed calmer proportion,
- the support rail cards still needed softer material feeling,
- the assistant room still needed richer response-state polish.

## Goal

Push the dashboard and assistant from polished toward living, premium parity by
softening materials, refining density, and introducing subtle shared motion and
context responsiveness.

## Deliverable For This Stage

A verified web implementation that:

- reduces shell and rail heaviness,
- improves hero density and dashboard-center proportion,
- softens support-rail card materials,
- refines assistant result treatment,
- introduces reusable gentle-liveness behavior in the shared UI language.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] dashboard shell feels calmer and more alive
- [x] hero, focus, timeline, and support rail are refined together
- [x] assistant response-state styling is improved
- [x] design memory reflects reusable living-ui guidance
- [x] relevant web validations pass
- [x] fresh dashboard and assistant captures are stored

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
  - reviewed refreshed local dashboard and assistant captures after the living
    parity pass
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseF.png`
  - `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseF.png`
- High-risk checks:
  - kept motion subtle and non-essential
  - kept all changes inside the existing shared shell and route structure

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
- State checks: success and showcase states only in this slice
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - semantic sections preserved
  - motion remains decorative and non-blocking
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

- This slice improves emotional quality and subtle liveness, but it still does
  not claim final canonical closure yet.
