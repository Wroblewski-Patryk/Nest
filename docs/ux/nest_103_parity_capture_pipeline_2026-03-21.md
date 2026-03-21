# NEST-103 Parity Capture Pipeline

Last updated: 2026-03-21
Task: `NEST-103`

## Pipeline Inputs

- Web capture config: `scripts/ux-parity/web-capture-config.json`
- Mobile capture config: `scripts/ux-parity/mobile-capture-config.json`
- Capture runtime: `scripts/ux-parity/capture-with-playwright.mjs`
- Web wrapper: `scripts/ux-parity/capture-web-parity.ps1`
- Mobile wrapper: `scripts/ux-parity/capture-mobile-parity.ps1`

## Expected Outputs

- `docs/ux_parity_evidence/<date>/web/*.png`
- `docs/ux_parity_evidence/<date>/mobile/*.png`
- `docs/ux_parity_evidence/<date>/capture-manifest.json`
- `docs/ux_parity_evidence/<date>/artifact-index.md`

## Determinism Rules

- Fixed viewport presets by target (`desktop`, `tablet`, `mobile`).
- Stable route list through JSON configs.
- Full-page screenshot mode enabled.
- Build/export step executed before capture scripts.
