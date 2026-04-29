# Task

## Header

- ID: NEST-243
- Title: Implement canonical dashboard mode pass
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-242
- Priority: P1

## Context

After the shell serenity pass, the dashboard still showed a few major
first-glance mismatches against the canonical image:

- fallback utility/date copy was still dynamic instead of canonical,
- the dashboard rail still exposed the `Assistant` item that does not exist in
  the founder image,
- the welcome area still used symbolic avatar treatment,
- rail icon tone and focus-card material still leaned slightly more app-like
  than the reference.

## Goal

Push the dashboard into a stricter canonical dashboard presentation mode so the
browser-rendered result is visually closer to the founder image and clears the
90% similarity threshold.

## Deliverable For This Stage

A verified dashboard pass with:

- canonical fallback date, weather, and greeting copy,
- assistant nav hidden in canonical showcase mode,
- rail footer actions hidden in canonical showcase mode,
- canonical portrait avatar,
- calmer rail icon tone and softer focus-card material,
- refreshed screenshot evidence.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] dashboard showcase mode is visually closer to the founder screen
- [x] canonical utility copy overrides are active only where needed
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
  - compared refreshed phase T dashboard capture against the canonical founder
    reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseT.png`
- High-risk checks:
  - dashboard logic and route protection stayed unchanged

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
  - retained asset-driven decorative fidelity from earlier passes
- Canonical asset extraction required: no new extraction required
- Screenshot comparison pass completed: yes
- Remaining mismatches:
  - final microtypography and spacing drift only
- State checks: success showcase mode
- Responsive checks: desktop
- Input-mode checks: pointer
- Accessibility checks:
  - semantic structure preserved
  - decorative overrides remain non-essential
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

- This pass intentionally prioritised canonical screenshot closeness for the
  dashboard showcase state over fully dynamic utility copy.
