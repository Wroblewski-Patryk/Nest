# Task

## Header

- ID: NEST-217
- Title: Refine dashboard shell composition and editorial entry on web
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-216
- Priority: P1

## Context

The previous parity review confirmed that the biggest remaining founder-target
gaps were no longer isolated inside single cards. The main mismatch now lived
in the shared workspace frame and in the way the dashboard entered the screen:

- the dashboard shell still carried remnants of an older hero/rail structure,
- the header still felt too much like a separate system card,
- the sidebar identity zone still felt slightly too utility-heavy,
- the assistant room needed one more pass toward a calmer premium feel.

## Goal

Bring the dashboard and shared shell closer to the canonical founder reference
by correcting shell composition, reducing top-entry segmentation, and refining
sidebar and assistant polish.

## Deliverable For This Stage

A verified web implementation that:

- makes the dashboard use one canonical shell grid,
- tightens the editorial relationship between page heading and hero,
- softens the shared sidebar/account rhythm,
- improves assistant conversation materials and refreshed screenshot evidence.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] dashboard shell uses one coherent desktop composition
- [x] top entry feels lighter and closer to the founder reference
- [x] sidebar/account/footer rhythm is calmer
- [x] relevant web validations pass
- [x] new screenshot evidence is stored

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
  - verified dashboard and assistant routes render with the refined shell
  - captured fresh local screenshots after the shell-grid and top-entry pass
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseD.png`
  - `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseD.png`
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseE.png`
  - `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseE.png`
- High-risk checks:
  - kept all work inside the existing shared shell and route structure

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
- State checks: success and empty-showcase states only in this slice
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - semantic sections preserved
  - route navigation remains explicit
- Parity evidence:
  - browser-captured local screenshots after the new shell pass
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

- This slice materially narrows the shared-shell mismatch, but it still does
  not claim full canonical dashboard parity yet.
