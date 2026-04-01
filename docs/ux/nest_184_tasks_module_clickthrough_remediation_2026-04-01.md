# NEST-184 Tasks Module Clickthrough + UX Remediation (2026-04-01)

## Scope

Execution focus:

- end-to-end clickthrough of `/tasks` web flow,
- collect UX issues affecting daily life-management usability,
- fix highest-impact blockers in web + mobile implementation.

## Design Context Used

- Stitch project baseline: `projects/11122321523690086751`.
- Cross-check reference: active project metadata + screen inventory fetched from Stitch MCP before remediation.

## Clickthrough Matrix (Web `/tasks`)

Validated manually with Playwright CLI session (`localhost:9001` + API `localhost:9000`):

1. Create list with no parent context.
2. Create list with parent type selected and parent chosen.
3. Create standalone task in `No List` column.
4. Toggle task `todo <-> done`.
5. Edit task and move between list and no-list states.
6. Delete task.
7. Edit list parent to `No parent`.
8. Delete list.
9. Apply and reset filters (`search`, `status`, `context`, `life area`, `hide empty`).

## Findings and Fixes

### 1) Tasks API 422 in board load

- **Symptom**: web board intermittently loaded with validation error (`per_page` too high).
- **Root cause**: frontend requested `per_page=200` while API contract max is `100`.
- **Fix**: replaced single oversized request with paginated loader (`per_page=100`, guarded loop).
- **Files**: `apps/web/src/app/tasks/page.tsx`.

### 2) Mobile tasks tab was placeholder-level and temporarily missing

- **Symptom**: mobile tasks route had no practical CRUD workflow after interim file removal.
- **Root cause**: old mobile tab only exposed MVP placeholder state; file had been deleted in working state.
- **Fix**: rebuilt `apps/mobile/app/(tabs)/index.tsx` as API-backed Tasks+Lists screen:
  - list create (optional parent type),
  - task create (optional list assignment),
  - standalone no-list tasks,
  - task edit/status toggle/delete,
  - list edit/delete,
  - search + status filters,
  - refreshed sanctuary-style visual treatment consistent with current design language.

### 3) Web feedback discoverability

- **Symptom**: success/error feedback rendered low in page flow, easy to miss during list/task creation.
- **Fix**:
  - moved actionable status/error callouts near module top,
  - set `hide empty columns` default to `true` (less cognitive clutter in dense boards),
  - reset action now restores focused default (`hide empty = true`).
- **Files**: `apps/web/src/app/tasks/page.tsx`.

## Validation

Automated checks run after remediation:

- `pnpm --dir apps/web test:unit`
- `pnpm --dir apps/web test:smoke`
- `pnpm --dir apps/mobile test:unit`
- `pnpm --dir apps/mobile test:smoke`

All passed.

## Residual Risk

- Physical-device ergonomics (touch precision, keyboard overlap, long-session comfort) still require live phone verification outside desktop web export.
