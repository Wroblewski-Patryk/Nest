# Task

## Header

- ID: NEST-251
- Title: Implement dashboard hero and ledger micro rhythm pass
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-250
- Priority: P1

## Context

After phase X, the remaining dashboard drift was concentrated in the micro
rhythm of the hero metrics and the lower ledger typography.

## Goal

Reduce that residual rhythm drift so the screen feels less like a coded layout
and more like the canonical founder composition.

## Deliverable For This Stage

- tighter hero headline and metric rhythm
- lighter lower-ledger row typography
- refreshed screenshot evidence and review

## Definition of Done

- [x] hero metric rhythm is closer to the canonical screenshot
- [x] lower-ledger typography is calmer than phase X
- [x] fresh screenshot evidence exists
- [x] relevant web validations pass

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit`
- Manual checks:
  - compared refreshed phase Y dashboard capture against the canonical founder
    reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-29/nest-dashboard-web-parity-preview-phaseY.png`
