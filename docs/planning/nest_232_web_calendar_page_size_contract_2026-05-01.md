# Task

## Header

- ID: NEST-232
- Title: Fix web Calendar event query page size contract
- Task Type: implementation
- Current Stage: verification
- Status: DONE
- Owner: Execution Agent
- Depends on: NEST-230
- Priority: P0
- Coverage Ledger Rows:
- Iteration: autonomous worker 2026-05-01
- Operation Mode: BUILDER

## Context

After `NEST-230` fixed local CORS defaults, browser smoke reached the API and
found that web Calendar calls `GET /calendar-events?per_page=200`. The API
validates Calendar and Tasks `per_page` with a maximum of `100`, so the page
falls back into showcase/error behavior instead of loading the real Calendar
CRUD surface.

## Goal

Align web Calendar event/task page-size queries with the existing API contract.

## Constraints

- do not change API pagination limits in this slice
- do not change Calendar UX behavior beyond the query contract
- preserve tenant/auth boundaries
- keep mobile authentication as a separate `NEST-231` blocker

## Definition of Done

- [x] web Calendar uses `per_page: 100` or less for events and tasks
- [x] web typecheck/build or targeted smoke passes
- [x] browser Calendar CRUD smoke reaches create/edit/delete
- [x] docs/context are updated

## Forbidden

- increasing API limits to hide a frontend bug
- bypassing validation
- using fake provider/auth paths

## Acceptance Criteria

- [x] no `per_page: 200` remains in web Calendar
- [x] web Calendar no longer receives `422` during initial event/task load
- [x] Calendar CRUD browser smoke passes or exposes a new distinct blocker

## Validation Evidence

- Static inspection:
  no `per_page: 200` or `per_page=200` remains in
  `apps/web/src/app/calendar/page.tsx`.
- Web:
  `.\node_modules\.bin\tsc.CMD --noEmit` passed in `apps/web`.
  `pnpm build` passed in `apps/web`.
- Browser smoke:
  local Playwright smoke against `http://127.0.0.1:9001/calendar` passed:
  initial Calendar API load returned `200` for
  `GET /calendar-events?per_page=100` and `GET /tasks?per_page=100`, then
  Calendar create, edit, and delete all completed through the web UI.
- Repository:
  `git diff --check` passed with line-ending warnings only.

## Result Report

- Task summary:
  Aligned web Calendar event/task query page size with the API `max:100`
  contract.
- Files changed:
  `apps/web/src/app/calendar/page.tsx`,
  `docs/planning/nest_232_web_calendar_page_size_contract_2026-05-01.md`,
  plus planning/context docs.
- What is incomplete:
  mobile authenticated API smoke remains blocked by `NEST-231`.
