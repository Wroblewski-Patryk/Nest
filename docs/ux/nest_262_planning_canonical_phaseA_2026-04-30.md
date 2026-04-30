# NEST-262 Planning Canonical Phase A

Date: 2026-04-30
Stage: verification
Owner: Execution Agent

## Context

The founder-approved Planning reference is now canonical in
`docs/ux_canonical_artifacts/2026-04-30/nest-planning-canonical-reference.png`.
The web Planning route already had functional Tasks, Lists, Goals, and Targets
workflows, but the first viewport still read as a utilitarian CRUD surface
rather than the weekly orchestration room shown in the canonical image.

## Goal

Bring the web Planning module closer to the canonical direction while
preserving the existing API-backed workflows and the dashboard-derived shell.

## Scope

- Web route: `apps/web/src/app/tasks/page.tsx`
- Shared dashboard primitive: `apps/web/src/components/workspace-primitives.tsx`
- Shared styling: `apps/web/src/app/globals.css`
- Documentation and context sync for the canonical implementation pass

## Implementation Plan

1. Keep the existing Planning sidebar and CRUD workflows intact.
2. Add a canonical first viewport for Planning: weekly direction hero,
   `Now planning` focus card, week flow, clarity rail, quick add, pressure
   summary, relational task table, and planning ladder.
3. Reuse dashboard canonical shell and painterly materials where they already
   exist.
4. Make the new canonical area responsive before treating the pass as done.
5. Capture desktop and mobile evidence and run web validation gates.

## Acceptance Criteria

- Planning opens with a canonical weekly orchestration composition instead of
  a generic setup/board-first layout.
- Sidebar layout remains unchanged from the dashboard canonical shell.
- Tasks expose linked Goal, Target, and List context in compact relational rows.
- `Goal -> Target -> List -> Next task` ladder exists as an implementation
  surface.
- Existing task/list/goal/target functionality remains available below the
  canonical entry surface.
- Desktop and mobile screenshots show no incoherent overlap.

## Definition Of Done

- Implementation output exists in the web app.
- Documentation and context files record the task and evidence.
- Relevant web validations are run and recorded.
- Remaining fidelity gaps are explicit rather than hidden.

## Result Report

Phase A is implemented. The first Planning viewport now follows the canonical
image structure while preserving the existing API-backed CRUD board beneath it.

Evidence:

- Desktop:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseF.png`
- Mobile:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-mobile-preview-phaseA.png`

Known follow-up:

- With the API unavailable locally, the canonical entry uses presentation-only
  fallback content while the lower CRUD area remains true to stored data.
  A non-blocking load failure callout appears below the canonical area.
- A future fidelity pass should tune painterly illustration strength and
  microspacing after live seeded data is available.
