# NEST-317 Canonical State And Responsive QA

Date: 2026-05-02
Stage: verification
Scope: web app canonical and contextual module surfaces

## Goal

Verify that the latest canonical UX/UI work keeps primary actions visible,
preserves protected route access, and avoids responsive layout regressions.

## Routes Checked

- `/dashboard`
- `/tasks?action=create-task`
- `/calendar?action=create-event`
- `/journal?action=create-entry`
- `/habits`
- `/routines`
- `/life-areas`
- `/insights`
- `/automations`
- `/billing`
- `/settings`

## Viewports

- Desktop: `1440x1100`
- Mobile: `390x844`

## Evidence

Automated Playwright smoke used a local mock API and production `next start`
server against the latest build.

- Result JSON:
  `docs/ux_canonical_artifacts/2026-05-02/qa/qa-results.json`
- Screenshots:
  `docs/ux_canonical_artifacts/2026-05-02/qa/`

## Findings

Initial QA found one mobile-only issue:

- `/calendar?action=create-event` opened the details state but the mobile CSS
  still hid `#calendar-add-event`.

Fix applied:

- Calendar details now receives `is-intent-open` when opened by action intent.
- Mobile CSS allows `details.is-intent-open` and `#calendar-add-event` to be
  visible.

## Verification Result

Final smoke result:

- checked routes/viewports: `22`
- failures: `0`
- protected routes did not redirect to `/auth`
- primary selectors were visible
- no horizontal overflow detected
- no Playwright page errors recorded

Additional validations:

- `pnpm lint`
- `pnpm exec tsc --noEmit`
- `pnpm build`
- `pnpm test:unit`
- `git diff --check` with CRLF warnings only

## Result Report

The canonical Dashboard, Planning create-task intent, Calendar create-event
intent, Journal create-entry intent, contextual module pages, and advanced
Settings-adjacent surfaces passed desktop and mobile smoke verification after
the Calendar mobile intent fix.
