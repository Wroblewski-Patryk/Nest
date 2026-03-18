<?php

namespace App\Tenancy\Services;

use App\Tenancy\Exceptions\TenantQuotaExceededException;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

class TenantUsageQuotaService
{
    public function enforce(string $tenantId, string $resource): void
    {
        /** @var array{model: class-string<Model>, limit: int}|null $definition */
        $definition = config("tenant_usage_limits.resources.{$resource}");
        if ($definition === null) {
            throw new InvalidArgumentException("Unknown tenant quota resource [{$resource}].");
        }

        $limit = (int) ($definition['limit'] ?? 0);
        if ($limit <= 0) {
            return;
        }

        $model = $definition['model'];
        $current = $model::query()->where('tenant_id', $tenantId)->count();

        if ($current >= $limit) {
            throw new TenantQuotaExceededException($resource, $limit, $current);
        }
    }
}
