<?php

namespace App\Policies;

use App\Collaboration\Services\CollaborationAccessService;
use App\Models\TaskList;
use App\Models\User;
use App\Policies\Concerns\ResolvesActorContextForPolicy;

class TaskListPolicy
{
    use ResolvesActorContextForPolicy;

    public function __construct(
        private readonly CollaborationAccessService $access
    ) {}

    public function view(User $user, TaskList $list): bool
    {
        if (! $this->hasSupportedActorContext()) {
            return false;
        }

        if ($list->tenant_id !== $user->tenant_id) {
            return false;
        }

        if ($list->visibility !== 'shared') {
            return $list->user_id === $user->id;
        }

        if ($list->collaboration_space_id === null) {
            return false;
        }

        return $this->access->canViewSpace($user, $list->collaboration_space_id);
    }

    public function update(User $user, TaskList $list): bool
    {
        if (! $this->hasSupportedActorContext()) {
            return false;
        }

        if ($list->tenant_id !== $user->tenant_id) {
            return false;
        }

        if ($list->visibility !== 'shared') {
            return $list->user_id === $user->id;
        }

        if ($list->collaboration_space_id === null) {
            return false;
        }

        return $this->access->canEditSpace($user, $list->collaboration_space_id);
    }

    public function delete(User $user, TaskList $list): bool
    {
        return $this->update($user, $list);
    }
}
