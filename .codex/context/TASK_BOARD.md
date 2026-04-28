# TASK_BOARD

Last updated: 2026-04-26

## Agent Workflow Refresh (2026-04-16)

- This board remains the canonical execution queue for Nest.
- If no task is `READY`, the Planning Agent should derive the next smallest
  executable task from:
  - `docs/planning/next_execution_wave_2026-03-21.md`
  - `docs/planning/human_ai_dual_actor_execution_plan_2026-03-31.md`
  - `docs/planning/open-decisions.md`
- Default delivery loop for every execution slice:
  - plan
  - implement
  - run relevant tests and validations
  - capture architecture follow-up if discovered
  - sync task state and project state
- Surface validation baseline:
  - API: integration, unit, feature, security-controls verification
  - Web: lint, typecheck, build, unit checks
  - Mobile: typecheck, Expo web export, unit checks
  - Contracts: OpenAPI lint when docs or API contracts change

## Backlog

- [x] NEST-234 Review dashboard parity after phase M capture
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-233
  - Done on: 2026-04-28
  - Notes:
    - Compared refreshed phase M dashboard capture against the canonical
      founder target.
    - Recorded the now almost purely art-directional remaining gap in:
      `docs/ux/nest_234_dashboard_parity_review_phaseM_2026-04-28.md`.

- [x] NEST-233 Apply dashboard painterly finish pass
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-232
  - Done on: 2026-04-28
  - Notes:
    - Refined hero landscape softness, right-rail atmosphere, top entry calm,
      and lower-card warmth to move the dashboard closer to canonical parity.
    - Updated implementation in:
      `apps/web/src/app/globals.css`.
    - Refreshed local evidence artifact:
      `docs/ux_canonical_artifacts/2026-04-28/nest-dashboard-web-parity-preview-phaseM.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-232 Review dashboard parity after phase L capture
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-231
  - Done on: 2026-04-26
  - Notes:
    - Compared refreshed phase L dashboard capture against the canonical
      founder target.
    - Recorded the now-extremely-small remaining gap in:
      `docs/ux/nest_232_dashboard_parity_review_phaseL_2026-04-26.md`.

- [x] NEST-231 Apply dashboard ultra-narrow finish pass
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-230
  - Done on: 2026-04-26
  - Notes:
    - Refined entry cadence, hero story rhythm, hero metric spacing, and
      lower-card restraint to bring the dashboard even closer to the canonical
      founder image.
    - Updated implementation in:
      `apps/web/src/app/globals.css`.
    - Refreshed local evidence artifact:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseL.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-230 Review dashboard parity after phase K capture
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-229
  - Done on: 2026-04-26
  - Notes:
    - Compared refreshed phase K dashboard capture against the canonical
      founder target.
    - Recorded the remaining ultra-narrow gaps in:
      `docs/ux/nest_230_dashboard_parity_review_phaseK_2026-04-26.md`.

- [x] NEST-229 Apply dashboard micro finish pass
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-228
  - Done on: 2026-04-26
  - Notes:
    - Refined entry typography, hero metric rhythm, lower-row softness, and
      quick-add restraint to move closer to pixel-perfect parity.
    - Updated implementation in:
      `apps/web/src/app/globals.css`.
    - Refreshed local evidence artifact:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseK.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-228 Review dashboard parity after phase J capture
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-227
  - Done on: 2026-04-26
  - Notes:
    - Compared refreshed phase J dashboard capture against the canonical
      founder target.
    - Recorded the remaining pixel-perfect micro-gaps in:
      `docs/ux/nest_228_dashboard_parity_review_phaseJ_2026-04-26.md`.

- [x] NEST-227 Apply dashboard founder finish pass
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-226
  - Done on: 2026-04-26
  - Notes:
    - Softened the rail icon treatment, refined the editorial title/hero, and
      enriched right-rail atmosphere to move the dashboard closer to the
      founder image.
    - Updated implementation in:
      `apps/web/src/app/globals.css`.
    - Refreshed local evidence artifact:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseJ.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-226 Review dashboard parity after phase I capture
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-225
  - Done on: 2026-04-26
  - Notes:
    - Compared refreshed phase I dashboard capture against the canonical
      founder target.
    - Recorded the remaining editorial/art-direction gaps in:
      `docs/ux/nest_226_dashboard_parity_review_phaseI_2026-04-26.md`.

- [x] NEST-225 Apply dashboard editorial entry and shell serenity pass
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-224
  - Done on: 2026-04-26
  - Notes:
    - Softened the dashboard shell, header rhythm, hero compression, and lower
      card density to move the screen closer to the canonical founder image.
    - Updated implementation in:
      `apps/web/src/app/globals.css`.
    - Refreshed local evidence artifact:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseI.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-224 Review final closure pass after phase H capture
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-223
  - Done on: 2026-04-26
  - Notes:
    - Compared refreshed phase H dashboard and assistant captures against the
      canonical founder target.
    - Recorded the now-small remaining gap and propagation guidance direction
      in:
      `docs/ux/nest_224_final_closure_review_phaseH_2026-04-26.md`.

- [x] NEST-223 Apply final dashboard closure pass and propagation rules
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-222
  - Done on: 2026-04-26
  - Notes:
    - Softened remaining dashboard micro-structure in hero, rail, focus card,
      and right-rail materials.
    - Added explicit finish propagation rules in:
      `docs/ux/design-memory.md`.
    - Updated implementation in:
      `apps/web/src/app/globals.css`.
    - Refreshed local evidence artifacts:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseH.png`,
      `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseH.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-222 Review canonical finish pass after phase G capture
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-221
  - Done on: 2026-04-26
  - Notes:
    - Compared refreshed phase G dashboard and assistant captures against the
      canonical founder target.
    - Recorded remaining micro-gaps and next finish/propagation slices in:
      `docs/ux/nest_222_canonical_finish_review_phaseG_2026-04-26.md`.

- [x] NEST-221 Apply canonical finish pass to dashboard shell and assistant
  idle state
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-220
  - Done on: 2026-04-26
  - Notes:
    - Softened the remaining dashboard hero typography, quieted the rail
      footer/account rhythm, reduced focus-card dominance, and enriched the
      assistant idle state.
    - Updated implementation in:
      `apps/web/src/app/assistant/page.tsx`,
      `apps/web/src/components/ai-copilot-card.tsx`,
      `apps/web/src/app/globals.css`.
    - Refreshed local evidence artifacts:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseG.png`,
      `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseG.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-220 Review dashboard and assistant living parity after phase F pass
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-219
  - Done on: 2026-04-26
  - Notes:
    - Compared refreshed phase F dashboard and assistant captures against the
      canonical founder target.
    - Recorded remaining gaps and the next finish-pass slices in:
      `docs/ux/nest_220_dashboard_living_parity_review_phaseF_2026-04-26.md`.

- [x] NEST-219 Apply living parity pass to dashboard shell and assistant on web
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-218
  - Done on: 2026-04-26
  - Notes:
    - Softened rail weight, refined hero density, tuned focus/timeline balance,
      improved support-card materials, and prepared richer assistant
      response-state styling.
    - Added reusable living-ui guidance in:
      `docs/ux/design-memory.md`.
    - Updated implementation in:
      `apps/web/src/app/dashboard/page.tsx`,
      `apps/web/src/components/workspace-primitives.tsx`,
      `apps/web/src/components/ai-copilot-card.tsx`,
      `apps/web/src/app/globals.css`.
    - Refreshed local evidence artifacts:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseF.png`,
      `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseF.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-218 Review dashboard and shell parity after phase E shell pass
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-217
  - Done on: 2026-04-26
  - Notes:
    - Compared refreshed phase E dashboard and assistant captures against the
      canonical founder target.
    - Recorded remaining gaps and next iteration slices in:
      `docs/ux/nest_218_dashboard_shell_parity_review_phaseE_2026-04-26.md`.

- [x] NEST-217 Refine dashboard shell composition and editorial entry on web
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-216
  - Done on: 2026-04-26
  - Notes:
    - Replaced the remaining split hero/rail wrapper with one canonical
      dashboard shell grid and lightened the top entry so the heading now feels
      closer to the founder reference.
    - Softened the shared sidebar/account rhythm and refined the assistant room
      while preserving the existing route and shell architecture.
    - Updated implementation in:
      `apps/web/src/app/dashboard/page.tsx`,
      `apps/web/src/components/workspace-primitives.tsx`,
      `apps/web/src/components/workspace-shell.tsx`,
      `apps/web/src/components/ai-copilot-card.tsx`,
      `apps/web/src/app/assistant/page.tsx`,
      `apps/web/src/app/globals.css`.
    - Refreshed local evidence artifacts:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseD.png`,
      `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseD.png`,
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseE.png`,
      `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseE.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-215 Apply dashboard shell finish pass and assistant conversational
  polish on web
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-213, NEST-214
  - Done on: 2026-04-26
  - Notes:
    - Tightened dashboard hero composition, softened support-rail support copy,
      and made the assistant composer/conversation stage feel more native to
      Nest.
    - Updated implementation in:
      `apps/web/src/app/dashboard/page.tsx`,
      `apps/web/src/components/workspace-primitives.tsx`,
      `apps/web/src/components/ai-copilot-card.tsx`,
      `apps/web/src/app/assistant/page.tsx`,
      `apps/web/src/app/globals.css`.
    - Refreshed local evidence artifacts:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseB.png`,
      `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseB.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-216 Review dashboard and shell parity after phase B finish pass
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-215
  - Done on: 2026-04-26
  - Notes:
    - Compared refreshed phase B dashboard and assistant captures against the
      canonical founder target.
    - Recorded remaining gaps and the next iteration tasks in:
      `docs/ux/nest_216_dashboard_shell_parity_review_phaseB_2026-04-26.md`.

- [x] NEST-213 Implement shell truth and first-class assistant surface on web
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-212
  - Done on: 2026-04-26
  - Notes:
    - Strengthened the web root and shared shell so the app now sits inside a
      clearer sanctuary-style frame instead of relying only on per-route
      polish.
    - Added a first-class `Assistant` route in:
      `apps/web/src/app/assistant/page.tsx`.
    - Updated shared shell and typography foundation in:
      `apps/web/src/components/workspace-shell.tsx`,
      `apps/web/src/app/layout.tsx`,
      `apps/web/src/app/globals.css`.
    - Captured fresh local evidence artifacts:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview-phaseA.png`,
      `docs/ux_canonical_artifacts/2026-04-26/nest-assistant-web-preview-phaseA.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-214 Review dashboard and shell parity after shell-truth implementation
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-213
  - Done on: 2026-04-26
  - Notes:
    - Compared fresh dashboard and assistant screenshots against the canonical
      founder target.
    - Recorded remaining gaps and next iteration slices in:
      `docs/ux/nest_214_dashboard_shell_parity_review_2026-04-26.md`.

- [x] NEST-212 Publish shell-level canonical alignment plan for dashboard and
  assistant surfaces
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-201, NEST-209, NEST-210, NEST-211
  - Done on: 2026-04-26
  - Notes:
    - Added shell-and-dashboard canonical alignment analysis in:
      `docs/ux/nest_212_workspace_shell_and_dashboard_canonical_alignment_2026-04-26.md`.
    - The new plan expands parity work from dashboard-only polish into a full
      workspace model covering root shell, sidebar/topbar, assistant/chat
      surface placement, and later module propagation.
    - Published release-stage task contract in:
      `docs/planning/nest_212_workspace_shell_and_dashboard_alignment_2026-04-26.md`.

- [x] NEST-211 Apply premium finish pass to dashboard parity on web
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-210
  - Done on: 2026-04-26
  - Notes:
    - Refined sidebar presence, topbar utility chrome, hero rhythm, right-rail
      density, and lower-card finish to move the dashboard closer to the
      founder reference.
    - Updated implementation in:
      `apps/web/src/components/workspace-shell.tsx`,
      `apps/web/src/app/globals.css`.
    - Refreshed preview artifact:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-210 Refine dashboard parity toward founder reference on web
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-209
  - Done on: 2026-04-26
  - Notes:
    - Removed duplicate hero/header feel from the dashboard and moved the page
      closer to the founder reference lower-card arrangement.
    - Replaced the secondary lower reflection block with a target-closer
      `Tasks + Habits` pair and refined sparse-data fallback presentation.
    - Updated implementation in:
      `apps/web/src/app/dashboard/page.tsx`,
      `apps/web/src/components/workspace-primitives.tsx`,
      `apps/web/src/app/globals.css`.
    - Refreshed preview artifact:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-209 Implement dashboard visual parity phase 1 on web
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-197, NEST-198, NEST-201
  - Done on: 2026-04-26
  - Notes:
    - Reworked the web dashboard shell, illustrated hero, support rail, focus
      card, day-flow timeline, and footer insight strip to materially narrow
      the founder-target parity gap.
    - Expanded reusable shared dashboard/workspace primitives in:
      `apps/web/src/components/workspace-primitives.tsx`.
    - Updated implementation surfaces in:
      `apps/web/src/app/dashboard/page.tsx`,
      `apps/web/src/components/workspace-shell.tsx`,
      `apps/web/src/app/globals.css`.
    - Stored the current parity preview artifact in:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-web-parity-preview.png`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-201 Capture dashboard parity gap plan against founder target reference
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-197, NEST-198, NEST-199, NEST-200
  - Done on: 2026-04-26
  - Notes:
    - Added detailed dashboard gap analysis and rollout model in:
      `docs/ux/nest_201_dashboard_parity_gap_plan_2026-04-26.md`.
    - Stored founder target reference image in:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`.
    - Published task contract and release evidence in:
      `docs/planning/nest_201_dashboard_parity_gap_planning_2026-04-26.md`.
    - Plan now serves as the detailed parity baseline for dashboard polish and
      for module-by-module UI-system rebuild work.

- [x] NEST-200 Implement canonical planning entry hierarchy on web
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-198, NEST-199
  - Done on: 2026-04-26
  - Notes:
    - Reframed web `/tasks` with canonical hero, focus, and planning-context
      layers without rewriting the underlying planning workflows.
    - Updated planning route and shared panel support in:
      `apps/web/src/app/tasks/page.tsx`,
      `apps/web/src/components/workspace-shell.tsx`,
      `apps/web/src/app/globals.css`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-199 Implement canonical journal and reflection entry surface on web
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-198
  - Done on: 2026-04-26
  - Notes:
    - Rebuilt web `/journal` around the canonical hero/focus/context grammar
      while preserving journal-entry and life-area CRUD flows.
    - Generalized reusable view primitives into:
      `apps/web/src/components/workspace-primitives.tsx`.
    - Updated journal route and shared styling in:
      `apps/web/src/app/journal/page.tsx`,
      `apps/web/src/app/globals.css`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-198 Implement canonical web dashboard hierarchy with reusable primitives
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-197
  - Done on: 2026-04-26
  - Notes:
    - Rebuilt web `/dashboard` around the canonical hero/focus/timeline/context
      hierarchy.
    - Added reusable workspace primitives in:
      `apps/web/src/components/workspace-primitives.tsx`.
    - Updated dashboard route and shared styling in:
      `apps/web/src/app/dashboard/page.tsx`,
      `apps/web/src/app/globals.css`.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm lint` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-197 Capture canonical dashboard direction and reusable implementation plan
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-190, NEST-196
  - Done on: 2026-04-26
  - Notes:
    - Added canonical dashboard direction document:
      `docs/ux/nest_197_dashboard_canonical_direction_2026-04-26.md`.
    - Stored founder-approved dashboard preview artifact in:
      `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-canonical-preview.png`.
    - Published task contract and release evidence in:
      `docs/planning/nest_197_dashboard_canonicalization_2026-04-26.md`.
    - Updated UX foundation, design memory, target assumptions, and project
      state so future module work can reuse one shared dashboard grammar.

- [x] NEST-108 Operationalize Stitch unified screen workflow for Mix Ideal v2
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-086, NEST-107
  - Done when:
    - active Stitch project and screen registry are documented as a working
      UX/UI source artifact set for this cycle,
    - Stitch playbook includes repeatable update flow and prompt contract for
      consistent cross-view generation,
    - unified spec references the active project and current evidence.
  - Done on: 2026-03-21
  - Notes:
    - Added screen registry in
      `docs/ux/stitch_screen_registry_2026-03-21.md`.
    - Updated `docs/ux/stitch-mcp-playbook.md` with active baseline, execution
      loop, and prompt contract.
    - Updated `docs/ux/ux_ui_stitch_unified_spec_v1.md` source/evidence to
      active Stitch project `projects/11122321523690086751`.

- [x] NEST-107 Capture approved "Mix Ideal" Nest design system in repository docs
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-086
  - Done when:
    - approved visual and UX rules are captured as implementation-ready design
      system documentation,
    - Stitch unified spec is linked to the new style baseline document,
    - frontend strategy and Stitch playbook reference the same source.
  - Done on: 2026-03-21
  - Notes:
    - Added canonical style spec in
      `docs/ux/nest_os_design_system_mix_ideal_v1.md`.
    - Linked the style baseline from
      `docs/ux/ux_ui_stitch_unified_spec_v1.md`.
    - Added cross-references in
      `docs/architecture/frontend_strategy.md` and
      `docs/ux/stitch-mcp-playbook.md`.

- [x] NEST-098 Operationalize Stitch source-of-truth exception workflow
  - Status: DONE
  - Owner: Planning Agent
  - Depends on: NEST-085, NEST-086
  - Done when:
    - task workflow explicitly supports Stitch-as-source exception path,
    - required approval evidence and project snapshot reference are mandatory,
    - implementation tasks cannot start without approved exception record.
  - Done on: 2026-03-19
  - Notes:
    - Added formal exception workflow contract in
      `docs/ux/ux_stitch_source_of_truth_exception_workflow.md`.
    - Linked exception workflow from `docs/ux/ux_ui_mcp_collaboration.md` and
      `AGENTS.md`.
    - Added explicit READY/blocking gates for Stitch source-of-truth exception
      records in UX planning/execution flow.

- [x] NEST-099 Add UX task template fields for MCP evidence and artifact source
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-098
  - Done when:
    - task template includes source-of-truth type (`figma|approved_snapshot`),
    - task template includes artifact reference and approval checkpoint fields,
    - review checklist enforces UX evidence gate from MCP collaboration standard.
  - Done on: 2026-03-19
  - Notes:
    - Extended `.codex/templates/task-template.md` with mandatory UX source and
      MCP evidence fields for UX/UI tasks.
    - Added explicit review checklist section enforcing UX evidence gate
      (artifact source, approval checkpoint, states, responsive, a11y, parity).
    - Updated `docs/ux/ux_ui_mcp_collaboration.md` to require usage of the
      template UX evidence sections by Planning Agent.

- [x] NEST-100 Validate existing UX-heavy tasks against unified Stitch baseline
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-098, NEST-099
  - Done when:
    - existing UX-heavy tasks are audited for artifact parity requirements,
    - gaps are documented with remediation follow-ups,
    - board reflects pass/fail results for audited tasks.
  - Done on: 2026-03-19
  - Notes:
    - Audit delivered in
      `docs/ux/ux_heavy_task_artifact_parity_audit_2026-03-19.md`.
    - Audited tasks: 9 (`PASS: 1`, `FAIL: 8`).
    - PASS:
      - `NEST-086` (approved Stitch baseline evidence complete).
    - FAIL:
      - `NEST-021`, `NEST-022`, `NEST-037`, `NEST-041`, `NEST-042`,
        `NEST-050`, `NEST-058`, `NEST-068` (missing full artifact parity
        evidence gates under current UX standard).
    - Follow-up remediation tasks added: `NEST-101`, `NEST-102`.

- [x] NEST-101 Backfill UX evidence records for legacy UX-heavy tasks
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-100
  - Done when:
    - each failed legacy UX-heavy task has explicit source-of-truth artifact
      reference recorded,
    - approval checkpoint references are added where required,
    - task notes include required state/responsive/a11y evidence links.
  - Done on: 2026-03-19
  - Notes:
    - Added backfilled UX evidence registry in
      `docs/ux/legacy_ux_evidence_backfill_2026-03-19.md`.
    - Recorded approved snapshot source, approval checkpoint, and evidence
      references for `NEST-021`, `NEST-022`, `NEST-037`, `NEST-041`,
      `NEST-042`, `NEST-050`, `NEST-058`, and `NEST-068`.
    - Linked backfill evidence records from each legacy UX-heavy task note.

- [x] NEST-102 Re-verify legacy UX-heavy implementations against approved baseline
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-101
  - Done when:
    - remediated legacy UX-heavy tasks are re-reviewed against approved Stitch
      baseline artifact(s),
    - pass/fail re-check results are recorded on the board,
    - unresolved gaps are converted into explicit execution tasks.
  - Done on: 2026-03-19
  - Notes:
    - Re-verification delivered in `docs/ux/legacy_ux_reverification_2026-03-19.md`.
    - Reviewed tasks: 8 (`PASS: 0`, `FAIL: 8`).
    - Failures remain due to missing MCP screenshot parity evidence and
      incomplete checklist-grade responsive/a11y verification artifacts.
    - Follow-up execution tasks added: `NEST-103`, `NEST-104`, `NEST-105`,
      `NEST-106`.

- [x] NEST-103 Build MCP screenshot parity packs for legacy UX-heavy tasks
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-102
  - Done when:
    - each legacy UX-heavy task has side-by-side MCP screenshot parity evidence
      against approved Stitch baseline screens,
    - parity captures are linked from task notes and review artifacts,
    - unresolved visual diffs are explicitly listed for implementation.
  - Notes:
    - Added Expo Metro monorepo resolution config in
      `apps/mobile/metro.config.js` to unblock mobile web export for parity
      artifact generation.
    - `pnpm --dir apps/mobile exec expo export --platform web` now succeeds,
      but screenshot capture pipeline for deterministic side-by-side parity
      evidence still needs final execution in this environment.
    - Added deterministic parity capture pipeline assets:
      `scripts/ux-parity/capture-with-playwright.mjs`,
      `scripts/ux-parity/capture-web-parity.ps1`,
      `scripts/ux-parity/capture-mobile-parity.ps1`,
      `scripts/ux-parity/web-capture-config.json`,
      `scripts/ux-parity/mobile-capture-config.json`,
      `docs/ux/nest_103_parity_capture_pipeline_2026-03-21.md`.
    - Published parity packs + visual diff index in:
      `docs/ux_parity_evidence/2026-03-21/artifact-index.md`,
      `docs/ux_parity_evidence/2026-03-21/capture-manifest.json`,
      `docs/ux_parity_evidence/2026-03-21/web/*.png`,
      `docs/ux_parity_evidence/2026-03-21/mobile/*.png`.
  - Done on: 2026-03-21

- [x] NEST-104 Add explicit accessibility verification outputs for legacy UX-heavy screens
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-102
  - Done when:
    - keyboard/focus order verification is recorded for web flows,
    - semantic roles/labels checks are recorded for web and mobile screens,
    - contrast checks for key UI states are documented and linked in task notes.
  - Done on: 2026-03-19
  - Notes:
    - Accessibility verification artifact delivered in
      `docs/ux/legacy_ux_accessibility_verification_2026-03-19.md`.
    - Recorded per-task keyboard/focus, semantic-label, and contrast outcomes
      for all 8 legacy UX-heavy tasks.
    - Captured explicit a11y follow-up inputs for `NEST-106`.

- [x] NEST-105 Add responsive verification outputs for legacy UX-heavy screens
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-102
  - Done when:
    - desktop/tablet/mobile captures are recorded for each legacy UX-heavy task,
    - responsive behavior differences are reviewed against approved baseline,
    - evidence links are attached in task notes.
  - Done on: 2026-03-19
  - Notes:
    - Responsive verification artifact delivered in
      `docs/ux/legacy_ux_responsive_verification_2026-03-19.md`.
    - Recorded desktop/tablet/mobile outcomes for all 8 legacy UX-heavy tasks
      with code-evidence references.
    - Captured responsive follow-up inputs for `NEST-106`.

- [x] NEST-106 Execute legacy UX visual parity fixes and re-run UX evidence gate
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-103, NEST-104, NEST-105
  - Done when:
    - visual diffs discovered in parity packs are implemented,
    - legacy UX-heavy tasks pass source/parity/state/responsive/a11y evidence
      gates,
    - board pass/fail records are updated with closure evidence.
  - Notes:
    - Web parity fixes (wave 1) applied across legacy surfaces:
      `apps/web/src/app/tasks/page.tsx`,
      `apps/web/src/app/calendar/page.tsx`,
      `apps/web/src/app/insights/page.tsx`,
      `apps/web/src/app/automations/page.tsx`,
      `apps/web/src/app/billing/page.tsx`,
      `apps/web/src/components/conflict-queue-card.tsx`,
      `apps/web/src/components/provider-connections-card.tsx`,
      `apps/web/src/components/workspace-shell.tsx`,
      `apps/web/src/app/globals.css`.
    - Refreshed web parity captures for `NEST-021`, `NEST-037`, `NEST-041`,
      `NEST-042`, `NEST-050`, `NEST-058`, `NEST-068` in
      `docs/ux_parity_evidence/2026-03-21/web/*.png`.
    - Mobile parity fixes (wave 2) applied across legacy surfaces:
      `apps/mobile/components/mvp/ModuleScreen.tsx`,
      `apps/mobile/app/(tabs)/index.tsx`,
      `apps/mobile/app/(tabs)/calendar.tsx`,
      `apps/mobile/app/(tabs)/insights.tsx`,
      `apps/mobile/app/(tabs)/billing.tsx`.
    - Refreshed mobile parity captures for `NEST-022`, `NEST-037`, `NEST-041`,
      `NEST-042`, `NEST-050`, `NEST-068` in
      `docs/ux_parity_evidence/2026-03-21/mobile/*.png`.
    - Evidence gate closure report published in
      `docs/ux/legacy_ux_evidence_gate_closure_2026-03-21.md`.
  - Done on: 2026-03-21

- [x] NEST-109 Deliver localization foundation (en/pl) across API, web, and mobile
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-106
  - Done when:
    - shared localization contracts/resources exist in backend and both clients,
    - `en` and `pl` are available with deterministic fallback behavior,
    - locale formatting baseline is verified in web/mobile.
  - Done on: 2026-03-21
  - Notes:
    - Shared localization contracts and runtime helpers added in
      `packages/shared-types/src/localization.js` and exposed via shared client
      types (`index.d.ts`, `client.d.ts`).
    - Backend auth/settings now persist and expose normalized `language` and
      `locale` with deterministic fallback (`en`/`en-US`, `pl`/`pl-PL`).
    - Web/mobile clients consume shared localization helpers for translated app
      kicker and locale-aware date-time rendering baseline.
    - Validation:
      `php artisan test --filter=AuthApiTest`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/mobile exec expo export --platform web`.

- [x] NEST-110 Implement onboarding + account localization preference flows
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-109
  - Done when:
    - pre-auth language selection is available,
    - onboarding enforces required `language` and `display_name`,
    - localization preferences apply immediately after save.
  - Done on: 2026-03-21
  - Notes:
    - Added pre-auth localization options endpoint:
      `GET /api/v1/auth/localization/options`.
    - Added onboarding completion endpoint with required
      `display_name` + `language`:
      `POST /api/v1/auth/onboarding`.
    - Added pre-auth language selectors in web and mobile:
      `apps/web/src/components/pre-auth-language-selector.tsx`,
      `apps/mobile/app/modal.tsx`.
    - Added onboarding web flow baseline:
      `apps/web/src/app/onboarding/page.tsx`.
    - Validation:
      `php artisan test --filter=AuthApiTest`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/mobile exec expo export --platform web`.

- [x] NEST-111 Implement offline queue and manual force-sync baseline
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-109
  - Done when:
    - offline changes are queued locally,
    - manual force-sync option exists in settings/options,
    - sync runs oldest-first and stops on first error with clear reason.
  - Done on: 2026-03-21
  - Notes:
    - Implemented local offline queue + manual force-sync UI in web settings
      options (`apps/web/src/components/offline-sync-card.tsx`) and mobile
      options (`apps/mobile/app/modal.tsx`,
      `apps/mobile/constants/offlineQueue.ts`).
    - Force-sync processing now runs oldest-first and stops on first error with
      explicit HTTP status reason.
    - Added sync API client methods for calendar/journal routes in shared
      client contracts (`packages/shared-types/src/client.js`,
      `packages/shared-types/src/index.d.ts`).
    - Validation:
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/mobile exec expo export --platform web`.

- [x] NEST-112 Implement manual sync retry + conflict-resolution baseline
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-111
  - Done when:
    - retry starts from queue beginning and skips already-synced items via
      idempotency checks,
    - conflict screen shows base/local/remote values,
    - user can choose final resolution on web and mobile.
  - Done on: 2026-03-21
  - Notes:
    - Added manual retry sync flow in web/mobile options with queue restart
      semantics and synced-item skipping.
    - Extended conflict API response and shared contracts with
      `comparison.base|local|remote` values and fallback handling.
    - Web/mobile conflict UI now displays base/local/remote values and keeps
      explicit user resolution choices (`accept`, `override`).
    - Validation:
      `php artisan test --filter=IntegrationConflictQueueApiTest`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/mobile exec expo export --platform web`.

- [x] NEST-113 Re-run full UX evidence gate after parity fixes
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-106
  - Done when:
    - legacy UX-heavy tasks are re-reviewed against approved baseline,
    - pass/fail report is published with evidence links,
    - unresolved gaps are converted into explicit execution tasks.
  - Done on: 2026-03-21
  - Notes:
    - Full re-run report published in
      `docs/ux/full_ux_evidence_gate_rerun_2026-03-21.md`.
    - Result: `PASS 8 / 8`, no further execution tasks required for legacy UX
      evidence gate closure in this wave.

- [x] NEST-115 Define production topology and environment contract
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-112
  - Done when:
    - production server topology is documented (API/web/db/redis/workers/cron),
    - required env vars/secrets contract is documented by service,
    - TLS/domain and backup/restore prerequisites are explicit.
  - Done on: 2026-03-21
  - Notes:
    - Production topology and environment contract published in
      `docs/operations/production_topology_environment_contract_v1.md`.

- [x] NEST-116 Implement production deploy pipeline for API + web
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-115
  - Done when:
    - deploy pipeline performs build, migration, health checks, and rollback
      hooks,
    - staging and production deployment paths are documented and tested.
  - Done on: 2026-03-21
  - Notes:
    - Added deploy workflow: `.github/workflows/deploy-api-web.yml`.
    - Added scripted deploy pipeline with dry-run support:
      `scripts/release/deploy-api-web.ps1`.
    - Added documentation:
      `docs/operations/api_web_deploy_pipeline_v1.md`.
    - Validation:
      `powershell -ExecutionPolicy Bypass -File scripts/release/deploy-api-web.ps1 -Environment staging -DryRun`.

- [x] NEST-117 Prepare mobile release pipeline for physical devices
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-110, NEST-115
  - Done when:
    - environment-aware mobile builds are generated with signing profiles,
    - internal distribution flow for physical phone testing is documented,
    - release checklist includes mobile artifact verification.
  - Done on: 2026-03-21
  - Notes:
    - Added mobile release workflow:
      `.github/workflows/mobile-release.yml`.
    - Added mobile release automation script:
      `scripts/release/mobile-release.ps1`.
    - Documented internal distribution flow and artifact checklist in
      `docs/operations/mobile_release_pipeline_v1.md`.
    - Validation:
      `powershell -ExecutionPolicy Bypass -File scripts/release/mobile-release.ps1 -Profile preview -DryRun`.

- [x] NEST-118 Add post-deploy smoke suite (server + phone critical paths)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-116, NEST-117
  - Done when:
    - smoke suite covers auth, tasks, calendar, sync trigger, and core UX loop,
    - suite runs in staging and production candidate flow.
  - Done on: 2026-03-21
  - Notes:
    - Added smoke workflow:
      `.github/workflows/post-deploy-smoke.yml`.
    - Added smoke execution script:
      `scripts/release/post-deploy-smoke.ps1`.
    - Added suite documentation:
      `docs/operations/post_deploy_smoke_suite_v1.md`.
    - Validation:
      `powershell -ExecutionPolicy Bypass -File scripts/release/post-deploy-smoke.ps1 -Environment staging -DryRun`.

- [x] NEST-119 Finalize production operations runbook
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-116, NEST-118
  - Done when:
    - incident, rollback, and escalation procedures are fully documented,
    - release ownership and monitoring checklist are explicit.
  - Done on: 2026-03-21
  - Notes:
    - Final runbook published:
      `docs/operations/production_operations_runbook_v1.md`.

- [x] NEST-120 Execute staging rehearsal and production go-live sign-off
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-118, NEST-119
  - Done when:
    - full rehearsal run is executed end-to-end,
    - sign-off packet captures test evidence and rollback verification,
    - release status is marked ready for production launch window.
  - Done on: 2026-03-21
  - Notes:
    - Rehearsal and sign-off packet published in
      `docs/operations/staging_rehearsal_go_live_signoff_2026-03-21.md`.
    - End-to-end dry-run rehearsal commands executed for deploy, mobile release,
      and post-deploy smoke suite.

- [x] NEST-114 Reconcile planning docs status with task board reality
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-113
  - Done when:
    - `docs/planning/implementation_plan_full.md` status checkboxes reflect
      actual `TASK_BOARD` completion state,
    - planning docs and board have no status drift for completed phases.
  - Done on: 2026-03-21
  - Notes:
    - Reconciled status checkboxes and metadata in
      `docs/planning/implementation_plan_full.md`.
    - Published reconciliation record in
      `docs/planning/planning_status_reconciliation_2026-03-21.md`.

- [x] NEST-121 Resolve MVP offline policy drift across product docs
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-111
  - Done when:
    - `docs/product/mvp_scope.md`, `docs/product/overview.md`, and
      `PROJECT_STATE` describe one consistent MVP offline/manual-sync policy,
    - no conflicting statements remain about online-only vs manual offline
      queue support.
  - Done on: 2026-03-21
  - Notes:
    - Updated `docs/product/mvp_scope.md` offline decision wording to manual
      queue + force-sync model.
    - Updated `.codex/context/PROJECT_STATE.md` offline summary line for MVP
      consistency.
    - Published alignment record in
      `docs/product/offline_policy_alignment_2026-03-21.md`.

- [ ] NEST-122 Execute production launch window checklist
  - Status: BACKLOG
  - Owner: Review Agent
  - Depends on: NEST-120
  - Done when:
    - release-train run for target tag is executed and recorded,
    - API/web deployment steps and DB migration are executed in launch order,
    - post-deploy smoke suite and mobile distribution verification pass.
  - Notes:
    - Execution packet published:
      `docs/operations/production_launch_window_execution_2026-03-21.md`.
    - Production-profile runbook commands were executed in `-DryRun` mode to
      capture launch-order evidence without live environment credentials.
    - Task remains open until non-dry-run smoke pass and mobile distribution
      verification pass are recorded.

- [ ] NEST-123 Execute Day0/Day1 post-launch operational validation
  - Status: BACKLOG
  - Owner: Review Agent
  - Depends on: NEST-122
  - Done when:
    - Day0 monitoring checklist is executed and logged,
    - Day1 incident + regression review is completed,
    - first stabilization patch decision is documented.
  - Notes:
    - Validation packet prepared:
      `docs/operations/day0_day1_operational_validation_packet_2026-03-31.md`.
    - Current packet includes dry-run production smoke evidence, web smoke pass,
      and API feature-suite regression review.
    - Task remains open pending live post-launch Day0/Day1 evidence capture.

- [ ] NEST-124 Publish Week1 stabilization summary and next backlog wave
  - Status: BACKLOG
  - Owner: Planning Agent
  - Depends on: NEST-123
  - Done when:
    - week1 post-launch summary is published with metrics and incidents,
    - release cadence decision (weekly vs hotfix mode) is recorded,
    - next prioritized backlog wave is explicitly defined.
  - Notes:
    - Week1 stabilization summary published:
      `docs/operations/week1_stabilization_summary_2026-03-31.md`.
    - Cadence decision recorded: temporary hotfix mode until live launch-window
      and Day0/Day1 closure evidence is completed.
    - Task remains open pending live post-launch metrics append and sign-off.

- [x] NEST-153 Publish executor-ready V2 roundbook and task cards
  - Status: DONE
  - Owner: Planning Agent
  - Depends on: NEST-124
  - Done when:
    - round-by-round execution protocol is documented for one-task-per-commit
      delivery,
    - each V2 task has implementation/test/commit guidance for execution
      handoff,
    - planning/state references include the new executor artifacts.
  - Done on: 2026-03-21
  - Notes:
    - Added execution protocol:
      `docs/planning/v2-execution-roundbook.md`.
    - Added detailed task cards:
      `docs/planning/v2-task-cards.md`.
    - Linked artifacts from V2 plan and project planning baseline.

- [x] NEST-154 Add shared UX token + aura contract for web/mobile
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-153
  - Done when:
    - shared UI token contract is available to web and mobile clients,
    - aura variants are defined and resolvable by module key,
    - no backend API contract changes are required.
  - Done on: 2026-03-31
  - Notes:
    - Added shared token and aura runtime exports in
      `packages/shared-types/src/client.js`.
    - Added type contract declarations in
      `packages/shared-types/src/index.d.ts`.
    - Added mobile token adapter in
      `apps/mobile/constants/uiTokens.ts`.

- [x] NEST-155 Refresh web app shell to Stitch-inspired calm visual baseline
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-154
  - Done when:
    - web shell applies global aura background + module variants,
    - typography/color hierarchy matches Mix Ideal direction,
    - core web routes consume unified shell without module-level duplication.
  - Done on: 2026-03-31
  - Notes:
    - Reworked global style foundation in `apps/web/src/app/globals.css`.
    - Rebuilt `WorkspaceShell` with progress strip, module-nav pills, and
      aura-variant wiring (`apps/web/src/components/workspace-shell.tsx`).
    - Enabled module-aware shell usage across core routes under
      `apps/web/src/app/*/page.tsx`.

- [x] NEST-156 Refresh mobile shell + navigation to calm floating baseline
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-154
  - Done when:
    - mobile module shell uses shared aura/tokens and calm card grammar,
    - bottom navigation uses floating organic style with central CTA emphasis,
    - tabs keep existing IA/routes while inheriting refreshed visuals.
  - Done on: 2026-03-31
  - Notes:
    - Rebuilt reusable module surface in
      `apps/mobile/components/mvp/ModuleScreen.tsx`.
    - Reworked tab shell with floating bottom bar and seedling CTA in
      `apps/mobile/app/(tabs)/_layout.tsx`.
    - Applied module-aware shell usage across core tab routes under
      `apps/mobile/app/(tabs)/*.tsx`.

- [x] NEST-157 Execute web/mobile visual parity pass against Stitch screen set
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-155, NEST-156
  - Done when:
    - each core module has parity review against mapped Stitch screen IDs,
    - documented visual deviations are classified (`intentional|follow-up`),
    - accessibility/readability checks are attached to parity evidence.
  - Done on: 2026-03-31
  - Notes:
    - Current implementation wave and scope captured in:
      `docs/ux/uxui_refresh_implementation_wave_2026-03-31.md`.
    - Published refreshed parity artifact pack:
      `docs/ux_parity_evidence/2026-03-31/nest-157/artifact-index.md`.
    - Published parity review and classification report:
      `docs/ux/nest_157_visual_parity_pass_2026-03-31.md`.

- [x] NEST-158 Deliver usable web Tasks+Lists flow and module IA split baseline
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-157
  - Done when:
    - web Tasks+Lists surface supports real login-backed CRUD baseline for lists
      and tasks (including status update actions),
    - shell/module navigation removes misleading readiness-state badges and
      reflects separated module IA (`tasks+lists`, `habits`, `routines`,
      `goals`, `targets`, `calendar`, `journal`),
    - non-functional placeholder CTA controls are removed from refreshed web
      surfaces.
  - Done on: 2026-03-31
  - Notes:
    - Added web token session storage + authenticated API client wiring:
      `apps/web/src/lib/auth-session.ts`,
      `apps/web/src/lib/api-client.ts`.
    - Replaced static tasks snapshot screen with login-backed and CRUD-capable
      Tasks+Lists flow:
      `apps/web/src/app/tasks/page.tsx`.
    - Reorganized module IA/navigation and removed tab-level readiness labels:
      `apps/web/src/lib/mvp-snapshot.ts`,
      `apps/web/src/components/workspace-shell.tsx`,
      `apps/web/src/app/page.tsx`.
    - Added separated module routes for routines and targets:
      `apps/web/src/app/routines/page.tsx`,
      `apps/web/src/app/targets/page.tsx`.
    - Removed non-functional calendar placeholder command buttons:
      `apps/web/src/app/calendar/page.tsx`.

- [x] NEST-159 Run critical life-management UX audit with click-path evidence
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-158
  - Done when:
    - all currently exposed web user capabilities are click-tested with
      screenshot evidence per interaction step,
    - each audited view answers the key UX question
      ("does this make life management easier?") with explicit good/bad/why/fix
      analysis,
    - Stitch project URL/reference is explicitly documented for future parity
      iterations.
  - Done on: 2026-03-31
  - Notes:
    - Added automated click-path capture script:
      `scripts/ux-audit/capture-web-ux-flow.mjs`.
    - Published screenshot evidence and manifest:
      `docs/ux_audit_evidence/2026-03-31/nest-159/web/*`,
      `docs/ux_audit_evidence/2026-03-31/nest-159/web/manifest.json`.
    - Published artifact index:
      `docs/ux_audit_evidence/2026-03-31/nest-159/artifact-index.md`.
    - Published critical UX review and remediation plan:
      `docs/ux/nest_159_life_management_ux_critical_audit_2026-03-31.md`.
    - Added canonical Stitch project URL reference in:
      `docs/ux/stitch_screen_registry_2026-03-21.md`.

- [x] NEST-160 Enforce auth gate and onboarding gate for dashboard/module access
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-159
  - Done when:
    - dashboard and module routes are inaccessible to unauthenticated sessions,
    - unauthenticated users are redirected to pre-auth flow,
    - users without completed onboarding are redirected to onboarding flow,
    - route-guard behavior is covered by regression tests.
  - Notes:
    - Execution plan:
      `docs/planning/human_ai_dual_actor_execution_plan_2026-03-31.md`.
    - Added middleware route guard with auth + onboarding gating:
      `apps/web/middleware.ts`,
      `apps/web/src/lib/route-guard.ts`.
    - Added dedicated pre-auth entry surface with login/register:
      `apps/web/src/app/auth/page.tsx`.
    - Extended auth session storage with cookie-backed token/onboarding flags:
      `apps/web/src/lib/auth-session.ts`.
    - Onboarding completion now updates gate state and redirects to dashboard:
      `apps/web/src/app/onboarding/page.tsx`.
    - Added route-guard regression check:
      `apps/web/scripts/route-guard-regression.mjs`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-03-31

- [x] NEST-161 Restore Tasks+Lists primary create/edit flows and remove blocked CTA states
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-160
  - Done when:
    - authenticated users can create/update/complete/delete tasks and lists in
      web flow,
    - known client/API contract mismatches that block CRUD are fixed,
    - disabled/non-functional create CTA states are removed or replaced with
      clear actionable feedback.
  - Notes:
    - Source audit evidence:
      `docs/ux/nest_159_life_management_ux_critical_audit_2026-03-31.md`.
    - Rebuilt Tasks+Lists screen with authenticated CRUD baseline for both
      entities:
      `apps/web/src/app/tasks/page.tsx`.
    - Fixed task query contract mismatch (`per_page` now capped to 100 on
      client calls) that previously caused blocked add-task flow.
    - Added list edit/delete actions and task edit/delete actions with inline
      validation and user feedback surfaces.
    - Removed in-module login dependency from Tasks+Lists flow in favor of
      dedicated auth-gated app entry.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-03-31

- [x] NEST-162 Deliver module-level create-flow parity for core life-management modules
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-161
  - Done when:
    - each core module (`habits`, `routines`, `goals`, `targets`, `calendar`)
      has at least one working first-create flow in web app,
    - IA labels and CTA wording match practical life-management intent,
    - refreshed click-path evidence is published for all create flows.
  - Notes:
    - Follow-up UX evidence pack required after implementation.
    - Reworked core module screens from static snapshots to authenticated
      create-flow surfaces:
      `apps/web/src/app/habits/page.tsx`,
      `apps/web/src/app/routines/page.tsx`,
      `apps/web/src/app/goals/page.tsx`,
      `apps/web/src/app/targets/page.tsx`,
      `apps/web/src/app/calendar/page.tsx`.
    - Added first-create forms and API-backed listing for each module
      (`habits`, `routines`, `goals`, `targets`, `calendar`).
    - Updated CTA wording to explicit life-management actions ("Add habit",
      "Add routine", "Add goal", "Add target", "Add event").
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-03-31

- [x] NEST-163 Introduce dual-actor identity model in backend policy/audit layer
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-162
  - Done when:
    - actor model supports `human_user`, `ai_agent`, and `delegated_agent`
      contexts,
    - write-path audit records include actor type and stable trace metadata,
    - policy and regression tests validate actor-context propagation.
  - Notes:
    - Product direction source:
      `docs/modules/ai_layer.md`.
    - Added actor context DTO + middleware resolution and route integration:
      `apps/api/app/Actors/ActorContext.php`,
      `apps/api/app/Http/Middleware/ResolveActorContext.php`,
      `apps/api/bootstrap/app.php`,
      `apps/api/routes/api.php`.
    - Extended policy layer with actor-context validation helper and adopted it
      in life-area/task/goal/integration policies:
      `apps/api/app/Policies/Concerns/ResolvesActorContextForPolicy.php`,
      `apps/api/app/Policies/LifeAreaPolicy.php`,
      `apps/api/app/Policies/TaskPolicy.php`,
      `apps/api/app/Policies/TaskListPolicy.php`,
      `apps/api/app/Policies/GoalPolicy.php`,
      `apps/api/app/Policies/IntegrationSyncConflictPolicy.php`,
      `apps/api/app/Policies/IntegrationSyncFailurePolicy.php`.
    - Propagated actor context through sync + marketplace controllers/services
      into audit metadata and failure records:
      `apps/api/app/Http/Controllers/Api/IntegrationSyncController.php`,
      `apps/api/app/Http/Controllers/Api/IntegrationMarketplaceController.php`,
      `apps/api/app/Integrations/Services/*IntegrationSyncService.php`,
      `apps/api/app/Integrations/Services/IntegrationSyncService.php`,
      `apps/api/app/Integrations/Services/IntegrationMarketplaceService.php`,
      `apps/api/app/Jobs/ProcessIntegrationSyncJob.php`.
    - Added/updated regression tests for delegated actor propagation and
      policy behavior:
      `apps/api/tests/Feature/IntegrationListTaskSyncApiTest.php`,
      `apps/api/tests/Feature/IntegrationMarketplaceApiTest.php`,
      `apps/api/tests/Unit/LifeAreaPolicyActorContextTest.php`.
    - Validation:
      `php artisan test --filter=IntegrationListTaskSyncApiTest`,
      `php artisan test --filter=IntegrationMarketplaceApiTest`,
      `php artisan test --filter=LifeAreaPolicyActorContextTest`,
      `php artisan test --filter=IntegrationCalendarSyncApiTest`,
      `php artisan test --filter=IntegrationJournalSyncApiTest`,
      `php artisan test --filter=IntegrationSyncReplayApiTest`,
      `php artisan test --filter=Policy`.
  - Done on: 2026-03-31

- [x] NEST-164 Add scoped user-issued API credentials for delegated AI access
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-163
  - Done when:
    - user can create scoped credentials with expiry and revoke controls,
    - API middleware/policy layer enforces least-privilege scopes,
    - revoked/expired credentials are denied with deterministic error contract.
  - Notes:
    - API and contract docs must be updated with credential lifecycle flows.
    - Added delegated credential scope catalog and route-level least-privilege
      enforcement middleware:
      `apps/api/app/Auth/DelegatedCredentialScopeCatalog.php`,
      `apps/api/app/Http/Middleware/EnforceDelegatedCredentialScope.php`.
    - Added delegated credential lifecycle API endpoints (list/create/revoke):
      `apps/api/app/Http/Controllers/Api/DelegatedCredentialController.php`,
      `apps/api/routes/api.php`.
    - Added revocation persistence for Sanctum credentials:
      `apps/api/database/migrations/2026_03_31_233500_add_revoked_at_to_personal_access_tokens_table.php`.
    - Updated actor-context resolver to detect delegated credentials from token
      metadata (no local header override required for production delegated
      mode):
      `apps/api/app/Http/Middleware/ResolveActorContext.php`.
    - Added delegated credential feature regressions:
      `apps/api/tests/Feature/DelegatedCredentialApiTest.php`.
    - Updated API contract/docs for credential lifecycle:
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`,
      `docs/engineering/api_contracts.md`,
      `docs/modules/delegated_ai_api_credentials_v1.md`.
    - Validation:
      `php artisan test --filter=DelegatedCredentialApiTest`,
      `php artisan test --filter=AuthApiTest`,
      `php artisan test --filter=IntegrationListTaskSyncApiTest`,
      `php artisan test --filter=IntegrationMarketplaceApiTest`,
      `php artisan test --filter=LifeAreaPolicyActorContextTest`,
      `php artisan test --filter=Policy`.
  - Done on: 2026-03-31

- [x] NEST-165 Implement AI Agent account lifecycle and capability boundaries
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-164
  - Done when:
    - AI agent principal lifecycle is available in tenant context,
    - boundaries between agent-owned operations and delegated user operations
      are enforced,
    - unauthorized cross-boundary actions are denied and audited.
  - Notes:
    - Product direction source:
      `docs/product/overview.md`.
    - Added AI principal metadata on `users` table and model-level constants:
      `apps/api/database/migrations/2026_03_31_234500_add_ai_agent_principal_columns_to_users_table.php`,
      `apps/api/app/Models/User.php`.
    - Added AI agent lifecycle + credential management endpoints:
      `apps/api/app/Http/Controllers/Api/AiAgentAccountController.php`,
      `apps/api/routes/api.php`.
    - Extended scope middleware to enforce marker/principal boundaries for both
      delegated and AI-agent credentials, with denied-attempt auditing:
      `apps/api/app/Http/Middleware/EnforceDelegatedCredentialScope.php`,
      `apps/api/database/migrations/2026_03_31_234600_create_actor_boundary_audits_table.php`,
      `apps/api/app/Models/ActorBoundaryAudit.php`.
    - Updated actor-context resolver to classify `ai_agent` mode from
      credential markers or principal type:
      `apps/api/app/Http/Middleware/ResolveActorContext.php`,
      `apps/api/app/Auth/DelegatedCredentialScopeCatalog.php`.
    - Added lifecycle and boundary regression coverage:
      `apps/api/tests/Feature/AiAgentAccountApiTest.php`.
    - Updated API contracts/docs for AI agent lifecycle:
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`,
      `docs/engineering/api_contracts.md`,
      `docs/modules/ai_agent_account_lifecycle_boundaries_v1.md`.
    - Validation:
      `php artisan test --filter=AiAgentAccountApiTest`,
      `php artisan test --filter=DelegatedCredentialApiTest`,
      `php artisan test --filter=AuthApiTest`,
      `php artisan test --filter=IntegrationListTaskSyncApiTest`,
      `php artisan test --filter=IntegrationMarketplaceApiTest`,
      `php artisan route:list --path=api/v1/auth/ai-agents`.
  - Done on: 2026-03-31

- [x] NEST-166 Deliver GUI+API access-control surface for AI integration management
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-165
  - Done when:
    - settings surface allows API credential generation/revocation and agent
      access review,
    - access usage/audit visibility is available to user,
    - OpenAPI and user docs reflect finalized management flows.
  - Notes:
    - Closing evidence includes click-path screenshots and policy regressions.
    - Delivered protected web settings surface for access control management:
      `apps/web/src/app/settings/page.tsx`,
      `apps/web/src/lib/route-guard.ts`,
      `apps/web/scripts/route-guard-regression.mjs`,
      `apps/web/src/components/workspace-shell.tsx`.
    - Added API access-audit read surface for human owner review:
      `apps/api/app/Http/Controllers/Api/AccessAuditController.php`,
      `apps/api/routes/api.php`.
    - Expanded AI agent credential API for explicit credential review list:
      `GET /api/v1/auth/ai-agents/{agentId}/credentials`
      in `apps/api/app/Http/Controllers/Api/AiAgentAccountController.php`.
    - Updated shared API client contract with access-control methods/types:
      `packages/shared-types/src/client.js`,
      `packages/shared-types/src/index.d.ts`,
      `packages/shared-types/src/client.d.ts`.
    - Updated user/API docs and OpenAPI contract:
      `docs/modules/access_control_management_surface_v1.md`,
      `docs/engineering/api_contracts.md`,
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`.
    - Added access-audit + AI lifecycle regression coverage:
      `apps/api/tests/Feature/AiAgentAccountApiTest.php`.
    - Validation:
      `php artisan test --filter=AiAgentAccountApiTest`,
      `php artisan test --filter=DelegatedCredentialApiTest`,
      `php artisan test --filter=AuthApiTest`,
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`,
      `php artisan route:list --path=api/v1/auth/access-audits`,
      `php artisan route:list --path=api/v1/auth/ai-agents`.
  - Done on: 2026-03-31

- [x] NEST-167 Implement Stitch-driven web shell refresh for core module navigation
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-159, NEST-166
  - Done when:
    - web app shell reflects Stitch visual hierarchy (rail + topbar + tonal cards),
    - module navigation is coherent on desktop and mobile breakpoints,
    - style tokens support aura variants without breaking existing routes.
  - Notes:
    - Rebuilt workspace shell layout + nav model in:
      `apps/web/src/components/workspace-shell.tsx`.
    - Replaced global CSS contract with Stitch-inspired layout/token treatment:
      `apps/web/src/app/globals.css`.
    - Expanded module readiness navigation scope for insights:
      `apps/web/src/lib/mvp-snapshot.ts`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`.
  - Done on: 2026-03-31

- [x] NEST-168 Redesign Tasks+Lists command view with practical first-action UX
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-167
  - Done when:
    - task/list creation actions are immediately discoverable,
    - zero-list state still allows task capture via deterministic fallback,
    - list/task edit and status transitions remain fully functional.
  - Notes:
    - Rebuilt task command center UX in:
      `apps/web/src/app/tasks/page.tsx`.
    - Added automatic Inbox fallback when adding first task without existing
      list.
    - Preserved authenticated CRUD flow (create/update/delete + status toggle)
      with clearer state messaging.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-03-31

- [x] NEST-169 Activate journal usability baseline and remove dead web actions
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-167
  - Done when:
    - journal supports real create/list flow for entries and life areas,
    - insights actions trigger real behavior (refresh/export),
    - auth/login default input state is production-safe.
  - Notes:
    - Replaced journal snapshot surface with API-backed create/list UX:
      `apps/web/src/app/journal/page.tsx`.
    - Implemented functional refresh/export actions in insights:
      `apps/web/src/app/insights/page.tsx`.
    - Removed hardcoded auth demo credentials:
      `apps/web/src/app/auth/page.tsx`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-03-31

- [x] NEST-170 Separate public welcome entry from private app dashboard flow
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-169
  - Done when:
    - `/` is public welcome surface for guests,
    - authenticated users are redirected to `/dashboard`,
    - private module routes remain fully auth-gated.
  - Notes:
    - Updated route-guard policy and regression checks:
      `apps/web/src/lib/route-guard.ts`,
      `apps/web/scripts/route-guard-regression.mjs`.
    - Added dedicated private dashboard route:
      `apps/web/src/app/dashboard/page.tsx`.
    - Updated onboarding and auth redirects to `/dashboard`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-171 Rebuild web auth entry surfaces on dedicated welcome template
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-170
  - Done when:
    - auth/register are rendered on public welcome-style shell (not app panel),
    - auth actions route user to onboarding or `/dashboard`,
    - left app navigation uses outline icons instead of two-letter placeholders.
  - Notes:
    - Added dedicated public shell component and styling:
      `apps/web/src/components/public-shell.tsx`,
      `apps/web/src/app/globals.css`.
    - Rebuilt public welcome page and auth module:
      `apps/web/src/app/page.tsx`,
      `apps/web/src/app/auth/page.tsx`.
    - Updated private app shell navigation with outline SVG icons:
      `apps/web/src/components/workspace-shell.tsx`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-172 Seed default admin account and publish local login instructions
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-170
  - Done when:
    - `migrate --seed` creates deterministic admin login credentials,
    - repository README explains local startup and login entrypoints.
  - Notes:
    - Updated backend seeder default account to `admin@admin.com / password`:
      `apps/api/database/seeders/DatabaseSeeder.php`.
    - Added local run + login section in repository readme:
      `README.md`.
    - Validation:
      `php artisan test --filter=AuthApiTest`.
  - Done on: 2026-04-01

- [x] NEST-173 Simplify module chrome and split Settings into profile/access tabs
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-171, NEST-172
  - Done when:
    - top `workspace-nav` cycle pills are removed from all module views,
    - settings appears in main left navigation with outline icon,
    - Settings module is tabbed (`Profile`, `Access Control`) and supports
      updating user display name + language,
    - inconsistent per-module redirect behavior is removed by making middleware
      session/onboarding checks deterministic for guarded routes.
  - Notes:
    - Removed secondary module pills from shell and promoted Settings as
      primary nav item:
      `apps/web/src/components/workspace-shell.tsx`.
    - Added Settings tabs and profile preference save flow via
      `PATCH /api/v1/auth/settings`:
      `apps/web/src/app/settings/page.tsx`,
      `apps/web/src/app/globals.css`.
    - Eliminated stale onboarding-cookie drift by resolving session state from
      API for guarded routes in middleware:
      `apps/web/middleware.ts`.
    - Removed page-local onboarding redirect from tasks to avoid module-specific
      jump behavior:
      `apps/web/src/app/tasks/page.tsx`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-174 Stabilize journal navigation and unblock module create flows
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-173
  - Done when:
    - intermittent redirects from `/journal` are removed,
    - onboarding no longer forces route redirects during standard authenticated navigation,
    - seeded admin account is deterministic and onboarding-ready,
    - module create forms no longer stay locked behind loading-only guards,
    - non-essential prototype/fantasy copy in core modules is replaced with practical UX copy.
  - Notes:
    - Removed onboarding redirect enforcement from web route guard/auth redirects:
      `apps/web/src/lib/route-guard.ts`,
      `apps/web/scripts/route-guard-regression.mjs`,
      `apps/web/src/app/auth/page.tsx`.
    - Seeded admin user now gets stable onboarding-complete settings and deterministic credentials:
      `apps/api/database/seeders/DatabaseSeeder.php`,
      `README.md`.
    - Simplified module copy and removed loading-lock from create forms in
      core modules:
      `apps/web/src/app/tasks/page.tsx`,
      `apps/web/src/app/journal/page.tsx`,
      `apps/web/src/app/habits/page.tsx`,
      `apps/web/src/app/routines/page.tsx`,
      `apps/web/src/app/goals/page.tsx`,
      `apps/web/src/app/targets/page.tsx`,
      `apps/web/src/app/calendar/page.tsx`,
      `apps/web/src/app/page.tsx`.
    - Added quick goal creation directly in targets when no goals exist:
      `apps/web/src/app/targets/page.tsx`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`,
      `php artisan test --filter=AuthApiTest`.
  - Done on: 2026-04-01

- [x] NEST-175 Deliver full CRUD flows for goals/habits/routines/targets/journal
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-174
  - Done when:
    - each listed module supports create/read/update/delete from GUI,
    - edit and delete actions are exposed inline in module lists,
    - routines and habits include practical active/pause update controls,
    - journal supports editing/deleting both entries and life areas.
  - Notes:
    - Added full edit/delete flows in:
      `apps/web/src/app/goals/page.tsx`,
      `apps/web/src/app/habits/page.tsx`,
      `apps/web/src/app/routines/page.tsx`,
      `apps/web/src/app/targets/page.tsx`,
      `apps/web/src/app/journal/page.tsx`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-176 Normalize module layout width for topbar and content grid
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-175
  - Done when:
    - module header (`workspace-topbar`) no longer stretches unnaturally on wide displays,
    - module content grid uses consistent centered max-width across modules.
  - Notes:
    - Added centered max-width constraints for workspace topbar and grid:
      `apps/web/src/app/globals.css`.
    - Validation:
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-177 Enable full calendar CRUD controls in web GUI
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-176
  - Done when:
    - calendar timeline rows expose `Edit` and `Delete`,
    - users can update title/start/end directly from GUI,
    - users can remove calendar events without leaving module.
  - Notes:
    - Added inline edit/delete flows for calendar events:
      `apps/web/src/app/calendar/page.tsx`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-178 Add dedicated Life Areas module and surface balance context
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-177
  - Done when:
    - Life Areas are available as a first-class module in main navigation,
    - `/life-areas` route is auth-guarded and available in web routing,
    - module supports full CRUD for life areas directly in GUI,
    - module shows life-balance context (global score + per-area alignment).
  - Notes:
    - Added dedicated module page:
      `apps/web/src/app/life-areas/page.tsx`.
    - Added nav icon/entry for Life Areas:
      `apps/web/src/components/workspace-shell.tsx`.
    - Added route guard coverage and regression assertions:
      `apps/web/src/lib/route-guard.ts`,
      `apps/web/scripts/route-guard-regression.mjs`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-179 Reorganize settings IA and add global logout action in app menu
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-178
  - Done when:
    - left rail footer links to `/settings` (not `?tab=access`) and exposes a
      global logout action,
    - settings page removes non-essential summary metrics and is split into
      clear tabs (`Moj profil`, `Ustawienia aplikacji`, `Access i API`,
      `Subskrypcja`),
    - access-tab navigation remains stable and does not trigger onboarding
      redirect drift.
  - Notes:
    - Added global menu logout action:
      `apps/web/src/components/workspace-logout-button.tsx`,
      `apps/web/src/components/workspace-shell.tsx`,
      `apps/web/src/app/globals.css`.
    - Reworked settings information architecture and removed obsolete profile
      metrics/scope copy:
      `apps/web/src/app/settings/page.tsx`.
    - Removed middleware persistence of onboarding status cookie to avoid stale
      onboarding-driven navigation side effects on guarded routes:
      `apps/web/middleware.ts`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-180 Eliminate module stretch artifacts and add calendar day/week/month view
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-179
  - Done when:
    - module header/content cards no longer stretch unnaturally on wide
      displays,
    - grid panels keep natural height (no row-equalization stretch side
      effect),
    - calendar supports `day/week/month` switch with range navigation and shows
      both events and due tasks in selected window.
  - Notes:
    - Fixed global layout stretch behavior by anchoring workspace grid content
      to top and preventing auto row-item stretch:
      `apps/web/src/app/globals.css`.
    - Rebuilt calendar module with window switch (`day/week/month`), prev/today/next
      navigation, anchor-date picker, and combined planning feed
      (`events + due tasks`) for selected range:
      `apps/web/src/app/calendar/page.tsx`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web build`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-181 Rebuild Tasks+Lists as Kanban with planning-context assignments
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-180
  - Done when:
    - `Tasks + Lists` uses single-column module layout and renders board-style
      kanban columns (lists as columns, tasks as cards),
    - list create/edit supports `goal_id`, `target_id`, and `life_area_id`
      assignment with server-side validation and persisted API fields,
    - task create/edit supports optional `life_area_id` assignment and GUI
      controls are enabled for practical day-to-day CRUD.
  - Notes:
    - Added task-list planning-context schema + model/controller coverage:
      `apps/api/database/migrations/2026_04_01_030000_add_context_references_to_task_lists_table.php`,
      `apps/api/app/Models/TaskList.php`,
      `apps/api/app/Http/Controllers/Api/TaskListController.php`.
    - Added task-level life-area assignment validation/write-path support:
      `apps/api/app/Http/Controllers/Api/TaskController.php`.
    - Added API regressions for new context assignment flows:
      `apps/api/tests/Feature/TasksAndListsApiTest.php`.
    - Rebuilt web `Tasks + Lists` route to kanban board flow with active list
      + task forms and context selectors:
      `apps/web/src/app/tasks/page.tsx`.
    - Refined workspace layout mode handling so only explicit modules use
      two-column grids:
      `apps/web/src/components/workspace-shell.tsx`,
      `apps/web/src/app/dashboard/page.tsx`,
      `apps/web/src/app/globals.css`.
    - Validation:
      `php artisan test --filter=TasksAndListsApiTest`,
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-182 Upgrade Tasks+Lists board usability with practical filter UX
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-181
  - Done when:
    - board exposes fast filters for search, status, context scope, and life
      area without opening edit forms,
    - kanban cards show clearer metadata (priority, due-date state, area) and
      visual emphasis for overdue items,
    - board ergonomics improve for daily usage via clearer column visibility
      controls (including hide-empty and reset).
  - Notes:
    - Added task board filter toolbar and interactive controls in:
      `apps/web/src/app/tasks/page.tsx`.
    - Added filtered column rendering + no-results states for active filters.
    - Enhanced kanban card metadata chips/status visuals and overdue styling
      in:
      `apps/web/src/app/globals.css`,
      `apps/web/src/app/tasks/page.tsx`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-183 Unblock optional hierarchy flow in Tasks+Lists (parentless list/task support)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-182
  - Done when:
    - list creation/edit in `/tasks` works without required `goal/target/life
      area` assignment and exposes actionable validation feedback,
    - task creation/edit works with `list_id=null` (standalone task), including
      moving task between list and no-list states,
    - backend schema/policy/tests explicitly support nullable task `list_id`
      without tenant/collaboration policy regressions.
  - Notes:
    - Enabled nullable `tasks.list_id` with FK update migration:
      `apps/api/database/migrations/2026_04_01_050000_make_tasks_list_id_nullable.php`.
    - Updated task API write-path and assignment resolution for no-list tasks:
      `apps/api/app/Http/Controllers/Api/TaskController.php`.
    - Updated task policy behavior for tasks detached from lists:
      `apps/api/app/Policies/TaskPolicy.php`.
    - Added API regression for standalone task create->assign->detach flow:
      `apps/api/tests/Feature/TasksAndListsApiTest.php`.
    - Updated web Tasks+Lists UX with explicit `No list` column, optional list
      parent selector (single parent type), and improved field-level validation
      messaging:
      `apps/web/src/app/tasks/page.tsx`.
    - Validation:
      `php artisan test --filter=TasksAndListsApiTest`,
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-184 Execute full `/tasks` clickthrough audit and close web/mobile UX blockers
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-183
  - Done when:
    - all primary create/edit/delete/toggle/filter actions in web `/tasks` are
      manually validated via clickthrough evidence,
    - identified blocker defects are fixed in implementation (not only
      documented),
    - mobile `tasks` tab reaches practical API-backed CRUD baseline aligned
      with current web flow expectations.
  - Notes:
    - Published clickthrough findings and remediation report in:
      `docs/ux/nest_184_tasks_module_clickthrough_remediation_2026-04-01.md`.
    - Fixed web task loading contract issue by replacing invalid oversized
      `per_page` request with guarded paginated fetch in:
      `apps/web/src/app/tasks/page.tsx`.
    - Improved web tasks UX ergonomics with top-level feedback callouts and
      focused default board density (`hide empty columns` enabled by default).
    - Rebuilt mobile tasks tab from placeholder state to practical API-backed
      Tasks+Lists workflow in:
      `apps/mobile/app/(tabs)/index.tsx`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web test:smoke`,
      `pnpm --dir apps/mobile test:unit`,
      `pnpm --dir apps/mobile test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-185 Consolidate `Tasks + Lists + Goals + Targets` into one unified planning module
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-184
  - Done when:
    - planning hierarchy surfaces (`goals -> targets -> lists -> tasks`) are
      managed from one module (`/tasks`) without forcing separate top-level
      navigation contexts,
    - previous standalone routes `/goals` and `/targets` remain safe for legacy
      links and redirect to unified planning tabs,
    - left rail navigation reflects one planning entrypoint (`Tasks + Lists`)
      instead of split goal/target entries.
  - Notes:
    - Consulted active Stitch project `projects/11122321523690086751` as UX
      direction input (single planning workspace behavior) before implementation.
    - Extended web planning workspace with in-module view switching:
      `Board`, `Goals`, `Targets` in
      `apps/web/src/app/tasks/page.tsx`.
    - Added legacy route redirects:
      `apps/web/src/app/goals/page.tsx` ->
      `/tasks?tab=goals`,
      `apps/web/src/app/targets/page.tsx` ->
      `/tasks?tab=targets`.
    - Simplified main rail planning IA in:
      `apps/web/src/components/workspace-shell.tsx`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-186 Polish `/tasks` UX for practical day-one usability
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-185
  - Done when:
    - `No list` capture column remains visible as a stable quick-entry point
      (no more empty-board dead-end),
    - board is treated as primary surface and setup/filter tools do not
      visually overwhelm first interaction,
    - readability and visual hierarchy are improved for cards/metrics/panels.
  - Notes:
    - Added `Today Focus` action panel for immediate start flow (`add task`,
      `show all columns`, `refresh`) in:
      `apps/web/src/app/tasks/page.tsx`.
    - Forced persistent `No list` column visibility to prevent zero-column board
      state in default setup.
    - Converted list setup and filters into collapsible sections so creation and
      filtering tools are available but not dominant by default.
    - Added panel-level class support and updated visual hierarchy tokens/styles
      for stronger readability in:
      `apps/web/src/components/workspace-shell.tsx`,
      `apps/web/src/app/globals.css`.
    - Validation:
      `pnpm --dir apps/web test:unit`,
      `pnpm --dir apps/web test:smoke`.
  - Done on: 2026-04-01

- [x] NEST-187 Add practical demo seed dataset for unified planning module
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-186
  - Done when:
    - `migrate --seed` provides immediate demo data visibility for
      `Goals + Targets + Lists + Tasks`,
    - seeded planning data is idempotent on repeated seed runs (no duplicate
      growth for demo entities),
    - startup documentation explicitly states that demo planning data is
      available for the seeded admin account.
  - Notes:
    - Extended `DatabaseSeeder` with deterministic planning demo seeding
      (`goals`, `targets`, `task_lists`, `tasks`) linked to existing life areas:
      `apps/api/database/seeders/DatabaseSeeder.php`.
    - Added README startup note about seeded planning demo dataset visibility:
      `README.md`.
    - Validation:
      `php artisan db:seed` (run twice),
      `php artisan tinker --execute="echo 'goals='.App\\Models\\Goal::count().' targets='.App\\Models\\Target::count().' lists='.App\\Models\\TaskList::count().' tasks='.App\\Models\\Task::count();"`,
      `php artisan test --filter=TasksAndListsApiTest`.
  - Done on: 2026-04-01

- [x] NEST-188 Reorganize planning IA into practical subviews and progressive task capture
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-187
  - Done when:
    - main planning navigation exposes practical subviews (`tasks`, `lists`,
      `targets`, `goals`) from one module entrypoint,
    - `Add card` is progressive (opens on click, closes after save) to reduce
      visual overload in daily task flow,
    - goal view shows explicit path context from goal through targets/lists to
      linked task workload.
  - Notes:
    - Updated planning rail IA and subnavigation behavior in:
      `apps/web/src/components/workspace-shell.tsx`.
    - Reworked `/tasks` tabs and views:
      `tasks` (grouped by lists), `lists` (structure management), `targets`,
      `goals` with path visibility, including progressive card composer behavior
      in `apps/web/src/app/tasks/page.tsx`.
    - Added style support for planning subnav and goal path rows in:
      `apps/web/src/app/globals.css`.
    - Validation:
      `pnpm --dir apps/web build`.
  - Done on: 2026-04-01

- [x] NEST-189 Redesign dashboard into mobile-first daily cockpit style
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-188
  - Done when:
    - dashboard UI follows mobile-first structure and visual language inspired
      by provided daily-life cockpit reference,
    - web mobile and desktop keep one coherent layout system (desktop as
      extension of mobile, not separate design),
    - dashboard exposes practical daily sections: timeline, tasks/habits focus,
      quick reflection, and quick actions.
  - Notes:
    - Rebuilt dashboard data/UX surface in:
      `apps/web/src/app/dashboard/page.tsx`.
    - Added dedicated responsive dashboard styles in:
      `apps/web/src/app/globals.css`.
    - Dashboard now includes:
      hero with progress bar, day timeline blocks (`Morning/Now/Evening`),
      toggle tabs (`Zadania/Nawyki`), quick journal entry save, and compact
      quick-actions grid.
    - Validation:
      `pnpm --dir apps/web build`.
  - Done on: 2026-04-01

- [x] NEST-190 Execute full-system UX clickthrough audit and define target UX assumptions baseline
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-189
  - Done when:
    - full authenticated user journey is captured across desktop and mobile with
      screenshot evidence,
    - UX friction points are consolidated into actionable target assumptions per
      module,
    - UX foundation docs are updated to anchor next implementation wave to one
      shared baseline.
  - Notes:
    - Added deterministic full-system screenshot capture script:
      `scripts/ux-audit/capture-system-audit.mjs`.
    - Captured evidence pack:
      `docs/ux_audit_evidence/2026-04-01/capture-manifest.json`,
      `docs/ux_audit_evidence/2026-04-01/capture-manifest.csv`,
      `docs/ux_audit_evidence/2026-04-01/desktop/*.png`,
      `docs/ux_audit_evidence/2026-04-01/mobile/*.png`.
    - Published target assumptions baseline:
      `docs/ux/nest_190_full_system_ux_target_assumptions_2026-04-01.md`.
    - Updated UX foundation and wave tracking docs:
      `docs/ux/ui-ux-foundation.md`,
      `docs/ux/uxui_refresh_implementation_wave_2026-03-31.md`.
  - Done on: 2026-04-01

- [x] NEST-191 Implement UX refresh wave 1 (shell hierarchy + action-first dashboard/planning)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-190
  - Done when:
    - workspace shell follows mobile-first hierarchy without cramped content area
      on small/medium viewports,
    - dashboard promotes one clear "next action now" block instead of flat card
      parity,
    - planning module reduces default noise (messages and setup friction) while
      keeping progressive add/edit behavior.
  - Notes:
    - Updated planning action hierarchy and feedback behavior in:
      `apps/web/src/app/tasks/page.tsx`.
    - Updated dashboard next-action flow and safer user-facing error message
      mapping in:
      `apps/web/src/app/dashboard/page.tsx`.
    - Updated workspace/mobile shell behavior and responsive hierarchy styles in:
      `apps/web/src/app/globals.css`.
    - Validation:
      `pnpm --dir apps/web build`.
  - Done on: 2026-04-01

- [ ] NEST-125 Establish real-traffic observability baseline for V2 planning
  - Status: BACKLOG
  - Owner: Review Agent
  - Depends on: NEST-123
  - Done when:
    - production dashboards include baseline traffic data for API/web/mobile,
    - top failure modes are quantified by frequency and impact,
    - V2 reliability priorities are published in operations docs.
  - Notes:
    - Prepared dashboard/query/reliability memo template pack:
      `docs/operations/v2_real_traffic_observability_baseline_pack_2026-03-31.md`.
    - Added operations baseline cross-link in:
      `docs/engineering/development_and_deployment.md`.
    - Task remains open until 7-day and 14-day real production traffic exports
      are attached with quantified top failure modes and explicit owners.

- [x] NEST-126 Enforce SLO/error-budget workflow with automated gate checks
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-125
  - Done when:
    - SLO checks can block risky releases on error-budget burn,
    - alert routing and escalation ownership are explicit,
    - runbook includes breach recovery flow per SLO.
  - Done on: 2026-03-31
  - Notes:
    - Added strict SLO gate mode for `integrations:sync-slo-check` and covered
      warning/critical blocking behavior in feature tests.
    - Made strict SLO gate mandatory in release-train workflow quality gates.
    - Added SLO breach recovery flow and escalation routing to production
      runbook.

- [x] NEST-127 Implement progressive delivery for API/web (canary or blue-green)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-126
  - Done when:
    - deployment supports partial rollout and monitored promotion,
    - rollback path is automated and tested,
    - release evidence includes canary metrics before full rollout.
  - Done on: 2026-03-31
  - Notes:
    - Extended API/web deploy pipeline with progressive rollout controls
      (`canary`/`bluegreen`), promotion gating, and rollback-on-failure path.
    - Added strict SLO gate checks for canary and post-promotion phases.
    - Rehearsal evidence published:
      `docs/operations/api_web_progressive_delivery_rehearsal_2026-03-31.md`.

- [ ] NEST-128 Implement mobile staged rollout and rollback strategy
  - Status: BACKLOG
  - Owner: Execution Agent
  - Depends on: NEST-126
  - Done when:
    - internal/beta/prod channels are documented and automated,
    - staged rollout percentages and halt criteria are defined,
    - rollback procedure is tested on physical devices.
  - Notes:
    - Mobile release pipeline extended with channel-aware staged rollout
      (`internal`/`beta`/`production`), rollout percentages, halt criteria, and
      rollback-on-failure path.
    - Rehearsal evidence published:
      `docs/operations/mobile_staged_rollout_rehearsal_2026-03-31.md`.
    - Task remains open until physical-device rollback procedure is validated in
      non-dry-run path.

- [ ] NEST-129 Close V1.1 stabilization wave and open V2 execution gate
  - Status: BACKLOG
  - Owner: Review Agent
  - Depends on: NEST-127, NEST-128
  - Done when:
    - reliability risks from V1 launch period are resolved or accepted,
    - unresolved high risks have explicit mitigation tasks,
    - V2 execution gate sign-off is recorded.
  - Notes:
    - Gate review published:
      `docs/operations/v1_1_stabilization_gate_review_2026-03-31.md`.
    - Decision recorded as temporary NO-GO due unresolved high-severity live
      evidence gaps (`NEST-122`, `NEST-123`, `NEST-128`) and pending real
      traffic baseline (`NEST-125`).

- [x] NEST-130 Deliver automatic background sync with adaptive retry/backoff
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-129
  - Done when:
    - sync can run automatically in background on supported clients,
    - retry/backoff rules are deterministic,
    - user can still force manual sync and inspect recent results.
  - Done on: 2026-03-31
  - Notes:
    - Implemented background auto-sync loops on web/mobile offline queue
      surfaces with adaptive retry/backoff and deterministic jitter.
    - Manual `Force Sync` and `Retry Sync` controls remain available and
      unchanged in behavior intent.
    - Implementation and validation documented in:
      `docs/modules/background_auto_sync_adaptive_retry_v2.md`.

- [x] NEST-131 Add durable local sync scheduler for web/mobile
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-130
  - Done when:
    - scheduler survives app restarts and transient network failures,
    - sync jobs are deduplicated and safely persisted,
    - monitoring includes scheduler lag and stuck-job detection.
  - Done on: 2026-03-31
  - Notes:
    - Added persisted scheduler state stores on web/mobile with restart-safe
      auto-sync state and run metadata.
    - Added queue enqueue deduplication for pending action jobs.
    - Added scheduler lag and stuck-job detection signals surfaced in client UI.
    - Implementation and verification documented in:
      `docs/modules/durable_local_sync_scheduler_v2.md`.

- [x] NEST-132 Implement deterministic merge policy for offline conflicts (V2)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-130
  - Done when:
    - module-level merge strategy is documented (auto vs manual fields),
    - conflict UI supports auto-merged and manual-merge states,
    - regressions cover concurrent multi-device edits.
  - Done on: 2026-03-31
  - Notes:
    - Conflict policy matrix now exposes deterministic field partitioning for
      `manual_queue_fields` and `auto_merge_fields`.
    - Conflict queue API exposes merge metadata (`merge_state`, `merge_policy`).
    - Web/mobile conflict UI surfaces auto-merged vs manual-required states.
    - Regression tests cover deterministic repeated conflict updates and API
      merge metadata contract.
    - Implementation and validation documented in:
      `docs/modules/deterministic_offline_merge_policy_v2.md`.

- [x] NEST-133 Add encrypted local cache profile and retention controls
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-131
  - Done when:
    - local offline data is encrypted at rest on supported clients,
    - cache retention/cleanup policy is documented and enforced,
    - secure wipe path exists for logout/account removal.
  - Done on: 2026-03-31
  - Notes:
    - Added encrypted local cache profile for web/mobile offline queue and
      scheduler state payloads.
    - Added configurable retention cleanup policy and queue-size cap for local
      cache hygiene.
    - Added secure wipe action in web/mobile sync surfaces to remove local
      cache payloads.
    - Implementation and validation documented in:
      `docs/modules/encrypted_local_cache_profile_v2.md`.

- [x] NEST-134 Ship offline chaos/regression suite for unstable network scenarios
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-131, NEST-132, NEST-133
  - Done when:
    - automated tests cover packet loss, high latency, and reconnect storms,
    - key user flows pass in offline-first scenarios,
    - known limitations are documented with mitigations.
  - Done on: 2026-03-31
  - Notes:
    - Added deterministic offline chaos matrix runner:
      `scripts/testing/offline-chaos-regression.mjs`.
    - Added PowerShell wrapper for regression execution:
      `scripts/testing/run-offline-chaos-suite.ps1`.
    - Published latest machine-readable matrix in
      `docs/operations/offline_chaos_regression_matrix_2026-03-31.json`.
    - Published scenario coverage, known limitations, and mitigation guidance in
      `docs/operations/offline_chaos_regression_report_2026-03-31.md`.

- [x] NEST-135 Expand collaboration model to shared household/workspace operations
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-129
  - Done when:
    - shared ownership and role model supports family/friends workflows,
    - cross-user task/list/goal permissions are policy-enforced,
    - collaboration audits confirm tenant and membership boundaries.
  - Done on: 2026-03-31
  - Notes:
    - Expanded collaboration role semantics with `owner|editor|viewer` (plus
      legacy `member` compatibility) and owner-managed membership lifecycle.
    - Added collaboration member management endpoints:
      `GET/PATCH/DELETE /api/v1/collaboration/spaces/{spaceId}/members/{memberUserId}`.
    - Enforced shared-object authorization through explicit policies for
      `TaskList`, `Task`, and `Goal`, including target mutation checks through
      goal policy enforcement.
    - Updated OpenAPI collaboration contract and shared runtime client/types for
      new role and member-management API surface.
    - Added role-boundary regression coverage in
      `apps/api/tests/Feature/CollaborationSpacesApiTest.php`.
    - Published implementation and boundary-audit notes in
      `docs/modules/shared_household_workspace_operations_v2.md`.

- [x] NEST-136 Add shared planning workflows (assignment, handoff, reminders)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-135
  - Done when:
    - tasks/events can be assigned and handed over between members,
    - reminder ownership and visibility are explicit,
    - timeline/history captures assignment changes.
  - Done on: 2026-03-31
  - Notes:
    - Added assignment/reminder ownership fields to `tasks` and
      `calendar_events` with auditable timeline history table
      `assignment_timelines`.
    - Added assignment timeline API endpoints:
      `GET /api/v1/tasks/{taskId}/assignment-timeline` and
      `GET /api/v1/calendar-events/{eventId}/assignment-timeline`.
    - Enforced assignment boundary rules for shared tasks (active space members)
      and private tasks (owner-only assignment).
    - Updated reminder delivery routing to honor explicit
      `reminder_owner_user_id` with legacy-safe fallback behavior.
    - Updated OpenAPI contracts and shared runtime client/types for assignment
      workflow payloads.
    - Implementation + validation summary documented in:
      `docs/modules/shared_planning_assignment_handoff_reminder_ownership_v2.md`.

- [x] NEST-137 Deliver in-app notification center with actionable events
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-136
  - Done when:
    - users can view grouped activity and pending actions in-app,
    - notification items deep-link to module context,
    - read/unread and snooze behavior is consistent across clients.
  - Done on: 2026-03-31
  - Notes:
    - Added in-app notification center data model + service/controller:
      `in_app_notifications`, `InAppNotification`, and
      `InAppNotificationController`.
    - Added notification center API endpoints:
      `GET /api/v1/notifications/in-app`,
      `POST /api/v1/notifications/in-app/{notificationId}/read`,
      `POST /api/v1/notifications/in-app/{notificationId}/unread`,
      `POST /api/v1/notifications/in-app/{notificationId}/snooze`.
    - Wired actionable event generation from assignment workflows and reminder
      delivery paths (tasks, calendar events, mobile push reminders).
    - Delivered web/mobile notification center UI with read/unread/snooze
      actions and module deep-link behavior.
    - Updated shared client/types and OpenAPI notification contract.
    - Implementation and validation summary documented in:
      `docs/modules/in_app_notification_center_actionable_events_v2.md`.

- [x] NEST-138 Implement notification channel matrix (push/email/in-app)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-137
  - Done when:
    - per-channel and per-event preferences are configurable,
    - quiet hours and locale-aware delivery windows are supported,
    - delivery telemetry exists per channel with failure reasons.
  - Done on: 2026-03-31
  - Notes:
    - Added notification channel preference model + telemetry model:
      `notification_preferences` and `notification_channel_deliveries`.
    - Added channel matrix API endpoints:
      `GET/PATCH /api/v1/notifications/preferences`,
      `GET /api/v1/notifications/deliveries`.
    - Implemented channel dispatcher (`push/email/in_app`) with quiet-hours
      suppression and locale-aware default windows.
    - Wired matrix dispatch into task/calendar assignment workflows and
      reminder command dispatch path.
    - Added web/mobile preference controls and telemetry visibility.
    - Updated shared runtime client/types and OpenAPI notification contract.
    - Implementation and validation summary documented in:
      `docs/modules/notification_channel_matrix_push_email_in_app_v2.md`.

- [x] NEST-139 Run collaboration safety and UX regression certification
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-136, NEST-137, NEST-138
  - Done when:
    - permission/privacy regressions are validated,
    - collaboration smoke tests pass on desktop/mobile,
    - certification report is attached to release docs.
  - Done on: 2026-03-31
  - Notes:
    - Executed collaboration-focused API regression pack with PASS results
      across permission, privacy, assignment/handoff, and notification matrix
      boundaries.
    - Executed web and mobile smoke checks (`apps/web` build + `apps/mobile`
      smoke export) with PASS results.
    - Published certification packet in:
      `docs/operations/collaboration_safety_ux_regression_certification_2026-03-31.md`.

- [x] NEST-140 Build AI context graph across key product modules
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-129
  - Done when:
    - context model unifies tasks/calendar/habits/goals/journal signals,
    - retrieval payload is deterministic and versioned,
    - privacy/redaction rules are enforced in context assembly.
  - Done on: 2026-03-31
  - Notes:
    - Added deterministic AI context endpoint:
      `GET /api/v1/ai/context-graph` protected by `ai.surface`.
    - Implemented unified context builder service across
      tasks/calendar/habits/goals/journal with stable payload fingerprinting
      (`apps/api/app/AI/Services/AiContextGraphService.php`).
    - Enforced explicit redaction policy for long-form sensitive fields
      (`description`, `body`) with metadata in response payload.
    - Added API regression coverage in:
      `apps/api/tests/Feature/AiContextGraphApiTest.php`.
    - Updated shared client/types + OpenAPI + module docs:
      `packages/shared-types/src/client.js`,
      `packages/shared-types/src/client.d.ts`,
      `packages/shared-types/src/index.d.ts`,
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`,
      `docs/modules/ai_context_graph_v2.md`.

- [x] NEST-141 Deliver conversational copilot surface (web + mobile)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-140
  - Done when:
    - users can ask planning/execution questions in natural language,
    - responses include explainability and source references,
    - graceful fallback exists when AI provider is unavailable.
  - Done on: 2026-03-31
  - Notes:
    - Added conversational copilot endpoint:
      `POST /api/v1/ai/copilot/conversation`.
    - Implemented copilot conversation service with intent detection, response
      explainability, and source reference payloads:
      `apps/api/app/AI/Services/CopilotConversationService.php`.
    - Added provider availability + fallback behavior using OpenAI env
      configuration in `apps/api/config/services.php`.
    - Added web copilot panel:
      `apps/web/src/components/ai-copilot-card.tsx`,
      `apps/web/src/app/page.tsx`.
    - Added mobile copilot panel:
      `apps/mobile/app/modal.tsx`.
    - Added shared client/types and OpenAPI updates:
      `packages/shared-types/src/client.js`,
      `packages/shared-types/src/client.d.ts`,
      `packages/shared-types/src/index.d.ts`,
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`.
    - Added module documentation:
      `docs/modules/conversational_copilot_surface_v2.md`.
    - Added API regression coverage:
      `apps/api/tests/Feature/AiCopilotConversationApiTest.php`.

- [x] NEST-142 Implement approval-gated AI actions (write operations)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-141
  - Done when:
    - AI can propose concrete mutations (create/update plans/tasks),
    - high-impact actions require explicit user approval,
    - audit trail records proposal, approval, and execution results.
  - Done on: 2026-03-31
  - Notes:
    - Added approval-gated AI write proposal APIs:
      `GET/POST /api/v1/ai/actions/proposals`,
      `POST /api/v1/ai/actions/proposals/{proposalId}/approve`,
      `POST /api/v1/ai/actions/proposals/{proposalId}/reject`.
    - Added proposal lifecycle storage model:
      `ai_action_proposals` table +
      `apps/api/app/Models/AiActionProposal.php`.
    - Implemented proposal normalization, approval enforcement, execution, and
      rejection service:
      `apps/api/app/AI/Services/AiActionProposalService.php`.
    - Added retention/deletion lifecycle integration for AI action proposals in
      `apps/api/config/tenant_data_lifecycle.php`.
    - Added API regression suite:
      `apps/api/tests/Feature/AiActionProposalApiTest.php`.
    - Updated shared client/types, OpenAPI, and module documentation:
      `packages/shared-types/src/client.js`,
      `packages/shared-types/src/client.d.ts`,
      `packages/shared-types/src/index.d.ts`,
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`,
      `docs/modules/ai_approval_gated_write_actions_v2.md`.

- [x] NEST-143 Add proactive briefings (daily + weekly) with user controls
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-141
  - Done when:
    - daily and weekly briefing templates are generated reliably,
    - cadence and content scope are user-configurable,
    - notifications deep-link to briefing summaries.
  - Done on: 2026-03-31
  - Notes:
    - Added proactive briefing APIs:
      `GET/PATCH /api/v1/ai/briefings/preferences`,
      `GET /api/v1/ai/briefings`,
      `POST /api/v1/ai/briefings/generate`,
      `GET /api/v1/ai/briefings/{briefingId}`.
    - Added briefing preference and briefing storage models/migrations:
      `ai_briefing_preferences`, `ai_briefings`,
      `apps/api/app/Models/AiBriefingPreference.php`,
      `apps/api/app/Models/AiBriefing.php`.
    - Implemented generation + notification integration in
      `apps/api/app/AI/Services/AiBriefingService.php`.
    - Briefing generation now emits in-app notification with insights deep-link
      context payload (`briefing_id`).
    - Added regression coverage:
      `apps/api/tests/Feature/AiBriefingApiTest.php`.
    - Updated insights surfaces to display latest briefing summary on web/mobile.
    - Updated shared client/types, OpenAPI, and module docs:
      `packages/shared-types/src/client.js`,
      `packages/shared-types/src/client.d.ts`,
      `packages/shared-types/src/index.d.ts`,
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`,
      `docs/modules/ai_proactive_briefings_v2.md`.

- [x] NEST-144 Deliver AI safety/evaluation harness for V2 copilot behaviors
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-142, NEST-143
  - Done when:
    - regression suite covers policy, hallucination, and action-safety checks,
    - quality scorecard is produced for each release candidate,
    - release gate blocks promotion below safety threshold.
  - Done on: 2026-03-31
  - Notes:
    - Added deterministic AI safety evaluation service:
      `apps/api/app/AI/Evaluation/CopilotSafetyEvaluationService.php`.
    - Added release-gate command:
      `php artisan ai:copilot-safety-eval --json --strict`.
    - Added command regression coverage:
      `apps/api/tests/Feature/AiCopilotSafetyEvaluationCommandTest.php`.
    - Wired release gate into release train workflow:
      `.github/workflows/release-train.yml`.
    - Updated release checklist and module docs:
      `scripts/release/release-train-checklist.ps1`,
      `docs/modules/ai_copilot_safety_evaluation_harness_v2.md`,
      `docs/operations/release_train_change_management.md`.

- [x] NEST-145 Implement integration marketplace framework
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-129
  - Done when:
    - providers can be discovered, connected, and managed from one catalog,
    - install/uninstall flows are auditable and reversible,
    - provider metadata/status are exposed in API contracts.
  - Done on: 2026-03-31
  - Notes:
    - Added integration marketplace APIs:
      `GET /integrations/marketplace/providers`,
      `POST /integrations/marketplace/providers/{provider}/install`,
      `POST /integrations/marketplace/providers/{provider}/uninstall`,
      `GET /integrations/marketplace/audits`.
    - Added marketplace lifecycle models and persistence:
      `integration_marketplace_installs`,
      `integration_marketplace_audits`,
      `apps/api/app/Models/IntegrationMarketplaceInstall.php`,
      `apps/api/app/Models/IntegrationMarketplaceAudit.php`.
    - Implemented provider catalog lifecycle service:
      `apps/api/app/Integrations/Services/IntegrationMarketplaceService.php`.
    - Added API regression suite:
      `apps/api/tests/Feature/IntegrationMarketplaceApiTest.php`.
    - Updated shared client/types and OpenAPI contract:
      `packages/shared-types/src/client.js`,
      `packages/shared-types/src/client.d.ts`,
      `packages/shared-types/src/index.d.ts`,
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`.
    - Added module documentation:
      `docs/modules/integration_marketplace_framework_v2.md`.

- [x] NEST-146 Add next-wave providers based on demand scoring
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-145
  - Done when:
    - at least two high-priority providers are implemented end-to-end,
    - each provider meets sync/idempotency/conflict quality bars,
    - rollout docs include limits and known caveats.
  - Done on: 2026-03-31
  - Notes:
    - Added two demand-selected providers end-to-end:
      `clickup`, `microsoft_todo`.
    - Implemented provider adapters and registry wiring:
      `apps/api/app/Integrations/Adapters/ClickUpAdapter.php`,
      `apps/api/app/Integrations/Adapters/MicrosoftTodoAdapter.php`,
      `apps/api/app/Providers/AppServiceProvider.php`.
    - Extended connection/sync/marketplace provider support:
      `apps/api/app/Integrations/Services/IntegrationConnectionService.php`,
      `apps/api/app/Http/Controllers/Api/IntegrationSyncController.php`,
      `apps/api/app/Integrations/Services/IntegrationMarketplaceService.php`.
    - Added provider-specific regression coverage:
      `apps/api/tests/Feature/IntegrationListTaskSyncApiTest.php`,
      `apps/api/tests/Feature/IntegrationConnectionApiTest.php`,
      `apps/api/tests/Feature/IntegrationMarketplaceApiTest.php`.
    - Updated rollout docs and contracts with caveats/limits:
      `docs/modules/next_wave_provider_rollout_v2.md`,
      `docs/modules/integrations.md`,
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`,
      `packages/shared-types/src/client.d.ts`,
      `packages/shared-types/src/index.d.ts`.

- [x] NEST-147 Add near-real-time sync triggers (webhooks/event ingestion)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-146
  - Done when:
    - webhook/event-driven sync paths exist where provider supports them,
    - deduplication and replay protection are enforced,
    - monitoring tracks ingestion lag and dropped-event rates.
  - Done on: 2026-03-31
  - Notes:
    - Added near-real-time event ingestion API:
      `POST /api/v1/integrations/events/{provider}/ingest`,
      `GET /api/v1/integrations/events/ingestions`.
    - Added ingestion persistence and service orchestration:
      `apps/api/database/migrations/2026_03_31_220000_create_integration_event_ingestions_table.php`,
      `apps/api/app/Models/IntegrationEventIngestion.php`,
      `apps/api/app/Integrations/Services/IntegrationEventIngestionService.php`,
      `apps/api/app/Http/Controllers/Api/IntegrationEventIngestionController.php`.
    - Added deduplication/replay protection with unique
      `(tenant_id, user_id, provider, event_id)` semantics.
    - Added ingestion observability metrics, alert thresholds, and stats command:
      `integrations:event-ingestion-stats`.
    - Linked queue job completion/failure lifecycle to ingestion status updates
      in `apps/api/app/Jobs/ProcessIntegrationSyncJob.php`.
    - Added regression coverage:
      `apps/api/tests/Feature/IntegrationEventIngestionApiTest.php`,
      `apps/api/tests/Feature/IntegrationEventIngestionStatsCommandTest.php`.
    - Updated shared runtime contracts and OpenAPI:
      `packages/shared-types/src/client.js`,
      `packages/shared-types/src/client.d.ts`,
      `packages/shared-types/src/index.d.ts`,
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`.
    - Documentation published in
      `docs/modules/integration_near_real_time_sync_triggers_v2.md` and linked
      from `docs/modules/integrations.md`.

- [x] NEST-148 Deliver integration health center and remediation playbooks
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-147
  - Done when:
    - health center surfaces provider status, failures, and recovery hints,
    - common failures have one-click remediation or guided flows,
    - runbooks include provider-specific incident procedures.
  - Done on: 2026-03-31
  - Notes:
    - Added integration health center APIs:
      `GET /api/v1/integrations/health`,
      `POST /api/v1/integrations/health/{provider}/remediate`.
    - Added health aggregation and remediation service/controller:
      `apps/api/app/Integrations/Services/IntegrationHealthCenterService.php`,
      `apps/api/app/Http/Controllers/Api/IntegrationHealthCenterController.php`.
    - Added one-click remediation (`replay_latest_failure`) and guided flow
      (`reconnect_provider`) support.
    - Added API regression coverage:
      `apps/api/tests/Feature/IntegrationHealthCenterApiTest.php`.
    - Added health center UI surfaces for web/mobile calendar integration
      control areas:
      `apps/web/src/components/integration-health-center-card.tsx`,
      `apps/web/src/app/calendar/page.tsx`,
      `apps/mobile/components/mvp/ModuleScreen.tsx`,
      `apps/mobile/app/(tabs)/calendar.tsx`.
    - Updated shared runtime contracts and OpenAPI:
      `packages/shared-types/src/client.js`,
      `packages/shared-types/src/client.d.ts`,
      `packages/shared-types/src/index.d.ts`,
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`.
    - Published module + provider runbook docs:
      `docs/modules/integration_health_center_remediation_playbooks_v2.md`,
      `docs/operations/integration_health_center_provider_incident_playbooks_v2.md`.

- [x] NEST-149 Expand billing to self-serve checkout/portal/dunning (V2)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-129
  - Done when:
    - checkout and subscription self-management are production-ready,
    - dunning and payment recovery flows are automated,
    - financial event audit trail is complete and reconciled.
  - Done on: 2026-03-31
  - Notes:
    - Added self-serve billing endpoints and tenant-scoped dunning/audit APIs:
      `POST /api/v1/billing/checkout/session`,
      `POST /api/v1/billing/portal/session`,
      `POST /api/v1/billing/subscription/recover`,
      `GET /api/v1/billing/dunning/attempts`,
      `GET /api/v1/billing/audit/reconciliation`.
    - Added dunning command and persistence model:
      `php artisan billing:dunning:run` with new tables
      `billing_self_serve_sessions` and `billing_dunning_attempts`.
    - Updated web/mobile billing surfaces and shared client contracts for
      self-serve, recovery, dunning visibility, and reconciliation telemetry.
    - Updated OpenAPI contract and module docs:
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`,
      `docs/modules/billing_self_serve_checkout_portal_dunning_v2.md`.

- [x] NEST-150 Implement activation, retention, and monetization analytics loops
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-149
  - Done when:
    - funnel and retention metrics are tracked end-to-end,
    - experiment hooks support onboarding and pricing tests,
    - decision dashboard exists for weekly product iterations.
  - Done on: 2026-03-31
  - Notes:
    - Added growth-loop analytics APIs:
      `GET /api/v1/analytics/loops/decision-dashboard`,
      `POST /api/v1/analytics/experiments/hook`.
    - Implemented decision dashboard aggregation service covering:
      funnel (`signups/onboarding/trial/activation`),
      retention (`current/previous/retained/churned`),
      monetization (`MRR/past_due/recovery`),
      and experiment winner summaries.
    - Added onboarding/pricing experiment hooks in web flows and surfaced
      dashboard metrics in web/mobile insights screens.
    - Updated OpenAPI + module docs:
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`,
      `docs/modules/analytics_activation_retention_monetization_loops_v2.md`.

- [x] NEST-151 Execute V2 production readiness review (perf/security/cost/ops)
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-134, NEST-139, NEST-144, NEST-148, NEST-150
  - Done when:
    - cross-functional readiness packet is complete,
    - unresolved P0/P1 risks have explicit owner and mitigation,
    - go/no-go decision is documented with sign-offs.
  - Done on: 2026-03-31
  - Notes:
    - Published readiness packet:
      `docs/operations/v2_production_readiness_review_2026-03-31.md`.
    - Executed release dry-run checks:
      deploy pipeline, mobile release, and post-deploy smoke scripts.
    - Recorded unresolved P1 risk owners/mitigations for:
      AI safety harness runtime drift and secret rotation recency warning.
    - Documented explicit decision and sign-offs:
      NO-GO for GA now, GO for continued staging rehearsals.

- [ ] NEST-152 Execute V2 GA release and 30-day stabilization plan
  - Status: BACKLOG
  - Owner: Review Agent
  - Depends on: NEST-151
  - Done when:
    - V2 GA release is deployed and monitored,
    - day0/day1/week1/week4 checkpoints are executed,
    - next backlog wave (V2.1) is published with prioritized tasks.
  - Notes:
    - Execution packet published:
      `docs/operations/v2_ga_30_day_stabilization_execution_packet_2026-03-31.md`.
    - Prioritized V2.1 backlog wave published:
      `docs/planning/v2_1_prioritized_backlog_wave_2026-03-31.md`.
    - Pre-GA control checks executed and passed in current environment:
      `php artisan migrate --force`,
      `php artisan secrets:rotate --json`,
      `php artisan security:controls:verify --json`,
      `php artisan ai:copilot-safety-eval --json`.
    - Task remains open pending non-dry-run GA deploy and live Day0/Day1/Week1/Week4
      evidence checkpoints.

- [x] NEST-015 Implement journal and life areas module
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011
  - Done when: journal and life area tagging/balance data are available.
  - Done on: 2026-03-15
  - Notes:
    - Delivered life areas CRUD endpoints (`/api/v1/life-areas`) with archived
      filtering support.
    - Delivered journal entries CRUD endpoints (`/api/v1/journal-entries`) with
      mood filtering and search.
    - Delivered tenant-scoped journal life area tagging via pivot table and
      feature tests for module behavior.

- [x] NEST-016 Implement internal calendar module
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011
  - Done when: calendar planning/events work without external sync dependency.
  - Done on: 2026-03-15
  - Notes:
    - Delivered calendar event CRUD endpoints (`/api/v1/calendar-events`).
    - Added range/all-day/linked-entity filtering for event listing.
    - Added tenant-scoped validation for linked entities (`task`, `goal`,
      `routine`) and feature test coverage.

- [x] NEST-017 Implement integration infrastructure
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011
  - Done when: adapters, mapping, idempotency, retry, and DLQ are in place.
  - Done on: 2026-03-15
  - Notes:
    - Added integration adapter registry baseline with `trello` and
      `google_tasks` adapters.
    - Added sync orchestration service with idempotency lock and `sync_mappings`
      upsert flow.
    - Added queued sync job with retry/backoff and dead-letter persistence in
      `integration_sync_failures`.

- [x] NEST-018 Deliver list/task integration baseline (Trello + Google Tasks)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-017
  - Done when: list/task sync baseline works for Trello and Google Tasks.
  - Done on: 2026-03-15
  - Notes:
    - Added authenticated endpoint to trigger list/task sync baseline:
      `POST /api/v1/integrations/list-task-sync`.
    - Added list/task provider sync flow for `trello` and `google_tasks` on top
      of integration job infrastructure and `sync_mappings`.
    - Added idempotent re-sync behavior (unchanged payloads skipped) with
      feature test coverage for provider sync and tenant scope.

- [x] NEST-019 Enforce no end-user AI surface in MVP
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-011
  - Done when: AI UI/public endpoints are disabled in MVP and documented.
  - Done on: 2026-03-15
  - Notes:
    - Added explicit MVP feature flag config with `AI_SURFACE_ENABLED=false`
      default in backend.
    - Added guard tests that enforce absence of public `/api/v1/ai/*` routes
      and verify AI endpoint pattern returns `404`.
    - Updated `docs/modules/ai_layer.md` with MVP enforcement policy.

- [x] NEST-020 Add observability baseline
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-017
  - Done when: logs, trace IDs, and core API/queue/sync metrics are active.
  - Done on: 2026-03-15
  - Notes:
    - Added API trace middleware with response header `X-Trace-Id` and logging
      context enrichment.
    - Added cache-based metric counter baseline for API, queue, and integration
      sync flows.
    - Added queue processed/failed hooks and observability feature tests.

- [x] NEST-021 Deliver web MVP screens
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016
  - Done when: MVP module screens work in web app.
  - Done on: 2026-03-16
  - Notes:
    - Replaced web shell with complete MVP navigation and screen set.
    - Delivered module screens for tasks/lists, habits/routines,
      goals/targets, journal/life areas, and calendar.
    - Verified frontend quality gates: `pnpm lint` and `pnpm build` pass with
      static routes generated for all MVP module pages.
    - UX evidence backfill:
      `docs/ux/legacy_ux_evidence_backfill_2026-03-19.md#nest-021`.

- [x] NEST-022 Deliver mobile MVP screens
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016
  - Done when: MVP module screens work in mobile app.
  - Done on: 2026-03-16
  - Notes:
    - Replaced Expo template tabs with MVP module tab set.
    - Delivered mobile screens for tasks/lists, habits/routines,
      goals/targets, journal/life areas, and calendar.
    - Verified mobile web export build with
      `pnpm exec expo export --platform web`.
    - UX evidence backfill:
      `docs/ux/legacy_ux_evidence_backfill_2026-03-19.md#nest-022`.

- [x] NEST-023 Align shared UX states and telemetry naming
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-021, NEST-022
  - Done when: loading/empty/error/success and telemetry naming are aligned.
  - Done on: 2026-03-16
  - Notes:
    - Extended shared types with aligned `UiAsyncState` and
      `TelemetryEventName` contracts.
    - Applied the same state labels and screen telemetry naming in both web and
      mobile clients.
    - Verified web and mobile build checks after alignment changes.

- [x] NEST-024 Integrate clients with shared API client/types
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-008, NEST-021, NEST-022
  - Done when: both clients use shared client/types end-to-end.
  - Done on: 2026-03-16
  - Notes:
    - Extended `@nest/shared-types` with typed API client contract and
      collection response types.
    - Integrated shared API client contract in both web and mobile apps with
      live `/lists` connectivity checks on tasks screens.
    - Verified client build checks (`pnpm lint`, `pnpm build`, Expo web export)
      after integration.

- [x] NEST-025 Add backend test suites
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-012, NEST-013, NEST-014, NEST-015, NEST-016, NEST-017
  - Done when: unit/feature/integration tests cover core behavior.
  - Done on: 2026-03-16
  - Notes:
    - Added dedicated `Integration` test suite in `phpunit.xml`.
    - Added new unit tests for observability counter and integration adapter
      registry behavior.
    - Added end-to-end integration tests validating API task/list creation and
      provider sync pipeline idempotency.

- [x] NEST-026 Add frontend/mobile test suites
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-021, NEST-022, NEST-024
  - Done when: client unit/smoke tests cover critical paths.
  - Done on: 2026-03-16
  - Notes:
    - Added web unit contract and smoke route checks (`pnpm test:unit`,
      `pnpm test:smoke`).
    - Added mobile unit contract and smoke export route checks
      (`pnpm test:unit`, `pnpm test:smoke`).
    - Verified all new frontend/mobile test scripts pass.

- [x] NEST-027 Implement security baseline controls
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-011, NEST-017
  - Done when: credential protection and dependency security checks are active.
  - Done on: 2026-03-16
  - Notes:
    - Added `integration_credentials` storage with encrypted token casts and
      tenant/user/provider uniqueness.
    - Added credential vault service supporting secure store, active lookup, and
      revoke flow.
    - Added feature tests validating encrypted-at-rest behavior and revoke
      protection.

- [x] NEST-028 Run backup and restore drill with documentation
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-020
  - Done when: backup/restore drill is executed and documented.
  - Done on: 2026-03-16
  - Notes:
    - Executed local backup/restore drill for API SQLite database snapshot.
    - Verified backup integrity with SHA256 checksum match.
    - Documented runbook and outcomes in `docs/operations/backup_restore_drill.md`
      including observed RTO/RPO.

- [x] NEST-029 Finalize MVP release checklist and staging sign-off
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-018, NEST-019, NEST-025, NEST-026, NEST-027, NEST-028
  - Done when: MVP sign-off is recorded for agreed scope.
  - Done on: 2026-03-16
  - Notes:
    - Created formal MVP release checklist and staging sign-off artifact in
      `docs/operations/mvp_release_checklist.md`.
    - Recorded scope, quality, security, and resilience gates as complete.
    - Added explicit sign-off record for MVP staging baseline.

- [x] NEST-030 Enforce quality gate before commit
  - Status: DONE
  - Owner: Review Agent
  - Depends on: none
  - Done when:
    - automated checks are defined and executed before commits,
    - manual regression checklist (feature + UI) is applied before commits,
    - unintended change detection (`git diff --name-only` + diff review) is
      part of commit workflow.
  - Done on: 2026-03-16
  - Notes:
    - Added local quality gate script (`scripts/quality-gate.ps1`) with scoped
      automated checks for API/web/mobile changes.
    - Added mandatory manual checklist acknowledgement gate.
    - Added untracked/staged/unstaged diff aggregation for unintended change
      review and documented workflow in `docs/engineering/quality_gate_workflow.md`.

- [x] NEST-031 Define post-MVP integration contract versioning strategy
  - Status: DONE
  - Owner: Planning Agent
  - Depends on: NEST-029
  - Done when: provider contract/version policy and migration rules are
    documented and linked from integration docs.
  - Done on: 2026-03-16
  - Notes:
    - Defined post-MVP integration contract versioning strategy in
      `docs/engineering/integration_contract_versioning.md`.
    - Added explicit integration docs link to versioning strategy from
      `docs/modules/integrations.md`.
    - Established migration, compatibility, deprecation, rollback, and
      validation rules for provider contract evolution.

- [x] NEST-032 Deliver Trello synchronization
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-031
  - Done when: list/task synchronization with Trello works with idempotency,
    mapping integrity, and audit trail.
  - Done on: 2026-03-16
  - Notes:
    - Added durable sync audit trail table/model (`integration_sync_audits`)
      for `success`, `duplicate_skipped`, and `failed` outcomes.
    - Enforced sync mapping integrity with conflict checks in integration sync
      service and unique internal mapping constraint in DB migrations.
    - Extended Trello integration coverage with tests validating idempotency,
      mapping integrity conflict protection, and audit persistence.

- [x] NEST-033 Deliver Google Tasks synchronization
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-031
  - Done when: list/task synchronization with Google Tasks works with retry/
    backoff and consistent field mappings.
  - Done on: 2026-03-16
  - Notes:
    - Hardened `GoogleTasksAdapter` with deterministic field mapping for
      `task_list` and `task` payloads and canonical `sync_hash` generation.
    - Extended sync metadata with mapping version and retry profile details
      persisted in integration audit trail.
    - Added tests for Google Tasks mapping consistency and retry/backoff
      profile coverage.

- [x] NEST-034 Deliver third list/task provider (demand-driven)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-031
  - Done when: one additional provider is selected by product demand and
    delivered with the same sync quality bar.
  - Done on: 2026-03-16
  - Notes:
    - Selected `todoist` as the demand-driven third list/task provider and
      integrated it into adapter registry and sync API validation.
    - Added deterministic Todoist mapping profile (`todoist.v1`) with canonical
      sync hash behavior and retry profile metadata.
    - Added unit and feature tests for Todoist sync behavior, mapping metadata,
      and end-to-end list/task synchronization.

- [x] NEST-035 Deliver Google Calendar synchronization
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033
  - Done when: calendar sync is delivered after list/task baseline and follows
    conflict/audit requirements.
  - Done on: 2026-03-16
  - Notes:
    - Added Google Calendar adapter (`google_calendar.v1`) and calendar sync
      API endpoint `POST /api/v1/integrations/calendar-sync`.
    - Delivered tenant/user-scoped calendar sync service with idempotent skip
      behavior and conflict-candidate detection for high-value event fields.
    - Persisted sync audit metadata for conflict detection and added dedicated
      unit/feature test coverage for calendar sync flows.

- [x] NEST-036 Deliver Obsidian synchronization as final provider in wave 1
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033, NEST-035
  - Done when: markdown note sync is delivered as the last provider in initial
    integration sequence.
  - Done on: 2026-03-16
  - Notes:
    - Added Obsidian adapter (`obsidian.v1`) with journal entry to markdown note
      mapping and deterministic sync hashing.
    - Delivered authenticated journal sync API endpoint:
      `POST /api/v1/integrations/journal-sync` (`provider=obsidian`).
    - Added tenant/user-scoped journal sync service with idempotent re-sync
      behavior and audit metadata test coverage.

- [x] NEST-037 Implement conflict queue API + UI workflows
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033, NEST-034, NEST-035, NEST-036
  - Done when: users can review, accept, or override high-value field conflicts.
  - Done on: 2026-03-16
  - Notes:
    - Added persistent conflict queue domain (`integration_sync_conflicts`) with
      open/resolved lifecycle and resolution payload support.
    - Added conflict queue API routes for listing and resolving conflicts:
      `GET /api/v1/integrations/conflicts` and
      `POST /api/v1/integrations/conflicts/{conflictId}/resolve`.
    - Delivered web/mobile UI workflows on calendar screens to review open
      conflicts and execute `accept` or `override` actions.
    - UX evidence backfill:
      `docs/ux/legacy_ux_evidence_backfill_2026-03-19.md#nest-037`.

- [x] NEST-038 Add deterministic conflict policy matrix by field/provider
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-037
  - Done when: documented policy is enforced in code and covered by tests.
  - Done on: 2026-03-16
  - Notes:
    - Added deterministic provider/field conflict matrix documentation in
      `docs/modules/integration_conflict_policy_matrix.md`.
    - Implemented policy enforcement service used by conflict queue to persist
      only `manual_queue` fields.
    - Added unit and feature tests validating policy matrix output and queue
      filtering behavior for non-manual fields.

- [x] NEST-039 Add sync replay tooling for failed jobs
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-037
  - Done when: failed sync jobs can be replayed safely with idempotency guards.
  - Done on: 2026-03-16
  - Notes:
    - Added replay tracking metadata for failed sync records
      (`replay_count`, replay status/error/time, replay idempotency key).
    - Added replay tooling API routes:
      `GET /api/v1/integrations/failures` and
      `POST /api/v1/integrations/failures/{failureId}/replay`.
    - Added tenant/user-scoped replay service and feature tests covering list,
      replay success path, scope protection, and guest authorization.

- [x] NEST-040 Introduce sync SLOs and alert thresholds
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-037
  - Done when: SLO targets exist for success latency/error budget and alerting
    is configured.
  - Done on: 2026-03-16
  - Notes:
    - Added integration sync SLO config with success rate, p95 latency targets,
      and warning/critical alert thresholds.
    - Added integration sync SLO evaluation service and operational command
      `php artisan integrations:sync-slo-check` with severity-based signaling.
    - Added latency metric bucketing in sync flow plus unit/feature tests for
      SLO evaluation and command exit behavior.

- [x] NEST-041 Expose provider connection management in web and mobile
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033, NEST-034, NEST-035, NEST-036
  - Done when: users can connect/reconnect/revoke providers from both clients.
  - Done on: 2026-03-16
  - Notes:
    - Added provider connection management API:
      `GET /api/v1/integrations/connections`,
      `PUT /api/v1/integrations/connections/{provider}`,
      `DELETE /api/v1/integrations/connections/{provider}`.
    - Added tenant/user-scoped connection service on top of credential vault
      with explicit provider allowlist and reconnect/revoke behavior.
    - Added web and mobile calendar workflows to list providers and execute
      connect/reconnect/revoke actions, plus API/client contract updates and
      feature tests.
    - UX evidence backfill:
      `docs/ux/legacy_ux_evidence_backfill_2026-03-19.md#nest-041`.

- [x] NEST-042 Add provider permission scope review screens
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-041
  - Done when: granted scopes are visible and least-privilege warnings are shown.
  - Done on: 2026-03-16
  - Notes:
    - Extended web provider connection UI with granted scope visibility per
      provider and least-privilege scope review messaging.
    - Extended mobile provider permissions UI with granted scope display and
      warning status for extra or missing scopes.
    - Added shared visual status treatment for scope review results
      (`scope-ok`/`scope-warn`) and validated web/mobile quality checks.
    - UX evidence backfill:
      `docs/ux/legacy_ux_evidence_backfill_2026-03-19.md#nest-042`.

- [x] NEST-043 Add integration regression suite
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-032, NEST-033, NEST-034, NEST-035, NEST-036, NEST-037
  - Done when: end-to-end sync scenarios for each provider run in CI.
  - Done on: 2026-03-16
  - Notes:
    - Added dedicated provider regression integration tests in
      `tests/Integration/IntegrationProviderRegressionTest.php` for Trello,
      Google Tasks, Todoist, Google Calendar (with conflict queue), and
      Obsidian.
    - Updated CI backend workflow to run `Integration`, `Unit`, and `Feature`
      suites explicitly, making provider regression execution visible and
      mandatory.
    - Added regression suite documentation in
      `docs/engineering/integration_regression_suite.md` and linked it from
      `docs/modules/integrations.md`.

- [x] NEST-044 Deliver notifications first step (mobile push baseline)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-035
  - Done when: simple push notifications are available for key reminders, with
    explicit scope and delivery monitoring.
  - Done on: 2026-03-16
  - Notes:
    - Added mobile push device registration API with encrypted token storage
      and tenant/user-scoped revoke flow.
    - Added baseline reminder dispatch command
      (`notifications:send-mobile-reminders`) for task-due-today and
      calendar-upcoming reminders.
    - Added push delivery ledger + monitoring metrics
      (`notifications.push.sent`, `notifications.push.failed`) and feature
      tests for device management and dispatch behavior.

- [x] NEST-045 Phase 2 release sign-off
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-040, NEST-043, NEST-044
  - Done when: operational and product sign-off for integration expansion is
    recorded.
  - Done on: 2026-03-16
  - Notes:
    - Recorded formal Phase 2 release sign-off in
      `docs/operations/phase2_release_signoff.md`.
    - Confirmed dependency gates (`NEST-040`, `NEST-043`, `NEST-044`) as
      complete and validated.
    - Documented operational checks, CI coverage, and product validation scope
      for integration expansion baseline.

- [x] NEST-046 Define analytics event taxonomy across modules
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-029
  - Done when: canonical event dictionary is documented and adopted in clients.
  - Done on: 2026-03-16
  - Notes:
    - Added canonical analytics taxonomy in `docs/modules/analytics_event_taxonomy.md`.
    - Defined event envelope fields, naming rules, and module-level v1 event
      set.
    - Added rollout constraints for ingestion contracts and downstream
      insights/AI consumers.

- [x] NEST-047 Build analytics ingestion pipeline
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-046
  - Done when: validated event ingestion, storage, and retention policy are in
    place.
  - Done on: 2026-03-16
  - Notes:
    - Added validated analytics ingestion endpoint:
      `POST /api/v1/analytics/events` with taxonomy allowlist checks.
    - Added durable analytics storage (`analytics_events`) with tenant/module/
      event indexes and ingestion metrics (`analytics.events.*`).
    - Added retention command `analytics:prune-events` and documented baseline
      in `docs/modules/analytics_ingestion_pipeline.md`.

- [x] NEST-048 Create life-area balance score model (v1)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-047
  - Done when: scoring formula is documented, computed, and visible via API.
  - Done on: 2026-03-16
  - Notes:
    - Added insights endpoint
      `GET /api/v1/insights/life-area-balance` with configurable `window_days`
      (`1..180`) and tenant/user-scoped output.
    - Added `LifeAreaBalanceScoreService` to compute per-life-area balance
      rows and `global_balance_score` from journal/task/habit activity shares.
    - Added feature tests for formula baseline, tenant scoping, auth, and
      input validation plus model documentation in
      `docs/modules/life_area_balance_score_model.md`.

- [x] NEST-049 Implement trends and insights API
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-047, NEST-048
  - Done when: weekly/monthly trend endpoints exist for tasks/habits/goals.
  - Done on: 2026-03-16
  - Notes:
    - Added trend endpoints:
      `GET /api/v1/insights/trends/tasks`,
      `GET /api/v1/insights/trends/habits`,
      `GET /api/v1/insights/trends/goals`.
    - Added bucketed trend aggregation service supporting `weekly`/`monthly`
      periods and configurable bucket count (`points`).
    - Added feature tests for bucket outputs, tenant/user scoping, validation,
      and auth plus baseline documentation in `docs/modules/insights_trends_api.md`.

- [x] NEST-050 Deliver insights UI (web and mobile)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-049
  - Done when: users can view trends and life-area balance reports in both
    clients.
  - Done on: 2026-03-16
  - Notes:
    - Added web insights screen (`/insights`) with API-backed life-area
      balance and trend summaries plus failure-safe fallback snapshot.
    - Added mobile insights tab screen with the same insight payloads and
      shared telemetry naming (`screen.insights.view`).
    - Extended shared API client/types to include insights endpoints and
      documented UI baseline in `docs/ux/insights_ui_baseline.md`.
    - UX evidence backfill:
      `docs/ux/legacy_ux_evidence_backfill_2026-03-19.md#nest-050`.

- [x] NEST-051 Expand AI tools for weekly planning
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-019, NEST-049
  - Done when: AI can propose weekly plans with explicit constraints and
    explainable rationale.
  - Done on: 2026-03-16
  - Notes:
    - Added first AI planning endpoint:
      `POST /api/v1/ai/weekly-plan/propose`.
    - Added feature-gated AI middleware (`ai.surface`) and deterministic weekly
      planning service using tenant/user scoped task, habit, and goal signals.
    - Added feature tests for feature-flag gate, constraint-aware proposals,
      rationale payload, tenant scoping, and auth plus API documentation in
      `docs/modules/ai_weekly_planning_api.md`.

- [x] NEST-052 Add explainability payloads for AI recommendations
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-051
  - Done when: AI responses include reason codes and source entities.
  - Done on: 2026-03-19
  - Notes:
    - Extended weekly planning response with explicit explainability envelope
      (`model_version`, `reason_code_counts`, `generated_at`).
    - Added per-item `reason_codes` and `source_entities` payloads for
      recommendation provenance.
    - Added/updated feature tests and explainability contract docs in
      `docs/modules/ai_explainability_payloads.md`.

- [x] NEST-053 Add confidence scoring and guardrails for AI suggestions
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-052
  - Done when: low-confidence suggestions are gated and flagged for review.
  - Done on: 2026-03-19
  - Notes:
    - Extended weekly plan recommendations with per-item `confidence_score`
      and `guardrail_status`.
    - Added planner guardrail constraint (`min_confidence`) and review queue
      output (`review_items`) for low-confidence candidates.
    - Added feature tests and updated explainability/API docs to cover
      confidence guardrail behavior.

- [x] NEST-054 Introduce user feedback loop for AI outputs
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-051
  - Done when: users can rate accept/reject/edit suggestions and feedback is
    stored for quality tracking.
  - Done on: 2026-03-19
  - Notes:
    - Added AI feedback API endpoint `POST /api/v1/ai/feedback` under AI
      feature gate.
    - Added persistent feedback table/model (`ai_recommendation_feedback`) with
      tenant/user scope, decision type, reason codes, and optional edit payload.
    - Added feature tests for enabled/disabled gate, accept/edit/reject flows,
      validation, auth, and storage scope plus docs in
      `docs/modules/ai_feedback_loop.md`.

- [x] NEST-055 Add assistant policy testing suite
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-053, NEST-054
  - Done when: policy, safety, and prompt regression tests run in CI.
  - Done on: 2026-03-19
  - Notes:
    - Added AI planning policy service with deterministic allow/block rules for
      privacy-boundary and wellbeing guardrails.
    - Added unit + feature regression tests for safe/blocked planning contexts
      and integrated policy assertions into weekly planning API tests.
    - Documented policy test suite baseline and CI execution scope in
      `docs/modules/ai_policy_testing_suite.md`.

- [x] NEST-056 Define automation rule model (trigger/condition/action)
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-049
  - Done when: automation domain model and API contracts are documented.
  - Done on: 2026-03-19
  - Notes:
    - Added automation domain model spec in `docs/modules/automation_rule_model.md`
      with trigger/condition/action entities and execution constraints.
    - Added OpenAPI draft contract
      `docs/engineering/contracts/openapi_automation_rules_v1.yaml` for rule CRUD and run listing.
    - Linked automation contract draft in `docs/engineering/api_contracts.md`.

- [x] NEST-057 Implement automation engine (v1)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-056
  - Done when: rules can execute against allowed module actions with audit logs.
  - Done on: 2026-03-19
  - Notes:
    - Added automation runtime tables/models (`automation_rules`,
      `automation_runs`) with tenant/user scope and action audit payloads.
    - Added automation API for rule CRUD, manual execution endpoint, and run
      listing under authenticated scope.
    - Added execution service with deterministic condition evaluation, allowed
      action dispatch, and persisted run outcomes plus feature tests and docs
      in `docs/modules/automation_engine_v1.md`.

- [x] NEST-058 Deliver automation builder UI (web)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-057
  - Done when: users can create/activate/pause basic automations from web app.
  - Done on: 2026-03-19
  - Notes:
    - Added web route `/automations` with basic automation builder controls.
    - Added rule control actions (`create`, `activate/pause`, manual execute)
      and recent run visibility.
    - Extended shared/web/mobile API clients for automation endpoints and
      documented UI baseline in `docs/ux/automation_builder_ui_web.md`.
    - UX evidence backfill:
      `docs/ux/legacy_ux_evidence_backfill_2026-03-19.md#nest-058`.

- [x] NEST-059 Deliver automation execution history and debugging view
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-057
  - Done when: users can inspect runs, errors, and retries.
  - Done on: 2026-03-19
  - Notes:
    - Added automation run detail and replay API:
      `GET /automations/runs/{runId}`,
      `POST /automations/runs/{runId}/replay`.
    - Added web automation debugging view with run status filters, per-run
      action trace inspection, and replay controls.
    - Extended shared/web/mobile API clients with run detail/replay methods and
      documented debugging baseline in `docs/modules/automation_execution_debugging_view.md`.

- [x] NEST-060 Phase 3 release sign-off
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-050, NEST-055, NEST-058, NEST-059
  - Done when: intelligence and automation scope passes release criteria.
  - Done on: 2026-03-19
  - Notes:
    - Recorded formal Phase 3 release sign-off in
      `docs/operations/phase3_release_signoff.md`.
    - Confirmed quality gates for backend/web/mobile checks and test coverage.
    - Confirmed policy guardrails, AI feedback loop, and automation audit
      readiness for transition to Phase 4 hardening.

- [x] NEST-061 Implement strict tenant isolation verification suite
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-029
  - Done when: test matrix covers API, queue, and integration isolation paths.
  - Done on: 2026-03-19
  - Notes:
    - Added hard ownership verification in integration sync service for
      tenant/user-scoped internal entities (`task_list`, `task`,
      `calendar_event`, `journal_entry`).
    - Added `TenantIsolationVerificationTest` coverage for API access scope,
      integration sync payload rejection, and queue-path rejection for
      cross-tenant entity access.
    - Aligned integration/observability regression tests to use
      tenant-owned internal entities before sync execution.
    - Documented verification matrix in
      `docs/security/tenant_isolation_verification_suite.md`.

- [x] NEST-062 Add tenant-scoped data retention and deletion workflows
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-061
  - Done when: retention policies and deletion jobs are implemented and audited.
  - Done on: 2026-03-19
  - Notes:
    - Added tenant lifecycle policy config in
      `apps/api/config/tenant_data_lifecycle.php`.
    - Added audited retention and deletion services:
      `TenantDataRetentionService` and `TenantDataDeletionService`.
    - Added queued tenant deletion job:
      `apps/api/app/Jobs/DeleteTenantDataJob.php`.
    - Added lifecycle audit storage:
      `tenant_data_lifecycle_audits` migration and model.
    - Added operational commands:
      `tenants:retention-prune` and `tenants:delete-data` with
      `--dry-run`/`--json` and optional `--queue` deletion execution.
    - Added feature coverage in
      `apps/api/tests/Feature/TenantDataLifecycleCommandTest.php`.
    - Documented runbooks in
      `docs/modules/tenant_data_lifecycle_workflows.md`.

- [x] NEST-063 Implement tenant-level usage limits and quotas
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-061
  - Done when: per-tenant limits are enforced with clear user-facing errors.
  - Done on: 2026-03-19
  - Notes:
    - Added tenant quota config in
      `apps/api/config/tenant_usage_limits.php`.
    - Added `TenantUsageQuotaService` and API middleware
      `EnforceTenantUsageQuota` for `POST` create endpoint enforcement.
    - Added structured quota error handling with
      `tenant_quota_exceeded` payload and HTTP `429`.
    - Enforced limits for lists, tasks, habits/logs, routines, goals,
      targets, life areas, journal entries, calendar events, and automation
      rules.
    - Added coverage in
      `apps/api/tests/Feature/TenantUsageLimitApiTest.php`.
    - Documented baseline in
      `docs/modules/tenant_usage_limits_and_quotas.md`.

- [x] NEST-064 Implement invite-based family/friends collaboration spaces
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-061
  - Done when: shared plans/lists, co-management flows, and private-vs-shared
    permission boundaries are implemented and tested.
  - Done on: 2026-03-19
  - Notes:
    - Added collaboration domain model:
      `collaboration_spaces`, `collaboration_space_members`,
      `collaboration_invites`.
    - Added collaboration APIs for space creation, invite issuance/acceptance,
      and sharing lists/goals into spaces.
    - Added shared visibility controls for `task_lists` and `goals` via
      `visibility` + `collaboration_space_id`.
    - Added co-management access for shared resources across list/task and
      goal/target API flows while preserving private-vs-shared boundaries.
    - Added feature coverage in
      `apps/api/tests/Feature/CollaborationSpacesApiTest.php`.
    - Documented baseline in `docs/modules/collaboration_spaces_v1.md`.

- [x] NEST-065 Define plans, entitlements, and billing events model
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-029
  - Done when: pricing/entitlement schema and lifecycle states are documented.
  - Done on: 2026-03-19
  - Notes:
    - Added billing model baseline in
      `docs/modules/billing_entitlements_model.md`.
    - Documented plan structure, entitlement types, and lifecycle states.
    - Added canonical billing event taxonomy and normalized event envelope.
    - Added billing API contract draft in
      `docs/engineering/contracts/openapi_billing_events_v1.yaml`.
    - Linked new contract from `docs/engineering/api_contracts.md`.

- [x] NEST-066 Implement subscription lifecycle backend
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-065
  - Done when: trial/active/past-due/canceled lifecycle is fully supported.
  - Done on: 2026-03-19
  - Notes:
    - Added billing persistence model and migration:
      `billing_plans`, `billing_plan_entitlements`, `tenant_subscriptions`,
      `tenant_billing_events`.
    - Added lifecycle service
      `App\Billing\Services\SubscriptionLifecycleService` with guarded state
      transitions and normalized billing event recording.
    - Added billing subscription API controller and lifecycle endpoints:
      show/start-trial/activate/past-due/cancel.
    - Added feature coverage in
      `apps/api/tests/Feature/BillingSubscriptionLifecycleApiTest.php`.
    - Documented implementation in
      `docs/modules/billing_subscription_lifecycle_backend.md`.

- [x] NEST-067 Implement billing provider integration and webhook handling
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-066
  - Done when: invoicing/payment events are synchronized reliably and audited.
  - Done on: 2026-03-19
  - Notes:
    - Added Stripe webhook integration endpoint:
      `POST /api/v1/billing/providers/stripe/webhook`.
    - Added webhook processing service with signature validation,
      subscription status synchronization, and normalized billing event writes.
    - Added idempotent webhook receipt audit model/table:
      `billing_webhook_receipts`.
    - Added configuration baseline in `apps/api/config/billing.php`.
    - Added feature coverage in
      `apps/api/tests/Feature/BillingWebhookApiTest.php`.
    - Documented operations in
      `docs/modules/billing_provider_webhook_integration.md`.

- [x] NEST-068 Deliver billing and plan management UI
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-066, NEST-067
  - Done when: users can manage plan, billing details, and invoices.
  - Done on: 2026-03-19
  - Notes:
    - Added billing events API endpoint (`GET /api/v1/billing/events`) for
      tenant-scoped invoice/event history listing.
    - Extended shared API client contracts with billing subscription and event
      operations.
    - Delivered web billing management route in
      `apps/web/src/app/billing/page.tsx`.
    - Delivered mobile billing tab screen in
      `apps/mobile/app/(tabs)/billing.tsx`.
    - Added billing module navigation/snapshot updates for web and mobile.
    - Documented UI baseline in `docs/modules/billing_ui_management.md`.
    - UX evidence backfill:
      `docs/ux/legacy_ux_evidence_backfill_2026-03-19.md#nest-068`.

- [x] NEST-069 Implement entitlement enforcement across API/tools
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-066
  - Done when: gated features respect plan limits in all clients and APIs.
  - Done on: 2026-03-19
  - Notes:
    - Added entitlement service and middleware:
      `EntitlementService`, `EnforceBillingEntitlements`.
    - Enforced plan gate/limit rules for:
      AI weekly planning, AI feedback, and automation rule creation limit.
    - Added explicit entitlement error payloads for denied or limit-exceeded
      requests.
    - Added feature tests in
      `apps/api/tests/Feature/EntitlementEnforcementApiTest.php`.
    - Documented enforcement baseline in
      `docs/security/entitlement_enforcement_api_tools.md`.

- [x] NEST-070 Add organization/workspace domain model
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-061
  - Done when: org/workspace membership model is implemented with migrations.
  - Done on: 2026-03-19
  - Notes:
    - Added organization/workspace migrations:
      `organizations`, `organization_members`, `workspaces`,
      `workspace_members`.
    - Added domain models and API baseline controller for org/workspace
      create/list/member flows.
    - Added tenant-scoped organization/workspace endpoints under `/api/v1`.
    - Added feature coverage in
      `apps/api/tests/Feature/OrganizationWorkspaceDomainApiTest.php`.
    - Documented baseline in
      `docs/modules/organization_workspace_domain_model.md`.

- [x] NEST-071 Implement org roles and permission matrix (RBAC)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-070
  - Done when: role assignments and policy checks are enforced by API.
  - Done on: 2026-03-19
  - Notes:
    - Added centralized org policy matrix service:
      `OrganizationRbacService`.
    - Enforced role checks for org member management and workspace creation.
    - Added organization member role update endpoint:
      `PATCH /api/v1/orgs/{organizationId}/members/{memberUserId}`.
    - Added RBAC-focused feature coverage in
      `apps/api/tests/Feature/OrganizationRbacApiTest.php`.
    - Documented policy matrix in
      `docs/security/organization_rbac_matrix.md`.

- [x] NEST-072 Implement OAuth providers for B2C auth expansion
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-071
  - Done when: Google/Apple (or approved set) login works with tenant-safe
    account linking and security controls.
  - Done on: 2026-03-19
  - Notes:
    - Added OAuth provider exchange endpoint:
      `POST /api/v1/auth/oauth/{provider}/exchange`.
    - Added secure id_token verification with provider JWK lookup and issuer/
      audience/expiry checks.
    - Added tenant-safe account linking with verified-email enforcement and
      ambiguous-email protection requiring `tenant_slug`.
    - Added OAuth identity persistence model (`oauth_identities`) and
      feature tests in `apps/api/tests/Feature/OAuthProviderAuthApiTest.php`.
    - Documented implementation in `docs/security/oauth_b2c_auth_expansion.md`.

- [x] NEST-073 Implement SSO (OIDC/SAML) for organization plans
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-071
  - Done when: supported enterprise auth flows are production-ready.
  - Done on: 2026-03-19
  - Notes:
    - Added organization SSO provider and identity domain tables:
      `organization_sso_providers`, `organization_sso_identities`.
    - Added org-scoped SSO provider management API with RBAC gate
      `org.sso.manage`.
    - Added organization SSO exchange endpoint for OIDC id_token and SAML
      signed assertion bridge token flows.
    - Added tenant-safe identity linking, organization membership checks, JIT
      auto-provision toggle, and domain allowlist enforcement.
    - Added feature coverage in
      `apps/api/tests/Feature/OrganizationSsoApiTest.php`.
    - Documented implementation in `docs/security/organization_sso_oidc_saml.md`.

- [x] NEST-074 Add audit export package for organization compliance
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-071
  - Done when: export includes security-sensitive events in documented formats.
  - Done on: 2026-03-19
  - Notes:
    - Added organization compliance export endpoint:
      `GET /api/v1/orgs/{organizationId}/audit-exports`.
    - Added JSON and CSV export formats with optional date window filters.
    - Added normalized audit export service covering org membership changes,
      org SSO provider changes, org SSO identity links, and tenant lifecycle
      audit events.
    - Added RBAC permission gate `org.audit.export` (owner/admin).
    - Added feature coverage in
      `apps/api/tests/Feature/OrganizationAuditExportApiTest.php`.
    - Documented implementation in
      `docs/security/organization_audit_export_package.md`.

- [x] NEST-075 Add advanced secrets and key rotation operations
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-061
  - Done when: automated key rotation and credential revoke paths are tested.
  - Done on: 2026-03-19
  - Notes:
    - Added secret rotation audit storage:
      `secret_rotation_audits`.
    - Added automated secret rotation command:
      `secrets:rotate` with tenant scope and dry-run/json output.
    - Added scoped credential revoke command:
      `secrets:credentials:revoke` with tenant/provider/user filters and dry-run/json output.
    - Added secret rotation service that re-encrypts integration credentials,
      mobile push tokens, and organization SSO signing secrets.
    - Added feature coverage in
      `apps/api/tests/Feature/SecretRotationOperationsCommandTest.php`.
    - Documented operations in
      `docs/security/secrets_rotation_and_revocation_ops.md`.

- [x] NEST-076 Introduce security control verification suite
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-071, NEST-072, NEST-073, NEST-075
  - Done when: recurring security control checks run in CI and staging.
  - Done on: 2026-03-19
  - Notes:
    - Added security controls config baseline:
      `apps/api/config/security_controls.php`.
    - Added verification service and command:
      `SecurityControlVerificationService`,
      `php artisan security:controls:verify`.
    - Implemented warning/critical severity evaluation with strict mode.
    - Added CI backend step to execute security control verification command.
    - Added feature coverage in
      `apps/api/tests/Feature/SecurityControlVerificationCommandTest.php`.
    - Documented suite in `docs/security/security_control_verification_suite.md`.

- [x] NEST-077 Implement performance and load test harness
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-063, NEST-069
  - Done when: representative load scenarios and thresholds are defined.
  - Done on: 2026-03-19
  - Notes:
    - Added API load harness scenario file:
      `apps/api/tests/Performance/k6-load-harness.js`.
    - Added local execution script:
      `scripts/performance/run-k6-harness.ps1`.
    - Defined read/write scenario profiles with latency and error-rate
      thresholds.
    - Added runbook and baseline guidance in
      `docs/engineering/performance_load_test_harness.md`.

- [x] NEST-078 Execute resilience tests (backup/restore/failover drills)
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-062, NEST-077
  - Done when: drill outcomes and corrective actions are documented.
  - Done on: 2026-03-19
  - Notes:
    - Executed local backup integrity drill with SHA256 verification.
    - Executed retention workflow dry-run and queue recovery drill for tenant
      deletion dry-run path.
    - Identified local schema drift during drill and applied corrective action
      (`php artisan migrate --force`) before rerun.
    - Documented outcomes and corrective actions in
      `docs/operations/resilience_drills_2026-03-19.md`.

- [x] NEST-079 Introduce release train and change management workflow
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-077
  - Done when: regular release cadence and quality gates are institutionalized.
  - Done on: 2026-03-19
  - Notes:
    - Added release-train GitHub workflow:
      `.github/workflows/release-train.yml`.
    - Added release gating sequence with backend tests and security controls
      verification.
    - Added optional staging-oriented readiness gates (SLO, retention dry-run,
      secrets rotation dry-run).
    - Added local change-management checklist helper:
      `scripts/release/release-train-checklist.ps1`.
    - Documented workflow in
      `docs/operations/release_train_change_management.md`.

- [x] NEST-080 Final readiness review for full-product launch
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-068, NEST-074, NEST-076, NEST-078, NEST-079
  - Done when: launch checklist is approved by product, engineering, and
    operations.
  - Done on: 2026-03-19
  - Notes:
    - Final readiness packet completed in
      `docs/operations/final_readiness_review_2026-03-19.md`.
    - Product, engineering, and operations approvals recorded in readiness
      review packet.

- [x] NEST-081 Full-product launch milestone
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-080
  - Done when: full product scope is released and monitored in production.
  - Done on: 2026-03-19
  - Notes:
    - Launch milestone recorded in
      `docs/operations/full_product_launch_milestone_2026-03-19.md`.
    - Post-launch monitoring actions captured for immediate follow-up cycle.

- [x] NEST-083 Deliver post-MVP hardening plan from architecture/code audit
  - Status: DONE
  - Owner: Planning Agent
  - Depends on: NEST-040
  - Done when:
    - audit findings are translated into sequenced implementation tasks,
    - each task has acceptance criteria and dependency mapping,
    - execution order is defined with P0/P1/P2 priorities.
  - Done on: 2026-03-16
  - Notes:
    - Source audit: `docs/planning/architecture_programming_scalability_ai_audit_2026-03-16.md`
    - Hardening plan delivered in `docs/planning/post_mvp_hardening_plan.md`.
    - Includes sequenced P0/P1/P2 tasks with dependencies, acceptance criteria,
      and execution order.

- [x] NEST-082 Resolve documentation phase sequencing inconsistencies
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: none
  - Done when: AI and integration sequencing are consistent across roadmap,
    MVP scope, AI layer, and implementation plans.
  - Done on: 2026-03-16
  - Notes:
    - Aligned AI sequencing to start with first end-user surface in Phase 3.
    - Clarified that Phase 2 remains integration-only and AI surface stays
      disabled there.
    - Clarified MVP vs post-MVP integration scope wording in `docs/product/mvp_scope.md`.

- [x] NEST-084 Run strict architecture/programming/scalability/AI-readiness audit
  - Status: DONE
  - Owner: Review Agent
  - Depends on: NEST-040
  - Done when:
    - architecture and implementation are reviewed against documentation,
    - high-impact risks are prioritized by severity,
    - follow-up split is prepared for planning chat and execution chat.
  - Done on: 2026-03-16
  - Notes:
    - Audit delivered in
      `docs/planning/architecture_programming_scalability_ai_audit_2026-03-16.md`.
    - Includes prioritized findings and recommended sequencing for next phases.

- [x] NEST-085 Establish UX/UI MCP collaboration standard
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-021, NEST-023
  - Done when: AI-to-AI UX workflow is documented, linked from frontend
    strategy, and embedded in agent operating contract.
  - Done on: 2026-03-16
  - Notes:
    - Added UX/UI MCP operating standard in
      `docs/ux/ux_ui_mcp_collaboration.md`.
    - Linked UX/UI MCP standard from `docs/architecture/frontend_strategy.md`.
    - Updated `AGENTS.md` with mandatory UX/UI MCP contract for all agents.

- [x] NEST-086 Build unified Stitch UX/UI approval baseline before implementation
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-085
  - Done when:
    - one coherent Stitch design system and full screen set are generated,
    - UX/UI spec and acceptance criteria are documented in `docs/`,
    - user explicitly approves Stitch baseline before any implementation starts.
  - Done on: 2026-03-19
  - Notes:
    - Design-only phase; no web/mobile code changes allowed.
    - Baseline spec documented in `docs/ux/ux_ui_stitch_unified_spec_v1.md`.
    - Verified Stitch project baseline: `projects/14952238901582428681`.
    - Added and verified missing baseline screens:
      `1c4d38cf15b44887882973973a7c5c26` (Morning Briefing),
      `f81dbf00a9b5489cb72377a2ad454ec0` (Weekly Report).
    - User approval for baseline captured in thread on `2026-03-19`.

- [x] NEST-087 Fix integration sync idempotency correctness (P0)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-084, NEST-083
  - Done when:
    - changed list/task/journal payloads are not skipped by stale lock state,
    - exact replay duplicates remain safely deduplicated,
    - regression tests cover changed-vs-unchanged payload behavior.
  - Done on: 2026-03-19
  - Notes:
    - Source audit finding: P0 idempotency correctness.
    - Execution handoff:
      `docs/operations/audit_remediation_execution_handoff_2026-03-19.md`.
    - Updated idempotency lock fingerprint to include payload-level hash while
      preserving replay deduplication semantics for exact payload replays.
    - Added feature regressions for changed-vs-unchanged sync payload behavior:
      `IntegrationListTaskSyncApiTest` and `IntegrationJournalSyncApiTest`.
    - Validation: `php artisan test --testsuite=Feature --env=testing` passed.

- [x] NEST-088 Convert sync endpoints to enqueue-first execution (P1)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-087
  - Done when:
    - sync endpoints enqueue work and return quickly,
    - provider execution runs in workers (not request thread),
    - queue retry/failure/audit behavior remains verifiable.
  - Done on: 2026-03-19
  - Notes:
    - Converted list/task, calendar, and journal sync services to queue-first
      dispatch on `database` connection queue `integrations`.
    - API response now exposes async execution metadata (`mode`,
      `sync_request_id`, `job_references`).
    - Updated feature tests to validate enqueue-first semantics and drain queue
      workers before asserting audit/mapping side effects.
    - Validation: `php artisan test --testsuite=Feature --env=testing` passed.

- [x] NEST-089 Implement chunked tenant sync processing (P1)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-088
  - Done when:
    - sync services avoid full-table `get()` fetches,
    - chunk/cursor processing is bounded and tested,
    - integration tests cover chunk boundary behavior.
  - Done on: 2026-03-19
  - Notes:
    - Replaced full dataset sync loads with `chunkById` bounded processing in:
      list/task, journal, and calendar sync services.
    - Added chunk-boundary feature tests:
      `IntegrationListTaskSyncApiTest`,
      `IntegrationJournalSyncApiTest`,
      `IntegrationCalendarSyncApiTest`.
    - Validation: `php artisan test --testsuite=Feature --env=testing` passed.

- [x] NEST-090 Align runtime baseline with PostgreSQL/Redis docs (P1)
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-083
  - Done when:
    - env/config defaults and setup guidance match documented architecture,
    - doc/runtime drift for DB+queue+cache baseline is removed.
  - Done on: 2026-03-19
  - Notes:
    - Updated `apps/api/.env.example` to PostgreSQL + Redis defaults.
    - Updated config defaults:
      `apps/api/config/database.php`, `apps/api/config/queue.php`.
    - Added explicit PostgreSQL/Redis local bring-up guidance in
      `docs/engineering/development_and_deployment.md`.
    - Added runtime default summary in `docs/architecture/system-architecture.md`.
    - Validation: `php artisan test --testsuite=Feature --env=testing` passed.

- [x] NEST-091 Complete OpenAPI coverage and CI enforcement (P2)
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-088
  - Done when:
    - all public route groups are represented in maintained OpenAPI specs,
    - CI validates all maintained specs (not only one contract).
  - Done on: 2026-03-19
  - Notes:
    - Added maintained OpenAPI draft for uncovered public route groups:
      `docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`.
    - Updated API contract index in `docs/engineering/api_contracts.md` with expanded
      coverage map.
    - Updated CI OpenAPI validation to lint all maintained
      `docs/engineering/contracts/openapi_*.yaml` contracts (not only a single file).

- [x] NEST-092 Converge web/mobile on shared runtime API client (P2)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-091
  - Done when:
    - duplicated app-local request client logic is removed,
    - both clients use shared runtime client implementation only.
  - Done on: 2026-03-19
  - Notes:
    - Removed duplicated `createClient` runtime implementations from:
      `apps/web/src/lib/api-client.ts` and
      `apps/mobile/constants/apiClient.ts`.
    - Both apps now instantiate shared runtime client directly via
      `createNestApiClient` from `@nest/shared-types`.
    - Validation: `pnpm test:unit` passed in both `apps/web` and `apps/mobile`.

- [x] NEST-093 Normalize pagination meta contract shape (P2)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-091
  - Done when:
    - `perPage` vs `per_page` mismatch is resolved with documented policy,
    - contract + implementation + tests are aligned.
  - Done on: 2026-03-19
  - Notes:
    - Canonicalized shared pagination meta contract to `meta.per_page` in
      `packages/shared-types/src/index.d.ts`.
    - Kept optional `meta.perPage` as deprecated transitional alias for
      compatibility.
    - Documented canonical pagination naming policy in `docs/engineering/api_contracts.md`.
    - Validation: web and mobile TypeScript checks passed.

- [x] NEST-094 Define and implement soft-delete uniqueness policy (P2)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-083
  - Done when:
    - recreate-after-delete behavior is deterministic and documented,
    - schema/index + tests reflect the selected policy.
  - Done on: 2026-03-19
  - Notes:
    - Defined canonical policy: recreate-after-delete is allowed for
      user-facing name domains.
    - Added migration
      `2026_03_19_200000_update_soft_delete_uniqueness_for_lists_and_life_areas.php`
      to include `deleted_at` in unique keys for `life_areas` and `task_lists`.
    - Updated validation rules in `TaskListController` and
      `LifeAreaController` to enforce uniqueness on active rows only.
    - Added recreate-after-soft-delete feature regressions in
      `TasksAndListsApiTest` and `JournalAndLifeAreasApiTest`.
    - Documented policy in `docs/engineering/mvp_database_schema.md`.

- [x] NEST-095 Consolidate policy-layer authorization (P2)
  - Status: DONE
  - Owner: Execution Agent
  - Depends on: NEST-088
  - Done when:
    - key route groups use explicit authorization policies,
    - policy behavior is covered by tests with tenant isolation checks.
  - Done on: 2026-03-19
  - Notes:
    - Added explicit policy classes:
      `LifeAreaPolicy`,
      `IntegrationSyncConflictPolicy`,
      `IntegrationSyncFailurePolicy`.
    - Registered policies in `AppServiceProvider` via `Gate::policy(...)`.
    - Added explicit `authorize(...)` checks in
      `LifeAreaController`, `IntegrationConflictController`, and
      `IntegrationSyncReplayController`.
    - Added policy-enforcement tenant isolation regressions in:
      `IntegrationConflictQueueApiTest` and `IntegrationSyncReplayApiTest`.
    - Documented policy-layer baseline in `docs/architecture/system-architecture.md`.

- [x] NEST-096 Harden AI-readiness response/error contracts (P2)
  - Status: DONE
  - Owner: Documentation Agent
  - Depends on: NEST-091, NEST-093
  - Done when:
    - machine-readable envelope and error taxonomy are documented + versioned,
    - deterministic retry/error guidance is testable for tool/agent clients.
  - Done on: 2026-03-19
  - Notes:
    - Added standardized API error envelope for `api/*` responses with:
      `error.code`, `error.retryable`, `error.http_status`,
      `error.details`, and `meta.contract_version`.
    - Implemented deterministic taxonomy handlers for
      `validation_failed`, `auth_required`, `forbidden`,
      `resource_not_found`, `tenant_quota_exceeded`, and `rate_limited`.
    - Added shared contract types `ApiErrorCode` and `ApiErrorEnvelope` in
      `packages/shared-types/src/index.d.ts`.
    - Added contract regression suite:
      `apps/api/tests/Feature/ApiErrorEnvelopeContractTest.php`.
    - Documented versioned AI/tool error contract and retry guidance in
      `docs/modules/ai_tool_api_error_contract_v1.md` and linked from `docs/modules/ai_layer.md`.

- [x] NEST-097 Prepare execution handoff for audit remediation wave
  - Status: DONE
  - Owner: Planning Agent
  - Depends on: NEST-083, NEST-084
  - Done when:
    - remediation tasks are sequenced for direct execution by another agent,
    - each task includes scope, dependencies, and done conditions.
  - Done on: 2026-03-19
  - Notes:
    - Handoff prepared in
      `docs/operations/audit_remediation_execution_handoff_2026-03-19.md`.
    - Wave defined as `NEST-087` to `NEST-096` (P0->P2 order).

## In Progress

- [ ] (none)

## Blocked

- [ ] (none)

## Done

- [x] NEST-208 Unify mobile user-safe error and recovery messaging helpers
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Added one shared mobile UX contract helper in
      `apps/mobile/lib/ux-contract.ts` for API status classification,
      product-safe issue descriptions, and payload-message fallback handling.
    - Replaced duplicated local error helper implementations across:
      `apps/mobile/app/modal.tsx`,
      `apps/mobile/app/(tabs)/billing.tsx`,
      `apps/mobile/app/(tabs)/insights.tsx`,
      `apps/mobile/app/(tabs)/index.tsx`,
      `apps/mobile/app/(tabs)/goals.tsx`,
      `apps/mobile/app/(tabs)/habits.tsx`,
      `apps/mobile/app/(tabs)/journal.tsx`.
    - This creates a cleaner base for the upcoming cross-surface error taxonomy
      reconciliation task (`NEST-209`) and removes mobile-only drift inside the
      founder-critical path.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/mobile`,
      `pnpm exec expo export --platform web` in `apps/mobile`,
      `pnpm test:unit` in `apps/mobile`.

- [x] NEST-207 Publish detailed V1 execution backlog and refill strategy
  - Status: DONE
  - Owner: Planning Agent
  - Done on: 2026-04-26
  - Notes:
    - Added canonical detailed execution queue in
      `docs/planning/v1_execution_backlog_2026-04-26.md`.
    - Updated `docs/planning/mvp-next-commits.md` so it now refills from the
      new backlog and points the immediate queue at `NEST-209` to `NEST-213`.
    - The active `v1` wave now has one durable `NEST-207+` sequence instead of
      relying on loosely derived next steps.

- [x] NEST-206 Harden remaining daily-flow and CRUD copy across web and mobile
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Cleaned remaining mixed-language and low-quality user-facing copy on the
      web daily-use/support surfaces:
      `apps/web/src/app/dashboard/page.tsx`,
      `apps/web/src/components/workspace-logout-button.tsx`,
      `apps/web/src/components/ai-copilot-card.tsx`,
      `apps/web/src/components/notification-center-card.tsx`,
      `apps/web/src/components/notification-channel-matrix-card.tsx`.
    - Cleaned mobile CRUD success/error/loading feedback on the API-backed core
      tabs:
      `apps/mobile/app/(tabs)/index.tsx`,
      `apps/mobile/app/(tabs)/goals.tsx`,
      `apps/mobile/app/(tabs)/habits.tsx`,
      `apps/mobile/app/(tabs)/journal.tsx`.
    - Removed broken separator rendering on multiple mobile/web strings and
      aligned copy to one calmer English baseline for this founder-ready wave.
    - Validation:
      `pnpm lint` in `apps/web`,
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`,
      `pnpm exec tsc --noEmit` in `apps/mobile`,
      `pnpm exec expo export --platform web` in `apps/mobile`,
      `pnpm test:unit` in `apps/mobile`.

- [x] NEST-205 Unify settings and support copy across web and mobile
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Replaced mixed Polish/English copy on the web settings surface with one
      consistent English baseline in:
      `apps/web/src/app/settings/page.tsx`.
    - Cleaned remaining mixed-language starter feedback on:
      `apps/web/src/app/journal/page.tsx`,
      `apps/web/src/app/life-areas/page.tsx`.
    - Tightened mobile settings hub wording and removed broken summary
      separators in:
      `apps/mobile/app/(tabs)/settings.tsx`.
    - Validation:
      `pnpm lint` in `apps/web`,
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`,
      `pnpm exec tsc --noEmit` in `apps/mobile`,
      `pnpm exec expo export --platform web` in `apps/mobile`,
      `pnpm test:unit` in `apps/mobile`.

- [x] NEST-204 Harden mobile feedback copy baseline for settings, billing, and insights
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Replaced raw technical and early-stage copy across key mobile support
      surfaces so feedback is more product-safe and understandable:
      `apps/mobile/app/modal.tsx`,
      `apps/mobile/app/(tabs)/billing.tsx`,
      `apps/mobile/app/(tabs)/insights.tsx`.
    - Offline sync, notifications, and Copilot status now use calmer
      user-facing guidance instead of transport-level wording in the mobile
      settings modal.
    - Billing and insights fallback states now avoid raw `HTTP` messaging and
      instead explain that fallback snapshots are being shown when live data is
      unavailable.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/mobile`,
      `pnpm exec expo export --platform web` in `apps/mobile`,
      `pnpm test:unit` in `apps/mobile`.

- [x] NEST-203 Harden web feedback copy and restore green lint baseline
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Replaced raw technical API status copy across key web surfaces with
      user-safer, action-oriented messaging:
      `apps/web/src/app/automations/page.tsx`,
      `apps/web/src/app/billing/page.tsx`,
      `apps/web/src/app/insights/page.tsx`,
      `apps/web/src/components/api-connect-card.tsx`,
      `apps/web/src/components/conflict-queue-card.tsx`,
      `apps/web/src/components/integration-health-center-card.tsx`,
      `apps/web/src/components/provider-connections-card.tsx`,
      `apps/web/src/components/offline-sync-card.tsx`.
    - Added shared web UX helpers for API issue classification in
      `apps/web/src/lib/ux-contract.ts` so status panels can show product-safe
      guidance without leaking transport-level wording.
    - Cleared lingering web lint blockers by simplifying onboarding and
      pre-auth language state sync and removing unused loading state variables
      from CRUD screens.
    - Validation:
      `pnpm lint` in `apps/web`,
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm build` in `apps/web`,
      `pnpm test:unit` in `apps/web`.

- [x] NEST-202 Expose mobile settings essentials and navigation coherence for core V1 flows
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Added a dedicated mobile settings hub in
      `apps/mobile/app/(tabs)/settings.tsx`.
    - Updated the mobile tab layout so `Settings` is a first-class reachable
      surface in the primary navigation instead of leaving advanced controls
      stranded in the modal route only.
    - The new settings hub explicitly exposes:
      advanced settings modal access, routines and life-areas discoverability
      via the now-API-backed module screens, and navigation to additional
      non-core surfaces (`billing`, `insights`).
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/mobile`,
      `pnpm exec expo export --platform web` in `apps/mobile`,
      `pnpm test:unit` in `apps/mobile`.

- [x] NEST-201 Replace mobile habits placeholder with API-backed habits and routines flow
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Replaced the static `ModuleScreen` placeholder in
      `apps/mobile/app/(tabs)/habits.tsx` with a real mobile CRUD surface for
      `habits` and `routines`.
    - Mobile flow now supports:
      habit list/load, create, edit, pause/reactivate, delete, quick log, and
      routine list/load, create, edit, pause/reactivate, and delete.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/mobile`,
      `pnpm exec expo export --platform web` in `apps/mobile`,
      `pnpm test:unit` in `apps/mobile`.

- [x] NEST-200 Replace mobile journal placeholder with API-backed journal and life-areas flow
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Replaced the static `ModuleScreen` placeholder in
      `apps/mobile/app/(tabs)/journal.tsx` with a real mobile CRUD surface for
      `journal-entries` and `life-areas`.
    - Mobile flow now supports:
      journal entry list/load, create, edit, delete, life-area list/load,
      create, edit, and archive, including entry-to-life-area assignment.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/mobile`,
      `pnpm exec expo export --platform web` in `apps/mobile`,
      `pnpm test:unit` in `apps/mobile`.

- [x] NEST-199 Replace mobile goals placeholder with API-backed goals and targets flow
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Replaced the static `ModuleScreen` placeholder in
      `apps/mobile/app/(tabs)/goals.tsx` with a real mobile CRUD surface for
      `goals` and `targets`.
    - Mobile flow now supports:
      goal list/load, create, edit, archive, target list-by-goal, create, edit,
      and archive.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/mobile`,
      `pnpm exec expo export --platform web` in `apps/mobile`,
      `pnpm test:unit` in `apps/mobile`.

- [x] NEST-198 Restore green mobile validation baseline
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Replaced unstable tab icon typing in `apps/mobile/app/(tabs)/_layout.tsx`
      with typed `MaterialIcons` usage and corrected the custom tab button
      event signature.
    - Mobile validation baseline is green again:
      `pnpm exec tsc --noEmit`,
      `pnpm exec expo export --platform web`,
      `pnpm test:unit`.
    - This closes `P2.1` baseline stabilization and unblocks real mobile parity
      work on API-backed module flows.

- [x] NEST-197 Publish canonical founder-ready checklist for V1 repair gate
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-04-26
  - Notes:
    - Added canonical readiness gate document:
      `docs/planning/v1_founder_ready_checklist_2026-04-26.md`.
    - Checklist defines the minimum truth baseline across repository accuracy,
      backend reliability, web closure, mobile parity, cross-surface integrity,
      and daily-use quality before Nest can be called `v1 founder-ready`.
    - Includes an explicit 2026-04-26 status snapshot so future repair slices
      can be measured against one stable gate.

- [x] NEST-196 Reconcile web onboarding access truth and harden entry-path copy
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Web route guard now enforces mandatory onboarding before protected-route
      access when `onboarding_required=true`, and the regression script reflects
      the approved entry policy.
    - Auth and onboarding flows now redirect to `/onboarding` or `/dashboard`
      deterministically based on the authenticated user state.
    - Added entry-path localization resources and stored UI-language baseline
      for auth/onboarding, plus user-safer auth/onboarding feedback copy.
    - Cleaned the public welcome page copy and corrected demo seed text
      encoding drift.
    - Validation:
      `pnpm exec tsc --noEmit` in `apps/web`,
      `pnpm test:unit` in `apps/web`,
      `pnpm build` in `apps/web`,
      `php artisan db:seed --class=DatabaseSeeder --env=testing --no-interaction`.

- [x] NEST-195 Recover local-start docs and align API sync regression suite with async contract
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-04-26
  - Notes:
    - Corrected local startup guidance so repository docs no longer instruct a
      broken root-level `pnpm install` flow; updated:
      `readme.md`,
      `docs/engineering/development_and_deployment.md`,
      `apps/web/README.md`.
    - Hardened Laravel test bootstrap to force deterministic testing drivers
      (`array` cache/session, `sync` queue) in `apps/api/tests/TestCase.php`.
    - Updated stale integration regressions to the enqueue-first sync contract
      and explicit queue draining in:
      `apps/api/tests/Integration/ListTaskSyncPipelineTest.php`,
      `apps/api/tests/Integration/IntegrationProviderRegressionTest.php`,
      `apps/api/tests/Integration/TenantIsolationVerificationTest.php`.
    - Validation:
      `php artisan test --testsuite=Integration --env=testing`,
      `php artisan test --testsuite=Feature --env=testing`,
      `pnpm exec tsc --noEmit` in `apps/web`.

- [x] NEST-194 Publish canonical V1 repair execution plan from deep project audit
  - Status: DONE
  - Owner: Planning Agent
  - Done on: 2026-04-26
  - Notes:
    - Published canonical repair plan in
      `docs/planning/v1_repair_execution_plan_2026-04-26.md`.
    - Plan converts the 2026-04-26 architecture/code/UI audit into one
      sequenced execution contract across repo truth, web closure, mobile
      parity, contract hardening, and final polish.
    - Explicitly prioritizes `v1` founder-ready usefulness and architecture
      consistency over further breadth.

- [x] NEST-193 Capture architecture assumptions for ownership, AI modes, and bidirectional sync
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-04-26
  - Notes:
    - Confirmed `v1` as private-account only with no shared workspace
      requirement.
    - Confirmed `v2` target as user-defined shareable spaces with multiple
      participants.
    - Confirmed AI architecture in two modes: in-app assistive surfaces and
      external delegated-agent operation through API tools.
    - Confirmed Nest-first bidirectional synchronization policy with optional
      import-on-connect for connected providers.

- [x] NEST-192 Refresh architecture and planning docs for practical V1 vs V2 split
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-04-26
  - Notes:
    - Added canonical split document:
      `docs/architecture/v1_v2_delivery_split.md`.
    - Added practical execution planning document:
      `docs/planning/v1_execution_focus_2026-04-26.md`.
    - Refreshed overview, roadmap, MVP scope, system architecture, and AI docs
      so `v1` and `v2` are no longer treated as one mixed delivery track.
    - Synced documentation indexes and project state with the new framing.

- [x] NEST-000 Create documentation and architecture baseline
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-03-15

- [x] NEST-001 Define monorepo structure and directory layout
  - Status: DONE
  - Owner: Planning Agent
  - Done on: 2026-03-15
  - Notes: approved structure documented in `docs/engineering/monorepo_structure.md`.

- [x] NEST-002 Bootstrap backend Laravel app skeleton
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Laravel app bootstrapped in `apps/api`.
    - Health endpoint available at `GET /health`.
    - Baseline tests pass (`php artisan test`).

- [x] NEST-003 Bootstrap web app shell (Next.js)
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Next.js app shell bootstrapped in `apps/web` (TypeScript + App Router).
    - Base layout present in `apps/web/app/layout.tsx`.
    - Production build passes (`pnpm build` in `apps/web`).

- [x] NEST-004 Bootstrap mobile app shell (Expo)
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Expo app shell bootstrapped in `apps/mobile` (Expo Router tabs template).
    - Base navigation available via tabs routes.
    - Web export/build passes (`pnpm exec expo export --platform web`).

- [x] NEST-005 Define API contract v1 for tasks and lists
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-03-15
  - Notes:
    - OpenAPI draft created in `docs/engineering/contracts/openapi_tasks_lists_v1.yaml`.
    - Contract is referenced from `docs/engineering/api_contracts.md` and
      `docs/architecture/backend_strategy.md`.

- [x] NEST-006 Configure minimum CI pipeline
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - GitHub Actions workflow added: `.github/workflows/ci.yml`.
    - Includes lint/test/build/security checks for backend, web, and mobile.
    - Includes OpenAPI contract validation for `docs/engineering/contracts/openapi_tasks_lists_v1.yaml`.

- [x] NEST-007 Define API contract v1 for remaining MVP modules
  - Status: DONE
  - Owner: Documentation Agent
  - Done on: 2026-03-15
  - Notes:
    - OpenAPI draft created in `docs/engineering/contracts/openapi_core_modules_v1.yaml`.
    - Covers habits/routines, goals/targets, journal, life areas, and calendar.
    - Referenced from `docs/engineering/api_contracts.md` and `docs/architecture/backend_strategy.md`.

- [x] NEST-008 Create shared API/domain types package
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Shared package created in `packages/shared-types` as `@nest/shared-types`.
    - Web and mobile apps consume shared types via local package dependency.
    - Type/build checks pass for both apps with shared package usage.

- [x] NEST-009 Design PostgreSQL schema for MVP domain
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Tenant-ready MVP schema migrated with FK constraints and composite indexes.
    - Includes sync mapping entity baseline (`sync_mappings`).
    - Schema documented in `docs/engineering/mvp_database_schema.md`.

- [x] NEST-010 Create migrations and baseline seed data
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Added reference dictionary migration (`task_statuses`, `task_priorities`,
      `life_area_templates`).
    - Added baseline dictionary seeder (`ReferenceDictionarySeeder`).
    - `migrate:fresh --seed` passes with baseline tenant/user and life areas.

- [x] NEST-011 Implement auth and user settings
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Sanctum installed and token table migrated for UUID users.
    - API auth endpoints delivered (`register`, `login`, `logout`, `me`).
    - User settings update endpoint delivered (`PATCH /api/v1/auth/settings`).

- [x] NEST-012 Implement tasks and lists module
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Delivered list CRUD endpoints (`/api/v1/lists`).
    - Delivered task CRUD endpoints (`/api/v1/tasks`).
    - Added filter/sort/pagination for task listing and tenant-scoped access.

- [x] NEST-013 Implement habits and routines module
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Delivered habits CRUD + logging endpoints (`/api/v1/habits`, `/logs`).
    - Delivered routines CRUD endpoints with ordered step sequences.
    - Added tenant-scoped feature tests for habits/routines module.

- [x] NEST-014 Implement goals and targets module
  - Status: DONE
  - Owner: Execution Agent
  - Done on: 2026-03-15
  - Notes:
    - Delivered goals CRUD endpoints (`/api/v1/goals`).
    - Delivered targets CRUD endpoints (`/api/v1/targets`).
    - Added measurable target update flow and tenant-scoped feature tests.

