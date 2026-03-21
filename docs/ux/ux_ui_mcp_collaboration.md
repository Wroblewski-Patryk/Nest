# UX/UI MCP Collaboration Standard

## Goal

Define a repeatable workflow where implementation AI collaborates with a
specialized UX/UI AI via MCP, while keeping Nest documentation and delivery
quality consistent.

## Design Source of Truth

- Default primary: Figma MCP context for exact node/frame implementation.
- Secondary: Stitch MCP can be used for ideation/proposal drafts.
- Exception path: for a dedicated UX cycle, Documentation Agent can promote an
  approved Stitch project snapshot to temporary source of truth if:
  - the decision is documented in `docs/`,
  - task board references the Stitch project ID,
  - implementation is blocked until explicit user approval of that Stitch
    baseline.
- Final implementation must always be validated against a concrete design
  artifact (Figma screenshot or approved design snapshot).
- Mandatory exception workflow reference:
  `docs/ux/ux_stitch_source_of_truth_exception_workflow.md`.

## Required Execution Flow (UX/UI Changes)

1. Identify the exact design target (Figma URL/node ID or approved artifact).
2. Fetch MCP design context for structure/tokens/components.
3. Fetch MCP screenshot for visual reference.
4. Implement with project conventions (shared tokens/components/types).
5. Validate parity for layout, spacing, typography, colors, states, and
   responsive behavior.
6. Record evidence in task notes/review notes before marking done.

## Role Responsibilities

### Documentation Agent

- Define UX intent and constraints in docs before execution if behavior changes.
- Add or update acceptance criteria for visual states and responsive behavior.
- Keep this standard linked from frontend strategy.

### Planning Agent

- Create tasks with explicit UX evidence requirements:
  - design source reference (Figma node or approved artifact),
  - required states (loading/empty/error/success),
  - desktop/tablet/mobile behavior,
  - accessibility verification expectations.
- Do not mark task `READY` if design source is undefined.
- Do not mark task `READY` for Stitch-as-source execution unless approved
  exception record is complete and linked.
- Use `.codex/templates/task-template.md` UX sections to capture source type,
  artifact reference, approval checkpoint, and review evidence gate checklist.

### Execution Agent

- Use MCP design context and screenshot before coding.
- Treat generated output as reference, not final code style.
- Map implementation to Nest conventions and shared design vocabulary.
- Capture validation proof in task notes.
- Block implementation if Stitch exception record is missing, incomplete, or
  expired.

### Review Agent

- Validate acceptance criteria line-by-line including UX evidence.
- Block completion if no source-of-truth artifact is referenced.
- Block completion if interactive states/responsiveness/a11y checks are missing.

## Minimal Prompt Contract (Implementation -> UX Agent)

Use this payload when asking UX-specialized AI for implementation guidance:

```json
{
  "goal": "What screen/flow to implement",
  "design_source": {
    "type": "figma|approved_snapshot",
    "reference": "figma URL/node ID or artifact path"
  },
  "platform": "web|mobile|both",
  "required_states": ["loading", "empty", "error", "success"],
  "constraints": [
    "reuse existing components",
    "use shared tokens",
    "preserve API/domain contracts"
  ],
  "deliverables": [
    "implementation plan",
    "component mapping",
    "visual/a11y validation checklist"
  ]
}
```

## MCP Setup Baseline

Recommended baseline for this repository:

- Enable and authenticate Figma MCP.
- Keep Stitch MCP available for ideation and approved-stitch exception path.
- Treat selected source-of-truth artifact parity as release gate for UX-heavy
  tasks.

## Evidence Gate (Definition of Done Add-on)

For UX/UI tasks, done means:

- implementation exists,
- acceptance criteria are checked,
- task status is updated in board,
- `PROJECT_STATE.md` is updated if scope/strategy changed,
- UX evidence exists (design reference + parity checks + state behavior checks).

