<?php

namespace App\Collaboration\Services;

use App\Models\CollaborationSpace;
use App\Models\CollaborationSpaceMember;
use App\Models\User;

class CollaborationAccessService
{
    /**
     * @return list<string>
     */
    public function memberSpaceIds(User $user): array
    {
        return CollaborationSpaceMember::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->pluck('space_id')
            ->all();
    }

    public function isSpaceOwner(User $user, string $spaceId): bool
    {
        return CollaborationSpace::query()
            ->where('id', $spaceId)
            ->where('tenant_id', $user->tenant_id)
            ->where('owner_user_id', $user->id)
            ->exists();
    }
}
