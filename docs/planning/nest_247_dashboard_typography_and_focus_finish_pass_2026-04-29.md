# Task

## Header

- ID: NEST-247
- Title: Implement dashboard typography and focus finish pass
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-246
- Priority: P1

## Context

After phase U, the remaining visual drift was concentrated in a few highly
visible details:

- the `Dashboard` masthead still lacked enough serif authority,
- the active dashboard rail item was calmer than before but still too muted,
- `Now focus` still carried a little too much weight and digital smoothness.

## Goal

Tighten the highest-visibility typography and focus-card details so the first
glance of the dashboard moves even closer to the canonical founder image.

## Deliverable For This Stage

A verified pass with:

- stronger canonical serif treatment in the masthead,
- clearer active dashboard rail state,
- softer and slightly less dominant `Now focus`,
- refreshed screenshot evidence and review.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] masthead is visually closer to the founder screenshot
- [x] active rail state reads more like the canonical image
- [x] `Now focus` is calmer than phase U
- [x] fresh screenshot evidence exists
- [x] relevant web validations pass

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit`
- Manual checks:
  - compared refreshed phase V dashboard capture against the canonical founder
    reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseV.png`

## Notes

- This pass stayed intentionally ultra narrow and changed only typography,
  active-rail emphasis, and focus-card material/scale.
