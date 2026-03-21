# MVP Next Commits

Last updated: 2026-03-21

## NOW (execute in order)

- [ ] `NEST-103` parity capture pipeline + deterministic screenshot packs
  - commit: `chore(ux): add deterministic parity capture pipeline`
- [ ] `NEST-103` publish parity diff index and unresolved visual deltas
  - commit: `docs(ux): publish legacy parity packs and visual diff register`
- [ ] `NEST-106` apply web parity fixes (legacy UX-heavy tasks)
  - commit: `feat(web): implement legacy UX parity fixes wave 1`

## NEXT

- [ ] `NEST-106` apply mobile parity fixes (legacy UX-heavy tasks)
  - commit: `feat(mobile): implement legacy UX parity fixes wave 2`
- [ ] `NEST-113` rerun UX evidence gate and publish pass/fail closure
  - commit: `docs(ux): rerun legacy evidence gate and update task closure`
- [ ] `NEST-109` localization foundation (`en/pl`, shared contracts)
  - commit: `feat(i18n): add localization foundation for api web mobile`

## LATER

- [ ] `NEST-110` onboarding + account localization preferences
- [ ] `NEST-111` offline queue + manual force-sync baseline
- [ ] `NEST-112` manual sync retry + conflict-resolution baseline
- [ ] `NEST-115` production topology/environment contracts
- [ ] `NEST-116` deploy pipeline for API + web
- [ ] `NEST-117` mobile release pipeline for physical devices
- [ ] `NEST-118` deploy smoke suite (staging/prod)
- [ ] `NEST-119` production ops runbook hardening
- [ ] `NEST-120` staging rehearsal + go-live sign-off
- [ ] `NEST-121` resolve offline-policy wording drift in product docs

## Refill Rules

- When `NOW` has fewer than 2 items, refill from `docs/planning/mvp-execution-plan.md`.
- Preserve dependency order from `TASK_BOARD`.
- Keep one primary execution concern per commit.
- Never open a new wave until quality gate and evidence updates are complete.
