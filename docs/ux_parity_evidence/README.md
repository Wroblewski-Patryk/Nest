# UX Parity Evidence Artifacts

This directory stores deterministic screenshot parity evidence for legacy UX-heavy tasks.

## Structure

- `<date>/web/*.png`: web parity captures.
- `<date>/mobile/*.png`: mobile parity captures (from Expo web export).
- `<date>/artifact-index.md`: source, screen mapping, and unresolved diff list.
- `<date>/capture-manifest.json`: machine-readable capture output index.

## Capture pipeline

Run from repository root:

```powershell
pwsh ./scripts/ux-parity/capture-web-parity.ps1
pwsh ./scripts/ux-parity/capture-mobile-parity.ps1
```

Both scripts rely on `pnpm dlx playwright` and produce deterministic outputs under `docs/ux_parity_evidence/<date>/`.
