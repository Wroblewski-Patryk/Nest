# Deployment Agent Checklist Template

## Mission
Deploy `Nest (LifeOS)` to `<ENV>` using SHA `<SHA>` and return only after API,
web, mobile-web, and contract validation is complete.

## Inputs
1. Repo path
2. SHA or branch
3. Environment (`stage` or `production`)
4. API URL
5. Web URL
6. Mobile web preview or release target
7. Service map or deployment topology

## Required Execution Order
1. Verify SHA and repo state.
2. Verify env variables, secrets, and routing.
3. Run migrations and tenant-safe data checks if needed.
4. Deploy API, web, and mobile artifacts.
5. Run API health and auth smoke checks.
6. Run one core web journey and one mobile-web smoke journey.
7. Validate OpenAPI contracts if release touched them.
8. Report outcome.

## Health And Smoke Commands
1. API health or equivalent runtime check
2. one authenticated dashboard or module route
3. one localization-sensitive flow if copy or locale logic changed
4. one parity-sensitive flow if a shared module changed

## Stop Conditions
1. migration failure
2. API or client not reachable
3. tenant or auth smoke fails
4. build or asset mismatch blocks core UI
5. contract validation fails

## Output Contract
1. Final status (`success`, `blocked`, `rolled_back`)
2. Deployed SHA
3. Passed or failed checks
4. Exact failing endpoint or error if blocked
5. Recommended next action

## Deployment Gate Evidence

- [ ] `DEPLOYMENT_GATE.md` has no hard blocks.
- [ ] Build passes without errors.
- [ ] Runtime startup logs have no blocking errors.
- [ ] API contracts match deployed clients.
- [ ] Required migrations are applied.
- [ ] Environment variables and secrets are configured.
- [ ] Rollback path is prepared and appropriate for the risk level.
