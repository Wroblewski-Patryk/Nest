# Nest Design System and UI (Mix Ideal PL)

Version: 1.0
Status: Approved for implementation
Updated: 2026-03-21

## Purpose

Define a single, implementation-ready visual and UX baseline for Nest, based on
the approved "Mix Ideal" direction and reference concept image.

## Source and Approval

- Source type: approved design snapshot and written style specification
- Source owner: founder/user approval
- Approval date: 2026-03-21
- Usage scope: web and mobile UI generation in Stitch, then implementation in
  app code after explicit implementation approval

## 1. Brand Philosophy and Style

Nest is a digital ecosystem and safe "nest" for thoughts, habits, and goals.
The experience should feel calm, harmonious, and in control, without creating
task-pressure stress.

Brand keywords:

- calm
- nature
- harmony
- modern minimalism
- artistic polish

Guiding principle:

- "Natural lightness and flow combined with precise digital polish."

## 2. Color Palette

Avoid pure white and pure black. Use muted, earthy, calming tones.

### 2.1 Foundation Colors (Earth and Beige)

- `color-beige-base`: `#FDFCF8`
  - Main application background, warm paper-like beige.
- `color-brown-base`: `#4B3F34`
  - Primary text, headings, ultra-thin outlines.
- `color-brown-subtle`: `#BFA68A`
  - Subtle surfaces, secondary text, low-emphasis UI zones.

### 2.2 Accent Colors (Nature and Growth)

- `color-green-sage`: `#789262`
  - Main accent, progress bars, active icons, selected states.
- `color-green-light`: `#DFE5DA`
  - Active card fills, contextual highlight backgrounds.

## 3. Typography

Primary family:

- `Inter` for full UI, preferred weights: `Light`, `Regular`, `Medium`.

Alternative:

- `Lora` allowed only for headline accents if needed, but default baseline
  remains Inter-first.

### 3.1 Typographic Hierarchy

- Headline 1 (logo title): Inter Medium, 18, `color-brown-base`
- Subtitle 1 (date, "TWOJE DZISIAJ"): Inter Regular, 14, `color-brown-subtle`
- Headline 2 (module title): Inter Medium, 20, `color-brown-base`
- Task Title: Inter Medium, 16, `color-brown-base`
- Task Info: Inter Regular, 14, `color-brown-subtle`
- Bottom Bar Label: Inter Light, 11, `color-brown-base`

Additional rule:

- "TWOJE DZISIAJ" style subtitles may use uppercase with subtle letter spacing
  for elegance.

## 4. Visual Language (Icons and Outlines)

### 4.1 Ultra-thin Outline Style

- Icons, logo marks, action controls use ultra-thin line style (`1px` visual
  weight target).
- No fill by default.
- Fill is allowed only for active/selected emphasis states.
- Outline colors:
  - default: `color-brown-base`
  - active accent: `color-green-sage`

### 4.2 Central Bottom Action ("Seedling")

- Central CTA in the bottom bar should use a minimal seed/drop icon form.
- Keep it outline-first and subtle, avoid heavy filled plus buttons.
- This element is part of Nest visual identity and must remain consistent across
  modules.

## 5. Background and Module Variations

### 5.1 Base Background

- Global base background: `color-beige-base`.

### 5.2 Artistic Watercolor Aura

- Use very subtle, highly transparent watercolor-like shapes behind content.
- Primary tint direction: sage green derived from `color-green-sage`.
- Background aura must never reduce text readability.

### 5.3 Contextual Module Variation

- Allow subtle per-module watercolor variation for context separation:
  - journal: slightly warmer and wrapping beige overlays,
  - tasks: fresher green watercolor touch.
- Variations must stay within one coherent design language.

## 6. Layout and UX Rules

### 6.1 Compact Header

- Header should be compact.
- Place Nest logo/title and date in one left-aligned block.
- Keep center area visually clean or use for a discreet progress cue.
- Brand should not dominate over user content.

### 6.2 Bottom Navigation as Floating Panel

- Use a rounded, floating bottom panel.
- Icons follow ultra-thin outline style with `color-brown-base`.
- Active state uses subtle `color-green-sage` accent.

### 6.3 Day Timeline Structure

- Structure day into sections such as Morning / Now / Evening.
- Task checkbox pattern:
  - default: empty outline circle,
  - selected: fully filled `color-green-sage`.
- "Now" section cards are highlighted with `color-green-light`.

## 7. Implementation Constraints for Stitch Generation

When generating screens in Stitch for this baseline:

- Keep one coherent visual language across all modules.
- Reuse the same token palette and component grammar.
- Keep line icon style consistent (`1px` fine line target).
- Ensure desktop and mobile treatments keep the same identity.
- Include required states: loading, empty, error, success, and high-load
  triage where relevant.

## 8. Acceptance Gate Before Code Implementation

The design package is implementation-ready only if:

- all required modules are generated in Stitch using this exact system,
- visual consistency is preserved across screens,
- responsive behavior is validated for web and mobile patterns,
- accessibility checks are recorded (contrast, state clarity, hierarchy),
- user confirms implementation approval after reviewing the Stitch package.

## 9. Related Documents

- `docs/ux/ux_ui_stitch_unified_spec_v1.md`
- `docs/ux/ux_ui_mcp_collaboration.md`
- `docs/ux/stitch-mcp-playbook.md`
