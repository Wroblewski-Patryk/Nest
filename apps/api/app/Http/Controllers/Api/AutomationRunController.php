<?php

namespace App\Http\Controllers\Api;

use App\Automation\Services\AutomationEngineService;
use App\Http\Controllers\Controller;
use App\Models\AutomationRun;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AutomationRunController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $runs = AutomationRun::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->when($request->filled('rule_id'), function ($query) use ($request): void {
                $query->where('rule_id', $request->string('rule_id')->toString());
            })
            ->when($request->filled('status'), function ($query) use ($request): void {
                $query->where('status', $request->string('status')->toString());
            })
            ->orderByDesc('started_at')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $runs->items(),
            'meta' => [
                'page' => $runs->currentPage(),
                'per_page' => $runs->perPage(),
                'total' => $runs->total(),
            ],
        ]);
    }

    public function show(Request $request, string $runId): JsonResponse
    {
        $run = $this->resolveRun($request, $runId);

        return response()->json(['data' => $run]);
    }

    public function replay(
        Request $request,
        string $runId,
        AutomationEngineService $engineService
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $run = $this->resolveRun($request, $runId);
        $rule = $run->rule;
        if ($rule === null) {
            abort(404);
        }

        $replayedRun = $engineService->executeRule($rule, $user, $run->trigger_payload ?? []);

        return response()->json([
            'data' => $replayedRun,
        ]);
    }

    private function resolveRun(Request $request, string $runId): AutomationRun
    {
        /** @var User $user */
        $user = $request->user();

        return AutomationRun::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($runId);
    }
}
