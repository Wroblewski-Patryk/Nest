# Localization Foundation v1 (NEST-109)

Date: 2026-03-21
Task: `NEST-109`

## Scope Delivered

- Shared localization primitives in `@nest/shared-types`:
  - `resolveLanguage(value)`
  - `resolveLocale(language, override)`
  - `translate(key, language, fallback)`
  - `formatLocalizedDateTime(value, language, localeOverride)`
- Supported language baseline: `en`, `pl`.
- Deterministic fallback behavior:
  - unsupported language -> `en`
  - missing locale override -> `en-US` for `en`, `pl-PL` for `pl`

## Backend Contract

- Auth register accepts optional:
  - `language` (`en|pl`)
  - `locale` (string)
- Auth/profile responses now include:
  - `language`
  - `locale`
  - normalized `settings.language` and `settings.locale`
- Settings update supports top-level `language` and `locale` and persists them in user settings.

## Client Baseline

- Web uses shared localization primitives for:
  - app kicker translation in workspace shell,
  - localized date-time formatting in automation and billing views.
- Mobile uses shared localization primitives for:
  - app kicker translation in module hero.

## Validation

- `php artisan test --filter=AuthApiTest` (PASS)
- `pnpm --dir apps/web build` (PASS)
- `pnpm --dir apps/mobile exec expo export --platform web` (PASS)
