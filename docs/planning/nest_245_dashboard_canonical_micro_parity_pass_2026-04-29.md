# Task

## Header

- ID: NEST-245
- Title: Implement dashboard canonical micro parity pass
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-244
- Priority: P1

## Context

After phase T, the dashboard had already crossed practical 90% convergence,
but several small differences still made the implementation read more like a
productized dashboard than the founder screenshot:

- the shell still exposed non-canonical dashboard chrome,
- the title and rail typography needed calmer editorial proportions,
- `Now focus` still carried extra structure and too much digital polish,
- the lower dashboard ledger and life-area donut still diverged from the
  screenshot language.

## Goal

Tighten the dashboard into a more screenshot-faithful canonical mode by
removing remaining non-canonical UI signals and refining the most visible
micro-composition gaps.

## Deliverable For This Stage

A verified pass with:

- canonical dashboard shell tone,
- quieter rail and masthead proportions,
- simplified `Now focus`,
- more canonical lower ledger and life-area donut treatment,
- fresh screenshot evidence and review.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] canonical dashboard mode is visually closer to the founder image
- [x] lower ledger reads more like the founder screenshot
- [x] fresh screenshot evidence exists
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
  - compared refreshed phase U dashboard capture against the canonical founder
    reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseU.png`
- High-risk checks:
  - route logic, auth session behavior, and dashboard data selection remained
    unchanged

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
  - canonical dashboard mode
  - asset-driven dashboard parity patterns
- New shared pattern introduced: yes
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: yes
- Visual gap audit completed: yes
- Background or decorative asset strategy:
  - retained raster-asset-based fidelity for the hero and reflection surfaces
- Canonical asset extraction required: no new extraction required
- Screenshot comparison pass completed: yes
- Remaining mismatches:
  - final `Now focus` softness
  - left-rail micro-spacing
  - some lower-ledger typography rhythm
- State checks: success showcase mode
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - semantic structure preserved
  - decorative changes remained non-essential
- Parity evidence:
  - browser-rendered local screenshot after the pass
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

- This pass intentionally removed several elegant-but-non-canonical dashboard
  details so the browser render would read closer to the founder reference.
