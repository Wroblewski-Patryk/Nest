<?php

namespace App\Policies;

use App\Models\LifeArea;
use App\Models\User;
use App\Policies\Concerns\ResolvesActorContextForPolicy;

class LifeAreaPolicy
{
    use ResolvesActorContextForPolicy;

    public function viewAny(User $user): bool
    {
        return $this->hasSupportedActorContext();
    }

    public function view(User $user, LifeArea $lifeArea): bool
    {
        if (! $this->hasSupportedActorContext()) {
            return false;
        }

        return $lifeArea->tenant_id === $user->tenant_id
            && $lifeArea->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $this->hasSupportedActorContext();
    }

    public function update(User $user, LifeArea $lifeArea): bool
    {
        return $this->view($user, $lifeArea);
    }

    public function delete(User $user, LifeArea $lifeArea): bool
    {
        return $this->view($user, $lifeArea);
    }
}
