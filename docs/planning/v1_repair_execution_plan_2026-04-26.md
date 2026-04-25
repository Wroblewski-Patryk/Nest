# V1 Repair Execution Plan

Last updated: 2026-04-26

## Purpose

This document converts the April 26 repository audit into one canonical repair
plan for Nest `v1`.

The goal is not to add more breadth.

The goal is to make the current product:

- trustworthy,
- usable every day,
- architecturally consistent,
- ready for disciplined iteration.

This plan is the execution contract for repair and hardening work until the
project reaches a credible `v1 founder-ready` baseline.

## Source Inputs

- audit of architecture, code, tests, UI, and repository reality on
  `2026-04-26`
- `docs/architecture/architecture-source-of-truth.md`
- `docs/architecture/v1_v2_delivery_split.md`
- `docs/architecture/system-architecture.md`
- `docs/planning/v1_execution_focus_2026-04-26.md`
- `.codex/context/PROJECT_STATE.md`
- `.codex/context/TASK_BOARD.md`

## Strategic Decision

From this point forward, repair work follows one strict rule:

- `v1` usefulness, coherence, and reliability come before new capability
  expansion.

This means:

- no new cross-cutting systems without explicit approval,
- no hidden architecture workarounds,
- no widening of `v2` scope inside `v1` repair tasks,
- no claiming parity unless behavior is actually equivalent.

## Current Reality Summary

## What is strong already

- architecture direction is clear and mostly well documented,
- backend domain breadth is substantial,
- web shell and core planning/dashboard surfaces are materially usable,
- shared contracts package exists,
- UX direction is more cohesive than earlier waves,
- repo already contains prior planning and evidence artifacts that can be
  reused.

## What currently blocks "great product" status

- repository truth is drifting from documentation in several important places,
- mobile does not yet satisfy the declared parity contract for core modules,
- localization exists as a policy but not yet as a complete implementation,
- backend test suite is not fully green,
- integration sync contract changed to async while parts of the suite still
  assume synchronous summary behavior,
- startup and onboarding truth is inconsistent between docs, guard logic, and
  intended UX,
- some deferred or future-facing surfaces still compete with core `v1`
  usability attention.

## Non-Negotiable Repair Principles

## Principle 1 - Architecture stays authoritative

If implementation conflicts with architecture:

1. describe the mismatch,
2. propose valid options,
3. wait for explicit decision before changing architecture.

## Principle 2 - Founder-ready before feature-rich

A smaller product that is calm and dependable is better than a broader product
that feels unfinished.

## Principle 3 - Web is the operational reference surface for `v1`

Web should reach the cleanest daily-use baseline first.
Mobile then closes parity against the same domain outcomes.

## Principle 4 - Parity means outcome parity, not screenshot parity

Web and mobile may differ in presentation, but core user outcomes must match:

- create,
- edit,
- delete,
- review,
- navigate,
- recover from errors.

## Principle 5 - User-facing text must be intentional

- no mojibake,
- no mixed accidental language,
- no raw backend validation payloads shown directly to users,
- no technical wording where a human action message is required.

## Principle 6 - Reliability is part of UX

Broken tests, ambiguous startup instructions, or drifting sync contracts are
product defects, not only engineering defects.

## Repair North Star

Nest should feel like one calm system with one clear daily loop:

1. decide what matters,
2. act on it,
3. reflect,
4. adjust,
5. trust that the system still tells the truth tomorrow.

## Execution Model

The repair plan runs in five waves.

Each wave has:

- purpose,
- scope,
- done criteria,
- explicit stop conditions.

Do not overlap waves unless the tasks are independent and do not hide
cross-surface regressions.

## Wave 1 - Repo Truth And Runtime Baseline

## Purpose

Make the repository trustworthy again before larger UX or parity work.

## Scope

- reconcile docs and actual startup instructions,
- restore a green or intentionally triaged validation baseline,
- remove contract drift that makes the repo misleading to work in,
- define the canonical `v1 founder-ready` checklist.

## Tasks

### P0.1 Local startup truth reconciliation

- fix root-level onboarding/startup instructions so they match actual workspace
  structure,
- document the true install/run sequence for API, web, and mobile,
- remove steps that do not work in current repo shape.

Done when:

- a new contributor can start the main surfaces without hidden assumptions,
- README and supporting docs no longer describe invalid root commands.

### P0.2 Backend validation baseline recovery

- diagnose and resolve cache-store drift in tests,
- recover failing observability/cache tests,
- recover failing integration sync tests or explicitly migrate them to current
  async contract,
- make failing suite categories intentional rather than accidental.

Done when:

- backend test output is fully green or every remaining failure is explicitly
  documented with owner and blocking status,
- no stale test assumptions remain unacknowledged.

### P0.3 Sync contract reconciliation

- decide whether current integration sync endpoints should expose:
  - enqueue acknowledgement only,
  - acknowledgement plus deterministic preview counters,
  - or restored synchronous summary behavior.
- align controller responses, tests, and docs to one contract.

Done when:

- `IntegrationSyncController`, integration tests, and docs all describe the
  same behavior.

### P0.4 Founder-ready release baseline doc

- publish one compact checklist defining what must be true before calling Nest
  genuinely usable for daily founder use.

Done when:

- product, engineering, and UX all point to the same readiness gate.

## Wave 1 Exit Criteria

- repository startup truth is accurate,
- backend validation baseline is trustworthy,
- no major contract ambiguity remains around sync behavior.

## Wave 2 - Web Product Closure

## Purpose

Turn web into a confident `v1` operating surface.

## Scope

- dashboard,
- planning,
- habits/routines,
- calendar,
- journal/life areas,
- settings/auth/onboarding.

## Tasks

### P1.1 Onboarding and route-access truth

- reconcile onboarding policy with actual route-guard behavior,
- define whether onboarding is mandatory before dashboard access in current
  `v1`,
- align guard code, middleware, tests, and UX copy.

Done when:

- auth and onboarding behavior matches documented product policy,
- redirect logic is deterministic and tested.

### P1.2 User-facing copy and message hardening

- remove mojibake and broken encoding,
- standardize action feedback, empty states, and errors,
- replace technical messages with user-safe guidance.

Done when:

- critical screens no longer show accidental encoding issues or raw technical
  backend wording.

### P1.3 Localization implementation closure

- move core shell and key module copy to shared localization resources,
- enforce `en` and `pl` behavior in auth, onboarding, dashboard, planning,
  settings, and other core modules,
- verify locale formatting consistency.

Done when:

- language switching affects actual user-visible product text across the core
  `v1` path,
- the localization policy is no longer only architectural intent.

### P1.4 Dashboard and planning refinement

- strengthen "what matters now" hierarchy,
- reduce setup noise,
- keep quick actions secondary to daily focus,
- improve feedback locality around task/list actions.

Done when:

- dashboard and planning support daily use without feeling like internal admin
  tooling.

### P1.5 Web module usability closure

- re-audit each web core module for first-use and repeat-use flow quality,
- fix discoverability gaps,
- remove dead-end interactions.

Done when:

- every core web module supports a practical create/edit/review/delete loop
  through GUI.

## Wave 2 Exit Criteria

- web becomes the stable reference experience for `v1`,
- auth, onboarding, planning, reflection, and settings behave coherently.

## Wave 3 - Mobile Parity Recovery

## Purpose

Bring mobile from partial/product-demo state to real parity with web core
behavior.

## Scope

- replace placeholder/static module surfaces,
- restore green mobile typecheck,
- add missing module coverage and navigation coherence.

## Tasks

### P2.1 Mobile baseline stabilization

- fix current TypeScript failures,
- restore fully green mobile validation baseline,
- verify tab/navigation shell types and runtime behavior.

Done when:

- `pnpm exec tsc --noEmit` passes in mobile,
- exported mobile web build remains healthy.

### P2.2 Replace placeholder modules with API-backed flows

Current high-risk placeholders include:

- habits,
- goals,
- journal-related simplified states,
- other screens still fed from static `mvpData`.

Repair by:

- wiring real API reads,
- adding practical create/edit/delete/complete flows,
- preserving mobile-specific UX without losing behavior parity.

Done when:

- mobile outcomes match web outcomes for the same domain module.

### P2.3 Missing core-module parity

- add or expose mobile access for routines, life areas, and settings-level
  essentials required by `v1`,
- ensure the navigation model reflects actual module availability.

Done when:

- mobile does not silently omit declared `v1` core behavior.

### P2.4 Mobile UX hardening

- improve cramped layouts,
- review keyboard overlap and touch ergonomics,
- localize feedback and empty states,
- reduce dashboard/planning overload on mobile widths.

Done when:

- mobile is comfortable at the target baseline viewport and on practical
  handheld flows.

## Wave 3 Exit Criteria

- mobile is no longer a mostly representational client,
- parity can be defended with evidence.

## Wave 4 - Shared Contracts And Cross-Surface Integrity

## Purpose

Ensure backend, shared types, web, and mobile tell one story.

## Scope

- shared types,
- OpenAPI coverage,
- error envelopes,
- localized formatting and contract assumptions,
- offline/manual sync behavior.

## Tasks

### P3.1 Shared contract audit

- compare backend response shapes with shared-types exports,
- remove stale aliases and accidental drift,
- verify frontend assumptions against real responses.

Done when:

- shared client and backend contracts are aligned for all `v1` critical paths.

### P3.2 Error and recovery contract pass

- standardize user-safe error mapping in web and mobile,
- preserve machine-readable envelopes for programmatic clients,
- ensure local UI recovery actions exist where needed.

Done when:

- errors are both developer-credible and user-comprehensible.

### P3.3 Offline/manual sync product pass

- verify that manual sync, retry, stop-on-first-error, and conflict handling
  work as one understandable system,
- remove placeholder-feeling flows from settings/modal surfaces where they are
  not founder-critical.

Done when:

- offline and sync behavior feels intentional rather than experimental.

## Wave 4 Exit Criteria

- cross-surface contracts are stable,
- shared types become a true contract layer rather than a partial mirror.

## Wave 5 - Greatness Layer

## Purpose

Only after trust and parity are restored, elevate Nest from "solid" to
"wonderful".

## Scope

- hierarchy polish,
- deeper product calm,
- accessibility,
- actionable insight quality,
- visual refinement,
- friction removal across repeated daily use.

## Tasks

### P4.1 Accessibility and interaction quality pass

- keyboard focus completeness on web,
- visible focus states,
- semantic landmarks,
- contrast review,
- mobile accessibility labels for key interactions.

### P4.2 Guided productivity loop polish

- make dashboard, planning, calendar, and journal feel like one connected loop,
- strengthen next-action framing and weekly adjustment flow.

### P4.3 Insight usefulness pass

- shift insights from dense reporting toward actionable weekly guidance,
- connect insight outcomes into planning and calendar decisions.

### P4.4 Design-system hardening

- reduce visual inconsistency between modules,
- strengthen reusable component patterns,
- preserve sanctuary styling while improving contrast and hierarchy.

## Wave 5 Exit Criteria

- Nest feels coherent, calm, and intentional across the founder daily loop,
- polish work rests on stable foundations rather than masking drift.

## Priority Order

## P0 - Must happen first

- startup truth
- backend green baseline
- sync contract reconciliation
- founder-ready readiness checklist

## P1 - Makes web genuinely dependable

- onboarding/access truth
- copy/error/localization repair
- dashboard/planning refinement
- core web usability closure

## P2 - Makes parity real

- mobile type stability
- mobile API-backed module replacement
- missing mobile core-module coverage

## P3 - Makes the system durable

- contract audit
- error/recovery consistency
- offline/manual sync coherence

## P4 - Makes the product wonderful

- accessibility
- guided daily loop polish
- insight usefulness
- design-system hardening

## Immediate Task Derivation Order

Derive the next execution tasks in this exact order:

1. fix local startup truth and README drift,
2. fix backend cache-store / observability test baseline,
3. reconcile async integration sync contract,
4. reconcile onboarding policy and route-guard behavior,
5. repair user-facing copy, encoding, and localization baseline,
6. repair mobile typecheck and mobile parity gaps,
7. run fresh web + mobile readiness audits against repaired baselines.

## Definition Of Done For Each Repair Slice

A repair task is complete only when:

- implementation or doc output exists,
- the change fits approved architecture,
- tests/validations relevant to the touched area were run and recorded,
- task board and project state reflect the new truth when repo reality changed,
- no workaround-only path was introduced,
- user-facing behavior is better, not just differently shaped.

## Anti-Patterns To Block

Do not allow the following during repair:

- adding new platform subsystems to avoid fixing a current mismatch,
- claiming mobile parity from screenshots while behavior is still missing,
- hiding broken contracts behind looser tests,
- leaving future-facing AI or marketplace surfaces to distract from `v1`
  closure,
- shipping more complexity into settings or navigation while core flows are
  still uneven.

## Success Outcome

This plan succeeds when Nest becomes:

- a truthful repository,
- a reliable web product,
- a parity-capable mobile client,
- a stable architectural base for later `v2` expansion,
- and a product that feels calm enough to trust every day.
