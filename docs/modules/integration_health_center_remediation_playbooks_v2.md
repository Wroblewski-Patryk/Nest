# Integration Health Center and Remediation Playbooks V2 (NEST-148)

Last updated: 2026-03-31

## Goal

Provide a single operational health center for integrations with actionable
recovery paths and provider-specific incident playbooks.

## Delivered Scope

- Health center API endpoints:
  - `GET /api/v1/integrations/health`
  - `POST /api/v1/integrations/health/{provider}/remediate`
- Health aggregation service:
  - `apps/api/app/Integrations/Services/IntegrationHealthCenterService.php`
- API controller:
  - `apps/api/app/Http/Controllers/Api/IntegrationHealthCenterController.php`
- One-click remediation action:
  - `replay_latest_failure` (replays latest provider failure in user scope)
- Guided remediation action:
  - `reconnect_provider` (returns guided checklist)

## Health Dimensions

Per provider, health center reports:

- connection status (`connected|revoked|not_connected`),
- sync reliability window (`success_count`, `failed_count`, success rate),
- latest/open failure footprint,
- webhook event ingestion quality (received, dropped, lag),
- remediation options and runbook reference.

Health states:

- `healthy`
- `degraded`
- `disconnected`

## UX Surfaces

- Web: calendar integration area now includes integration health center card.
- Mobile: calendar tab includes integration health center section with one-click
  remediation triggers and status messaging.

## Provider Incident Procedures

Canonical provider procedures are documented in:

- `docs/operations/integration_health_center_provider_incident_playbooks_v2.md`

Each provider health record includes direct `runbook_ref` to the provider
section in that runbook.

## Validation

- Automated:
  - `php artisan test --filter "IntegrationHealthCenterApiTest"` (PASS)
  - `php artisan test --filter "IntegrationConnectionApiTest|IntegrationSyncReplayApiTest|IntegrationEventIngestionApiTest"` (PASS)
  - `pnpm --package=@redocly/cli dlx redocly lint docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml` (PASS, warnings only)
  - `pnpm --dir apps/web build` (PASS)
  - `pnpm --dir apps/mobile test:smoke` (PASS)
- Manual:
  - provider failure simulation and one-click replay recovery path (PASS)
  - guided reconnect flow visibility in health center UI (PASS)
