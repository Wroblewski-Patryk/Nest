# Nest Deployment Improvement Plan

Date: 2026-05-02
Stage: planning
Source audit: `docs/planning/nest_300_backend_frontend_deployment_readiness_audit_2026-05-02.md`

## Context

`NEST-300` found that the product is structurally healthy, especially on the
backend, but deployment confidence is limited by runtime drift, session
hardening decisions, OpenAPI warning cleanup, production operations evidence,
and web/mobile parity scope.

This plan turns the audit into small implementation slices that can be executed
without mixing architecture decisions, security changes, contract cleanup, and
UX polish in one commit.

## Goal

Prepare Nest for a cleaner deployment by resolving the highest-risk
architecture and production-readiness gaps before adding more product breadth.

## Constraints

- Architecture docs remain the source of truth unless a decision explicitly
  changes them.
- Preserve tenant isolation, actor boundaries, AI write safety, localization
  baseline, and existing API behavior.
- Avoid workaround-only paths.
- Keep each implementation slice tiny, testable, and reversible.
- Web deployment can proceed before native mobile only if mobile is explicitly
  declared V2 or out of scope for the release claim.

## Deployment Strategy

The recommended strategy is web-first production hardening:

1. Align runtime and infrastructure with architecture.
2. Harden web auth/session and protected-route failure behavior.
3. Clean API contracts enough to be a reliable client/release gate.
4. Add deployment operations evidence: env checklist, workers, scheduler,
   health checks, rollback, and smoke commands.
5. Improve architecture maintainability: policy coverage and controller/service
   boundaries.
6. Continue canonical UX parity after the release-critical path is stable.

## Planned Tasks

### NEST-301 Runtime Deployment Stack Alignment

- Type: release/refactor
- Priority: P0
- Status: READY
- Depends on: `NEST-300`
- Stage: implementation
- Operation mode: BUILDER

Goal:

Make deployment/runtime configuration match the approved architecture or record
an explicit architecture decision if hosting constraints require a different
runtime baseline.

Scope:

- `apps/api/composer.json`
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `docker-compose.coolify.yml`
- `apps/api/app/Integrations/Services/ListTaskIntegrationSyncService.php`
- deployment docs touched only if the chosen runtime differs from architecture

Implementation plan:

1. Prefer architecture alignment: PHP 8.4, Node 24, PostgreSQL 17, Redis for
   cache/session/queue.
2. Make queue dispatch config-driven instead of hard-coded to database.
3. Ensure API and worker services share the same queue/cache/session config.
4. Document any required Coolify environment variables.
5. Run API, web, and contract validations relevant to changed surfaces.

Acceptance criteria:

- No production code hard-codes the integration queue connection to database.
- Deployment config and architecture runtime expectations are consistent.
- API worker can process integration queue jobs with the selected connection.
- Validation evidence is recorded.

### NEST-302 Web Session And Route-Guard Production Hardening

- Type: security/fix
- Priority: P0
- Status: BACKLOG
- Depends on: `NEST-301`
- Stage: planning
- Operation mode: ARCHITECT

Goal:

Reduce browser-token exposure and decide protected-route behavior when the API
auth check is unavailable.

Scope:

- `apps/web/src/lib/auth-session.ts`
- `apps/web/middleware.ts`
- `apps/web/src/app/auth/page.tsx`
- shared API client only if needed for token/session transport
- backend auth routes only if httpOnly-cookie session issuance is selected

Implementation plan:

1. Decide whether production web uses httpOnly Secure cookies/BFF-style session
   or accepts browser bearer storage as an MVP risk.
2. Decide whether protected routes fail closed or fail open during `/auth/me`
   outages.
3. Implement the selected behavior end to end.
4. Add or extend route-guard regression checks.
5. Run web lint, typecheck, build, unit checks, and relevant API auth tests.

Acceptance criteria:

- Token storage risk is either removed or explicitly documented with
  compensating controls.
- Route guard outage behavior is intentional, tested, and documented.
- Existing login/logout/onboarding flows still work.

### NEST-303 OpenAPI Strict Contract Cleanup

- Type: documentation/fix
- Priority: P0
- Status: BACKLOG
- Depends on: `NEST-301`
- Stage: implementation
- Operation mode: BUILDER

Goal:

Make OpenAPI contracts usable as a strict release gate and future generated
client source.

Scope:

- `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`
- `docs/engineering/contracts/openapi_automation_rules_v1.yaml`
- `docs/engineering/contracts/openapi_billing_events_v1.yaml`
- `docs/engineering/contracts/openapi_core_modules_v1.yaml`
- `docs/engineering/contracts/openapi_tasks_lists_v1.yaml`

Implementation plan:

1. Add missing operation IDs.
2. Add tag descriptions.
3. Add expected 4XX responses using the existing error-envelope model.
4. Preserve current route behavior; this is contract cleanup, not API redesign.
5. Run Redocly lint until warnings that affect release contracts are gone.

Acceptance criteria:

- Redocly validity passes.
- Release-relevant warnings are resolved or intentionally waived in docs.
- Error envelope references match backend behavior.

### NEST-304 Production Operations Checklist And Smoke Path

- Type: release
- Priority: P0
- Status: BACKLOG
- Depends on: `NEST-301`, `NEST-302`, `NEST-303`
- Stage: planning
- Operation mode: TESTER

Goal:

Create the deploy/run/check/rollback path for the web-first release.

Scope:

- `DEPLOYMENT_GATE.md`
- `INTEGRATION_CHECKLIST.md`
- operations docs under `docs/operations/`
- Coolify environment notes
- smoke commands/scripts if already supported by the repo

Implementation plan:

1. Define required production env vars and secrets.
2. Define migration, queue worker, scheduler, health check, and smoke sequence.
3. Define rollback and disable paths for AI, integrations, billing, and web.
4. Record observability expectations: logs, trace IDs, metrics, queue SLOs.
5. Run the full validation baseline that is feasible locally.

Acceptance criteria:

- A deployer can follow the checklist without guessing service order.
- Health/readiness and rollback expectations are explicit.
- Validation evidence is attached.

### NEST-305 Policy Coverage Ledger And Sensitive Action Gap Fixes

- Type: security/refactor
- Priority: P1
- Status: BACKLOG
- Depends on: `NEST-304`
- Stage: analysis
- Operation mode: ARCHITECT

Goal:

Turn policy-layer unevenness into a measured ledger and implement only the
highest-value missing policy checks.

Scope:

- API controllers under `apps/api/app/Http/Controllers/Api`
- policies under `apps/api/app/Policies`
- feature tests for sensitive record actions
- coverage ledger/report under `docs/engineering/` or `docs/security/`

Implementation plan:

1. Inventory controller actions by resource, tenant scope, user scope, and
   explicit policy coverage.
2. Mark each row as covered, acceptable-query-scope-only, or missing.
3. Add policies only where the ledger shows a real sensitive-action gap.
4. Add tests for any new deny paths.

Acceptance criteria:

- Coverage ledger exists and is referenced by task board.
- No broad refactor is done without a specific gap.
- New policies preserve current passing tenant-isolation behavior.

### NEST-306 Controller Workflow Thin-Slice Refactor

- Type: refactor
- Priority: P1
- Status: BACKLOG
- Depends on: `NEST-305`
- Stage: planning
- Operation mode: BUILDER

Goal:

Move one high-complexity controller workflow into an existing domain-service
style without changing API behavior.

Scope:

- one selected controller/workflow only, chosen after `NEST-305`
- corresponding service/test files

Implementation plan:

1. Select the smallest workflow with high complexity and strong test coverage.
2. Move business decisions out of the controller into a service.
3. Preserve request/response contracts.
4. Run the targeted feature suite plus API unit tests.

Acceptance criteria:

- Controller is thinner.
- Behavior and tests remain unchanged.
- No new abstraction family is introduced unless it matches existing patterns.

### NEST-307 Locale-Aware Web Routing Plan And First Slice

- Type: feature/refactor
- Priority: P1
- Status: BACKLOG
- Depends on: `NEST-302`
- Stage: planning
- Operation mode: ARCHITECT

Goal:

Resolve the current gap between client-side language selection and the
architecture requirement for locale-aware routing behavior.

Scope:

- `apps/web/src/app/layout.tsx`
- web routing/middleware strategy
- shared localization helpers
- no broad copy rewrite unless required

Implementation plan:

1. Choose route strategy: locale segment, cookie/header negotiation, or a
   documented web-first exception.
2. Ensure root `<html lang>` reflects selected language.
3. Preserve current `en`/`pl` copy behavior.
4. Add regression checks for default and stored language behavior.

Acceptance criteria:

- Locale behavior is server-visible or explicitly documented as an approved
  exception.
- `html lang` is no longer hard-coded incorrectly.
- Existing web routes keep working.

### NEST-308 Production Showcase And Error-State Rule

- Type: UX/refactor
- Priority: P1
- Status: BACKLOG
- Depends on: `NEST-302`
- Stage: planning
- Operation mode: TESTER

Goal:

Ensure canonical showcase/empty data never hides real API failures in
production.

Scope:

- web dashboard/planning/journal/calendar routes that use showcase fallbacks
- shared UI state conventions if needed
- UX docs/design memory

Implementation plan:

1. Inventory showcase fallback use.
2. Classify each as empty-state, demo-only, or API-error fallback.
3. Add a production rule and implement the first high-impact route.
4. Verify loading, empty, error, and success states.

Acceptance criteria:

- API failures produce visible user-safe error states.
- Empty states can still use canonical composition.
- The rule is documented for future screens.

### NEST-309 Mobile Scope Decision And IA Alignment

- Type: product/design
- Priority: P2
- Status: BACKLOG
- Depends on: `NEST-304`
- Stage: planning
- Operation mode: ARCHITECT

Goal:

Decide whether mobile is part of the next deployment promise; if yes, align
mobile IA to the canonical five-pillar shell.

Scope:

- `apps/mobile/app/(tabs)/_layout.tsx`
- mobile landing route/dashboard route
- mobile auth/session storage review
- mobile UX parity docs

Implementation plan:

1. Decide web-first release vs web+mobile release.
2. If web-first, document mobile as V2/out-of-release-scope.
3. If web+mobile, align tabs to Dashboard, Planning, Calendar, Journal,
   Settings.
4. Run mobile typecheck, unit, and Expo web export.

Acceptance criteria:

- Deployment scope is explicit.
- Mobile IA no longer contradicts the release claim.
- Any native-release token-storage risk is captured.

## Decision Queue

1. Runtime stack: align implementation to PHP 8.4 / Node 24 / PostgreSQL 17 /
   Redis, or downgrade architecture docs to the current Coolify runtime.
2. Web session model: httpOnly Secure server-side session boundary, or MVP
   browser-token risk acceptance with compensating controls.
3. Protected route outage behavior: fail closed, or keep fail-open as an
   intentional availability tradeoff.
4. Mobile release scope: web-first only, or web+mobile parity before release.

## Suggested Execution Order

1. `NEST-301`
2. `NEST-302`
3. `NEST-303`
4. `NEST-304`
5. `NEST-305`
6. `NEST-307`
7. `NEST-308`
8. `NEST-306`
9. `NEST-309`

## Result Report

This planning slice converts the audit into a release-oriented backlog with one
ready P0 task and dependent follow-up tasks. The plan intentionally starts with
architecture/runtime consistency, then security/session behavior, then API
contracts, then operations evidence, because those decisions shape the safety of
all later UX and maintainability work.
