<?php

namespace App\Integrations\Adapters;

use App\Integrations\Contracts\IntegrationAdapter;
use App\Integrations\Support\IntegrationSyncResult;
use Illuminate\Support\Str;

class GoogleTasksAdapter implements IntegrationAdapter
{
    public function provider(): string
    {
        return 'google_tasks';
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function sync(array $payload): IntegrationSyncResult
    {
        $externalId = (string) ($payload['external_id'] ?? 'gtasks-'.Str::ulid());
        $syncHash = (string) ($payload['sync_hash'] ?? hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR)));

        return new IntegrationSyncResult(
            externalId: $externalId,
            status: 'success',
            syncHash: $syncHash,
            metadata: ['adapter' => 'google_tasks']
        );
    }
}
