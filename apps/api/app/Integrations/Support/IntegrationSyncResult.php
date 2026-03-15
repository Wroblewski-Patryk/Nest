<?php

namespace App\Integrations\Support;

class IntegrationSyncResult
{
    /**
     * @param  array<string, mixed>  $metadata
     */
    public function __construct(
        public readonly string $externalId,
        public readonly string $status = 'success',
        public readonly ?string $syncHash = null,
        public readonly array $metadata = [],
    ) {}
}
