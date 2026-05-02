# Task

## Header

- ID: NEST-295
- Title: Brand naming correction to Nest
- Task Type: design
- Current Stage: release
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-294
- Priority: P0
- Coverage Ledger Rows: not applicable
- Iteration: 295
- Operation Mode: TESTER

## Process Self-Audit
- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context
The user clarified on 2026-05-02 that the product name is simply `Nest`.
Canonical previews and repository copy must not use the old product suffix or similar stale product-branding.

## Goal
Normalize product naming to `Nest` across visible UI copy, agent guidance,
fresh UX documentation, and canonical Dashboard preview artifacts.

## Scope
- Agent prompt and workflow copy that named the project with the old suffix
- Public/mobile visible brand copy
- Shared localization brand and Dashboard ladder text
- UX/product/architecture docs that used the old suffix or old product metaphor
- Canonical Dashboard preview artifacts generated for `NEST-294`
- Renamed UX docs and local skill folder paths that contained the old suffix

## Success Signal
- User or operator problem: the product branding in canonical views and docs is
  wrong.
- Expected product or reliability outcome: future UI generation and runtime
  surfaces refer to the product as `Nest`.
- How success will be observed: static search finds no remaining textual
  stale product-branding patterns
  matches outside binary image artifacts.
- Post-launch learning needed: no

## Deliverable For This Stage
Release-ready naming correction plus regenerated desktop/mobile Dashboard
canonical previews.

## Constraints
- preserve runtime behavior
- do not alter API, auth, tenancy, or data contracts
- preserve the five-pillar Dashboard IA from `NEST-294`
- keep generated canonical previews premium and calm
- do not use the old product suffix in product branding

## Implementation Plan
1. Evaluate the `NEST-294` generated Dashboard previews against the naming
   correction.
2. Regenerate desktop and mobile canonical previews with `Nest` as the only
   brand text.
3. Mechanically normalize text references in source/docs.
4. Rename docs/local skill paths containing the old suffix where safe.
5. Run static search and frontend validations.
6. Update task board and project state.

## Acceptance Criteria
- Canonical Dashboard desktop and mobile preview images display `Nest`, not the
  old suffix.
- Textual repository search outside binary image artifacts returns no old
  suffix or stale product-branding matches.
- Web and mobile typechecks pass.
- Web lint, build, and unit checks pass.
- Mobile unit contract passes.

## Definition of Done
- [x] Implementation and documentation output exists.
- [x] Acceptance criteria are verified.
- [x] Required validations are run and recorded.
- [x] Task status is updated in `.codex/context/TASK_BOARD.md`.
- [x] `.codex/context/PROJECT_STATE.md` reflects current reality.

## Forbidden
- changing runtime API behavior
- changing tenant or auth contracts
- using the old product suffix in new UI or docs
- replacing the five-pillar navigation rule

## Validation Evidence

- Tests:
  - `pnpm exec tsc --noEmit` in `apps/web` passed.
  - `pnpm lint` in `apps/web` passed.
  - `pnpm build` in `apps/web` passed.
  - `pnpm test:unit` in `apps/web` passed.
  - `pnpm exec tsc --noEmit` in `apps/mobile` passed.
  - `pnpm test:unit` in `apps/mobile` passed.
  - `git diff --check` passed.
- Manual checks:
  - Static repository search found no remaining textual matches for the old
    suffix or stale product-branding outside binary image artifacts.
  - Visual inspection confirmed the regenerated desktop and mobile preview
    images use `Nest` branding.
- Screenshots/logs:
  - `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-canonical-ia-desktop-2026-05-02.png`
  - `docs/ux_canonical_artifacts/2026-05-02/nest-dashboard-canonical-ia-mobile-2026-05-02.png`
- High-risk checks: API, auth, tenancy, and data loading paths unchanged.
- Coverage ledger updated: not applicable
- Coverage rows closed or changed: none

## Architecture Evidence

- Architecture source reviewed:
  `docs/architecture/frontend_strategy.md`,
  `docs/ux/nest_canonical_view_architecture_2026-05-02.md`.
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed: user naming clarification on
  2026-05-02
- Follow-up architecture doc updates: naming references updated.

## UX/UI Evidence

- Source of truth type: approved_snapshot
- Design source reference: user naming clarification plus `NEST-294` IA
  direction
- Canonical visual target:
  corrected generated desktop/mobile Dashboard previews
- Fidelity target: structurally_faithful
- Stitch used: no
- Existing shared pattern reused: five-pillar Dashboard IA and existing visual
  system
- New shared pattern introduced: no
- Design-memory update required: yes, completed by terminology cleanup
- Visual gap audit completed: yes
- Screenshot comparison pass completed: visual inspection of regenerated
  artifacts
- Remaining mismatches: none blocking for canonical Dashboard direction
- Responsive checks: desktop/mobile canonical previews inspected
- Accessibility checks: runtime behavior unchanged
- Parity evidence: corrected desktop/mobile Dashboard previews

## Result Report

- Task summary: Normalized product naming to `Nest`, regenerated canonical
  Dashboard previews, renamed fresh UX docs and the local scaffold skill path
  away from the old suffix, and verified no textual old-brand matches remain.
- Files changed: prompt/docs/UI copy/localization/canonical previews listed in
  git diff for this task.
- How tested: web/mobile typechecks, web lint/build/unit, mobile unit, static
  branding search, visual preview inspection, and `git diff --check`.
- What is incomplete: binary image artifacts outside the regenerated canonical
  previews were not OCR-scanned.
- Next steps: future UI prompts must state `Nest` as the only product name.
- Decisions made: replace old product metaphors with `workspace`, `system`, or
  direct `Nest` wording depending on context.

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues: generated previews and repository text still used the old suffix.
- Gaps: file paths and docs also carried stale naming.
- Inconsistencies: product branding contradicted the user's clarification.
- Architecture constraints: preserve runtime behavior and current five-pillar
  IA.

### 2. Select One Priority Task
- Selected task: NEST-295 Brand naming correction to Nest.
- Priority rationale: branding correctness is a canonical UX blocker.
- Why other candidates were deferred: no further layout change was necessary
  after corrected previews.

### 3. Plan Implementation
- Files or surfaces to modify: text copy, docs, local skill path, canonical
  preview artifacts.
- Logic: no data or API logic changes.
- Edge cases: avoid touching binary assets except the two regenerated
  canonical previews.

### 4. Execute Implementation
- Implementation notes: regenerated two previews, replaced stale naming text,
  and renamed docs/skill paths where safe.

### 5. Verify and Test
- Validation performed: static search, image inspection, web/mobile checks, and
  diff check.
- Result: passed.

### 6. Self-Review
- Simpler option considered: only regenerating images; rejected because runtime
  and docs still had stale branding.
- Technical debt introduced: no
- Scalability assessment: future agents now receive corrected product naming in
  prompts and docs.
- Refinements made: old product-metaphor wording was replaced with calmer Nest
  workspace/system language.

### 7. Update Documentation and Knowledge
- Docs updated: task report, context docs, UX architecture/design docs, product
  docs, agent guidance.
- Context updated: task board and project state.
- Learning journal updated: not applicable.
