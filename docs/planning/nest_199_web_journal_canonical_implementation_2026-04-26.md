# Task

## Header

- ID: NEST-199
- Title: Implement canonical journal and reflection entry surface on web
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-198
- Priority: P1

## Context

After the canonical dashboard landed on web, the next visible module entry
surface worth upgrading was `Journal + Reflection`. The old screen worked
functionally but still felt form-first and flat instead of warm, guided, and
whole-life aware.

## Goal

Bring the web journal route into the same visual and UX grammar as the
canonical dashboard while preserving the existing CRUD flows for reflections and
life areas.

## Deliverable For This Stage

A verified web implementation that:

- reuses shared hero and context primitives,
- makes quick reflection feel warm and immediate,
- gives life-area context stronger narrative value,
- preserves existing journal and life-area management flows.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] `/journal` adopts the canonical hero/context grammar.
- [x] Shared primitives are reused beyond the dashboard route.
- [x] Relevant web validation commands pass.

## Stage Exit Criteria

- [x] The output matches the declared `Current Stage`.
- [x] Work from later stages was not mixed in without explicit approval.
- [x] Risks and assumptions for this stage are stated clearly.

## Forbidden

- new systems without approval
- duplicated logic or parallel implementations of the same contract
- temporary bypasses, hacks, or workaround-only paths
- architecture changes without explicit approval
- implicit stage skipping

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm test:unit`
- Manual checks:
  - journal route now uses shared hero/context primitives
  - quick reflection, life-area context, and recent entries are grouped into a
    more intentional hierarchy
  - dashboard primitives were generalized into reusable workspace primitives
- Screenshots/logs:
  - production build log from 2026-04-26
- High-risk checks:
  - reflection create/edit/delete flow preserved
  - life-area create/edit/delete flow preserved
  - no routing or auth-guard regressions introduced

## Architecture Evidence (required for architecture-impacting tasks)

- Architecture source reviewed:
  - `docs/architecture/modules.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed:
  - not applicable
- Follow-up architecture doc updates:
  - none

## UX/UI Evidence (required for UX/UI tasks)

- Source of truth type: approved_snapshot
- Design source reference:
  - `docs/ux/nest_197_dashboard_canonical_direction_2026-04-26.md`
- Stitch used: no
- Exception workflow reference (if stitch_exception):
  - not applicable
- Experience-quality bar reviewed: yes
- Visual-direction brief reviewed: yes
- Existing shared pattern reused:
  - dashboard hero band
  - dominant focus card
  - quiet context ribbon
  - dense desktop surfaces
- New shared pattern introduced: no
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: no
- State checks: loading | empty | error | success
- Responsive checks: desktop | tablet | mobile
- Input-mode checks: pointer | keyboard
- Accessibility checks:
  - preserved semantic form controls and CTA hierarchy
- Parity evidence:
  - web journal now aligns to the same mental model; mobile journal still needs
    follow-up adoption
- MCP evidence links:
  - canonical artifact remains:
    `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-canonical-preview.png`

## Review Checklist (mandatory)

- [x] Current stage is declared and respected.
- [x] Deliverable for the current stage is complete.
- [x] Architecture alignment confirmed.
- [x] Existing systems were reused where applicable.
- [x] No workaround paths were introduced.
- [x] No logic duplication was introduced.
- [x] Definition of Done evidence is attached.
- [x] Relevant validations were run.
- [x] Docs or context were updated if repository truth changed.
- [x] Learning journal was updated if a recurring pitfall was confirmed.

## Notes

- Shared UI primitives were generalized from dashboard-only usage to
  workspace-level reuse in:
  `apps/web/src/components/workspace-primitives.tsx`.
