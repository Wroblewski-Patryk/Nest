# Onboarding and Localization Preference Flow v1 (NEST-110)

Date: 2026-03-21
Task: `NEST-110`

## Delivered Flow

- Pre-auth language selection:
  - API endpoint: `GET /api/v1/auth/localization/options`
  - Web pre-auth selector surface: home panel `Pre-Auth Language`
  - Mobile pre-auth selector surface: `app/modal.tsx`
- Onboarding enforcement:
  - API endpoint: `POST /api/v1/auth/onboarding`
  - required fields: `display_name`, `language`
  - optional field: `locale`
- Immediate apply behavior:
  - onboarding/settings responses return normalized `language`, `locale`, and
    `onboarding_required` state immediately after save.

## Contract Notes

- Supported languages remain `en` and `pl`.
- Deterministic fallback policy remains active (`en` + locale defaults).
- Shared client includes onboarding and localization-option methods for web/mobile.

## Validation

- `php artisan test --filter=AuthApiTest` (PASS)
- `pnpm --dir apps/web build` (PASS)
- `pnpm --dir apps/mobile exec expo export --platform web` (PASS)
