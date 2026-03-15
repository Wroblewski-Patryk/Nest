# Quality Gate Workflow (Pre-Commit)

Last updated: 2026-03-16

## Purpose

Enforce a repeatable pre-commit process that includes:

- automated checks for changed areas,
- manual regression confirmation,
- unintended change detection via diff review.

## Command

Run from repository root:

```powershell
pwsh ./scripts/quality-gate.ps1 -AcknowledgeManualChecks
```

## What the Gate Does

1. Collects changed files from staged and unstaged diffs.
2. Requires explicit manual checklist acknowledgement.
3. Runs scoped automated checks by area:
   - `apps/api/*`: `php vendor/bin/pint --test` + `php artisan test`
   - `apps/web/*`: `pnpm lint` + `pnpm build`
   - `apps/mobile/*`: `pnpm test:unit` + `pnpm test:smoke`
4. Fails fast if any check fails.

## Manual Checklist (Required)

- Critical behavior regression verified for changed features.
- UI regression verified for desktop/mobile where applicable.
- Diff reviewed for unintended file changes.

## Recommended Usage

- Run gate before every commit.
- Keep commits single-purpose (`1 task = 1 commit`).
- If gate fails, fix issues and re-run before committing.
