# V1 Execution Focus

Last updated: 2026-04-26

## Purpose

This plan converts the architecture refresh into a practical execution focus
for reaching `v1`.

Canonical architecture scope:

- `docs/architecture/v1_v2_delivery_split.md`

## V1 Success Definition

`v1` is successful when Nest is a reliable daily-use product with:

- stable backend API,
- practical web experience for all core modules,
- mobile parity for core module behavior,
- localization baseline (`en`, `pl`),
- manual offline queue and sync baseline,
- repeatable deployment and operational readiness.

`v1` does not require end-user AI, advanced collaboration, billing maturity,
or marketplace capabilities.

## Included In Current V1 Planning

- auth, onboarding, and settings,
- dashboard,
- tasks/lists,
- goals/targets,
- habits/routines,
- journal/life areas,
- calendar,
- localization and locale-aware preferences,
- operational reliability and release evidence,
- mobile parity for the same core domain behavior.

## Deferred To V2

- conversational AI copilot,
- AI write proposals and approval flows,
- proactive AI briefings,
- collaboration-heavy shared spaces as release criteria,
- billing self-serve and dunning as release criteria,
- marketplace and near-real-time integrations,
- advanced analytics and growth loops as release criteria,
- automatic background sync and offline-first merge sophistication.

## Recommended V1 Task Order

### Workstream A - V1 Reality Audit

1. Audit backend, web, and mobile against the `v1` scope split.
   Done when: every current module is marked `ready`, `partial`, or `deferred`
   for backend, web, mobile, parity, and release readiness.
2. Publish a single `v1` gap register.
   Done when: each gap is labeled as `blocker`, `important`, or `later`.

### Workstream B - Core Product Usability Closure

3. Close remaining authenticated CRUD and empty-state gaps in web core modules.
   Done when: every `v1` module has practical first-use and repeat-use flows.
4. Close remaining dashboard and planning-loop usability gaps.
   Done when: dashboard, planning, and daily execution feel connected rather
   than fragmented.
5. Remove or de-emphasize UI entrypoints that lead users into `v2` or deferred
   surfaces.
   Done when: the product navigation reflects `v1` priorities only.

### Workstream C - Mobile Parity Closure

6. Audit mobile parity against the same `v1` module behaviors.
   Done when: parity gaps are explicit per module and per action.
7. Close mobile parity gaps for create, edit, delete, and review flows across
   all core modules.
   Done when: mobile matches web in core domain outcomes, with form-factor
   differences only in UX presentation.

### Workstream D - Reliability And Contracts

8. Re-verify API contracts and shared client assumptions for all `v1` modules.
   Done when: OpenAPI, shared types, backend responses, web, and mobile agree.
9. Re-verify manual sync, conflict handling, and offline queue behavior for
   `v1`.
   Done when: manual sync is understandable, predictable, and tested.
10. Re-verify localization and locale-aware rendering across web and mobile.
    Done when: `en` and `pl` behave consistently in auth, onboarding, and core
    modules.

### Workstream E - Release Readiness

11. Run a full `v1` clickthrough and smoke audit on web.
    Done when: the main day-to-day journey is evidence-backed and blocker-free.
12. Run the same `v1` clickthrough and smoke audit on mobile.
    Done when: mobile critical paths are evidence-backed and blocker-free.
13. Reconcile deployment, smoke, rollback, and operations docs to `v1` only.
    Done when: release docs no longer imply `v2` systems are required for
    go-live.
14. Publish a `v1 launch blocker review`.
    Done when: open items are either resolved, explicitly accepted, or moved to
    `v2`.
15. Freeze the `v1` scope and open the first `v2` planning wave only after
    `v1` closure evidence exists.
    Done when: `v2` work cannot silently expand the `v1` release gate.

## Planning Guardrails

- A task belongs in the current execution queue only if it improves `v1`
  usability, parity, reliability, or release readiness.
- If a task mainly improves AI, billing, collaboration, marketplace, or
  advanced automation, it defaults to `v2`.
- Existing `v2` implementation artifacts do not make a capability mandatory for
  `v1`.

## Suggested Immediate Next Planning Output

- produce a `v1 readiness matrix` by module and platform,
- derive the next smallest implementation tasks from that matrix,
- keep the queue focused on practical product closure rather than platform
  breadth.
