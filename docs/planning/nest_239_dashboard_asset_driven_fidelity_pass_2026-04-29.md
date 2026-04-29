# Task

## Header

- ID: NEST-239
- Title: Implement dashboard asset-driven fidelity pass
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-238
- Priority: P1

## Context

The canonical dashboard audit established that the remaining hero and journal
decorative gap should no longer be solved only with gradients and blur layers.
The founder reference carries painterly medium fidelity that code-native
approximation was flattening.

## Goal

Move the dashboard toward canonical fidelity by introducing real decorative
assets for the painterly hero and journal wash layers while preserving the
existing layout and component architecture.

## Deliverable For This Stage

A verified dashboard pass with:

- canonical-derived decorative image assets prepared in the web workspace,
- asset-driven hero landscape integration,
- asset-driven journal wash integration,
- refreshed screenshot evidence after the pass.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] decorative dashboard assets exist in the web workspace
- [x] hero landscape uses asset-driven fidelity instead of gradients alone
- [x] journal rail uses asset-driven decorative wash instead of gradients alone
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
  - compared refreshed phase P dashboard capture against the canonical founder
    reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseP.png`
- High-risk checks:
  - no dashboard logic, routing, or shared architecture contracts changed

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
  - dashboard primitives
  - dashboard parity implementation workflow
- New shared pattern introduced: yes
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: yes
- Visual gap audit completed: yes
- Background or decorative asset strategy:
  - canonical dashboard painterly regions now use workspace-bound raster
    artifacts
- Canonical asset extraction required: yes
- Screenshot comparison pass completed: yes
- Remaining mismatches:
  - left rail calm,
  - `Now focus` contrast,
  - final hero softness balance
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

- The asset pass intentionally preserved current composition and used real
  decorative medium only where the audit justified it.
