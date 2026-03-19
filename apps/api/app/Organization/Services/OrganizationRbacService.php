<?php

namespace App\Organization\Services;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\User;

class OrganizationRbacService
{
    /**
     * @var array<string, list<string>>
     */
    private array $policyMatrix = [
        'org.view' => ['owner', 'admin', 'member'],
        'org.members.create' => ['owner'],
        'org.members.update_role' => ['owner'],
        'workspace.create' => ['owner', 'admin'],
        'org.sso.manage' => ['owner', 'admin'],
        'org.audit.export' => ['owner', 'admin'],
    ];

    public function can(User $user, Organization $organization, string $permission): bool
    {
        $allowedRoles = $this->policyMatrix[$permission] ?? [];
        if ($allowedRoles === []) {
            return false;
        }

        $role = $this->roleForUser($user, $organization);
        if ($role === null) {
            return false;
        }

        return in_array($role, $allowedRoles, true);
    }

    public function roleForUser(User $user, Organization $organization): ?string
    {
        if ((string) $organization->owner_user_id === (string) $user->id) {
            return 'owner';
        }

        /** @var OrganizationMember|null $member */
        $member = OrganizationMember::query()
            ->where('organization_id', $organization->id)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        return $member?->role;
    }
}
