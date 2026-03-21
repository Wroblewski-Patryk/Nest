# Production Operations Runbook v1 (NEST-119)

Date: 2026-03-21
Task: `NEST-119`

## 1. Incident Response

1. Detect incident (monitoring alert, smoke suite failure, user report).
2. Declare incident severity (`SEV-1`, `SEV-2`, `SEV-3`).
3. Assign roles:
   - Incident Commander
   - API owner
   - Web owner
   - Mobile owner
   - Scribe/communications owner
4. Stabilize service and publish first status update.

## 2. Rollback Procedure

1. Stop new deployments.
2. Roll back API/web release symlink or previous artifact version.
3. Verify DB migration rollback safety policy:
   - use forward-fix when destructive rollback is unsafe,
   - execute rollback only for verified reversible migrations.
4. Re-run health checks and smoke suite.
5. Close rollback with timeline + owner sign-off.

## 3. Escalation Matrix

- `SEV-1`: immediate paging for engineering on-call + product owner.
- `SEV-2`: engineering on-call within defined SLA window + product lead.
- `SEV-3`: backlog remediation with scheduled owner.

## 4. Release Ownership

- Release Manager: owns go/no-go decision and checklist closure.
- API owner: migration, queue workers, API health.
- Web owner: web availability and route health.
- Mobile owner: build distribution status and phone critical-path checks.
- Ops owner: monitoring, backups, and rollback readiness.

## 5. Monitoring Checklist

- API health endpoint green.
- Queue backlog and failed jobs within threshold.
- Error rate and latency SLO checks pass.
- Billing/integration critical routes healthy.
- Post-deploy smoke suite pass recorded.
- Mobile phone critical path checklist pass recorded.

## 6. Post-Incident / Post-Release Actions

- Publish timeline and root cause summary.
- Capture corrective/preventive actions with owners and deadlines.
- Update runbook when missing guardrails are discovered.
