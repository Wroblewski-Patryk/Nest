# Task

## Header

- ID: NEST-211
- Title: Apply premium finish pass to dashboard parity on web
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-210
- Priority: P1

## Context

The dashboard already matched the founder reference much more closely in
structure, but it still needed a finish pass on shell and material quality:

- sidebar still felt slightly too utilitarian,
- top utility chrome was a bit heavy,
- hero and support cards needed lighter micro-spacing and type rhythm,
- lower cards and footer strip still had room for a more premium final polish.

## Goal

Push the dashboard closer to the founder target through premium finish work on
the shell, topbar, hero, right rail, lower cards, and typography rhythm.

## Deliverable For This Stage

A verified finish-pass refinement with updated preview artifact and synchronized
repository truth.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic

## Definition of Done

- [x] shell and right rail feel lighter and more premium
- [x] hero and lower sections are more visually aligned with the founder
  reference
- [x] relevant web validation commands pass

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit`
- Screenshots/logs:
  - refreshed preview:
    `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview.png`

## UX/UI Evidence

- Source of truth type: approved_snapshot
- Design source reference:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`
- Existing shared pattern reused:
  - workspace shell
  - illustrated hero
  - support rail cards
  - day-flow timeline
  - insight footer strip
- New shared pattern introduced:
  - none
- Design-memory update required: no
