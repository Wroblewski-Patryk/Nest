# Task

## Header

- ID: NEST-235
- Title: V1 navigation scope alignment
- Task Type: refactor
- Current Stage: implementation
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-234
- Priority: P1
- Coverage Ledger Rows: not applicable
- Iteration: 235
- Operation Mode: TESTER

## Process Self-Audit
- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

The V1/V2 architecture split says V1 is the practical core product and that AI,
growth-loop analytics, advanced billing, and broader automation are not release
dependencies. The web rail still presented Insights and Assistant as core
modules, while mobile Settings explicitly says non-core surfaces should stay out
of the main daily tab loop even though Insights remained in the main tab bar.

## Goal

Align navigation hierarchy with the V1 architecture split: core daily modules
stay primary, while optional/future surfaces remain reachable but visually
secondary.

## Scope

- `apps/web/src/components/workspace-shell.tsx`
- `apps/web/src/app/globals.css`
- `apps/mobile/app/(tabs)/_layout.tsx`
- `apps/mobile/app/(tabs)/settings.tsx`
- `packages/shared-types/src/localization.js`
- Planning/context docs

## Success Signal
- User or operator problem: the V1 UI should not imply out-of-scope surfaces are
  part of the core founder-ready gate.
- Expected product or reliability outcome: core navigation matches the
  architecture split while optional surfaces remain discoverable.
- How success will be observed: web/mobile typechecks pass and static inspection
  confirms Insights/Assistant are no longer core nav entries.
- Post-launch learning needed: no

## Deliverable For This Stage

Implement the navigation hierarchy adjustment, verify web/mobile typechecks,
update docs/context, and commit the slice.

## Constraints
- use existing systems and approved mechanisms
- preserve tenancy, localization, and actor boundaries
- preserve web/mobile parity for core module behavior
- do not introduce workaround-only paths
- do not duplicate logic
- stay within the declared current stage unless explicit approval changes it

## Implementation Plan

1. Split web rail navigation into core V1 modules and secondary optional
   surfaces.
2. Keep Insights and Assistant reachable, but outside the core modules nav.
3. Hide mobile Insights from the primary tab bar while preserving access through
   Settings additional surfaces.
4. Add/adjust shared localization keys for optional-surface labels.
5. Run web and mobile typechecks plus static inspection.
6. Update project/task docs and commit.

## Acceptance Criteria

- Web core rail no longer treats Insights/Assistant as core modules.
- Web optional surfaces remain reachable through secondary navigation.
- Mobile Insights is not in the main tab loop, but remains reachable from
  Settings.
- `pnpm exec tsc --noEmit` passes for web and mobile.
- No API, auth, data ownership, or route behavior changes.

## Definition of Done
- [x] implementation output exists
- [x] acceptance criteria are verified
- [x] required validations were run and recorded
- [x] task status is updated in `.codex/context/TASK_BOARD.md`
- [x] `.codex/context/PROJECT_STATE.md` reflects current reality

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

- Tests: `pnpm exec tsc --noEmit` in `apps/web`; `pnpm exec tsc --noEmit` and
  `pnpm exec expo export --platform web` in `apps/mobile`.
- Manual checks: static inspection confirmed web core/optional nav split,
  optional-surface localization keys, and mobile Insights `href: null`.
- Screenshots/logs: not applicable
- High-risk checks: no route/API/data behavior changed
- Coverage ledger updated: not applicable
- Coverage rows closed or changed: not applicable

## Architecture Evidence

- Architecture source reviewed: `docs/architecture/README.md`,
  `docs/architecture/architecture-source-of-truth.md`,
  `docs/architecture/system-architecture.md`,
  `docs/architecture/v1_v2_delivery_split.md`
- Fits approved architecture: yes
- Mismatch discovered: no
- Decision required from user: no
- Approval reference if architecture changed: not applicable
- Follow-up architecture doc updates: none expected

## UX/UI Evidence

- Source of truth type: architecture + existing app shell
- Existing shared pattern reused: existing web rail, mobile Settings additional
  surfaces, shared localization dictionary
- New shared pattern introduced: no
- Design-memory update required: no
- State checks: not applicable
- Feedback locality checked: not applicable
- Raw technical errors hidden from end users: not applicable
- Responsive checks: desktop | mobile
- Input-mode checks: touch | pointer | keyboard
- Accessibility checks: nav aria labels preserved
- Parity evidence: non-core surfaces remain reachable outside the main daily
  loop on both web and mobile

## Review Checklist
- [x] Process self-audit completed before implementation.
- [x] Autonomous loop evidence covers all seven steps.
- [x] Exactly one priority task was selected in this iteration.
- [x] Operation mode was selected according to iteration rotation.
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

This does not solve `NEST-231`; mobile authenticated API session remains blocked
by a required explicit user decision.

## Production-Grade Required Contract

Included through Goal, Scope, Implementation Plan, Acceptance Criteria,
Definition of Done, and Result Report sections.

## Integration Evidence

- `INTEGRATION_CHECKLIST.md` reviewed: not applicable
- Real API/service path used: unchanged
- Endpoint and client contract match: unchanged
- DB schema and migrations verified: not applicable
- Loading state verified: not applicable
- Error state verified: not applicable
- Refresh/restart behavior verified: unchanged
- Regression check performed: web/mobile typechecks, mobile web export, and
  static navigation inspection

## Product / Discovery Evidence
- Problem validated: yes
- User or operator affected: founder using V1 daily navigation
- Existing workaround or pain: optional surfaces looked like V1 core modules
- Smallest useful slice: navigation hierarchy only
- Success metric or signal: typechecks and static inspection pass
- Feature flag, staged rollout, or disable path: revert commit
- Post-launch feedback or metric check: not applicable

## Reliability / Observability Evidence
- `docs/operations/service-reliability-and-observability.md` reviewed: not applicable
- Critical user journey: V1 core navigation
- SLI: not applicable
- SLO: not applicable
- Error budget posture: not applicable
- Health/readiness check: not applicable
- Logs, dashboard, or alert route: not applicable
- Smoke command or manual smoke: typecheck/static inspection
- Rollback or disable path: revert commit

## AI Testing Evidence

Not applicable.

## Security / Privacy Evidence
- `docs/security/secure-development-lifecycle.md` reviewed: not applicable
- Data classification: unchanged
- Trust boundaries: unchanged
- Permission or ownership checks: unchanged backend enforcement
- Abuse cases: not applicable for navigation hierarchy
- Secret handling: no secrets touched
- Security tests or scans: not applicable
- Fail-closed behavior: unchanged
- Residual risk: low

## Result Report

- Task summary: split web navigation into V1 core modules and optional surfaces,
  hid mobile Insights from the primary tab loop, and preserved optional route
  access through secondary navigation/settings.
- Files changed: `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/app/globals.css`, `apps/mobile/app/(tabs)/_layout.tsx`,
  `apps/mobile/app/(tabs)/settings.tsx`,
  `apps/mobile/components/ExternalLink.tsx`,
  `packages/shared-types/src/localization.js`, planning/context docs.
- How tested: web typecheck, mobile typecheck, mobile Expo web export,
  `git diff --check`, static navigation inspection.
- What is incomplete: mobile authenticated API session remains blocked by
  `NEST-231`.
- Next steps: continue unblocked V1 architecture/view convergence, or resolve
  `NEST-231` when the user chooses an option.
- Decisions made: keep optional routes available rather than deleting them,
  because architecture allows implementation experiments outside the V1 gate.

## Autonomous Loop Evidence

### 1. Analyze Current State
- Issues: optional V2-adjacent surfaces appeared in core navigation.
- Gaps: mobile Settings described non-core surfaces outside the daily tab loop,
  while Insights was still a main tab.
- Inconsistencies: architecture says AI/growth/billing are outside V1 gate, but
  nav hierarchy made them look core.
- Architecture constraints: keep optional surfaces reachable without making them
  V1 readiness dependencies.

### 2. Select One Priority Task
- Selected task: `NEST-235` V1 navigation scope alignment.
- Priority rationale: directly improves architecture/view convergence without
  touching blocked mobile auth.
- Why other candidates were deferred: mobile auth implementation still requires
  explicit user decision.

### 3. Plan Implementation
- Files or surfaces to modify: web shell, mobile tab layout/settings, shared
  localization dictionary, planning/context docs.
- Logic: split core/optional nav and hide mobile Insights from the main tab bar.
- Edge cases: preserve deep-link access to optional routes and do not remove
  implementation experiments.

### 4. Execute Implementation
- Implementation notes: split web shell nav into `CORE_NAV_ITEMS` and
  `OPTIONAL_NAV_ITEMS`, added optional-surface rail styling, hid mobile
  Insights with Expo Router `href: null`, and localized the remaining mobile
  Billing settings label.

### 5. Verify and Test
- Validation performed: web/mobile typechecks, mobile web export, static
  navigation inspection, and `git diff --check`.
- Result: passed. `ExternalLink` needed a typed-router wrapper fix so mobile
  typecheck could validate cleanly.

### 6. Self-Review
- Simpler option considered: delete optional routes; rejected because
  architecture allows implementation experiments as long as they do not define
  the V1 gate.
- Technical debt introduced: no
- Scalability assessment: optional surfaces can now grow without presenting as
  V1 core modules.
- Refinements made: updated `ExternalLink` to use the Expo `Link` href prop type
  instead of a raw string, preserving native browser-open behavior.

### 7. Update Documentation and Knowledge
- Docs updated: task report.
- Context updated: `.codex/context/TASK_BOARD.md` and
  `.codex/context/PROJECT_STATE.md`.
- Learning journal updated: not applicable.
