# Mobile Release Pipeline for Physical Devices (NEST-117)

Date: 2026-03-21
Task: `NEST-117`

## Pipeline Assets

- Workflow: `.github/workflows/mobile-release.yml`
- Script: `scripts/release/mobile-release.ps1`

## Build Profiles

- `preview`: internal distribution for physical-device testing.
- `production`: signed release candidate profile.

## Internal Distribution Flow

1. Trigger workflow in `preview` profile.
2. Generate iOS/Android builds through EAS profile.
3. Share install links with internal phone test group.
4. Run artifact verification checklist before sign-off.

## Release Checklist Additions

- App install succeeds on physical iOS and Android devices.
- Auth/onboarding screens open after install.
- API connectivity path is verified.
- Sync/options controls are visible in app modal/settings surface.

## Validation

- Dry-run execution is supported:
  - `powershell -ExecutionPolicy Bypass -File scripts/release/mobile-release.ps1 -Profile preview -DryRun`
