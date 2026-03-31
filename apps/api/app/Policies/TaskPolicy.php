<?php

namespace App\Policies;

use App\Collaboration\Services\CollaborationAccessService;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function __construct(
        private readonly CollaborationAccessService $access
    ) {}

    public function view(User $user, Task $task): bool
    {
        if ($task->tenant_id !== $user->tenant_id) {
            return false;
        }

        $task->loadMissing('list');
        $list = $task->list;
        if ($list === null) {
            return false;
        }

        if ($list->visibility !== 'shared') {
            return $task->user_id === $user->id || $task->assignee_user_id === $user->id;
        }

        if ($list->collaboration_space_id === null) {
            return false;
        }

        return $this->access->canViewSpace($user, $list->collaboration_space_id);
    }

    public function update(User $user, Task $task): bool
    {
        if ($task->tenant_id !== $user->tenant_id) {
            return false;
        }

        $task->loadMissing('list');
        $list = $task->list;
        if ($list === null) {
            return false;
        }

        if ($list->visibility !== 'shared') {
            return $task->user_id === $user->id || $task->assignee_user_id === $user->id;
        }

        if ($list->collaboration_space_id === null) {
            return false;
        }

        return $this->access->canEditSpace($user, $list->collaboration_space_id);
    }

    public function delete(User $user, Task $task): bool
    {
        if ($task->tenant_id !== $user->tenant_id) {
            return false;
        }

        return $task->user_id === $user->id;
    }
}
