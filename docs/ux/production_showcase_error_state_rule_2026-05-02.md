# Production Showcase And Error-State Rule

Date: 2026-05-02

## Rule

Canonical showcase states may be used for beautiful empty or sparse first-run
states. They must not hide real API failures in production.

## Implementation Baseline

The first production slice applies this rule to:

- Dashboard
- Calendar
- Journal

Those routes now enter canonical showcase only when loading is complete and no
API error is present. If an API call fails, the existing user-safe error message
surface remains visible instead of being replaced by demo-like content.

## Follow-Up

Planning still has a preview-state branch used for the canonical Planning
experience. Before public release, review it separately because Planning mixes
operational task management with approved canonical preview behavior.

## Acceptance Criteria

- Empty live data can render the canonical experience.
- API failure renders an error state.
- Raw technical errors remain hidden from end users.
- Future canonical screens follow the same distinction between empty state and
  failure state.
