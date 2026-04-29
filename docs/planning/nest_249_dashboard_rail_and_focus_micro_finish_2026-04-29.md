# Task

## Header

- ID: NEST-249
- Title: Implement dashboard rail and focus micro finish
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-248
- Priority: P1

## Context

After phase V, the biggest remaining visual drift was concentrated in the
lower atmosphere of the left rail and the final compositional density of the
`Now focus` card.

## Goal

Reduce the remaining "implemented UI" feel in those two areas so the dashboard
reads even more like the canonical founder screenshot.

## Deliverable For This Stage

- quieter lower rail atmosphere and account zone
- softer `Now focus` composition with better title wrapping and CTA detail
- refreshed screenshot evidence and review

## Definition of Done

- [x] left rail is calmer than phase V
- [x] `Now focus` title and CTA are closer to the founder image
- [x] fresh screenshot evidence exists
- [x] relevant web validations pass

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit`
- Manual checks:
  - compared refreshed phase X dashboard capture against the canonical founder
    reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseX.png`

## Notes

- This pass intentionally stayed ultra narrow and touched only rail atmosphere
  and `Now focus` micro-composition.
