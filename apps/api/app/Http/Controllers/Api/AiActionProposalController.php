<?php

namespace App\Http\Controllers\Api;

use App\AI\Services\AiActionProposalService;
use App\Http\Controllers\Controller;
use App\Models\AiActionProposal;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiActionProposalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'status' => ['sometimes', 'string', 'in:pending,approved,rejected,executed,failed'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = (int) ($payload['per_page'] ?? 20);
        $query = AiActionProposal::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->orderByDesc('created_at');

        if (isset($payload['status'])) {
            $query->where('status', (string) $payload['status']);
        }

        $proposals = $query->limit($perPage)->get();

        return response()->json([
            'data' => $proposals->map(fn (AiActionProposal $proposal): array => $this->serialize($proposal))->all(),
            'meta' => [
                'total' => $proposals->count(),
                'per_page' => $perPage,
            ],
        ]);
    }

    public function propose(Request $request, AiActionProposalService $service): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'action_type' => ['required', 'string', 'in:create_task,update_task_status'],
            'proposal_payload' => ['required', 'array'],
            'note' => ['sometimes', 'string', 'max:1000'],
        ]);

        /** @var array<string, mixed> $proposalPayload */
        $proposalPayload = $payload['proposal_payload'];
        $proposal = $service->propose(
            user: $user,
            actionType: (string) $payload['action_type'],
            payload: $proposalPayload,
            note: isset($payload['note']) ? (string) $payload['note'] : null
        );

        return response()->json([
            'data' => $this->serialize($proposal),
        ], 201);
    }

    public function approve(Request $request, string $proposalId, AiActionProposalService $service): JsonResponse
    {
        $proposal = $this->findUserProposal($request, $proposalId);
        /** @var User $user */
        $user = $request->user();

        $approved = $service->approve($user, $proposal);

        return response()->json([
            'data' => $this->serialize($approved),
        ]);
    }

    public function reject(Request $request, string $proposalId, AiActionProposalService $service): JsonResponse
    {
        $proposal = $this->findUserProposal($request, $proposalId);

        $payload = $request->validate([
            'reason' => ['sometimes', 'string', 'max:1000'],
        ]);

        $rejected = $service->reject(
            proposal: $proposal,
            reason: isset($payload['reason']) ? (string) $payload['reason'] : null
        );

        return response()->json([
            'data' => $this->serialize($rejected),
        ]);
    }

    private function findUserProposal(Request $request, string $proposalId): AiActionProposal
    {
        /** @var User $user */
        $user = $request->user();

        return AiActionProposal::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($proposalId);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(AiActionProposal $proposal): array
    {
        return [
            'id' => (string) $proposal->id,
            'action_type' => (string) $proposal->action_type,
            'proposal_payload' => $proposal->proposal_payload ?? [],
            'requires_approval' => (bool) $proposal->requires_approval,
            'status' => (string) $proposal->status,
            'note' => $proposal->note,
            'rejection_reason' => $proposal->rejection_reason,
            'execution_result' => $proposal->execution_result,
            'failure_reason' => $proposal->failure_reason,
            'approved_by_user_id' => $proposal->approved_by_user_id,
            'approved_at' => $proposal->approved_at?->toISOString(),
            'rejected_at' => $proposal->rejected_at?->toISOString(),
            'executed_at' => $proposal->executed_at?->toISOString(),
            'created_at' => $proposal->created_at?->toISOString(),
            'updated_at' => $proposal->updated_at?->toISOString(),
        ];
    }
}
