<?php

namespace App\Http\Middleware;

use App\Billing\Services\EntitlementService;
use App\Models\AutomationRule;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceBillingEntitlements
{
    public function __construct(
        private readonly EntitlementService $entitlements
    ) {}

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();
        if ($user === null) {
            return $next($request);
        }

        $tenantId = (string) $user->tenant_id;
        if (! $this->entitlements->hasSubscription($tenantId)) {
            return $next($request);
        }

        $path = trim($request->path(), '/');

        if ($path === 'api/v1/ai/weekly-plan/propose') {
            if (! $this->entitlements->isEnabled($tenantId, 'ai.weekly_planning.enabled', true)) {
                return $this->featureDenied('ai.weekly_planning.enabled');
            }
        }

        if ($path === 'api/v1/ai/feedback') {
            if (! $this->entitlements->isEnabled($tenantId, 'ai.feedback.enabled', true)) {
                return $this->featureDenied('ai.feedback.enabled');
            }
        }

        if ($request->isMethod('post') && $path === 'api/v1/automations/rules') {
            $limit = $this->entitlements->limit($tenantId, 'automation.rules.max');
            if ($limit !== null) {
                $current = AutomationRule::query()
                    ->where('tenant_id', $tenantId)
                    ->count();

                if ($current >= $limit) {
                    return response()->json([
                        'message' => 'Entitlement limit exceeded.',
                        'error' => [
                            'code' => 'entitlement_limit_exceeded',
                            'entitlement' => 'automation.rules.max',
                            'limit' => $limit,
                            'current' => $current,
                        ],
                    ], 403);
                }
            }
        }

        return $next($request);
    }

    private function featureDenied(string $entitlement): Response
    {
        return response()->json([
            'message' => 'Feature disabled for current plan.',
            'error' => [
                'code' => 'entitlement_denied',
                'entitlement' => $entitlement,
            ],
        ], 403);
    }
}
