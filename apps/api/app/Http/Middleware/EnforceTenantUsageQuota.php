<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Tenancy\Services\TenantUsageQuotaService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceTenantUsageQuota
{
    public function __construct(
        private readonly TenantUsageQuotaService $quotaService
    ) {}

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethod('post')) {
            return $next($request);
        }

        /** @var User|null $user */
        $user = $request->user();
        if ($user === null) {
            return $next($request);
        }

        $resource = $this->resolveQuotaResource($request);
        if ($resource !== null) {
            $this->quotaService->enforce((string) $user->tenant_id, $resource);
        }

        return $next($request);
    }

    private function resolveQuotaResource(Request $request): ?string
    {
        $path = trim($request->path(), '/');

        return match (true) {
            $path === 'api/v1/lists' => 'task_lists',
            $path === 'api/v1/tasks' => 'tasks',
            $path === 'api/v1/habits' => 'habits',
            preg_match('#^api/v1/habits/[^/]+/logs$#', $path) === 1 => 'habit_logs',
            $path === 'api/v1/routines' => 'routines',
            $path === 'api/v1/goals' => 'goals',
            $path === 'api/v1/targets' => 'targets',
            $path === 'api/v1/life-areas' => 'life_areas',
            $path === 'api/v1/journal-entries' => 'journal_entries',
            $path === 'api/v1/calendar-events' => 'calendar_events',
            $path === 'api/v1/automations/rules' => 'automation_rules',
            default => null,
        };
    }
}
