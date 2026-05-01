# Task

## Header

- ID: NEST-225
- Title: Resolve provider connection production semantics
- Task Type: implementation
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-224
- Priority: P0
- Coverage Ledger Rows:
- Iteration: autonomous worker 2026-05-01
- Operation Mode: BUILDER

## Process Self-Audit

- [x] All seven autonomous loop steps are planned.
- [x] No loop step is being skipped.
- [x] Exactly one priority task is selected.
- [x] Operation mode matches the iteration number.
- [x] The task is aligned with repository source-of-truth documents.

## Context

`NEST-223` identified provider connection semantics as a hard founder-ready
blocker. Current web and mobile connection buttons call
`upsertIntegrationConnection(...)` with `manual-token-*`, which is a local
integration harness and not production provider auth.

## Goal

Choose and apply the approved V1 path for provider connection behavior before
the founder-ready gate is rerun.

## Scope

- `apps/mobile/app/(tabs)/calendar.tsx`
- `apps/web/src/components/provider-connections-card.tsx`
- `packages/shared-types/src/client.d.ts`
- `apps/api/app/Http/Controllers/Api/IntegrationConnectionController.php`
- `apps/api/app/Integrations/Services/IntegrationConnectionService.php`
- provider/auth architecture docs

## Architecture Mismatch

Architecture says provider adapters and per-user provider credentials are part
of the integration layer, while V1/V2 docs treat integrations as optional but
useful for daily operation. Implementation currently exposes a production-like
connect button backed by a manual token harness.

This is not safe to silently code around because the valid product choices
change scope, UX, API behavior, and release claims.

## Decision Options

### Option A - Implement production provider auth now

- Build or wire real provider OAuth/authorization semantics for the V1 provider
  connection path.
- Pros:
  closes the blocker honestly and keeps provider connection in the
  founder-ready claim.
- Cons:
  likely larger than a tiny reversible slice; requires provider configuration,
  callback/deep-link behavior, security review, tests, and deployment evidence.
- Validation:
  API provider-auth tests, web/mobile connect smoke, credential storage checks,
  security control verification.

### Option B - Remove provider connect from the V1 founder-ready claim

- Keep sync/event CRUD and health surfaces, but make provider connect explicitly
  unavailable for V1 production readiness.
- Pros:
  smallest honest release path; avoids fake OAuth and avoids claiming external
  provider readiness prematurely.
- Cons:
  founder-ready would mean Nest-first calendar/events with no production
  provider connect.
- Validation:
  remove/disable connect buttons or relabel them as unavailable, preserve
  revoke/read-only health where real data exists, update readiness docs.

### Option C - Explicit local-founder waiver

- Keep `manual-token-*` only as a local harness and record a waiver that V1 is
  local-founder only for provider connection behavior.
- Pros:
  fastest path for local testing.
- Cons:
  cannot be called production-ready; must be visibly marked as local/testing
  behavior to avoid misleading release claims.
- Validation:
  visible UI wording, docs waiver, no production deployment claim.

## Decision

Option B was selected after the user asked to continue from the decision brief.

Provider connect is removed from the V1 founder-ready claim. Nest-first
Calendar event CRUD, provider health visibility, remediation, and revoke remain
in scope. New provider authorization/OAuth is explicitly outside the V1
founder-ready scope and must not be represented as production-ready behavior.

Reason:
the repository's current `v1 founder-ready` framing is about trustworthy daily
use, not a commercial integration launch. Calendar event CRUD is real after
`NEST-224`; provider auth can be excluded from V1 readiness without pretending
the manual harness is production behavior.

## Acceptance Criteria

- [x] mismatch is described
- [x] 2 to 3 valid options are documented
- [x] implementation waits for explicit user decision
- [x] no workaround path is introduced
- [x] selected path is implemented on web and mobile
- [x] local `manual-token-*` provider connect behavior is removed from
  delivered V1 UI surfaces
- [x] V1 readiness docs record provider connect as outside founder-ready scope

## Definition of Done

- [x] decision brief exists
- [x] explicit user continuation allowed the recommended path to proceed
- [x] implementation removes the misleading production-like connect affordance
- [x] docs/context reflect the new V1 scope boundary
- [x] validations were run and recorded

## Validation Evidence

- Static inspection:
  `Select-String` found no `manual-token`, `upsertIntegrationConnection`, or
  `connectProvider` usage in the updated mobile Calendar route or web provider
  connections card.
- Mobile:
  `.\node_modules\.bin\tsc.CMD --noEmit` passed in `apps/mobile`;
  `pnpm test:unit` passed in `apps/mobile`;
  `.\node_modules\.bin\expo.CMD export --platform web` passed in
  `apps/mobile`.
- Web:
  `.\node_modules\.bin\tsc.CMD --noEmit` passed in `apps/web`;
  `node .\node_modules\eslint\bin\eslint.js . --ignore-pattern .next` passed
  in `apps/web`;
  `pnpm build` passed in `apps/web`.
- Repository:
  `git diff --check` passed with line-ending warnings only.
- Notes:
  mobile Expo export exited 0 and produced the expected static output; it also
  printed non-blocking `ENOENT` noise while reading generated
  `apps/web/.next/standalone` paths.

## Result Report

- Task summary:
  Removed provider connect from the delivered V1 founder-ready UI claim while
  preserving provider health, remediation, and revoke surfaces.
- Files changed:
  `apps/mobile/app/(tabs)/calendar.tsx`,
  `apps/mobile/components/mvp/ModuleScreen.tsx`,
  `apps/web/src/components/provider-connections-card.tsx`,
  `docs/planning/nest_225_provider_connection_production_semantics_2026-05-01.md`,
  plus planning/context docs.
- What is incomplete:
  production provider OAuth remains future scope and is not part of the V1
  founder-ready claim.

## Autonomous Loop Evidence

1. Analyzed provider connection architecture and current manual-token code.
2. Selected exactly one task: `NEST-225`.
3. Planned decision-first handling because this is an architecture/product
   mismatch.
4. Executed Option B on web and mobile by removing the misleading connect
   affordance.
5. Verified typecheck, unit/build/export, lint, static inspection, and diff
   cleanliness.
6. Self-reviewed against DoD and Integration Checklist: no fake provider auth
   remains in delivered V1 UI surfaces.
7. Updated context to reflect the new V1 scope boundary.
