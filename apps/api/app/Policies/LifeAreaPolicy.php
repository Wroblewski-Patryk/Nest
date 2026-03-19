<?php

namespace App\Policies;

use App\Models\LifeArea;
use App\Models\User;

class LifeAreaPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, LifeArea $lifeArea): bool
    {
        return $lifeArea->tenant_id === $user->tenant_id
            && $lifeArea->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
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
