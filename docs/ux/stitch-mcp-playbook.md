# Stitch MCP Playbook

## Purpose
Use Stitch MCP as a structured UX co-designer workflow for Nest:

- iterate complete screen packs in one visual language,
- enforce Mix Ideal style baseline,
- hand off implementation only after explicit approval.

## Allowed Use
- early concept exploration
- alternative layout proposals
- component composition ideas
- full-cycle unified screen iteration under approved Stitch exception record

## Not Allowed as Sole Source
Stitch output alone must not be used as final source of truth for implementation.

## Required Pairing
Every Stitch-assisted task must include one of:
- Figma source reference (preferred), or
- approved design snapshot with explicit sign-off.

For Nest unified baseline work, use:

- `docs/ux/nest_os_design_system_mix_ideal_v1.md`

## Active Stitch Baseline (Current Cycle)
- Project: `projects/11122321523690086751`
- Unified spec: `docs/ux/ux_ui_stitch_unified_spec_v1.md`
- Style source: `docs/ux/nest_os_design_system_mix_ideal_v1.md`
- Screen registry: `docs/ux/stitch_screen_registry_2026-03-21.md`

## Execution Checklist
1. Document UX goal and scope in task context.
2. Verify Stitch connectivity (`list_projects`, `list_screens`).
3. Pull current screen inventory and identify impacted screen IDs.
4. Send focused `edit_screens` batches (prefer module-based batches).
5. Enforce style constraints from Mix Ideal spec in every prompt.
6. Record updated screen IDs and state-coverage evidence.
7. Keep implementation blocked until user approves the Stitch package.

## Prompt Contract (Stitch Edits)
Always include:
- fixed token palette:
  - `#FDFCF8`, `#4B3F34`, `#BFA68A`, `#789262`, `#DFE5DA`
- typographic hierarchy (Inter Light/Regular/Medium),
- icon style (`1px` fine-line outline),
- compact header + floating bottom nav language,
- watercolor aura constraints (very low opacity, no readability loss),
- explicit state coverage (loading/empty/error/success).

## Stitch Guidance Adopted for Nest
When Stitch proposes extra rules, adopt only if they do not conflict with
approved Nest baseline. Currently accepted guidance:
- rely on tonal layering over heavy hard dividers where practical,
- keep shadows ambient/subtle,
- keep premium whitespace rhythm and avoid overcrowding,
- prefer clear state communication over dense control clusters.

## Evidence Fields
- `design_source_type`: figma | approved_snapshot
- `design_source_reference`: url/node/path
- `stitch_used`: yes | no
- `stitch_artifact_reference`: project/screen IDs or exported snapshot path
- `parity_check_result`: pass | fail
