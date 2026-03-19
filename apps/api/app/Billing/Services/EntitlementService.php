<?php

namespace App\Billing\Services;

use App\Models\TenantSubscription;

class EntitlementService
{
    /**
     * @return array<string, string>
     */
    public function allForTenant(string $tenantId): array
    {
        $subscription = TenantSubscription::query()
            ->with('plan.entitlements')
            ->where('tenant_id', $tenantId)
            ->first();

        if ($subscription === null) {
            return [];
        }

        $map = [];
        foreach ($subscription->plan->entitlements as $entitlement) {
            $map[(string) $entitlement->key] = (string) $entitlement->value;
        }

        return $map;
    }

    public function hasSubscription(string $tenantId): bool
    {
        return TenantSubscription::query()->where('tenant_id', $tenantId)->exists();
    }

    public function isEnabled(string $tenantId, string $key, bool $default = true): bool
    {
        $all = $this->allForTenant($tenantId);
        if (! array_key_exists($key, $all)) {
            return $default;
        }

        return filter_var($all[$key], FILTER_VALIDATE_BOOL);
    }

    public function limit(string $tenantId, string $key): ?int
    {
        $all = $this->allForTenant($tenantId);
        if (! array_key_exists($key, $all)) {
            return null;
        }

        return max(0, (int) $all[$key]);
    }
}
