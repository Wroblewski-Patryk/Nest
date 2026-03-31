<?php

namespace App\Policies;

use App\Collaboration\Services\CollaborationAccessService;
use App\Models\Goal;
use App\Models\User;

class GoalPolicy
{
    public function __construct(
        private readonly CollaborationAccessService $access
    ) {}

    public function view(User $user, Goal $goal): bool
    {
        if ($goal->tenant_id !== $user->tenant_id) {
            return false;
        }

        if ($goal->visibility !== 'shared') {
            return $goal->user_id === $user->id;
        }

        if ($goal->collaboration_space_id === null) {
            return false;
        }

        return $this->access->canViewSpace($user, $goal->collaboration_space_id);
    }

    public function update(User $user, Goal $goal): bool
    {
        if ($goal->tenant_id !== $user->tenant_id) {
            return false;
        }

        if ($goal->visibility !== 'shared') {
            return $goal->user_id === $user->id;
        }

        if ($goal->collaboration_space_id === null) {
            return false;
        }

        return $this->access->canEditSpace($user, $goal->collaboration_space_id);
    }

    public function delete(User $user, Goal $goal): bool
    {
        return $this->update($user, $goal);
    }
}
