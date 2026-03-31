<?php

namespace App\Collaboration\Services;

use App\Models\AssignmentTimeline;
use Illuminate\Support\Collection;

class AssignmentTimelineService
{
    public function record(
        string $tenantId,
        string $entityType,
        string $entityId,
        string $action,
        ?string $fromUserId,
        ?string $toUserId,
        ?string $changedByUserId,
        ?string $note = null
    ): AssignmentTimeline {
        return AssignmentTimeline::query()->create([
            'tenant_id' => $tenantId,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'action' => $action,
            'from_user_id' => $fromUserId,
            'to_user_id' => $toUserId,
            'changed_by_user_id' => $changedByUserId,
            'note' => $note,
            'occurred_at' => now(),
        ]);
    }

    /**
     * @return Collection<int, AssignmentTimeline>
     */
    public function forEntity(string $tenantId, string $entityType, string $entityId): Collection
    {
        return AssignmentTimeline::query()
            ->with(['fromUser:id,name,email', 'toUser:id,name,email', 'changedBy:id,name,email'])
            ->where('tenant_id', $tenantId)
            ->where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->orderByDesc('occurred_at')
            ->orderByDesc('created_at')
            ->get();
    }
}
