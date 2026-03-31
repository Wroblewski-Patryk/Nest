<?php

namespace App\Collaboration\Services;

use App\Models\CollaborationSpace;
use App\Models\CollaborationSpaceMember;
use App\Models\User;

class CollaborationAccessService
{
    /**
     * @var list<string>
     */
    private const EDITOR_ROLES = ['owner', 'editor', 'member'];

    /**
     * @var list<string>
     */
    private const VIEWER_ROLES = ['owner', 'editor', 'member', 'viewer'];

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

    public function roleForSpace(User $user, string $spaceId): ?string
    {
        return CollaborationSpaceMember::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('space_id', $spaceId)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->value('role');
    }

    public function isSpaceOwner(User $user, string $spaceId): bool
    {
        return CollaborationSpace::query()
            ->where('id', $spaceId)
            ->where('tenant_id', $user->tenant_id)
            ->where('owner_user_id', $user->id)
            ->exists();
    }

    public function canViewSpace(User $user, string $spaceId): bool
    {
        $role = $this->roleForSpace($user, $spaceId);

        return $role !== null && in_array($role, self::VIEWER_ROLES, true);
    }

    public function canEditSpace(User $user, string $spaceId): bool
    {
        $role = $this->roleForSpace($user, $spaceId);

        return $role !== null && in_array($role, self::EDITOR_ROLES, true);
    }
}
