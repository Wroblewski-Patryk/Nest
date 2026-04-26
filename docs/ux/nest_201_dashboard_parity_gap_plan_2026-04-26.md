# NEST-201 Dashboard Parity Gap Plan (2026-04-26)

## Purpose

Turn the founder-provided dashboard target image into an implementation-ready
 gap analysis and rollout plan for:

- final dashboard visual parity,
- reusable UI-system upgrades,
- downstream module rebuild work.

This document answers one practical question:

`What still differs between the current implemented dashboard and the desired reference, and how do we close that gap without losing reuse discipline?`

## Source Inputs

Current implementation reviewed:

- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/components/workspace-primitives.tsx`
- `apps/web/src/components/workspace-shell.tsx`
- `apps/web/src/app/globals.css`

Current repository truth reviewed:

- `docs/ux/nest_197_dashboard_canonical_direction_2026-04-26.md`
- `docs/ux/ui-ux-foundation.md`
- `docs/ux/design-memory.md`
- `docs/ux/visual-direction-brief.md`
- `docs/ux/brand-personality-tokens.md`

Reference artifacts:

- existing canonical concept:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-canonical-preview.png`
- founder target image used for parity planning:
  - `docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`

## Executive Verdict

The current dashboard is directionally aligned but not yet visually equivalent.

What is already true:

- the information architecture is closer to the target,
- there is a stronger `Hero + Focus + Timeline + Reflection + Context` model,
- shared primitives exist and are reusable,
- the screen already feels calmer and more intentional than before.

What is not yet true:

- the visual polish level is still below the target image,
- the shell and cards still read more like a product UI than an art-directed
  personal command center,
- the current dashboard lacks several premium composition and material details
  that create the target "wow" effect.

## Gap Model

The gap is best understood in six layers.

### Layer 1. Shell and Framing Gap

Current:

- shell is structurally correct,
- left rail exists,
- top bar exists,
- dashboard sits cleanly in the workspace.

Target:

- shell feels lighter, more premium, and more editorial,
- the full app frame behaves like a crafted product object,
- chrome is quieter and visually more integrated with the content.

Missing from current implementation:

- more refined rounded outer-canvas framing,
- more luxurious negative space around the main work area,
- lighter, more polished top-right utility zone,
- more elegant left-rail item density and spacing rhythm,
- stronger personality in the brand lockup and footer user area.

Required reusable outcomes:

- shared `WorkspaceShell` needs a premium mode, not only a functional mode,
- shell spacing, rail proportions, and utility chrome must become tokenized,
- sidebar and topbar styles must be reusable by all core modules.

### Layer 2. Hero Composition Gap

Current:

- hero exists,
- progress is visible,
- metric summary is present,
- visual hierarchy is improved.

Target:

- hero is the emotional centerpiece of the screen,
- progress ring, stat row, and scenic background work as one composition,
- the block feels memorable before the user reads individual details.

Missing from current implementation:

- circular progress treatment instead of only linear progress emphasis,
- scenic/illustrative background layer inside the hero,
- richer stat-item composition with icon + label + value rhythm,
- softer internal separation and more premium visual balance,
- stronger headline/subheadline alignment to the illustration field.

Required reusable outcomes:

- `HeroBand` needs display variants:
  - `editorial`
  - `metrics-led`
  - `illustrated`
- hero should support:
  - circular progress,
  - inline stats,
  - optional scenic art layer,
  - secondary illustration overlay,
  - module-specific internal composition.

### Layer 3. `Now Focus` Gap

Current:

- `Now Focus` exists,
- it is stronger than before,
- it gives one next action and CTA.

Target:

- `Now Focus` feels like a premium decision card,
- it visually anchors the left-middle section,
- it carries confidence, warmth, and a touch of ceremony.

Missing from current implementation:

- richer card surface with layered plant/leaf motif,
- more refined metadata row (`impact`, `duration`, contextual reason),
- stronger CTA composition and clearer hierarchy between primary and secondary
  explanation,
- higher contrast between this block and surrounding surfaces.

Required reusable outcomes:

- `FocusCard` needs variants:
  - `deep-focus`
  - `reflection`
  - `recommendation`
- focus cards should support:
  - metadata clusters,
  - reason/explanation text,
  - optional decorative motif,
  - primary CTA + secondary rationale link.

### Layer 4. Timeline Gap

Current:

- timeline exists and is logically structured,
- `Morning / Now / Evening` grouping is correct,
- `Now` is highlighted.

Target:

- timeline reads like a crafted day-strip,
- the current moment is visually centered and ceremonial,
- the user can scan the whole day like one calm story.

Missing from current implementation:

- stronger central `Now` lane treatment,
- clearer vertical timeline spine and current marker,
- more elegant event/task markers,
- better balance between side columns and center focal card,
- more breathable typography and spacing.

Required reusable outcomes:

- `TimelineGroup` should not be only "stacked list in card";
- we need a reusable `DayFlowTimeline` primitive with:
  - lane headers,
  - central current-state emphasis,
  - event marker styles,
  - optional focal event card,
  - compact "view full calendar" footer link treatment.

### Layer 5. Right-Rail Support Stack Gap

Current:

- journal context exists elsewhere on the page,
- quick actions exist,
- quiet context ribbon exists.

Target:

- the right side works as a calm support column,
- it holds warm reflection, quick add, and life-area balance in one coherent
  vertical stack,
- each card is lighter, clearer, and more atmospheric.

Missing from current implementation:

- dedicated sidebar-style `Journal` card with handwriting-like reflection
  feeling,
- compact icon-led `Quick add` grid with premium small action buttons,
- `Life areas` mini-card with chart + legend in a refined compact treatment,
- atmospheric watercolor backdrop within right-side cards.

Required reusable outcomes:

- create reusable right-rail primitives:
  - `ReflectionSidebarCard`
  - `QuickAddCard`
  - `BalanceMiniCard`
- these should become the default support-column grammar for:
  - dashboard,
  - journal,
  - life areas,
  - insights.

### Layer 6. Finish and Material Gap

Current:

- calm palette is present,
- rounded cards and soft backgrounds exist,
- overall feel is cleaner than the legacy UI.

Target:

- the whole screen feels tactile, premium, and slightly painterly,
- wow comes from finish quality, not spectacle.

Missing from current implementation:

- more nuanced shadows and depth transitions,
- subtle paper/wash texture feel,
- finer border and divider treatment,
- more editorial typography contrast,
- more premium icon sizing and placement,
- better micro-spacing consistency.

Required reusable outcomes:

- token expansion for:
  - container radii tiers,
  - shadow tiers,
  - divider softness,
  - decorative illustration opacity,
  - scenic background placement,
  - premium spacing rhythm,
  - heading/display typography scales.

## Detailed Gap Matrix

## 1. Navigation

Current:

- functionally correct,
- icon-led,
- active state works.

Target differences:

- more spacious and elegant line-height,
- stronger active pill treatment,
- more polished brand mark,
- more premium avatar/account footer treatment,
- less utilitarian icon rhythm.

Implementation implication:

- refine `WorkspaceShell` rail styles before module-by-module visual polishing.

## 2. Header Bar

Current:

- title, subtitle, quick actions exist.

Target differences:

- date/weather/time sits more quietly and elegantly,
- utility icons feel lighter and more premium,
- page title is more editorial and less app-like.

Implementation implication:

- topbar needs a `display-title` mode and a right utility cluster primitive.

## 3. Progress Treatment

Current:

- % progress is clear,
- metrics are present.

Target differences:

- circular progress is iconic and memorable,
- stat icons make the information easier to scan,
- progress card feels more like a crafted insight panel.

Implementation implication:

- add reusable circular progress module and stat-item primitive.

## 4. Cards and Panel Hierarchy

Current:

- hierarchy is improved over legacy,
- cards no longer feel fully equal-weight.

Target differences:

- dashboard still has too many similarly styled panel shells,
- target uses stronger distinction between:
  - hero,
  - focus card,
  - utility cards,
  - support cards,
  - footer insight strip.

Implementation implication:

- introduce panel variants:
  - `hero`
  - `feature`
  - `support`
  - `mini`
  - `footer-strip`

## 5. Typography

Current:

- functional, readable, consistent.

Target differences:

- target uses more editorial title styling,
- display/headline rhythm is more luxurious,
- supporting text breathes more.

Implementation implication:

- keep readability, but add stronger display type scale and optional serif or
  editorial accent usage where approved.

## 6. Illustration and Atmosphere

Current:

- aura gradients exist,
- surfaces are calm.

Target differences:

- target uses scenic watercolor/landscape and botanical overlays inside cards,
- these are not decoration-only; they create product identity and warmth.

Implementation implication:

- we need a controlled illustration layer system:
  - card-scene backdrop,
  - botanical accent overlay,
  - module-specific watercolor field,
  - all tokenized and accessibility-safe.

## 7. Data Visualization

Current:

- life balance is text/context oriented,
- metrics are mostly textual.

Target differences:

- target uses a compact donut chart,
- progress circle and icon-led stats are richer,
- visual summaries reduce reading load.

Implementation implication:

- add reusable micro-visual components:
  - donut balance chart,
  - circular progress ring,
  - icon-stat row,
  - compact legend list.

## 8. Quick Actions

Current:

- quick actions are functional button cluster.

Target differences:

- target quick actions feel lighter, more iconic, and more integrated,
- they occupy less visual weight while looking more premium.

Implementation implication:

- create compact action-tile primitive with icon + short label + mini-card
  treatment.

## 9. Reflection Surface

Current:

- quick reflection exists and works,
- tone is warmer than before.

Target differences:

- target reflection card feels more intimate and handwritten,
- stronger emotional texture,
- cleaner separation from the main dashboard work surface.

Implementation implication:

- create a reflection-card variant with:
  - softer typography,
  - optional handwriting-style display accent,
  - vertical support-column layout,
  - quick entry affordance as floating or anchored action.

## 10. Insight Footer

Current:

- no equivalent premium footer strip yet.

Target differences:

- target has a bottom insight strip that closes the page elegantly,
- creates one final moment of calm guidance.

Implementation implication:

- create reusable `InsightStrip` component for dashboard and insights module.

## Model UI System Requirements Derived From the Gap

To make this dashboard the base for the rest of the product, the rebuild must
produce these reusable families:

### A. Shell family

- premium workspace rail
- premium top utility cluster
- module page title variants
- footer account cluster

### B. Surface family

- illustrated hero band
- deep focus card
- support sidebar card
- mini analytics card
- footer insight strip

### C. Data-display family

- circular progress
- donut balance chart
- icon-stat block
- current-state marker
- legend list

### D. Interaction family

- compact action tiles
- premium pills/chips
- contextual rationale link
- inline support CTA

### E. Atmosphere family

- scenic wash background
- botanical overlays
- module watercolor variants
- premium divider and shadow tokens

## Dashboard Rollout Plan

### Phase 1. Shell parity

Close the outer-frame gap first:

- left rail refinement,
- top utility refinement,
- outer container rounding and spacing,
- typography upgrade for page header.

### Phase 2. Hero parity

Rebuild the hero to match the reference more closely:

- circular progress,
- illustrated backdrop,
- icon-stat summary row,
- richer internal layout.

### Phase 3. Focus + timeline parity

- deepen `Now Focus` art direction,
- replace current grouped timeline with a true day-flow composition,
- strengthen current-moment focal point.

### Phase 4. Right-rail parity

- build support-column cards:
  - journal,
  - quick add,
  - life areas,
- align them visually and dimensionally.

### Phase 5. Finish pass

- shadow tuning,
- divider tuning,
- icon pass,
- spacing pass,
- final copy pass,
- accessibility contrast verification.

## Module Propagation Plan

Once dashboard parity is materially improved, use the same system to rebuild
other entry surfaces in this order:

1. `Planning`
2. `Journal`
3. `Life Areas`
4. `Calendar`
5. `Habits`
6. `Insights`
7. `Routines`

Rationale:

- `Planning`, `Journal`, and `Life Areas` are closest to dashboard semantics.
- `Calendar` benefits from the day-flow timeline system.
- `Habits` can inherit icon-stat and compact support-card patterns.
- `Insights` can inherit the footer-strip and mini-visual family.

## Definition Of Done For Dashboard Visual Parity

The dashboard can be considered visually near-parity with the reference only
when:

- the first glance emotional impact matches the target class,
- hero, focus, timeline, and support column feel like one composed scene,
- shell feels premium rather than merely functional,
- right-rail cards are compact, atmospheric, and polished,
- micro-visuals reduce reading load,
- the resulting components are reusable by at least two additional modules.

## Non-Goals

- Do not chase 1:1 pixel cloning if it harms reuse or accessibility.
- Do not hardcode one-off dashboard styling that cannot become a system.
- Do not hide functional data just to mimic the screenshot.

## Execution Recommendation

Use this plan as the bridge between:

- the current canonical dashboard direction (`NEST-197`),
- implementation tasks for dashboard visual parity,
- module-by-module rebuild tasks that inherit the same UI system.

The recommended next execution slice after this document is:

`dashboard parity phase 1: shell + hero + right-rail support stack`
