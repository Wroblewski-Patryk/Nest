# Integration Regression Suite

## Purpose

Define and enforce an end-to-end regression suite for integration providers in
CI.

## Scope

The integration regression suite validates provider sync flows end-to-end for:

- `trello` (list/task sync)
- `google_tasks` (list/task sync)
- `todoist` (list/task sync)
- `google_calendar` (calendar sync with conflict queue generation)
- `obsidian` (journal sync)

## Test Entry Point

- `apps/api/tests/Integration/IntegrationProviderRegressionTest.php`

## CI Enforcement

The backend CI pipeline runs suites explicitly:

1. `php artisan test --testsuite=Integration --env=testing`
2. `php artisan test --testsuite=Unit --env=testing`
3. `php artisan test --testsuite=Feature --env=testing`

This keeps provider regression coverage visible and non-optional in every CI
run.
