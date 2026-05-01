# Repository Bootstrap Usage

This repository uses local, manual bootstrap artifacts.

## Flow
1. Start from this repository bootstrap package.
2. Rename the folder.
3. Open the new project in Codex.
4. Tailor docs/plans/context through AI-guided setup.
5. When the project reaches a release-readiness, handoff, incident-review, or
   stalled-queue moment, copy
   `docs/governance/function-coverage-ledger-template.csv` into
   `docs/operations/` as a dated function coverage matrix and use
   `docs/governance/function-coverage-ledger-standard.md` to classify the next
   smallest evidence, fix, blocker, or scope-decision tasks.

## Why Manual Mode
- Fast setup for early-stage projects.
- Full flexibility per project without template update tooling.
- Easy human review of every initial decision.

## Guardrails
- Keep this repository docs as the canonical baseline.
- Do not skip bootstrap checklist.
- Keep changes small and auditable in each new repo.
- Keep subagent rules aligned with `docs/governance/subagent-delegation-policy.md`.
- Treat the function coverage ledger as optional until the project has enough
  module surface area that ad-hoc "test everything" loops stop being useful.

