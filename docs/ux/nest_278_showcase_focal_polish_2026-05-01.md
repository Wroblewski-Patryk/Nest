# NEST-278 - Showcase Focal Polish

## Context

After reference-date alignment, Calendar and Journal were much closer to the
canonical desktop targets, but both still had one remaining storytelling issue:
Calendar did not consistently spotlight the intended flagship event, and
Journal showcase continued beyond the canonical room into lower management
surfaces.

## Goal

Strengthen the focal narrative of the showcase states so the first-screen story
matches the founder-approved canonical views more closely.

## Scope

- focal-event polish in `apps/web/src/app/calendar/page.tsx`
- showcase stopping-point polish in `apps/web/src/app/journal/page.tsx`
- preview visibility rule in `apps/web/src/app/globals.css`

## Changes

- Made Calendar showcase explicitly center the product strategy workshop in the
  `Now on deck` card, `Now` lane, and ladder.
- Switched Calendar showcase hero metrics to the founder-style reference values
  for day load, deep work, protected blocks, and sync pressure.
- Hid lower Journal life-area management and context surfaces during showcase
  mode so the desktop screen ends on recent entries plus the reflection ladder.
- Set the Journal showcase focus prompt to the canonical guided question rather
  than an excerpt from the synthetic entry body.

## Validation

- `pnpm exec tsc --noEmit` in `apps/web`
- `pnpm lint` in `apps/web`
- `pnpm build` in `apps/web`
- `pnpm test:unit` in `apps/web`

## Result

Calendar now reads more like a guided day centered on the right event, and
Journal feels less like a mixed canonical-plus-admin screen and more like one
complete reflection room.
