# Legacy UX Parity Packs (2026-03-21)

Task: `NEST-103`
Approved source artifact: Stitch project `projects/11122321523690086751`

## Side-by-side Parity Index

| Legacy task | Implementation artifact (web) | Implementation artifact (mobile) | Approved Stitch baseline |
|---|---|---|---|
| `NEST-021` | `docs/ux_parity_evidence/2026-03-21/web/nest-021-tasks.png` | `docs/ux_parity_evidence/2026-03-21/mobile/nest-022-mobile-home-tasks.png` | `projects/11122321523690086751/screens/81fbbc74978a4d7cb180d0bd2ceeef80` |
| `NEST-022` | `docs/ux_parity_evidence/2026-03-21/web/nest-021-tasks.png` | `docs/ux_parity_evidence/2026-03-21/mobile/nest-022-mobile-home-tasks.png` | `projects/11122321523690086751/screens/7decc38f1eaf4da3ae262c145d21c231` |
| `NEST-037` | `docs/ux_parity_evidence/2026-03-21/web/nest-037-calendar-conflicts.png` | `docs/ux_parity_evidence/2026-03-21/mobile/nest-037-mobile-calendar-conflicts.png` | `projects/11122321523690086751/screens/fa4aa25ee4354516b0e817bd5fce3a7b` |
| `NEST-041` | `docs/ux_parity_evidence/2026-03-21/web/nest-041-calendar-connections.png` | `docs/ux_parity_evidence/2026-03-21/mobile/nest-041-mobile-calendar-connections.png` | `projects/11122321523690086751/screens/fa4aa25ee4354516b0e817bd5fce3a7b` |
| `NEST-042` | `docs/ux_parity_evidence/2026-03-21/web/nest-042-calendar-scopes.png` | `docs/ux_parity_evidence/2026-03-21/mobile/nest-042-mobile-calendar-scopes.png` | `projects/11122321523690086751/screens/fa4aa25ee4354516b0e817bd5fce3a7b` |
| `NEST-050` | `docs/ux_parity_evidence/2026-03-21/web/nest-050-insights.png` | `docs/ux_parity_evidence/2026-03-21/mobile/nest-050-mobile-insights.png` | `projects/11122321523690086751/screens/71d241c92bc944a9b86033bbe5456fb4` |
| `NEST-058` | `docs/ux_parity_evidence/2026-03-21/web/nest-058-automations.png` | n/a | `projects/11122321523690086751/screens/64341b8036e1470b83a4ae630a00aa83` |
| `NEST-068` | `docs/ux_parity_evidence/2026-03-21/web/nest-068-billing.png` | `docs/ux_parity_evidence/2026-03-21/mobile/nest-068-mobile-billing.png` | `projects/11122321523690086751/screens/64341b8036e1470b83a4ae630a00aa83` |

## Unresolved Visual Diff List (input for `NEST-106`)

1. Action-entry parity gap: legacy screens still emphasize status/read-only cards; explicit primary add/create CTA surfaces are missing or visually de-emphasized versus Mix Ideal command-focused baseline (`NEST-021`, `NEST-050`, `NEST-058`, `NEST-068`).
2. Calendar integration hierarchy gap: conflict queue, connection status, and scope review remain visually merged in one dense block instead of clearly separated sections with stronger hierarchy (`NEST-037`, `NEST-041`, `NEST-042`).
3. Card density gap on mobile: calendar/integration cards are visually cramped and lack baseline spacing rhythm (`NEST-037`, `NEST-041`, `NEST-042`).
4. Typographic contrast gap: secondary metadata text in automation and billing modules is too low-emphasis compared with approved baseline readability target (`NEST-058`, `NEST-068`).
5. Insights emphasis gap: insights tiles still resemble MVP utility cards instead of dashboard-grade, high-signal summary blocks from approved baseline (`NEST-050`).

## Capture Run

- Web capture command: `powershell -ExecutionPolicy Bypass -File .\\scripts\\ux-parity\\capture-web-parity.ps1`
- Mobile capture command: `powershell -ExecutionPolicy Bypass -File .\\scripts\\ux-parity\\capture-mobile-parity.ps1`
- Web build validation: `pnpm --dir apps/web exec next build --webpack`
- Mobile export validation: `pnpm --dir apps/mobile exec expo export --platform web`
