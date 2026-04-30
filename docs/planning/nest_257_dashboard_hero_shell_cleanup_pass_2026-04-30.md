# Task

## Header

- ID: NEST-257
- Title: Tighten dashboard hero and shell cleanup parity
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-256
- Priority: P1

## Context

After shell flattening, the dashboard still carried a few clearly
implementation-shaped signals compared to the canonical founder image:
duplicated hero copy, an over-wrapped timeline chrome, and rail/icon rhythm
that still felt more app-system than editorial composition.

## Goal

Tighten hero fidelity, simplify the canonical timeline card chrome, and bring
the left rail closer to the canonical image through calmer spacing and more
faithful iconography.

## Deliverable For This Stage

- cleaned-up hero copy and proportion
- canonical timeline panel without non-reference header chrome
- calmer left rail rhythm and more faithful dashboard icon
- refreshed screenshot evidence and recorded parity review

## Definition of Done

- [x] duplicated hero progress copy is removed in canonical mode
- [x] canonical timeline panel no longer shows extra non-reference header chrome
- [x] left rail iconography and rhythm move closer to the founder reference
- [x] fresh screenshot evidence exists
- [x] relevant web validations pass

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit`
- Manual checks:
  - compared refreshed phase AC dashboard capture against the canonical founder
    reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-30/nest-dashboard-web-parity-preview-phaseAC.png`

## Notes

- This pass intentionally favored structural cleanup over more decorative
  polish because the remaining visible drift still included a few
  non-canonical UI decisions rather than only painterly nuance.
