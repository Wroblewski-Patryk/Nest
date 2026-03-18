<?php

namespace App\Jobs;

use App\Tenancy\Services\TenantDataDeletionService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DeleteTenantDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /**
     * @var array<int, int>
     */
    public array $backoff = [30, 120];

    public function __construct(
        public readonly string $tenantId,
        public readonly bool $dryRun = false
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function handle(TenantDataDeletionService $service): array
    {
        return $service->run($this->tenantId, $this->dryRun);
    }
}
