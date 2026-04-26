# Canonical Visual Implementation Workflow

Use this workflow when a project has an approved target screen, screenshot, or
mockup that implementation should match closely.

The canonical visual is not inspiration. It is a specification.

## Goal

Prevent "close enough" approximations when the task requires a polished,
high-fidelity result.

## Required Stages

### 1. Canonical Intake

- Identify the exact approved reference.
- Record the source in the task.
- Confirm whether the target is pixel-close, structurally faithful, or only
  style-inspired.

### 2. Visual Decomposition

Break the screen into:

- layout structure
- reusable components
- typography system
- decorative assets
- background assets
- surface treatments
- motion and interaction details

Do not merge all decorative work into "background styling".

### 3. Asset Strategy

For each decorative or background element, decide whether it should be:

- code-native CSS or native drawing
- SVG asset
- raster asset such as PNG or WebP

Use generated or exported image assets when the canonical design contains
texture, painterly atmosphere, organic shapes, or illustration that code will
flatten.

### 4. Gap Audit

Before implementation, compare the current UI against the canonical reference
and record missing assets, layout mismatches, hierarchy gaps, and any element
that is still only approximated.

### 5. Implementation Sequencing

Recommended order:

1. asset preparation
2. structural layout parity
3. component styling parity
4. decorative and background parity
5. interaction and state parity
6. screenshot comparison pass

### 6. Screenshot Comparison Pass

- Capture the implemented screen in the browser.
- Compare it side by side against the canonical reference.
- List remaining mismatches explicitly.
- Do not stop at "the vibe is similar".
