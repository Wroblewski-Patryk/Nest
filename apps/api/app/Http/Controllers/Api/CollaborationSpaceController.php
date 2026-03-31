<?php

namespace App\Http\Controllers\Api;

use App\Collaboration\Services\CollaborationAccessService;
use App\Http\Controllers\Controller;
use App\Models\CollaborationInvite;
use App\Models\CollaborationSpace;
use App\Models\CollaborationSpaceMember;
use App\Models\Goal;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CollaborationSpaceController extends Controller
{
    public function index(Request $request, CollaborationAccessService $access): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $spaceIds = $access->memberSpaceIds($user);

        $spaces = CollaborationSpace::query()
            ->with('members.user')
            ->whereIn('id', $spaceIds)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $spaces]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $payload = $request->validate([
            'name' => ['required', 'string', 'max:120'],
        ]);

        $space = DB::transaction(function () use ($payload, $user): CollaborationSpace {
            $space = CollaborationSpace::query()->create([
                'tenant_id' => $user->tenant_id,
                'owner_user_id' => $user->id,
                'name' => $payload['name'],
                'status' => 'active',
            ]);

            CollaborationSpaceMember::query()->create([
                'tenant_id' => $user->tenant_id,
                'space_id' => $space->id,
                'user_id' => $user->id,
                'role' => 'owner',
                'status' => 'active',
            ]);

            return $space->fresh(['members']);
        });

        return response()->json(['data' => $space], 201);
    }

    public function invite(
        Request $request,
        string $spaceId,
        CollaborationAccessService $access
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        if (! $access->isSpaceOwner($user, $spaceId)) {
            abort(404);
        }

        $payload = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'role' => ['nullable', 'in:editor,viewer'],
        ]);

        $invite = CollaborationInvite::query()->updateOrCreate(
            [
                'tenant_id' => $user->tenant_id,
                'space_id' => $spaceId,
                'email' => strtolower((string) $payload['email']),
                'status' => 'pending',
            ],
            [
                'invited_by_user_id' => $user->id,
                'role' => $payload['role'] ?? 'editor',
                'token' => Str::random(48),
                'expires_at' => now()->addDays(7),
            ]
        );

        return response()->json(['data' => $invite], 201);
    }

    public function members(
        Request $request,
        string $spaceId,
        CollaborationAccessService $access
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        if (! $access->canViewSpace($user, $spaceId)) {
            abort(404);
        }

        $members = CollaborationSpaceMember::query()
            ->with('user')
            ->where('tenant_id', $user->tenant_id)
            ->where('space_id', $spaceId)
            ->where('status', 'active')
            ->orderBy('created_at')
            ->get();

        return response()->json(['data' => $members]);
    }

    public function updateMemberRole(
        Request $request,
        string $spaceId,
        string $memberUserId,
        CollaborationAccessService $access
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        if (! $access->isSpaceOwner($user, $spaceId)) {
            abort(404);
        }

        $payload = $request->validate([
            'role' => ['required', 'in:editor,viewer'],
        ]);

        $member = CollaborationSpaceMember::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('space_id', $spaceId)
            ->where('user_id', $memberUserId)
            ->where('status', 'active')
            ->firstOrFail();

        if ($member->role === 'owner') {
            return response()->json([
                'message' => 'Owner role cannot be changed.',
            ], 422);
        }

        $member->role = $payload['role'];
        $member->save();

        return response()->json(['data' => $member->fresh('user')]);
    }

    public function removeMember(
        Request $request,
        string $spaceId,
        string $memberUserId,
        CollaborationAccessService $access
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        if (! $access->isSpaceOwner($user, $spaceId)) {
            abort(404);
        }

        $member = CollaborationSpaceMember::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('space_id', $spaceId)
            ->where('user_id', $memberUserId)
            ->where('status', 'active')
            ->firstOrFail();

        if ($member->role === 'owner') {
            return response()->json([
                'message' => 'Owner cannot be removed from space.',
            ], 422);
        }

        $member->status = 'removed';
        $member->save();

        return response()->json([], 204);
    }

    public function shareList(
        Request $request,
        string $spaceId,
        string $listId,
        CollaborationAccessService $access
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        if (! $access->canEditSpace($user, $spaceId)) {
            abort(404);
        }

        $list = TaskList::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($listId);

        $list->visibility = 'shared';
        $list->collaboration_space_id = $spaceId;
        $list->save();

        return response()->json(['data' => $list->fresh()]);
    }

    public function shareGoal(
        Request $request,
        string $spaceId,
        string $goalId,
        CollaborationAccessService $access
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        if (! $access->canEditSpace($user, $spaceId)) {
            abort(404);
        }

        $goal = Goal::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($goalId);

        $goal->visibility = 'shared';
        $goal->collaboration_space_id = $spaceId;
        $goal->save();

        return response()->json(['data' => $goal->fresh()]);
    }
}
