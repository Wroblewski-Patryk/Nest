# Integration Marketplace Framework V2 (NEST-145)

Last updated: 2026-03-31

## Purpose

Provide one integration catalog for provider discovery and lifecycle management
(`install`, `uninstall`, reconnect through existing connection flows).

## Marketplace APIs

- `GET /api/v1/integrations/marketplace/providers`
  - returns provider catalog with metadata and current per-user lifecycle state.
- `POST /api/v1/integrations/marketplace/providers/{provider}/install`
  - installs or reinstalls provider in catalog state.
- `POST /api/v1/integrations/marketplace/providers/{provider}/uninstall`
  - uninstalls provider and revokes active connection state.
- `GET /api/v1/integrations/marketplace/audits`
  - returns install/uninstall audit history for tenant/user scope.

## Data Model

- `integration_marketplace_installs`
  - per-tenant/per-user provider install state (`installed|uninstalled`),
  - stores install metadata and lifecycle timestamps.
- `integration_marketplace_audits`
  - immutable audit records for `install` and `uninstall` actions,
  - includes reason and operational payload snapshot.

## Provider Metadata and Status Surface

Provider catalog response includes:

- metadata:
  - `display_name`, `category`, `description`, `auth_type`,
    `default_scopes`, `supports_webhook`, `sync_modes`.
- lifecycle state:
  - `install_status`, `is_installed`, `installed_at`, `uninstalled_at`.
- connection state:
  - `connection.status`, `connection.is_connected`, `connection.scopes`,
    token expiry/update timestamps.

Current catalog providers:

- `trello`, `google_tasks`, `todoist`, `clickup`, `microsoft_todo`,
  `google_calendar`, `obsidian`.

## Reversibility and Auditability

- uninstall is reversible by running install again for the same provider.
- each install/uninstall action writes a dedicated audit record.
- state and audits are tenant/user scoped and exposed through API contracts.

## Regression Coverage

- `tests/Feature/IntegrationMarketplaceApiTest.php`
  - catalog discovery,
  - install -> uninstall -> reinstall lifecycle,
  - uninstall connection revoke behavior,
  - tenant/user isolation and auth guards.
