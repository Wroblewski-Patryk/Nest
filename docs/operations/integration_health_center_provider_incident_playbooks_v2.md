# Integration Health Center Provider Incident Playbooks V2

Last updated: 2026-03-31

## Scope

This runbook defines provider-specific incident procedures consumed by
Integration Health Center records (`runbook_ref`).

## Global Triage Sequence

1. Confirm provider health status and risk level in
   `GET /api/v1/integrations/health`.
2. Run one-click replay (`replay_latest_failure`) if available.
3. If replay fails or provider is disconnected, run guided reconnect flow.
4. Re-check health window and event drop/lag metrics.
5. Escalate with provider-specific diagnostics below when status remains
   `degraded` or `disconnected`.

## Provider Procedures

### provider-trello

- Verify board/card permissions in granted scopes (`read`, `write`).
- Reconnect credentials when status is `revoked` or token expired.
- Replay latest failed sync and verify success rate recovery.
- Validate webhook delivery signature and payload shape when drop rate > 0.

### provider-google_tasks

- Validate OAuth token freshness and minimal `tasks.readonly` scope.
- Reconnect and run manual list/task sync if replay is unavailable.
- Compare latest failed payload against current Google Tasks entity shape.

### provider-todoist

- Verify token validity and `data:read_write` scope.
- Replay latest failed sync and inspect idempotency key sequence.
- Confirm webhook endpoint delivery if event drops increase.

### provider-clickup

- Validate OAuth token, workspace permissions, and task scopes.
- Run one-click replay for latest failed sync.
- If event drops persist, verify webhook secret and ClickUp callback health.

### provider-microsoft_todo

- Validate Graph token expiration and `Tasks.ReadWrite` permission.
- Reconnect provider and replay latest failed sync.
- Inspect provider throttling and retry patterns when failure attempts rise.

### provider-google_calendar

- Confirm `calendar.events` scope and event write permissions.
- Replay latest failed sync conflict and review resulting conflict queue state.
- Validate webhook push notifications and delivery renewals.

### provider-obsidian

- Verify vault token validity and path permissions (`vault:read_write`).
- Reconnect provider if vault path or token changed.
- Run manual journal sync and validate markdown export metadata.

## Exit Criteria

- Provider health state returns to `healthy` or accepted mitigation is recorded.
- No unresolved replayable failure remains for the provider in current window.
- Drop rate stabilizes and lag trend returns below warning threshold.
