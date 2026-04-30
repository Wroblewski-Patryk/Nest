# Task

## Header

- ID: NEST-259
- Title: Replace dashboard container gradients with painterly asset pack
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-258
- Priority: P1

## Context

The dashboard still relied too heavily on CSS gradients and procedural washes.
That made the overall screen feel coded rather than art-directed, especially
across the hero, `Now focus`, support cards, and the main workspace canvas.

## Goal

Generate and wire a cohesive PNG background asset pack for the major canonical
dashboard surfaces so the screen reads closer to the founder reference.

## Deliverable For This Stage

- generated painterly PNG assets for major dashboard surfaces
- asset-driven backgrounds wired into dashboard containers
- refreshed screenshot evidence after asset integration
- recorded parity review and design-memory updates

## Definition of Done

- [x] hero uses a dedicated painterly scene asset
- [x] `Now focus` uses a dedicated painted panel asset
- [x] journal card uses a dedicated painterly card asset
- [x] workspace canvas and light support cards use painterly assets
- [x] fresh screenshot evidence exists
- [x] relevant web validations pass

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit`
- Manual checks:
  - compared refreshed phase AD dashboard capture against the canonical founder
    reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-30/nest-dashboard-web-parity-preview-phaseAD.png`

## Notes

- This pass intentionally moved multiple surfaces to generated image assets in
  one slice so the dashboard could read as one material family instead of a
  gradient-heavy UI with a few isolated illustrations.
