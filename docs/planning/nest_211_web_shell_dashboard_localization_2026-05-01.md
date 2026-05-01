# Task

## Header

- ID: NEST-211
- Title: Move web shell and dashboard copy to shared localization keys
- Task Type: feature
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-210
- Priority: P1
- Iteration: autonomous worker 2026-05-01
- Operation Mode: BUILDER

## Context

`NEST-210` confirmed that the authenticated web shell and `/dashboard` still
rendered founder-critical copy in hard-coded English and that the shell read
language from `NEXT_PUBLIC_NEST_DEFAULT_LANGUAGE` instead of the stored user
preference. This slice closes the first runtime localization gap on the web
path without widening into Planning, Calendar, Journal, or settings
propagation.

## Goal

Move authenticated shell and dashboard entry copy onto the shared translation
contract and make the shell honor the persisted web UI language.

## Scope

- shared dictionary:
  `packages/shared-types/src/localization.js`
- web language source:
  `apps/web/src/lib/ui-language.ts`
- authenticated shell:
  `apps/web/src/components/workspace-shell.tsx`
  `apps/web/src/components/workspace-logout-button.tsx`
- dashboard route:
  `apps/web/src/app/dashboard/page.tsx`
- planning/context sync:
  `docs/planning/mvp-next-commits.md`
  `docs/planning/v1_execution_backlog_2026-04-26.md`
  `.codex/context/TASK_BOARD.md` (attempted; blocked by local ACL deny)
  `.codex/context/PROJECT_STATE.md` (attempted; blocked by local ACL deny)

## Success Signal

- User or operator problem:
  authenticated web entry still behaved like an English-only shell even after a
  user selected Polish in pre-auth or onboarding flows.
- Expected product or reliability outcome:
  web shell navigation, utility labels, logout copy, and dashboard entry copy
  now come from shared keys and resolve against the stored web language.
- How success will be observed:
  shell and dashboard render translated copy when stored language is `pl`,
  without introducing a second translation system.
- Post-launch learning needed: yes

## Deliverable For This Stage

Implemented runtime localization changes plus updated queue/context records and
validation evidence.

## Validation Evidence

- Tests:
  `.\node_modules\.bin\tsc.CMD --noEmit` in `apps/web`
  `node .\node_modules\eslint\bin\eslint.js .` in `apps/web`
  `node --experimental-strip-types .\scripts\route-guard-regression.mjs;
  node .\scripts\unit-contract.mjs` in `apps/web`
- Manual checks:
  code inspection of shell/dashboard language flow and dictionary coverage
- Build:
  `node .\node_modules\next\dist\bin\next build --webpack` in `apps/web`
  attempted twice and blocked by environment-level `spawn EPERM`
- High-risk checks:
  confirmed the shell no longer reads authenticated language directly from env

## Result Report

- Task summary:
  moved shared authenticated shell labels and dashboard entry copy onto
  `@nest/shared-types` translations, introduced one shared `useUiLanguage()`
  reader for the stored web preference, and wired dashboard showcase/live copy
  through localized keys.
- Files changed:
  `packages/shared-types/src/localization.js`,
  `apps/web/src/lib/ui-language.ts`,
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/components/workspace-logout-button.tsx`,
  `apps/web/src/app/dashboard/page.tsx`,
  `docs/planning/mvp-next-commits.md`,
  `docs/planning/v1_execution_backlog_2026-04-26.md`
- How tested:
  local TypeScript check, local ESLint, local route-guard/unit contract
  scripts, plus attempted production build
- What is incomplete:
  Planning, Calendar, Journal, and settings-driven live language propagation
  are still outside this slice; `.codex/context/TASK_BOARD.md` and
  `.codex/context/PROJECT_STATE.md` could not be updated in this session
  because local ACL rules denied writes
- Next steps:
  execute `NEST-212` on mobile shell/tab/module copy, then `NEST-213` for
  settings-driven language propagation
- Decisions made:
  kept localization on the existing shared dictionary contract instead of
  introducing route-local translation stores
