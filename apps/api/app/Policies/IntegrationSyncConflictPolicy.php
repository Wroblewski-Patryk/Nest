<?php

namespace App\Policies;

use App\Models\IntegrationSyncConflict;
use App\Models\User;

class IntegrationSyncConflictPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, IntegrationSyncConflict $conflict): bool
    {
        return $conflict->tenant_id === $user->tenant_id
            && $conflict->user_id === $user->id;
    }

    public function resolve(User $user, IntegrationSyncConflict $conflict): bool
    {
        return $this->view($user, $conflict);
    }
}
