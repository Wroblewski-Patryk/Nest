<?php

namespace App\Integrations\Contracts;

use App\Integrations\Support\IntegrationSyncResult;

interface IntegrationAdapter
{
    public function provider(): string;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function sync(array $payload): IntegrationSyncResult;
}
