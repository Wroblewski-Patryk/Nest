<?php

namespace App\Policies;

use App\Models\IntegrationSyncConflict;
use App\Models\User;
use App\Policies\Concerns\ResolvesActorContextForPolicy;

class IntegrationSyncConflictPolicy
{
    use ResolvesActorContextForPolicy;

    public function viewAny(User $user): bool
    {
        return $this->hasSupportedActorContext();
    }

    public function view(User $user, IntegrationSyncConflict $conflict): bool
    {
        if (! $this->hasSupportedActorContext()) {
            return false;
        }

        return $conflict->tenant_id === $user->tenant_id
            && $conflict->user_id === $user->id;
    }

    public function resolve(User $user, IntegrationSyncConflict $conflict): bool
    {
        return $this->view($user, $conflict);
    }
}
