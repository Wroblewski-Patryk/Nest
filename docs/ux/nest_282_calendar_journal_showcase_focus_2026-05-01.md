# NEST-282 - Calendar and Journal showcase focus pass

## Context

After `NEST-281`, both Calendar and Journal were structurally closer to their
desktop references, but the highest-attention focus surfaces still felt too
generic. The showcase state still relied on the shared `DashboardFocusCard`,
which kept behavior stable but did not fully match the founder-approved visual
language for `Now on deck` and `Reflection focus`.

## Goal

Bring the focus sections of Calendar and Journal materially closer to the
canonical screenshots by giving showcase mode route-specific focus layouts.

## Scope

- replace Calendar showcase `DashboardFocusCard` with a custom `Now on deck`
  surface using time, chips, and a more editorial texture treatment
- replace Journal showcase `DashboardFocusCard` with a custom `Reflection
  focus` band using compact chips and a right-aligned primary action
- keep non-showcase live behavior on the shared focus primitive

## Constraints

- preserve existing links and action targets
- preserve live non-showcase behavior
- do not stage unrelated reference docs or temporary artifacts already present
  in the worktree

## Implementation Plan

1. add showcase-only focus layouts in `calendar/page.tsx` and `journal/page.tsx`
2. add route-local canonical CSS for those focus sections
3. rerun validations and capture fresh desktop evidence

## Acceptance Criteria

- Calendar showcase first viewport reads closer to the founder reference in the
  left focus block
- Journal showcase focus reads like a distinct editorial band instead of a
  reused utility card
- web validations pass

## Definition of Done

- implementation updated
- evidence captured
- context docs synced
- validations recorded

## Result Report

- Calendar showcase now uses a custom `Now on deck` panel with title, time,
  chips, supporting copy, a more reference-like CTA treatment, and denser
  painterly background framing.
- Journal showcase now uses a custom `Reflection focus` band with chip-style
  context and a right-aligned `Start reflection` action, which makes the upper
  narrative feel much closer to the approved screen.

## Evidence

- `docs/ux_canonical_artifacts/2026-04-30/_tmp-calendar-desktop-after-n282.png`
- `docs/ux_canonical_artifacts/2026-04-30/_tmp-journal-desktop-after-n282.png`

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`
