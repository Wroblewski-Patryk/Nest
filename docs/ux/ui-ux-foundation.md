# UI/UX Foundation

## Design Source of Truth

- Primary: Figma MCP artifacts and approved implementation snapshots.
- Secondary (ideation + execution benchmark): Stitch project `projects/11122321523690086751`.
- Current target assumptions baseline:
  - `docs/ux/nest_190_full_system_ux_target_assumptions_2026-04-01.md`

## Tokens and Components

- Sanctuary visual language (calm palette, soft contrast, airy spacing) is mandatory.
- Shared UI components are required for cross-module consistency:
  - shell/navigation primitives,
  - cards/metrics/panels,
  - status chips,
  - date/time and picker controls,
  - multi-select chips for life-area context,
  - inline feedback blocks.
- One primary action per screen section; secondary actions must be visually de-emphasized.

## State Requirements

- `loading`: local skeleton/placeholder in the exact section being fetched.
- `empty`: plain-language state with clear CTA.
- `error`: user-safe message plus explicit recovery action.
- `success`: local contextual confirmation near the action source.
- Raw backend error payloads must not be rendered directly to users.

## Responsive Requirements

- Mobile-first composition is the source model.
- Desktop extends mobile information architecture; it must not introduce a different mental model.
- Over-stretched panels and large empty header/content zones are prohibited.
- Module content must remain readable and actionable at `390x844`.

## Accessibility Requirements

- Keyboard/focus navigation must be complete for all primary create/edit/confirm flows.
- Interactive controls require accessible labels and visible focus states.
- Contrast must satisfy practical readability for primary content and status indicators.
- Semantic headings/landmarks are required for each module surface.
