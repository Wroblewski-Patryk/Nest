<?php

namespace App\Policies;

use App\Models\IntegrationSyncFailure;
use App\Models\User;
use App\Policies\Concerns\ResolvesActorContextForPolicy;

class IntegrationSyncFailurePolicy
{
    use ResolvesActorContextForPolicy;

    public function viewAny(User $user): bool
    {
        return $this->hasSupportedActorContext();
    }

    public function view(User $user, IntegrationSyncFailure $failure): bool
    {
        if (! $this->hasSupportedActorContext()) {
            return false;
        }

        return $failure->tenant_id === $user->tenant_id
            && $failure->user_id === $user->id;
    }

    public function replay(User $user, IntegrationSyncFailure $failure): bool
    {
        return $this->view($user, $failure);
    }
}
