# Task Template

## Header

- ID: NEST-XXX
- Title:
- Status: BACKLOG | READY | IN_PROGRESS | BLOCKED | REVIEW | DONE
- Owner: Documentation Agent | Planning Agent | Execution Agent | Review Agent
- Depends on:
- Priority: P0 | P1 | P2

## Description

One short paragraph with expected outcome.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## UX Source and MCP Evidence (Required for UX/UI Tasks)

- Source of truth type: `figma | approved_snapshot`
- Artifact reference:
  - Figma URL/node ID, or
  - approved Stitch snapshot reference (project ID + screen IDs + snapshot date)
- Approval checkpoint:
  - required for `approved_snapshot` source
  - include user approval evidence reference (thread/date + summary)
- Required visual states:
  - `loading`
  - `empty`
  - `error`
  - `success`
- Responsive coverage:
  - desktop
  - tablet
  - mobile
- Accessibility checks:
  - focus order + keyboard flow
  - semantic roles/labels
  - color contrast for key UI states
- MCP evidence links:
  - design context capture
  - screenshot/parity capture

## Review Checklist (UX Evidence Gate)

- [ ] source-of-truth type is declared (`figma|approved_snapshot`)
- [ ] artifact reference is present and testable
- [ ] when source is `approved_snapshot`, approval checkpoint evidence exists
- [ ] required states (`loading|empty|error|success`) are verified
- [ ] responsive behavior evidence exists (desktop/tablet/mobile)
- [ ] accessibility checks are recorded
- [ ] parity evidence (MCP context + screenshot) is attached

## Notes

Implementation notes, risks, links.
