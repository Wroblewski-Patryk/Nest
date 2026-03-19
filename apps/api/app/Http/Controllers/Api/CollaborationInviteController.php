<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CollaborationInvite;
use App\Models\CollaborationSpaceMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CollaborationInviteController extends Controller
{
    public function accept(Request $request, string $token): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $invite = CollaborationInvite::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('token', $token)
            ->where('status', 'pending')
            ->firstOrFail();

        if (strtolower((string) $invite->email) !== strtolower((string) $user->email)) {
            abort(404);
        }

        if ($invite->expires_at !== null && $invite->expires_at->isPast()) {
            return response()->json([
                'message' => 'Invite expired.',
            ], 422);
        }

        DB::transaction(function () use ($invite, $user): void {
            $invite->status = 'accepted';
            $invite->accepted_by_user_id = $user->id;
            $invite->save();

            CollaborationSpaceMember::query()->updateOrCreate(
                [
                    'tenant_id' => $user->tenant_id,
                    'space_id' => $invite->space_id,
                    'user_id' => $user->id,
                ],
                [
                    'role' => $invite->role,
                    'status' => 'active',
                ]
            );
        });

        return response()->json([
            'data' => [
                'space_id' => $invite->space_id,
                'status' => 'accepted',
            ],
        ]);
    }
}
