<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActorBoundaryAudit;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccessAuditController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        if (! $user->isHumanPrincipal()) {
            throw new AuthorizationException('Only human users can review access audits.');
        }

        $perPage = min((int) $request->integer('per_page', 30), 100);
        $ownedAgentIds = User::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('owner_user_id', $user->id)
            ->where('principal_type', User::PRINCIPAL_AI_AGENT)
            ->pluck('id')
            ->all();

        $audits = ActorBoundaryAudit::query()
            ->where('tenant_id', $user->tenant_id)
            ->where(function (Builder $builder) use ($user, $ownedAgentIds): void {
                $builder->where('user_id', $user->id);
                if ($ownedAgentIds !== []) {
                    $builder->orWhereIn('user_id', $ownedAgentIds);
                }
            })
            ->orderByDesc('occurred_at')
            ->paginate($perPage);

        return response()->json([
            'data' => collect($audits->items())->map(
                static fn (ActorBoundaryAudit $audit): array => [
                    'id' => (string) $audit->id,
                    'user_id' => (string) $audit->user_id,
                    'principal_type' => (string) $audit->principal_type,
                    'token_mode' => $audit->token_mode !== null ? (string) $audit->token_mode : null,
                    'route' => (string) $audit->route,
                    'method' => (string) $audit->method,
                    'reason' => (string) $audit->reason,
                    'required_scope' => $audit->required_scope !== null ? (string) $audit->required_scope : null,
                    'metadata' => is_array($audit->metadata) ? $audit->metadata : [],
                    'occurred_at' => $audit->occurred_at?->toISOString(),
                ]
            )->values()->all(),
            'meta' => [
                'total' => $audits->total(),
                'page' => $audits->currentPage(),
                'per_page' => $audits->perPage(),
            ],
        ]);
    }
}

