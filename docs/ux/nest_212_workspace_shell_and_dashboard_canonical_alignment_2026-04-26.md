# Nest 212 Workspace Shell And Dashboard Canonical Alignment

Date: 2026-04-26
Owner: Documentation Agent
Source of truth: approved snapshot
Target reference:
`docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`

## Purpose

The dashboard is already directionally aligned with the founder reference, but
the remaining gap is no longer only inside `Dashboard`. The canonical target is
really a full workspace composition made of:

- the outer shell,
- the editorial dashboard hero,
- the support rail,
- the relationship between main content and support content,
- the way assistant/chat and other modules should live inside the same system.

This document records the exact `current -> target` delta so the next rebuild
wave can produce one reusable Nest workspace grammar instead of polishing each
route independently.

## Scope

This alignment plan covers:

- `apps/web/src/components/workspace-shell.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/components/workspace-primitives.tsx`
- `apps/web/src/components/ai-copilot-card.tsx`
- cross-route composition expectations for:
  - `Planning`
  - `Journal`
  - `Life Areas`
  - `Calendar`
  - `Habits`
  - `Insights`
  - future first-class assistant/chat surface

## Current Implementation Reality

### What is already strong

- The dashboard already has the correct overall direction:
  editorial hero, `Now Focus`, day-flow timeline, support rail stack, and
  insight footer strip.
- `Journal` and `Planning` already reuse part of the same visual grammar.
- Shared reusable primitives exist, so the project is not blocked by a total
  lack of systemization.

### What is still structurally incomplete

- The global app root does not yet carry the premium product frame.
  `apps/web/src/app/layout.tsx` is still a minimal font wrapper.
- The authenticated workspace shell carries most of the visual identity, but it
  is still treated as a local component, not as an explicit canonical
  application frame.
- The assistant/copilot does not yet exist as a first-class route or canonical
  workspace surface. It currently exists only as an embedded card pattern.
- Several routes still inherit the shell visually, but not compositionally,
  which means the dashboard feels more finished than the product around it.

## Canonical Workspace Model

The founder target image implies a reusable workspace model with five layers:

1. `Sanctuary frame`
   The whole app should feel like one calm object placed on a warm surface,
   not like separate pages dropped into a generic web shell.
2. `Editorial navigation shell`
   Navigation, identity, account presence, and utility controls should feel
   calm, premium, and quietly ceremonial.
3. `Primary work lane`
   Each route needs one dominant purpose surface before tools and management
   density appear.
4. `Support rail`
   Reflection, quick actions, life context, and eventually assistant support
   should live in a lighter vertical companion system.
5. `Closing context`
   Insight, reflection, or guidance should gently close the screen instead of
   ending abruptly at a card grid.

This model should become the base for all major modules, not just dashboard.

## Detailed Gap Analysis

## 1. Global Shell Gap

### Current

- `layout.tsx` does not define a product-level shell contract.
- The premium look is attached mainly to `WorkspaceShell`.
- The shell is visually strong, but its ownership is not explicit enough for
  future route families or assistant/chat expansion.

### Target

- The app needs one explicit canonical authenticated workspace frame.
- Shell responsibilities should be separated into:
  - page chrome and body background,
  - left navigation rail,
  - top utility band,
  - content container,
  - optional support rail behavior,
  - mobile navigation behavior.
- Route surfaces should slot into this frame through named layout regions,
  rather than each screen locally solving composition.

### Why it matters

Without this shift, every route can look individually better while the product
still feels uneven as a whole.

## 2. Sidebar And Identity Gap

### Current

- The rail is close in spirit, but still slightly more utilitarian than the
  founder reference.
- Brand presence, collapse affordance, quote zone, footer identity, and spacing
  rhythm are not yet consistently `luxury-calm`.
- The rail does not yet establish a sufficiently strong `Nest sanctuary`
  feeling before the user reaches content.

### Target

- Brand block should feel calmer, more ceremonial, and more precious.
- Active navigation treatment should feel elegant and embedded rather than
  simply highlighted.
- Footer identity should read as part of the overall scene, not as a detached
  utility section.
- Decorative plant/atmosphere treatment should feel intentional and reusable.

### Reusable pattern to extract

- `workspace sanctuary rail`
- `brand invocation block`
- `premium active nav treatment`
- `rail atmosphere footer`

## 3. Topbar And Utility Cluster Gap

### Current

- The utility cluster exists, but it still reads as a practical toolbar.
- Date, weather, search, and notification controls are present, but not yet as
  refined as the founder reference.
- The topbar hierarchy is still slightly too component-like compared with the
  calmer, more editorial target.

### Target

- Topbar utilities should feel lighter and more integrated into the page mood.
- Search and notification actions should look like premium ambient controls.
- Typography, spacing, and icon rhythm should emphasize quiet confidence.

### Reusable pattern to extract

- `ambient top utility cluster`
- `editorial page intro`

## 4. Dashboard Hero Gap

### Current

- The hero direction is correct, but still not fully at target parity.
- Illustration, metric separators, icon treatment, and spacing still have a
  slightly more product-UI feel than the founder reference.

### Target

- The hero should feel like one painted editorial band:
  progress ring, daily narrative, calm illustration, and metrics all inside
  one premium scenic composition.
- The panel should carry more atmosphere and less visible assembly.
- Daily metrics should feel naturally placed in the scene rather than arranged
  as modular widgets.

### Reusable pattern to extract

- `illustrated editorial hero band`
- `scenic metric narrative strip`

## 5. Now Focus And Day-Flow Gap

### Current

- `Now Focus` and the `Morning / Now / Evening` timeline are strong and
  directionally correct.
- They still need more exact parity in proportion, material softness,
  information density, and ceremonial rhythm.

### Target

- `Now Focus` should feel like the emotional and practical anchor of the day.
- The day-flow should feel like a quiet ritual board, not a schedule widget.
- The central `Now` emphasis should be more precise and more visually sacred.

### Reusable pattern to extract

- `dominant ritual focus card`
- `ceremonial day-flow board`

## 6. Right Rail Support Stack Gap

### Current

- `Journal`, `Quick add`, and `Life areas` exist as the correct family.
- They still need stronger shared choreography, lighter card material, and more
  intimate editorial styling.

### Target

- The right rail should feel like a companion lane, not a secondary dashboard
  column.
- `Journal` should feel written and human.
- `Quick add` should feel fast but precious.
- `Life areas` should feel like a quiet life-balance instrument, not only a
  data card.

### Reusable pattern to extract

- `support rail card family`
- `warm reflection card`
- `compact ceremonial quick actions`
- `life balance mini-instrument`

## 7. Assistant / Chat Surface Gap

### Current

- The product has an `AiCopilotCard`, but no first-class assistant surface in
  the web workspace.
- There is no explicit navigation or route ownership for a canonical chat or
  assistant view.
- This means the shell is not yet designed around assistant presence, only
  around dashboard and modules.

### Target

- The workspace system should explicitly define how assistant support lives in
  the product:
  - dedicated route, or
  - contextual support lane pattern, or
  - hybrid model.
- The preferred direction is a dedicated first-class assistant surface that
  still reuses the same sanctuary shell and support rail grammar.
- Chat should not feel bolted on; it should feel like another premium Nest
  room inside the same house.

### Reusable pattern to extract

- `assistant room layout`
- `conversation support lane`
- `context reference cards`

## 8. Cross-Module Composition Gap

### Current

- `Planning` and `Journal` already share visual language, but not yet a fully
  standardized compositional model.
- Other modules still vary more in weight, entry hierarchy, and finish.

### Target

- Every major module should inherit one of a small number of canonical entry
  modes:
  - `command center`
  - `ritual board`
  - `reflection room`
  - `analysis gallery`
  - `assistant room`
- Each route should declare:
  - dominant purpose,
  - main lane width behavior,
  - support rail participation,
  - closing context behavior.

### Reusable pattern to extract

- `workspace entry mode taxonomy`
- `module layout recipe contract`

## 9. Material And Finish Gap

### Current

- The implementation is already premium-leaning, but still reveals more UI
  assembly than the founder reference.
- Borders, shadows, separators, and gradients are improved but not yet fully
  `invisible`.

### Target

- Materials should feel soft, paper-like, and atmospheric.
- Decorative treatment should support clarity without becoming noisy.
- The user should feel polish before they consciously notice components.

### Reusable pattern to extract

- `paper-glow panel material`
- `warm separator language`
- `atmospheric illustration overlays`

## Canonical Rules For Future Module Rebuilds

Every major module should be rebuilt under these rules:

1. Start from shell and entry mode, not from local cards.
2. Place one dominant purpose surface above management density.
3. Use the support rail as a real companion system, not a dumping ground.
4. End the screen with calm context, not a hard visual stop.
5. Make assistant support feel native to the workspace system.
6. Prefer reusable layout recipes and shared material tokens over route-local
   styling.

## Proposed Implementation Sequence

### Phase A: Shell Truth

- formalize the canonical authenticated workspace frame
- tighten left rail identity, footer atmosphere, and utility cluster
- define named content regions for primary lane, support rail, and closing band

### Phase B: Dashboard Final Parity

- refine hero art, metrics rhythm, `Now Focus`, and day-flow parity
- tune right rail support stack toward the founder reference
- align lower dashboard closure strip and supporting cards

### Phase C: Assistant Surface

- add one first-class assistant/chat route in the shared workspace shell
- define how contextual references and side guidance live in that space
- ensure the assistant view feels native to the Nest sanctuary grammar

### Phase D: Module Propagation

- rebuild `Planning`
- rebuild `Journal`
- rebuild `Life Areas`
- rebuild `Calendar`
- rebuild `Habits`
- rebuild `Insights`

### Phase E: Production Parity Control

- maintain screenshot-based parity checks for canonical screens
- require visual drift review before calling premium UX work finished
- use the dashboard, shell, and assistant surfaces as the style gate for later
  screens

## Risks And Non-Goals

### Risks

- Polishing only the dashboard will create stronger contrast with weaker routes.
- Shipping assistant/chat later without shell planning will create a foreign
  surface inside the product.
- Too much route-local styling will weaken reuse and slow future module work.

### Non-goals

- This plan does not approve a brand-new navigation system.
- This plan does not change product architecture or actor boundaries.
- This plan does not propose screenshot-only cloning at the cost of
  accessibility, responsiveness, or maintainability.

## Recommended Next Execution Task

The next execution slice should start with:

- shell canonicalization,
- dashboard residual parity closure,
- assistant surface layout planning inside the same workspace frame.

That sequence gives the product one stable premium base before more module
rebuilds continue.
