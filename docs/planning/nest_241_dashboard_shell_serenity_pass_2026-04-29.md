# Task

## Header

- ID: NEST-241
- Title: Implement dashboard shell serenity pass
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-240
- Priority: P1

## Context

After the asset-driven fidelity pass, the dashboard improved in medium quality,
but the founder reference still exposed one major gap: the left rail and focus
surface still contained symbolic or system-like decorative treatment instead of
the softer, more literal ornamental imagery from the canonical image.

## Goal

Bring the workspace shell closer to canonical serenity by replacing remaining
symbolic decorative motifs with target-derived assets and by softening the
focus card ornament treatment.

## Deliverable For This Stage

A verified shell serenity pass with:

- canonical-derived brand mark asset integration,
- canonical-derived left-rail plant asset integration,
- canonical-derived `Now focus` ornamental foliage integration,
- refreshed screenshot evidence after the pass.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] symbolic left-rail graphics are replaced with canonical-derived assets
- [x] `Now focus` uses a calmer asset-driven ornamental treatment
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
  - compared refreshed phase R dashboard capture against the canonical founder
    reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseR.png`
- High-risk checks:
  - no navigation logic, auth flow, or dashboard data behavior changed

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
  - dashboard parity asset strategy
- New shared pattern introduced: yes
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: yes
- Visual gap audit completed: yes
- Background or decorative asset strategy:
  - canonical decorative crops used in place of symbolic CSS-only motifs
- Canonical asset extraction required: yes
- Screenshot comparison pass completed: yes
- Remaining mismatches:
  - final shell calm,
  - focus-card material balance,
  - remaining microtypography and spacing drift
- State checks: success
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - decorative assets are non-essential
  - semantic structure unchanged
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

- This pass intentionally focused on replacing symbolic visuals with target-like
  ornamental assets before continuing with micro-layout polish.
