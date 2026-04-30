# Task

## Header

- ID: NEST-255
- Title: Flatten shell container and continue dashboard finish
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-254
- Priority: P1

## Context

The desktop shell still wrapped the application in a rounded container with its
own border, padding, and background treatment. That framing was a clear source
of drift from the canonical founder image and also made the dashboard feel more
like a nested card than a directly composed surface.

## Goal

Remove the over-wrapped desktop shell framing, move the atmosphere to
`workspace-main`, and continue tightening dashboard parity afterward.

## Deliverable For This Stage

- desktop shell wrapper flattened
- aura background moved from `workspace-bg` into `workspace-main`
- refreshed dashboard screenshot evidence after the shell change
- parity review recorded

## Definition of Done

- [x] desktop shell no longer uses the large rounded wrapper treatment
- [x] workspace atmosphere is carried by `workspace-main`
- [x] fresh screenshot evidence exists
- [x] relevant web validations pass

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit`
- Manual checks:
  - compared refreshed phase AA dashboard capture against the canonical founder
    reference
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-04-30/nest-dashboard-web-parity-preview-phaseAA.png`

## Notes

- This pass intentionally changed shell framing first because it affected the
  perceived fidelity of every screen inside the workspace, not just dashboard.
