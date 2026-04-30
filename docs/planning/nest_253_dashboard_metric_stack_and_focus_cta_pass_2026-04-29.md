# Task

## Header

- ID: NEST-253
- Title: Implement dashboard metric stack and focus CTA pass
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-252
- Priority: P1

## Context

After phase Y, two visible remaining differences still stood out:

- hero metric labels were still not stacked as cleanly as in the canonical
  image,
- the `Now focus` title and CTA still felt slightly too product-like.

## Goal

Align those two micro-composition details more closely with the canonical
founder screenshot.

## Deliverable For This Stage

- stacked hero metric labels with calmer rhythm
- `Now focus` title/CTA closer to the founder image
- refreshed screenshot evidence and review

## Definition of Done

- [x] hero metric labels are visually closer to the canonical image
- [x] `Now focus` CTA and title are calmer than phase Y
- [x] fresh screenshot evidence exists
- [x] relevant web validations pass

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit`
- Manual checks:
  - compared refreshed phase Z dashboard capture against the canonical founder
    reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseZ.png`
