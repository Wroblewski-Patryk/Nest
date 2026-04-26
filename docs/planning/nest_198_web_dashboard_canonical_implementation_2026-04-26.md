# Task

## Header

- ID: NEST-198
- Title: Implement canonical web dashboard hierarchy with reusable primitives
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-197
- Priority: P1

## Context

The canonical dashboard direction was documented in `NEST-197`, but the web
route `/dashboard` still used the older flatter composition. The next smallest
execution slice was to bring the web dashboard into alignment while extracting
reusable primitives that future module work can inherit.

## Goal

Upgrade the web dashboard to the new canonical hierarchy with:

- editorial hero band,
- dominant `Now Focus` card,
- quiet whole-life context ribbon,
- reusable dashboard primitives,
- warmer reflection treatment and stronger desktop composition.

## Deliverable For This Stage

A verified web implementation on `apps/web` with reusable dashboard primitives
and passing web quality gates.

## Constraints

- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Definition of Done

- [x] `/dashboard` uses the new canonical information hierarchy.
- [x] Reusable dashboard primitives are extracted from route-local markup.
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
  - dashboard layout upgraded to hero + focus + timeline + reflection +
    whole-life context composition
  - quiet context ribbon now includes goals, life-balance, and reflection pulse
  - route uses reusable primitives instead of dashboard-only repeated markup
- Screenshots/logs:
  - production build log from 2026-04-26
- High-risk checks:
  - verified no raw API payload handling regression in dashboard surface
  - verified dashboard still refreshes and saves quick reflections

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
  - split-view workspace
  - dense desktop surfaces
  - empty-state clarity
- New shared pattern introduced: yes
- Design-memory entry reused:
  - `docs/ux/design-memory.md`
- Design-memory update required: no
- State checks: loading | empty | error | success
- Responsive checks: desktop | tablet | mobile
- Input-mode checks: pointer | keyboard
- Accessibility checks:
  - preserved semantic buttons/links and progressbar semantics
- Parity evidence:
  - web hierarchy now matches the canonical cross-surface mental model; mobile
    implementation still needs follow-up adoption
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

- This slice intentionally focuses on the web dashboard first.
- Recommended next task: propagate the same primitive grammar into mobile and
  adjacent module entry surfaces.
