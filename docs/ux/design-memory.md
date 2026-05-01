# Design Memory

## Approved Reuse Patterns

- Split-view workspace:
  Keep navigation or context visible while the active planning surface remains
  primary.
- Empty states:
  Explain what the module is for, what value starts after setup, and the next
  action to take.
- Dense desktop surfaces:
  Use hierarchy, grouping, and pinned context before adding more borders or
  isolated cards.

## Reuse Notes

- Prefer shared shell, spacing rhythm, and status treatment across tasks,
  habits, goals, calendar, and reflections.
- When a new UX pattern proves useful on both web and mobile, record it here.

## Dashboard Canonical Patterns (2026-04-26)

- Dashboard hero band:
  Use one editorial summary surface with progress, daily metrics, and calm
  emotional anchoring before secondary modules appear.
- Dominant next-action card:
  Put one clearly recommended `Now Focus` action above supporting panels so the
  user can decide what to do within seconds.
- Day-flow timeline:
  Structure the day as `Morning`, `Now`, `Evening` rather than one flat agenda
  list; visually emphasize `Now`.
- Warm reflection composer:
  Reflection and journal capture should feel human and inviting, not like a
  transactional form block.
- Quiet system context:
  Goals, life balance, and insights should appear as supporting context ribbons
  or compact summary cues, not equal-weight dashboard cards.

## Dashboard Parity Patterns (2026-04-26)

- Illustrated editorial hero:
  The hero should combine progress, guidance, and calm atmospheric art into one
  memorable first-glance composition rather than separating metrics into a
  generic summary card.
- Support rail stack:
  `Journal`, `Quick add`, and `Life areas` should live in one compact vertical
  support column with lighter, more intimate cards than the main work lane.
- Ceremonial day-flow:
  Daily planning should read as `Morning / Now / Evening` with a centered
  present-moment emphasis, not as three equal generic lists.
- Insight footer strip:
  Dashboard-like module surfaces benefit from one closing low-noise insight or
  guidance strip that ends the page with calm clarity.
- Mobile dashboard canonical order:
  Mobile Dashboard should stack header, `Today at a glance`, dominant
  `Now focus`, module nav, day-flow timeline, execution panels, reflection,
  quick add, life areas, and insight while preserving the same mental model as
  desktop.
- Showcase fallback:
  Canonical entry screens should preserve a premium visual composition even
  when the account is sparse or preview data is unavailable; fallback content
  may be presentation-oriented as long as it does not alter real stored data or
  fake write outcomes.

## Planning Canonical Patterns (2026-04-30)

- Planning room, not task app:
  The canonical Planning surface unifies `Tasks`, `Lists`, `Goals`, and
  `Targets` into one weekly orchestration room rather than splitting them into
  unrelated CRUD panels.
- Weekly direction hero:
  Planning should open with a strategic weekly direction band that mirrors the
  dashboard hero language while focusing on plan readiness instead of daily
  progress.
- Dominant `Now planning` card:
  The primary action is one recommended planning block. It should visually
  outrank the weekly flow, task board, and right-rail context.
- Relational task rows:
  Task rows should expose linked goal, target, and list context through compact
  chips so the user sees why a task matters.
- Planning ladder:
  Preserve the `Goal -> Target -> List -> Next task` strip as the canonical
  explanation of how long-term intent turns into daily action.
- Calm pressure rail:
  Right-rail cards should support clarity, quick add, and pressure awareness
  without becoming a generic analytics stack.
- Phase A implementation:
  The web Planning route now uses the canonical first viewport as the primary
  experience while keeping API-backed CRUD boards available below it. Preserve
  this structure in future refinements: weekly direction first, then planning
  flow and support rail, then relational rows and ladder before lower-level
  board controls.
- Workspace tab parity:
  The canonical Planning workspace panel should treat `Tasks`, `Lists`,
  `Goals`, and `Targets` as peers. Each tab needs relationship-aware rows and
  an entity-specific add action; do not let non-task tabs collapse back to
  generic helper text.
- Canonical creation ownership:
  Primary creation for Planning entities should happen inside the canonical
  workspace panel. Lower legacy/library panels may remain temporarily for edit,
  delete, and dense management, but duplicate add containers should not compete
  visually once inline canonical creation exists.
- Canonical row management:
  Real Planning rows should expose management actions in the canonical
  workspace itself. Keep the five-column reference rhythm; place subtle row
  tools under status instead of adding a sixth visible column. Presentation
  fallback rows must remain non-actionable.
- Canonical tool ownership:
  Task search, status/context/life-area filters, hide-empty-list controls,
  reset, and refresh should live inside the canonical Planning workspace before
  falling back to lower board utilities. Lower Kanban and dense library
  containers may remain for live advanced management, but preview mode should
  not let them compete with the founder-approved composition.
- Tab depth before legacy fallback:
  `Lists`, `Goals`, and `Targets` should each extend the canonical Planning
  story with their own contextual depth layer before the screen drops into
  legacy library surfaces. In preview mode, lower list/goal/target libraries
  should disappear once the canonical tab already carries enough meaning.
- Composer narrative matters:
  Canonical Planning composers should not feel like raw utility forms dropped
  into a polished screen. Give them a short narrative frame, one or two small
  context stats, and a quiet closing line so creation feels like part of the
  product story.
- Living planning polish:
  Gentle hover lift and subtle active-state sheen are allowed on canonical
  Planning surfaces when they respect reduced-motion preferences and do not
  distract from the calm weekly composition.
- Mobile planning canonical order:
  Mobile Planning should stack weekly direction, dominant `Now planning`, module
  nav, weekly planning flow, relational workspace tabs, clarity/quick-add/
  pressure support, and planning ladder. Do not carry lower legacy Kanban or
  preview error clutter into the canonical mobile target.

## Calendar Canonical Patterns (2026-04-30)

- Time map before grid:
  Calendar should open with `Today's time map` and day-load awareness before
  exposing detailed event navigation.
- Dominant `Now on deck` card:
  The clearest action is the next meaningful event, with time range, duration,
  focus/energy signal, and linked context.
- Day-flow timeline:
  Preserve `Morning / Now / Afternoon / Evening` as the primary browsing model;
  use week and date controls as orientation rather than the whole experience.
- Event intelligence:
  Selected events should expose source, sync state, privacy or ownership, linked
  goal/task/list context, and assignment timeline when available.
- Time ladder:
  Calendar should make the loop visible as `Goal -> Task/List -> Calendar event
  -> Reflection`, so scheduled time reads as part of LifeOS rather than an
  isolated block.
- Mobile calendar parity:
  Mobile should stack the same model: time map, now card, week strip, timeline,
  event intelligence, quick add, and sync/pressure support.
- Desktop calendar showcase fallback:
  When live calendar data is absent, preserve a dense canonical desktop story
  with believable week-strip, timeline, and support-rail content instead of
  leading with an error strip or lower CRUD panels.
- Calendar canonical reference date:
  When a founder-approved Calendar screenshot is the active fidelity target,
  align showcase date-dependent content to that exact canonical date rather
  than mixing fixed chrome labels with today-derived synthetic events.

## Journal Canonical Patterns (2026-04-30)

- Journal naming:
  The module should be named `Journal` everywhere. Reflection is the behavior,
  not the module label.
- Reflection room before form:
  Journal should open with `Today's reflection room` and emotional orientation
  before exposing the composer.
- Dominant `Reflection focus` card:
  One guided prompt should visually outrank recent entries, metrics, and
  support cards.
- Warm composer:
  Title, body, mood, date, and life-area chips should feel like a humane writing
  surface rather than a transactional form.
- Living memory list:
  Recent entries should show title, date, mood, life-area context, excerpt, and
  subtle management actions without turning into a generic feed.
- Reflection ladder:
  Preserve `Day event -> Feeling -> Life area -> Next intention` as the
  canonical explanation of how reflection loops back into planning and daily
  action.
- Mobile journal parity:
  Mobile should stack hero, focus card, composer, recent entries, support
  signals, and reflection ladder while keeping capture as the primary job.
- Desktop journal showcase fallback:
  If Journal has no live entries, life areas, or balance data, use a warm
  showcase layer to keep the hero, recent entries, and support rail feeling
  like a real reflection room; do not let empty runtime data flatten the
  screen into raw management or failure messaging.
- Journal showcase structure:
  Preview mode should still carry visible life-area chips and date-consistent
  recent-entry rows inside the composer and feed; otherwise the writing surface
  loses too much of the canonical rhythm.

## Workspace Shell Patterns (2026-04-26)

- Sanctuary application frame:
  The authenticated app should feel like one crafted object placed on a calm
  surface, not like separate pages floating independently.
- Branded editorial rail:
  The left navigation rail should combine brand presence, quiet atmosphere,
  module guidance, and account grounding in one cohesive composition.
- Assistant room:
  AI support should exist as a first-class room inside the same shell rather
  than only as an embedded helper card.

## Living UI Patterns (2026-04-26)

- Gentle presence, never noisy motion:
  Use subtle pulses, drift, and hover-lift only to make the interface feel
  alive; motion should suggest breath and attention, not productivity theater.
- Time-aware warmth:
  Core entry surfaces may react to time of day or current context when it
  increases emotional fit without adding decision noise.
- Premium hover rhythm:
  Interactive tiles, support cards, and utility actions should respond with
  small material shifts so the product feels touchable, not static.

## Canonical Fidelity Notes

- When a canonical screenshot drives implementation, record background and
  decorative fidelity rules here so future parity passes reuse them instead of
  flattening them into generic gradients.
- For founder-style Nest dashboard parity, painterly hero and reflection
  regions may use workspace-bound raster assets when code-native gradients no
  longer reproduce the required watercolor softness faithfully.
- Once that threshold is crossed, extend the same logic to the rest of the
  dashboard material family. If the hero becomes painterly but the container
  surfaces remain gradient-driven, the screen still reads inconsistent.
- For founder-style Nest dashboard shell parity, symbolic ornamental CSS motifs
  such as brand emblems, potted-plant vignettes, or decorative foliage should
  be replaced with target-derived assets once the symbolic version becomes the
  clearest remaining source of drift.
- For dashboard showcase parity, utility copy and rail composition may enter a
  stricter canonical mode when the goal is screenshot-faithful implementation
  rather than purely live-dynamic realism.
- In that stricter canonical mode, remove elegant-but-non-canonical chrome
  before adding more polish: extra rail kickers, dashboard-only support copy,
  and center readouts that do not exist in the founder screenshot should be
  removed rather than endlessly restyled.
- Once those non-canonical extras are removed, the next highest-leverage
  parity moves are usually masthead typography, active-rail emphasis, and the
  dominant emotional card. Those three areas disproportionately affect whether
  the screen reads like the founder screenshot at first glance.
- After those are corrected, remaining meaningful gains usually come from
  atmosphere compression: lower-rail quietness, account-zone restraint, and
  line-break quality in the dominant card often matter more than adding new
  ornament.
- Very late-stage dashboard parity work should prefer rhythm tuning over
  invention: micro-adjustments to metric spacing, label scale, and ledger row
  density can produce visible gains once structure and art direction are
  already close.
- When hero metrics still feel "coded", first force value/label stacking and
  tighten the text block before changing broader layout proportions. This tends
  to produce a cleaner parity gain with less collateral drift.
- If a canonical screen does not show a desktop "object frame", do not keep a
  rounded outer workspace wrapper just because it feels premium. Move
  atmosphere and color into the real content plane instead of preserving a
  decorative shell that the reference does not have.
- If a canonical hero is still drifting, remove repeated or extra guidance
  copy before touching illustration again. Duplicate copy makes the screen
  feel coded even when the art direction is otherwise close.
- In screenshot-faithful dashboard mode, extra panel chrome around already
  self-describing inner content should be removed instead of endlessly styled.
  The day-flow card reads closer to the founder reference when the component
  carries the hierarchy and the wrapper stops competing with it.
- Dashboard hero and shell cleanup pass landed on 2026-04-30 to remove
  duplicated canonical hero copy, simplify day-flow chrome, and bring the
  left rail closer to the founder reference in:
  `apps/web/src/app/dashboard/page.tsx`
  `apps/web/src/app/globals.css`
  `apps/web/src/components/workspace-primitives.tsx`
  `apps/web/src/components/workspace-shell.tsx`
  with refreshed parity evidence:
  `docs/ux_canonical_artifacts/2026-04-30/nest-dashboard-web-parity-preview-phaseAC.png`
- Phase AC review on 2026-04-30 confirmed another visible convergence step,
  with remaining drift now concentrated in `Now focus` material softness,
  support-rail proportion, and hero microspacing, recorded in:
  `docs/ux/nest_258_dashboard_parity_review_phaseAC_2026-04-30.md`
- Dashboard container background asset pack landed on 2026-04-30 to replace
  key gradient-heavy dashboard surfaces with painterly PNG assets in:
  `apps/web/src/app/globals.css`
  `apps/web/public/assets/dashboard/dashboard-hero-scene-canonical-v2.png`
  `apps/web/public/assets/dashboard/dashboard-focus-panel-canonical-v2.png`
  `apps/web/public/assets/dashboard/dashboard-journal-card-canonical-v2.png`
  `apps/web/public/assets/dashboard/dashboard-support-card-wash-canonical-v1.png`
  `apps/web/public/assets/dashboard/workspace-main-atmosphere-canonical-v1.png`
  with refreshed parity evidence:
  `docs/ux_canonical_artifacts/2026-04-30/nest-dashboard-web-parity-preview-phaseAD.png`
- Phase AD review on 2026-04-30 confirmed that the dashboard now reads less
  like a gradient-assembled system and more like a cohesive editorial object,
  recorded in:
  `docs/ux/nest_260_dashboard_parity_review_phaseAD_2026-04-30.md`
- Dashboard mobile canonical reference was approved on 2026-04-30 and recorded
  in:
  `docs/ux/nest_197_dashboard_canonical_direction_2026-04-26.md`
  with artifact:
  `docs/ux_canonical_artifacts/2026-04-30/nest-dashboard-canonical-reference-mobile.png`.
  Future Dashboard mobile implementation should treat this image as a
  specification for hero progress, `Now focus`, module nav, day-flow timeline,
  execution panels, warm reflection, quick add, life areas, and insight order.
- Planning canonical reference was approved on 2026-04-30 and recorded in:
  `docs/ux/nest_261_planning_canonical_direction_2026-04-30.md`
  with artifacts:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-canonical-reference.png`
  and
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-canonical-reference-mobile.png`.
  Future Planning implementation should treat this image as a specification,
  especially for hero composition, `Now planning`, relational task rows,
  support rail, mobile hierarchy, and the `Goal -> Target -> List -> Next task`
  ladder.
- Planning canonical phase A landed on 2026-04-30 in:
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/app/globals.css`
  with evidence in:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseF.png`
  and
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-mobile-preview-phaseA.png`.
  Remaining differences are accepted for this slice: presentation-only fallback
  content when the API is unavailable, painterly illustration nuance, and final
  microspacing.
- Planning workspace tab parity landed on 2026-04-30 in:
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/globals.css`
  with evidence in:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseH.png`,
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-lists-preview-phaseH.png`,
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-goals-preview-phaseH.png`,
  and
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-targets-preview-phaseH.png`.
- Planning canonical inline creation landed on 2026-04-30 in:
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/globals.css`
  with evidence in:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseI.png`,
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-lists-preview-phaseI.png`,
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-goals-preview-phaseI.png`,
  and
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-targets-preview-phaseI.png`,
  with mobile evidence in:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-mobile-lists-preview-phaseI.png`.
- Planning canonical row management landed on 2026-04-30 in:
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/globals.css`
  with evidence in:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseJ.png`
  and
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-task-edit-preview-phaseJ.png`.
- Planning canonical legacy reduction landed on 2026-04-30 in:
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/globals.css`
  with report:
  `docs/ux/nest_266_planning_canonical_legacy_reduction_2026-04-30.md`
  and evidence:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseK.png`.
- Planning canonical tab depth landed on 2026-04-30 in:
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/globals.css`
  with report:
  `docs/ux/nest_267_planning_canonical_tab_depth_2026-04-30.md`
  and evidence:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseL.png`,
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-lists-preview-phaseL.png`,
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-goals-preview-phaseL.png`,
  and
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-targets-preview-phaseL.png`.
- Planning canonical composer polish landed on 2026-04-30 in:
  `apps/web/src/app/tasks/page.tsx`,
  `apps/web/src/app/globals.css`
  with report:
  `docs/ux/nest_270_planning_canonical_composer_polish_2026-04-30.md`
  and evidence:
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-parity-preview-phaseM.png`,
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-lists-preview-phaseM.png`,
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-goals-preview-phaseM.png`,
  and
  `docs/ux_canonical_artifacts/2026-04-30/nest-planning-web-targets-preview-phaseM.png`.
- Calendar canonical direction was approved on 2026-04-30 and recorded in:
  `docs/ux/nest_268_calendar_canonical_direction_2026-04-30.md`
  with artifacts:
  `docs/ux_canonical_artifacts/2026-04-30/nest-calendar-canonical-reference-desktop.png`
  and
  `docs/ux_canonical_artifacts/2026-04-30/nest-calendar-canonical-reference-mobile.png`.
  Future Calendar implementation should treat these images as specifications,
  especially for `Today's time map`, `Now on deck`, day-flow timeline, event
  intelligence, support rail, and `Goal -> Task/List -> Calendar event ->
  Reflection` ladder.
- Calendar canonical phase A landed on 2026-04-30 in:
  `apps/web/src/app/calendar/page.tsx`,
  `apps/web/src/app/globals.css`
  with report:
  `docs/ux/nest_272_calendar_canonical_phaseA_2026-04-30.md`
  and evidence:
  `docs/ux_canonical_artifacts/2026-04-30/nest-calendar-web-parity-preview-phaseA.png`.
- Journal canonical direction was approved on 2026-04-30 and recorded in:
  `docs/ux/nest_269_journal_canonical_direction_2026-04-30.md`
  with artifacts:
  `docs/ux_canonical_artifacts/2026-04-30/nest-journal-canonical-reference-desktop.png`
  and
  `docs/ux_canonical_artifacts/2026-04-30/nest-journal-canonical-reference-mobile.png`.
  Future Journal implementation should treat these images as specifications,
  especially for `Today's reflection room`, `Reflection focus`, warm composer,
  living memory list, support rail, and the `Day event -> Feeling -> Life
  area -> Next intention` ladder.
- Journal canonical phase A landed on 2026-04-30 in:
  `apps/web/src/app/journal/page.tsx`,
  `apps/web/src/app/globals.css`
  with report:
  `docs/ux/nest_273_journal_canonical_phaseA_2026-04-30.md`
  and evidence:
  `docs/ux_canonical_artifacts/2026-04-30/nest-journal-web-parity-preview-phaseA.png`.
- Workspace mobile canonical parity pass A landed on 2026-05-01 in:
  `apps/web/src/components/workspace-shell.tsx`,
  `apps/web/src/components/workspace-primitives.tsx`,
  `apps/web/src/app/dashboard/page.tsx`,
  `apps/web/src/app/calendar/page.tsx`,
  `apps/web/src/app/journal/page.tsx`,
  and
  `apps/web/src/app/globals.css`
  with report:
  `docs/ux/nest_274_workspace_mobile_canonical_parity_passA_2026-05-01.md`.
  Mobile implementation rules reinforced by this pass:
  - the workspace mobile nav should sit directly below the topbar and keep text
    labels visible;
  - Dashboard mobile should lead with hero, focus, dayflow, and operational
    ledgers before softer support cards;
  - Planning mobile should suppress legacy workspace noise and keep support
    cards secondary to weekly direction and action flow;
  - Journal mobile should hide management/status chrome from the canonical first
    viewport;
  - Calendar mobile still needs one more parity closure pass before it can be
    treated as visually locked.
- Mobile canonical order closure landed on 2026-05-01 in:
  `apps/web/src/app/globals.css`
  with report:
  `docs/ux/nest_275_mobile_canonical_order_closure_2026-05-01.md`.
  Reinforced rule:
  - when a mobile canonical screen needs support cards to appear before a final
    ladder or summary block, flatten only the mobile ordering layer needed to
    preserve that reading sequence; do not let desktop column structure dictate
    narrow-screen hierarchy.

## Finish Propagation Rules (2026-04-26)

- Shell first, screen second:
  Future module upgrades should inherit the sanctuary frame, softened rail, and
  editorial page entry before adding route-local polish.
- One dominant emotional block per screen:
  Each module should have one area that carries the emotional center of the
  screen, while supporting surfaces stay quieter and lighter.
- Support rail stays intimate:
  Right-column support cards should use softer borders, warmer gradients, and
  lighter copy density than primary work panels.
- Calm hierarchy beats more widgets:
  If a screen feels weak, first adjust spacing, contrast, and material weight
  before adding new UI objects.
- Living cues stay subtle:
  Motion, time-awareness, and hover response should be shared language across
  modules, but always secondary to clarity and calm.
