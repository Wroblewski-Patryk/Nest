# V2 Execution Roundbook (Executor Playbook)

Last updated: 2026-03-21

## Purpose

This document is the operational playbook for Execution Agent to deliver V2 in
strict rounds.

One round = one primary task = one scoped commit = quality gate = board/state
update = next task.

Primary backlog source:

- `docs/planning/v2-target-execution-plan.md`
- `.codex/context/TASK_BOARD.md` (`NEST-125..NEST-152`)

## Round Contract (Mandatory)

For every task round, execute in this order:

1. Pull context for task ID (dependencies, AC, current architecture docs).
2. Move task status to `IN_PROGRESS` in `TASK_BOARD`.
3. Implement smallest complete slice that satisfies Acceptance Criteria.
4. Run automated checks for changed areas.
5. Run manual checks for changed feature + UI regression.
6. Run quality gate script with manual checklist acknowledgement.
7. Verify no unintended changes (`git diff --name-only` + diff review).
8. Commit with Conventional Commit message.
9. Update task to `DONE` with notes/evidence links.
10. Update `PROJECT_STATE` if reality/priority changed.
11. Start next dependency-ready task.

No skipping steps.

## Definition of Ready (Before Starting Any Task)

- Dependencies are `DONE`.
- Acceptance Criteria are unambiguous.
- Required source docs are identified.
- Expected touched modules are known (`apps/api`, `apps/web`, `apps/mobile`,
  `docs`, `.github/workflows`, `scripts`).
- Test plan for this task is prepared before coding.

## Mandatory Automated Checks

Use the project quality gate first:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/quality-gate.ps1 -AcknowledgeManualChecks
```

Then run targeted deep checks if needed for changed scope.

### API (when `apps/api/*` changed)

- formatter/lint gate:

```powershell
cd apps/api
php vendor/bin/pint --test
```

- test suite:

```powershell
cd apps/api
php artisan test
```

### Web (when `apps/web/*` changed)

```powershell
cd apps/web
pnpm lint
pnpm build
```

### Mobile (when `apps/mobile/*` changed)

```powershell
cd apps/mobile
pnpm test:unit
pnpm test:smoke
```

### Release/Operations flows (when release scripts/workflows changed)

- API+web deploy dry-run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/release/deploy-api-web.ps1 -Environment staging -DryRun
```

- mobile release dry-run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/release/mobile-release.ps1 -Profile preview -DryRun
```

- post-deploy smoke dry-run:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/release/post-deploy-smoke.ps1 -Environment staging -DryRun
```

## Mandatory Manual Checks (Every Round)

- Feature behavior for changed scope.
- Regression of neighboring flows (same module + linked module).
- UI regression where applicable:
  - web desktop,
  - web mobile viewport,
  - mobile app screen(s).
- Verify localization behavior when user-facing copy/date/time formatting changed.
- Verify no unintended file changes.

## Commit Policy (Every Round)

- One primary concern per commit.
- Conventional Commit format.
- No commit without quality gate pass and manual checklist execution.
- Always include evidence note in task `Notes` section.

Commit message pattern:

```text
<type>(<scope>): <task outcome>
```

Examples:

- `feat(sync): add background scheduler retry jitter for mobile`
- `ops(release): add canary promotion and rollback guard`
- `docs(ops): publish V2 readiness report`

## Task-to-Task Loop (Executor Algorithm)

After each commit:

1. Mark task `DONE` in `TASK_BOARD` with test evidence.
2. Add/update relevant doc under `docs/`.
3. Update `PROJECT_STATE` if strategy or active focus changed.
4. Pick next task with all dependencies resolved.
5. Repeat.

## Ordered V2 Rounds (Execution Queue)

This queue is dependency-safe and intended for sequential execution.

1. `NEST-125` -> `chore(obs): baseline production telemetry for v2 planning`
2. `NEST-126` -> `ops(slo): enforce error-budget release gates`
3. `NEST-127` -> `ops(release): add api-web progressive delivery`
4. `NEST-128` -> `ops(mobile): add staged rollout and rollback flow`
5. `NEST-129` -> `docs(ops): publish v1.1 stabilization and v2 gate signoff`
6. `NEST-130` -> `feat(sync): add background auto-sync with adaptive retry`
7. `NEST-131` -> `feat(sync): add durable local sync scheduler`
8. `NEST-132` -> `feat(sync): implement deterministic offline merge policy`
9. `NEST-133` -> `feat(security): add encrypted offline cache profile`
10. `NEST-134` -> `test(sync): add offline chaos and reconnection regression suite`
11. `NEST-135` -> `feat(collab): expand shared household workspace model`
12. `NEST-136` -> `feat(collab): add assignment handoff and reminder ownership`
13. `NEST-137` -> `feat(notifications): add in-app notification center`
14. `NEST-138` -> `feat(notifications): add push-email-inapp channel matrix`
15. `NEST-139` -> `test(collab): run collaboration safety and ux certification`
16. `NEST-140` -> `feat(ai): build unified context graph for copilot`
17. `NEST-141` -> `feat(ai): deliver conversational copilot surface`
18. `NEST-142` -> `feat(ai): add approval-gated write actions`
19. `NEST-143` -> `feat(ai): add proactive daily and weekly briefings`
20. `NEST-144` -> `test(ai): add v2 copilot safety evaluation harness`
21. `NEST-145` -> `feat(integrations): build provider marketplace framework`
22. `NEST-146` -> `feat(integrations): add next-wave providers by demand score`
23. `NEST-147` -> `feat(integrations): add webhook and event-driven sync triggers`
24. `NEST-148` -> `feat(integrations): add health center and remediation playbooks`
25. `NEST-149` -> `feat(billing): expand self-serve checkout portal and dunning`
26. `NEST-150` -> `feat(analytics): add activation retention monetization loops`
27. `NEST-151` -> `docs(release): publish v2 production readiness review`
28. `NEST-152` -> `ops(release): execute v2 ga launch and 30-day stabilization`

## Per-Task Verification Matrix (Attach to every DONE entry)

For each task, record:

- Automated checks run (exact commands + pass/fail).
- Manual checks run (flows + devices/viewports).
- Regression scope checked (feature + adjacent modules).
- Evidence artifact location (doc/report/screenshots/logs).
- Commit hash and message.

Template:

```markdown
- Validation:
  - Automated:
    - `<command 1>` (PASS)
    - `<command 2>` (PASS)
  - Manual:
    - `<flow 1>` on web desktop (PASS)
    - `<flow 2>` on mobile app (PASS)
  - Regression:
    - `<adjacent flow>` (PASS)
  - Diff review:
    - `git diff --name-only` checked, no unintended files.
  - Commit:
    - `<hash>` `<message>`
```

## Definition of Done Reinforcement

A task cannot be marked `DONE` until all are true:

- Output implemented/documented.
- Acceptance Criteria satisfied.
- Automated checks passed.
- Manual checks passed.
- Regression and diff review completed.
- `TASK_BOARD` updated.
- `PROJECT_STATE` updated if needed.

## End-of-V2 Closure

After `NEST-152`:

1. Publish V2 closure report with KPI/SLO/security/perf outcomes.
2. Publish unresolved risks + mitigations.
3. Create `V2.1` backlog and execution order.
4. Reset `NOW/NEXT/LATER` queue for next cycle.
