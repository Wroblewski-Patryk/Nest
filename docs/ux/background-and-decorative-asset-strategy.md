# Background And Decorative Asset Strategy

Use this file when a design includes non-trivial background visuals, ambient
illustration, texture, or decorative overlays.

## Principle

Backgrounds are part of the product surface, not disposable filler.

If the reference design depends on artful imagery, soft illustration, or
specific atmosphere, that visual layer must be treated as a real asset
decision, not improvised with generic gradients.

## Choose The Right Medium

### Prefer Code-Native Styling When

- the effect is geometric and simple
- the effect is repeatable through tokens
- the result can be reproduced faithfully with gradients, borders, shadows,
  blur, and transforms

### Prefer SVG When

- the artwork is vector-friendly
- edges must remain crisp
- a decorative motif needs scaling flexibility

### Prefer Raster Assets When

- the reference uses watercolor, grain, paper, fog, clouds, glow bloom, or
  painterly depth
- the background has subtle tonal complexity that code will flatten
- the decorative layer contains texture that matters to the brand feel
- repeated gradient experimentation is replacing straightforward asset use

## Anti-Approximation Rule

Do not replace a canonical image-based background with generic radial
gradients, blur blobs, or washed-out tint overlays unless the task explicitly
allows adaptation instead of fidelity.
