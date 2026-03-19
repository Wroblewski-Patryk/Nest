<?php

namespace App\Policies;

use App\Models\IntegrationSyncFailure;
use App\Models\User;

class IntegrationSyncFailurePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, IntegrationSyncFailure $failure): bool
    {
        return $failure->tenant_id === $user->tenant_id
            && $failure->user_id === $user->id;
    }

    public function replay(User $user, IntegrationSyncFailure $failure): bool
    {
        return $this->view($user, $failure);
    }
}
