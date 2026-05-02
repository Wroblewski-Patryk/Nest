# Codebase Map

Last updated: 2026-05-03

## Purpose

This map connects the repository tree to the runtime architecture. It is based
on inspected files and directories, not on planned-only documentation.

## Top-Level Structure

| Path | Role |
| --- | --- |
| `apps/api` | Laravel API, domain logic, queues/jobs, migrations, tests |
| `apps/web` | Next.js App Router web client and same-origin API proxy |
| `apps/mobile` | Expo mobile app; runtime exists, current release promise is V2 mobile scope |
| `packages/shared-types` | Shared TypeScript types and localization resources |
| `docs` | Product, architecture, engineering, module, UX, ops, security, planning docs |
| `.codex`, `.agents`, `.claude` | Agent workflow, task state, prompts, skills |
| `.github/workflows` | CI, deploy, mobile release, smoke, release train workflows |

## Backend: Laravel API

### Core folders

| Path | Responsibility |
| --- | --- |
| `apps/api/routes/api.php` | API route registration under `/api/v1` |
| `apps/api/app/Http/Controllers/Api` | HTTP controllers for auth, modules, integrations, AI, billing, notifications, orgs |
| `apps/api/app/Models` | Eloquent models for domain, tenancy, billing, integration, AI, notification data |
| `apps/api/app/Policies` | Policy checks for sensitive tenant/user scoped actions |
| `apps/api/app/Http/Middleware` | Trace ID, actor context, delegated scopes, tenant quota, entitlements, AI surface gates |
| `apps/api/app/Jobs` | Background jobs, including integration sync and tenant deletion |
| `apps/api/database/migrations` | PostgreSQL schema evolution |
| `apps/api/tests` | Feature, integration, unit, and performance-adjacent validation |

### Domain/service folders

| Folder | Key responsibility |
| --- | --- |
| `app/AI` | Copilot, action proposals, briefings, context graph, policy/evaluation services |
| `app/Analytics` | Analytics ingestion and decision dashboard services |
| `app/Auth` | OAuth, SSO, delegated credential support |
| `app/Automation` | Automation rules and run execution |
| `app/Billing` | Subscription lifecycle, checkout/portal/dunning/webhooks, entitlements |
| `app/Collaboration` | Shared spaces, invites, assignment timeline |
| `app/Integrations` | Provider adapters, sync services, conflict/health/marketplace/replay services |
| `app/Notifications` | In-app, mobile push, email/channel delivery services |
| `app/Observability` | Metrics and integration sync SLO checks |
| `app/Organization` | Organizations, workspaces, RBAC, audit export |
| `app/Security` | Secret rotation and control verification services |
| `app/Tenancy` | Data lifecycle, quotas, tenant data deletion/retention |

### API route groups

All routes are under `Route::prefix('v1')` in `apps/api/routes/api.php`.

Public/auth-adjacent routes:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/localization/options`
- `POST /auth/oauth/{provider}/exchange`
- `POST /auth/orgs/{organizationSlug}/sso/{providerSlug}/exchange`
- `POST /billing/providers/stripe/webhook`

Authenticated guarded route areas use `auth:sanctum`, `delegated.scope`,
`actor.context`, `tenant.usage`, and `entitlements` middleware:

- Auth/settings/delegated credentials/AI agents
- Billing subscription, events, checkout, portal, dunning, reconciliation
- Analytics ingestion and loop dashboard
- AI context graph, copilot, actions, briefings, weekly planning, feedback
- Insights and life-area balance
- Organizations, workspaces, collaboration spaces and invites
- Automation rules and runs
- Core modules: lists, tasks, habits, routines, goals, targets, life areas,
  journal entries, calendar events
- Integrations: list/task sync, calendar sync, journal sync, health, events,
  marketplace, connections, conflicts, failures/replay
- Notifications: mobile devices, in-app notifications, preferences, deliveries

## Database And Models

Model inventory from `apps/api/app/Models` includes:

- Core planning: `Task`, `TaskList`, `Goal`, `Target`, `CalendarEvent`
- Rhythms: `Habit`, `HabitLog`, `Routine`, `RoutineStep`
- Reflection and balance: `JournalEntry`, `LifeArea`
- Tenancy/identity: `Tenant`, `User`, `Workspace`, `WorkspaceMember`
- Organizations/collaboration: `Organization`, `OrganizationMember`,
  `OrganizationSsoProvider`, `OrganizationSsoIdentity`, `CollaborationSpace`,
  `CollaborationSpaceMember`, `CollaborationInvite`, `AssignmentTimeline`
- Integrations: `IntegrationCredential`, `SyncMapping`,
  `IntegrationSyncAudit`, `IntegrationSyncConflict`, `IntegrationSyncFailure`,
  `IntegrationEventIngestion`, `IntegrationMarketplaceInstall`,
  `IntegrationMarketplaceAudit`
- AI: `AiActionProposal`, `AiBriefing`, `AiBriefingPreference`,
  `AiRecommendationFeedback`, `ActorBoundaryAudit`
- Billing: `BillingPlan`, `BillingPlanEntitlement`, `TenantSubscription`,
  `TenantBillingEvent`, `BillingSelfServeSession`,
  `BillingDunningAttempt`, `BillingWebhookReceipt`
- Notifications: `InAppNotification`, `NotificationPreference`,
  `NotificationChannelDelivery`, `MobilePushDevice`, `MobilePushDelivery`
- Security/lifecycle: `SecretRotationAudit`, `TenantDataLifecycleAudit`,
  `OAuthIdentity`

Migrations are under `apps/api/database/migrations`. The schema starts with
Laravel baseline tables, then MVP domain tables, dictionaries, integrations,
AI, automation, collaboration, billing, organization, notifications, and
post-MVP refinements.

## Background Jobs And Queues

Verified jobs:

- `apps/api/app/Jobs/ProcessIntegrationSyncJob.php`
- `apps/api/app/Jobs/DeleteTenantDataJob.php`

Runtime queue default is documented as Redis in
`docs/architecture/system-architecture.md` and release docs.

## Frontend: Web

Next.js App Router pages under `apps/web/src/app`:

- Public/auth: `/`, `/auth`, `/onboarding`
- Core V1 web pillars: `/dashboard`, `/tasks` (Planning), `/calendar`,
  `/journal`, `/settings`
- Supporting module surfaces: `/habits`, `/routines`, `/life-areas`, `/goals`,
  `/targets`, `/insights`, `/automations`, `/billing`, `/assistant`
- Same-origin API proxy: `apps/web/src/app/api/nest/[...path]/route.ts`

Shared web support:

- API client/session/guard: `src/lib/api-client.ts`,
  `src/lib/auth-session.ts`, `src/lib/route-guard.ts`
- Localization: `src/lib/ui-language.ts`,
  `packages/shared-types/src/localization.js`
- Shared shell/components: `src/components/workspace-shell.tsx`,
  `src/components/workspace-primitives.tsx`, `src/components/confirm-dialog.tsx`
- Integration/support cards: provider connections, conflict queue, offline
  sync, notification center, channel matrix, API connect, AI copilot.

## Frontend: Mobile

Expo Router screens under `apps/mobile/app`:

- Tabs: dashboard/index, calendar, goals, habits, journal, settings, billing,
  insights
- Shared modal and layout files: `_layout.tsx`, `modal.tsx`, `+html.tsx`,
  `+not-found.tsx`

Current release truth: mobile implementation exists, but native mobile delivery
is V2 scope for the active web-first release promise.

## Shared Package

`packages/shared-types` provides shared domain/API TypeScript definitions and
localization resources consumed by web and mobile.

## Deployment And Runtime

Relevant runtime/deployment files:

- Root Docker/Coolify: `docker-compose.coolify.yml`,
  `docs/operations/coolify.md`
- Release runbook: `docs/operations/nest_web_first_release_runbook_2026-05-02.md`
- Runtime contract: `docs/operations/production_topology_environment_contract_v1.md`
- CI: `.github/workflows/ci.yml`, `.github/workflows/deploy-api-web.yml`,
  `.github/workflows/post-deploy-smoke.yml`,
  `.github/workflows/release-train.yml`,
  `.github/workflows/mobile-release.yml`

Approved baseline from architecture and release docs:

- PHP 8.4
- Node 24
- PostgreSQL 17
- Redis 7
- Laravel API, Next.js web, Expo mobile

## Test Map

API tests:

- Feature tests cover auth, core modules, AI, analytics, automation, billing,
  integrations, notifications, organizations, security, tenancy, and contracts.
- Integration tests cover provider regression, list/task sync pipeline, and
  tenant isolation.
- Unit tests cover AI policy, integration adapters/registry, sync SLO, policy
  actor context, and metrics.

Web/mobile validation commands are documented in `AGENTS.md`,
`.codex/context/PROJECT_STATE.md`, and `docs/engineering/testing.md`.
