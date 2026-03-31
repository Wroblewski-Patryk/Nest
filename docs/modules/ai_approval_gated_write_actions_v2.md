# AI Approval-Gated Write Actions v2 (NEST-142)

Date: 2026-03-31  
Task: `NEST-142`

## Scope

- Add AI write-action proposal flow for task mutations.
- Enforce explicit approval before any write execution.
- Persist full proposal/approval/execution audit trail.

## Supported actions

- `create_task`
- `update_task_status`

## API

- `GET /api/v1/ai/actions/proposals`
- `POST /api/v1/ai/actions/proposals`
- `POST /api/v1/ai/actions/proposals/{proposalId}/approve`
- `POST /api/v1/ai/actions/proposals/{proposalId}/reject`

## Flow

1. Copilot (or client) submits action proposal with payload.
2. Proposal is stored with status `pending` and `requires_approval=true`.
3. No write action is executed while proposal is pending.
4. User approves proposal:
   - status moves `pending -> approved -> executed` on success,
   - execution result payload is persisted.
5. User rejects proposal:
   - status moves `pending -> rejected`,
   - rejection reason is persisted.

## Audit model

- Table: `ai_action_proposals`
- Captures:
  - action type and normalized payload,
  - proposal status lifecycle,
  - approver identity and timestamps,
  - execution result or failure reason,
  - optional rejection reason.

## Key files

- Migration:
  - `apps/api/database/migrations/2026_03_31_180000_create_ai_action_proposals_table.php`
- Model:
  - `apps/api/app/Models/AiActionProposal.php`
- Service:
  - `apps/api/app/AI/Services/AiActionProposalService.php`
- Controller:
  - `apps/api/app/Http/Controllers/Api/AiActionProposalController.php`
- Routes:
  - `apps/api/routes/api.php`
- Retention/deletion lifecycle:
  - `apps/api/config/tenant_data_lifecycle.php`
- Shared client/types:
  - `packages/shared-types/src/client.js`
  - `packages/shared-types/src/client.d.ts`
  - `packages/shared-types/src/index.d.ts`

## Validation

- `php artisan test --filter "AiActionProposalApiTest|AiCopilotConversationApiTest|AiContextGraphApiTest|AiWeeklyPlanningApiTest|AiPolicyRegressionTest|MvpAiSurfaceGuardTest"`
- `pnpm --dir apps/web build`
- `pnpm --dir apps/mobile test:smoke`
- `pnpm --package=@redocly/cli dlx redocly lint docs/engineering/contracts/openapi_auth_integrations_platform_v1.yaml`
