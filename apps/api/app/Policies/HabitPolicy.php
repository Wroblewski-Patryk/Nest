<?php

namespace App\Policies;

use App\Models\Habit;
use App\Models\User;
use App\Policies\Concerns\ResolvesActorContextForPolicy;

class HabitPolicy
{
    use ResolvesActorContextForPolicy;

    public function viewAny(User $user): bool
    {
        return $this->hasSupportedActorContext();
    }

    public function view(User $user, Habit $habit): bool
    {
        if (! $this->hasSupportedActorContext()) {
            return false;
        }

        return $habit->tenant_id === $user->tenant_id
            && $habit->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $this->hasSupportedActorContext();
    }

    public function update(User $user, Habit $habit): bool
    {
        return $this->view($user, $habit);
    }

    public function delete(User $user, Habit $habit): bool
    {
        return $this->view($user, $habit);
    }

    public function log(User $user, Habit $habit): bool
    {
        return $this->update($user, $habit);
    }
}
