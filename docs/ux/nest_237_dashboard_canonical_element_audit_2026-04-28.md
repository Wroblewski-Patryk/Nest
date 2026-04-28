# Nest 237 Dashboard Canonical Element Audit

Date: 2026-04-28
Owner: Planning Agent
Reference target:
`docs/ux_canonical_artifacts/2026-04-26/nest-dashboard-reference-user-target.png`

Compared implementation artifact:

- `docs/ux_canonical_artifacts/2026-04-28/nest-dashboard-web-parity-preview-phaseN.png`

## Purpose

This audit decomposes the canonical dashboard image into concrete UI elements,
compares each one against the current code-rendered dashboard, and records the
implementation plan required to reach a true canonical-quality result with
fewer future parity loops.

This is not a vibe memo. It is a screen-spec gap audit.

## Executive Diagnosis

The dashboard is already structurally close to the canonical reference, but it
is still not visually identical because the implementation is currently
strongest in:

- structure,
- hierarchy,
- premium calm,
- component reuse.

It is still weaker in:

- medium fidelity,
- ornamental nuance,
- painterly atmosphere,
- serif editorial authority,
- shell intimacy,
- “alive but calm” interaction detail.

The most important conclusion is this:

The remaining gap is not best solved by more generic CSS polishing alone.
Several parts of the reference behave like designed art assets, not pure
gradient compositions. The hero and some decorative rail moments should be
treated as canonical asset work, not indefinite approximation.

## Canonical Breakdown

## 1. Whole-object composition

### Canonical

- The app reads like one crafted physical object resting on a soft background.
- The page feels slightly ceremonial, not simply “dashboard software”.
- Negative space is as important as cards and copy.

### Current

- The overall composition is close, but still feels a little more product UI
  than art-directed object.
- Some panels still read as individually styled reusable cards before they
  read as one composed dashboard.

### Gap

- Material unification is not complete.
- The shell is still a little too explicit about reusable card boundaries.

### Implementation requirement

- Reduce visible component seams.
- Increase shared atmospheric continuity across hero, lower panels, and rail.
- Make surface hierarchy rely more on material softness and spacing than on
  border assertion.

## 2. Outer frame and background

### Canonical

- Soft parchment-cream world background.
- Rounded outer frame with almost hand-finished calm.
- No hard app-chrome feeling.

### Current

- Very close structurally.
- Slightly more “software shell” crispness remains in contour and inner
  separations.

### Gap

- Outer frame still feels a touch too technically clean.

### Implementation requirement

- Soften frame edge contrast.
- Reduce border readability where not strictly needed.
- Add one more layer of low-contrast atmospheric continuity behind the shell.

## 3. Left rail: brand zone

### Canonical

- Brand zone is airy and soft.
- `Nest` logotype feels editorial and premium.
- The nest emblem has a more delicate painterly presence.
- Collapse icon is quiet and secondary.

### Current

- Layout is correct.
- Typography is improved, but still a bit more digital than the reference.
- Brand mark is cleaner and more icon-system-like than the canonical image.

### Gap

- Brand mark medium is too vector-clean.
- Logotype atmosphere is not yet fully founder-editorial.

### Implementation requirement

- Introduce a canonical nest mark asset or more organic mark treatment.
- Tighten brand row vertical rhythm.
- Lower perceived precision of the emblem so it feels more illustrated.

## 4. Left rail: navigation stack

### Canonical

- Navigation is extremely calm.
- Active item is dominant but still soft.
- Inactive items are quiet, almost paper-ink subtle.
- Iconography feels lighter and more elegant than app-dashboard generic icons.

### Current

- Information architecture is aligned.
- Active state is close.
- Inactive state remains a touch too explicit and system-UI-like.

### Gap

- Icon weight and rail contrast still lean product-like.
- Hover and rest states are slightly too “componentized”.

### Implementation requirement

- Reduce inactive icon/text assertiveness.
- Narrow icon stroke optical weight where needed.
- Further soften hover fill and border response.

## 5. Left rail: atmospheric lower section

### Canonical

- Decorative plant, quote, and welcome area feel like one poetic lower rail
  composition.
- The quote is centered and intimate.
- The avatar card feels grounded and elegant, not like account settings chrome.

### Current

- Present and directionally aligned.
- Still reads like three adjacent footer modules rather than one composed
  atmospheric zone.

### Gap

- Lower rail lacks final serenity and cohesion.
- Account block still feels a little operational.

### Implementation requirement

- Recompose lower rail as one visual story.
- Reduce account-card UI feel.
- Use softer spacing and lower separation contrast.

## 6. Top editorial entry

### Canonical

- `Dashboard` headline is a major editorial anchor.
- Greeting line is delicate and almost whisper-level.
- Date/weather utility sits lightly, with no product-dashboard harshness.

### Current

- Much better than earlier phases.
- Still slightly more app-header than editorial masthead.

### Gap

- The title still needs final serif authority and spacing exactness.
- Utility cluster still feels assembled from controls rather than nestled into
  the composition.

### Implementation requirement

- Continue refining title optical size and tracking.
- Align utility cluster as a visual sentence, not three separate objects.
- Consider exact canonical weather icon geometry and spacing.

## 7. Hero: overall block

### Canonical

- One integrated summary painting:
  progress ring, title, metrics, and watercolor landscape live inside one calm
  panorama.
- The hero is not just a card; it is the main art-directed scene.

### Current

- Correct structure.
- Still slightly more assembled from dashboard modules.

### Gap

- Hero art direction still stops short of true painterly integration.
- Landscape is still approximated with CSS atmosphere rather than fully
  canonical visual richness.

### Implementation requirement

- Treat the landscape as a candidate raster or SVG-derived canonical asset.
- Preserve code-driven layout, but stop relying on blur/radial gradients alone
  for the final visual layer.

## 8. Hero: progress ring

### Canonical

- Ring has calm thickness and premium emptiness.
- Leaf ornament is elegant and lightly integrated.
- Interior number typography feels stately and quiet.

### Current

- Good structurally.
- Slightly more widget-like than the reference.

### Gap

- Ring stroke, leaf ornament, and inner typography still feel closer to
  implemented component than designed illustration.

### Implementation requirement

- Tune ring stroke thickness and tonal contrast.
- Refine or assetize the leaf ornament.
- Reduce dashboard-widget feel.

## 9. Hero: title and summary cluster

### Canonical

- `Today at a glance` has soft editorial prominence.
- Supporting line is calm and understated.

### Current

- Close, but text block still feels slightly tighter and more system-laid-out.

### Gap

- Typography/copy block lacks final ease and air.

### Implementation requirement

- Match line-height, baseline spacing, and max width more closely.
- Recheck the exact relation between title block and metric row.

## 10. Hero: metric row

### Canonical

- Metrics feel elegant, not “KPI row”.
- Icons are tiny ceremonial marks.
- Separators are faint.

### Current

- Structurally aligned.
- Still a touch too dashboard-metric in feel.

### Gap

- Metric icons and separators remain too explicit.
- Labels feel slightly too system-small instead of art-directed small.

### Implementation requirement

- Further soften metric capsules.
- Reduce separator visibility.
- Tighten icon optical size.

## 11. Hero: landscape art

### Canonical

- Watercolor mountains, soft sun, tree wash, and atmospheric fade are essential
  to the screen identity.

### Current

- The code-native approximation is good, but still visibly approximate.

### Gap

- This is the single clearest remaining fidelity gap.

### Implementation requirement

- Prepare canonical landscape asset in raster or layered SVG/raster hybrid.
- Keep the current code-generated structure only as fallback.
- Use code for placement/masking, asset for actual painterly medium.

## 12. `Now focus` card

### Canonical

- Dark green focal card is rich, matte, soft, and premium.
- Decorative foliage is subtle but present.
- CTA has quiet confidence.

### Current

- Strong and useful.
- Still slightly too high-contrast and modern in finish.

### Gap

- Too much digital crispness.
- Decorative richness is lower than canonical.

### Implementation requirement

- Reduce contrast slightly.
- Add more organic inner texture/ornament.
- Soften CTA edges and spacing.

## 13. `Now focus` content rhythm

### Canonical

- Title, metadata, explanation, CTA, and rationale feel evenly breathed.

### Current

- Close, but still a little more stacked like a product card.

### Gap

- Internal copy rhythm is not yet fully ceremonial.

### Implementation requirement

- Rebalance spacing above and below metadata and CTA.
- Match the canonical pacing more literally.

## 14. Day-flow timeline shell

### Canonical

- Timeline panel is quiet and elegant.
- `Morning / Now / Evening` reads like a composed schedule illustration.

### Current

- One of the strongest parts structurally.

### Gap

- Still slightly more software-grid than the founder image.

### Implementation requirement

- Reduce internal hardness of the grid.
- Soften the visual line logic and central node treatment.

## 15. Day-flow timeline details

### Canonical

- Small circles, line, and central card feel airy and refined.

### Current

- Close, but still a little sharper and more literal.

### Gap

- Microgeometry and line softness are not yet fully canonical.

### Implementation requirement

- Retune dot size, line opacity, and central card softness.

## 16. Right rail: `Journal`

### Canonical

- Feels like paper, reflection, and calm.
- Decorative background wash is gentle and elegant.
- Footer prompt + edit CTA feel human and intimate.

### Current

- Stronger than before and closer.

### Gap

- Still slightly more “premium SaaS card” than “reflection paper”.

### Implementation requirement

- Continue to lower card-mechanical feel.
- Consider a softer decorative asset/wash rather than code-only abstraction.

## 17. Right rail: `Quick add`

### Canonical

- Very compact, almost utility-like.
- No extra explanatory burden.

### Current

- Better after recent pass.

### Gap

- Tiles still feel a little heavier and more modern than the reference.

### Implementation requirement

- Tighten tile optical density.
- Reduce border contrast and icon prominence slightly.

## 18. Right rail: `Life areas`

### Canonical

- Donut and legend feel elegantly informational.
- Card is compact and quiet.

### Current

- Close structure.
- Still slightly more dashboard-analytics than the canonical card.

### Gap

- Donut and legend spacing need final tuning.

### Implementation requirement

- Reduce analytic feel.
- Match the donut’s optical thickness and label calm more closely.

## 19. Bottom row: `Tasks`

### Canonical

- Reads like a light editorial task ledger.
- Tabs, rows, badges, and footer actions are very restrained.

### Current

- Layout is aligned.
- Still slightly too blocky and modern.

### Gap

- Row separators and badge treatment are still a bit too explicit.

### Implementation requirement

- Soften row dividers.
- Reduce chip weight.
- Bring footer action styling closer to reference restraint.

## 20. Bottom row: `Habits`

### Canonical

- Reads like a sibling of `Tasks`, not a separate design language.

### Current

- Good structure.

### Gap

- Check marks and line treatment remain a touch too digital.

### Implementation requirement

- Match `Tasks` softness and reduce digital sharpness of status markers.

## 21. Bottom strip: `Insight of the day`

### Canonical

- Feels like a closing note, not another card.
- Quote is ceremonial and quiet.

### Current

- Close and improved in phase N.

### Gap

- Still slightly too isolated as a card object.

### Implementation requirement

- Further merge it into the overall page flow.
- Match icon/quote/CTA spacing more literally.

## 22. Interaction and “living UI”

### Canonical expectation

- The UI should feel alive, but not animated for the sake of animation.
- Hover, focus, and entry should suggest touchable material and calm presence.

### Current

- Some subtle motion exists.
- The system still leans more static than alive-crafted.

### Gap

- Motion grammar is not yet clearly tied to the founder visual language.

### Implementation requirement

- Define one canonical motion grammar for dashboard:
  - rail hover
  - support-card lift
  - utility-button response
  - hero ambient drift
  - focus CTA feel

## 23. State fidelity

### Canonical expectation

- Empty or sparse-data states should preserve the same beauty and structure.

### Current

- Showcase fallback already helps significantly.

### Gap

- Need explicit parity review across loading, error, and sparse states too.

### Implementation requirement

- Capture and review:
  - loading,
  - empty,
  - error,
  - fallback-success
  against the same visual quality bar.

## Root Cause Summary

The dashboard is not yet literal canonical parity mainly because of five root
causes:

1. Canonical art-medium mismatch:
   painterly areas are still mostly approximated in CSS.
2. Shell intimacy gap:
   left rail and account zone still feel slightly too app-operational.
3. Residual component seams:
   some areas still read as reusable cards before they read as one composition.
4. Serif and microtypography nuance gap:
   the screen is close, but still not fully founder-editorial.
5. Motion and interaction under-definition:
   the UI is beautiful, but not yet fully alive in a designed, canonical way.

## Implementation Plan

## Phase 1. Canonical medium decisions

Goal:
Stop approximating clearly painterly elements with generic CSS when fidelity
depends on medium.

Tasks:

1. Decide which dashboard decorative regions require real assets.
2. Prepare canonical asset pack:
   - hero watercolor landscape,
   - possible journal wash,
   - optional nest mark refinement.
3. Keep CSS layout scaffolding, but swap visual medium where needed.

## Phase 2. Shell serenity pass

Goal:
Make the entire shell feel less like application chrome and more like a
crafted sanctuary frame.

Tasks:

1. Left rail brand refinement.
2. Inactive nav and icon softening.
3. Lower rail quote/account recomposition.
4. Reduced visible card seam contrast.

## Phase 3. Hero fidelity pass

Goal:
Bring the hero to true canonical quality.

Tasks:

1. Integrate asset-driven landscape.
2. Retune progress ring.
3. Retune title/summary spacing.
4. Retune metric row.

## Phase 4. Focus/timeline harmony pass

Goal:
Match the hero-adjacent core interaction zone exactly.

Tasks:

1. Soften `Now focus` contrast and internal rhythm.
2. Refine timeline microgeometry and central-card softness.
3. Rebalance left-right dominance between focus card and timeline.

## Phase 5. Support rail and lower ledger pass

Goal:
Make the right rail and bottom panels fully canonical and elegant.

Tasks:

1. Final `Journal` paper-like treatment.
2. Final `Quick add` density pass.
3. Final `Life areas` donut + legend pass.
4. Final `Tasks/Habits` ledger softness pass.
5. Final insight-strip merge pass.

## Phase 6. Living UI pass

Goal:
Make the screen feel alive, not just similar.

Tasks:

1. Define canonical dashboard motion grammar.
2. Add subtle ambient hero movement if it does not break calm.
3. Harmonize hover/focus responses across shell and dashboard.
4. Verify keyboard and pointer feedback quality.

## Phase 7. State parity pass

Goal:
Prevent the canonical dashboard from existing only in the “happy screenshot”
state.

Tasks:

1. Review loading state.
2. Review sparse/fallback state.
3. Review error state.
4. Review responsive behavior after visual parity changes.

## Recommended Sequencing

To reduce repeated loops, the work should proceed in this exact order:

1. asset strategy decision,
2. shell serenity pass,
3. hero fidelity pass,
4. focus/timeline harmony pass,
5. support rail and lower ledger pass,
6. living UI pass,
7. state parity pass,
8. final screenshot comparison review.

## Definition Of “Done” For Canonical Dashboard

The dashboard should only be considered truly done when:

- the hero painterly medium no longer reads as approximate,
- the left rail feels founder-soft rather than app-operational,
- `Now focus`, timeline, and right rail feel compositionally balanced,
- bottom panels read like one gentle ledger band, not separate product cards,
- the screen feels alive through subtle interaction grammar,
- screenshot comparison no longer finds meaningful visual drift except for
  explicitly accepted tiny differences.

## Immediate Next Tasks

Recommended next documentation-backed execution slices:

1. `NEST-238` Decide canonical dashboard decorative asset pack.
2. `NEST-239` Implement shell serenity pass.
3. `NEST-240` Implement hero asset-driven fidelity pass.
4. `NEST-241` Implement focus/timeline harmony pass.
5. `NEST-242` Implement support rail and lower ledger pass.
