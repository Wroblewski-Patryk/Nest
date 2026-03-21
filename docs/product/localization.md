# Localization

## Supported Languages

- Product direction: global-first localization.
- v1 baseline:
  - Multilingual architecture is implemented from the start (not as a
    post-release retrofit).
  - UI language selected per user.
  - Core translation coverage for user-facing navigation, forms, validation
    errors, and system notifications.
- Language rollout model:
  - English (`en`) is the mandatory default language.
  - Polish (`pl`) is the first additionally deployed production language.
  - Next languages are added using the same rollout process and QA gates.

## Routing Strategy

- Locale selection is user-preference driven (not URL-only driven).
- Timezone selection is user-preference driven and independent from workspace
  configuration.
- First day of week is user-configurable, with default inferred from locale.
- Time format is user-configurable (12h/24h preference).
- Number and currency formatting default to locale-derived values, with
  user-configurable overrides.
- Measurement units (metric/imperial) default to locale-derived values, with
  user-configurable overrides.
- Onboarding uses progressive localization detection: prefer the most accurate
  signal allowed by user permissions (for example device locale/timezone,
  browser hints, geo-based inference). If permissions or confidence are
  insufficient, user explicitly sets preferences manually.
- First-run onboarding uses a simplified language step: show available
  languages, preselect detected language, and provide one clear continue
  action.
- Detected language is shown as the preselected option in the language select
  control (no extra recommendation label required).
- Onboarding localization flow is optimized for the fewest possible clicks and
  only minimum required configuration before app access.
- v1 requires a short onboarding step before first app access with minimum
  mandatory fields: `language` and `display name`.
- After onboarding completion in v1, user is redirected directly to the main
  dashboard; quick setup is deferred to a future release.
- Language selection is available from pre-auth screens (sign in/sign up), so
  user can choose language before logging in.
- The same localization detection/default-selection logic is used consistently
  across pre-auth, onboarding, and authenticated app flows.
- v1 persists only the current effective localization preferences (no dedicated
  localization change history tracking).
- v1 uses one account-level default locale profile (language, region,
  formatting preferences) as the shared baseline for all modules.
- v1 does not provide a dedicated "reset to defaults" action for localization;
  users update each localization setting directly.
- RTL languages are out of v1 scope and planned for a future release phase.
- All localization preference changes are applied live immediately after save
  in the active session (no app restart and no re-login required).
- Localization preferences are stored in backend user profile settings as the
  single source of truth and synchronized across web and mobile clients.
- v1 uses one shared localization profile per user across all devices (no
  per-device localization overrides).
- Default language is initialized in onboarding and can be changed later from
  account settings.
- Region is initialized in onboarding from detection signals and can be changed
  later from account settings.
- Changing region does not automatically update other localization preferences
  (currency/number formats/units).
- v1 language enforcement policy: account language is strictly enforced across
  the experience, including UI copy, validation messages, and
  system-generated content; mixed-language behavior is not supported.
- User-authored content is not auto-translated on language change (for example
  list names, task titles, notes stay exactly as entered by user). Localization
  covers only system/application surfaces.
- Outbound communication (system email and push notifications) always uses the
  user's current account language.
- Outbound messaging uses one shared template structure across languages;
  localized copy and optional localized imagery can differ by language.
- Geo hints can suggest defaults during onboarding, but never override explicit
  user choice.

## Translation Source of Truth

- Canonical translation assets are version-controlled with app code.
- v1 translation operations use in-repository language files only (no external
  translation management platform).
- New language rollout requires at least 90% translation key coverage before
  production enablement.
- Backend/API error envelopes expose stable machine-readable codes; clients map
  codes to localized user-facing messages.
- Domain labels and dictionaries shared between web/mobile use common contracts
  to prevent naming drift.

## Fallback Rules

- Fallback order:
  1. User-selected locale.
  2. Product default locale (`en`).
  3. Safe non-empty fallback string from default bundle.
- Missing translation keys must be tracked and fixed as part of release QA.
- Date/time/number formatting follows user locale and timezone preferences.

## QA Checklist

- Verify language switching without app restart regression.
- Verify parity of localized strings between web and mobile for core modules.
- Verify locale formatting (date, time, number, currency where applicable).
- Verify right-to-left (RTL) readiness is explicitly tested before enabling RTL
  locales in production.
