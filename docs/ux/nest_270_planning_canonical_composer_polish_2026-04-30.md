# NEST-270 Planning Canonical Composer Polish

Date: 2026-04-30
Stage: verification
Owner: Execution Agent

## Context

The Planning route already had canonical structure, tab depth, and preview
noise reduction. The next closure gap was mostly tonal: inline canonical
composers still felt like raw form containers, and the live-data fallback still
read more like a technical notice than an intentional system-status surface.

## Goal

Polish the canonical Planning composers and the preview/live-data strip so the
screen feels more finished, calmer, and more product-like while preserving all
existing data and CRUD behavior.

## Scope

- Web Planning route: `apps/web/src/app/tasks/page.tsx`
- Planning visual system: `apps/web/src/app/globals.css`
- UX documentation and execution context sync

## Implementation Plan

1. Keep canonical layout and runtime behavior unchanged.
2. Add shared narrative chrome to inline canonical composers.
3. Add tab-aware mini-context stats to each composer.
4. Convert the live-data notice into a calmer status strip with refresh access.
5. Refresh evidence for main and tab variants.

## 25 Micro-Slice Batch

- [x] 1. Add composer eyebrow for `Tasks`.
- [x] 2. Add composer eyebrow for `Lists`.
- [x] 3. Add composer eyebrow for `Goals`.
- [x] 4. Add composer eyebrow for `Targets`.
- [x] 5. Add composer title for `Tasks`.
- [x] 6. Add composer title for `Lists`.
- [x] 7. Add composer title for `Goals`.
- [x] 8. Add composer title for `Targets`.
- [x] 9. Add composer explanatory copy for `Tasks`.
- [x] 10. Add composer explanatory copy for `Lists`.
- [x] 11. Add composer explanatory copy for `Goals`.
- [x] 12. Add composer explanatory copy for `Targets`.
- [x] 13. Add task composer mini-stats.
- [x] 14. Add list composer mini-stats.
- [x] 15. Add goal composer mini-stats.
- [x] 16. Add target composer mini-stats.
- [x] 17. Add task composer footer guidance.
- [x] 18. Add list composer footer guidance.
- [x] 19. Add goal composer footer guidance.
- [x] 20. Add target composer footer guidance.
- [x] 21. Replace preview notice paragraph with canonical status strip.
- [x] 22. Keep refresh action inside the status strip.
- [x] 23. Style status strip states for preview/error/success use.
- [x] 24. Style composer stats and typography as canonical sub-surfaces.
- [x] 25. Refresh phase M evidence and rerun web validation gates.

## Acceptance Criteria

- Canonical composers carry consistent narrative framing and context across
  tabs.
- The preview/live-data state uses one calmer status strip instead of a raw
  fallback alert paragraph.
- CRUD handlers and runtime flows remain unchanged.
- Fresh evidence exists for the default Planning view and the `Lists`,
  `Goals`, and `Targets` tabs.
- Web validation gates pass.

## Definition Of Done

- Implementation output exists.
- Visual evidence is refreshed.
- Validation evidence is recorded.
- Task board, project state, and design memory are updated.
- Remaining work is explicit.

## Result Report

Phase M is implemented. Canonical composers now read like part of the Planning
experience instead of generic embedded forms: each mode has its own eyebrow,
title, explanation, compact stats, and quieter footer guidance. The preview
fallback now ends with a slim status strip that keeps runtime truth visible
without breaking the visual calm of the screen.

Evidence:

- Main:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseM.png`
- Lists:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-lists-preview-phaseM.png`
- Goals:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-goals-preview-phaseM.png`
- Targets:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-targets-preview-phaseM.png`

Validation:

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`

Known follow-up:

- Preview mode still depends on the bottom status strip to tell the user why
  canonical sample data is visible; a future pass can integrate this more
  natively with a dedicated non-intrusive workspace state pattern.
- Live-data mode still preserves older dense management panels beneath the
  canonical story; those can be consolidated into one advanced-management
  surface in a later slice.
