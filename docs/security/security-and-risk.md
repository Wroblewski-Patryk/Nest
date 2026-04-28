# Security and Risk

## Threat Surface

## Critical Controls
- Auth/session
- Ownership checks
- Secrets handling
- Rate limiting

## Risk Register
- Risk
- Impact
- Mitigation
- Owner

## AI Security Rule

AI systems must be tested against prompt injection, data leakage, and unauthorized access before deployment. Use `AI_TESTING_PROTOCOL.md` and `.codex/agents/ai-red-team-agent.md` for reproducible red-team scenarios.

AI, auth-sensitive, money-impacting, and cross-user data flows must fail closed when authorization, ownership, tool access, model memory, or policy validation is ambiguous.
