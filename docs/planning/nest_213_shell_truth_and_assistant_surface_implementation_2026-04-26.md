# Task

## Header

- ID: NEST-213
- Title: Implement shell truth and first-class assistant surface on web
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-212
- Priority: P1

## Context

The dashboard parity work had reached the point where route-local polishing was
not enough. The remaining founder-target gap was now driven by the shared shell
itself:

- the root web frame still did not express the premium sanctuary feel,
- the workspace shell needed a stronger canonical container,
- the product still lacked a first-class assistant/chat room inside the same
  system.

This slice implemented the first part of that plan so the app could start
feeling like one coherent product object instead of a set of improved pages.

## Goal

Strengthen the canonical web shell and give assistant support its own
first-class surface inside the same layout system.

## Deliverable For This Stage

A verified web implementation that:

- upgrades the root/frame typography and shell composition,
- improves the sidebar/topbar/application container,
- adds a dedicated assistant route in the shared shell,
- produces fresh screenshot evidence for dashboard and assistant views.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] canonical shell frame is stronger and more explicit
- [x] assistant exists as a first-class web surface in the shared shell
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
  - verified new `Assistant` route is available in build output
  - captured fresh local screenshots of `Dashboard` and `Assistant`
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseA.png`
  - `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseA.png`
- High-risk checks:
  - kept the assistant surface inside the existing shell and did not invent a
    parallel application frame

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
  - premium sanctuary material language
- New shared pattern introduced: yes
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: yes
- State checks: success surface only in this slice
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - semantic sections preserved
  - route-level navigation remains explicit
- Parity evidence:
  - screenshot capture against current local implementation
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

- This slice intentionally improves the shell and adds assistant framing, but it
  does not claim full dashboard founder-parity closure yet.
