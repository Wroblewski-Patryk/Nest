# Learning Journal

Use this file to capture verified recurring pitfalls and execution guardrails.

## Entry Template

- Date:
- Context:
- Symptom:
- Root cause:
- Guardrail:
- Preferred pattern:
- Avoid:

## Entries

- (add new entries below)

### 2026-05-02 - Canonical showcase must evaluate current-view richness

- Context: NEST-288 Calendar canonical showcase convergence.
- Symptom: Authenticated Calendar loaded successfully but showed a thin empty
  live day instead of the approved canonical showcase because the account had
  some global Calendar data while the selected day had no meaningful events.
- Root cause: The showcase trigger used broad account-level richness
  (`events.length` / `tasks.length`) instead of asking whether the current day
  could carry the canonical `Today's time map` composition.
- Guardrail: For canonical UX fallback/showcase decisions, evaluate the
  visible route state first, then global data availability.
- Preferred pattern: Keep API-backed behavior intact, but promote sparse
  current-view states into the existing approved showcase path when the live
  view cannot satisfy the canonical screen contract.
- Avoid: Treating successful API responses as sufficient visual evidence when
  the current screen still lacks enough content to match the approved reference.

### 2026-04-30 - Template world-class delivery standards synced

- Context: The project adopted shared template guidance for user collaboration,
  evidence-driven UX, reliability, secure development, and post-launch learning.
- Learning: Agent handoffs are more useful when they include the active source
  of truth, success signal, validations, residual risks, and next tiny task.
- Guardrail: Use .agents/workflows/world-class-delivery.md for substantial
  work and apply reliability/security/UX evidence only when the scope warrants
  it, rather than adding ceremony to tiny safe changes.
