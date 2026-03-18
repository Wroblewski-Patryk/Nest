<?php

namespace App\Http\Controllers\Api;

use App\Automation\Services\AutomationEngineService;
use App\Http\Controllers\Controller;
use App\Models\AutomationRule;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AutomationRuleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $rules = AutomationRule::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate((int) $request->integer('per_page', 15));

        return response()->json([
            'data' => $rules->items(),
            'meta' => [
                'page' => $rules->currentPage(),
                'per_page' => $rules->perPage(),
                'total' => $rules->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $payload = $this->validateRulePayload($request, false);

        $rule = AutomationRule::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            ...$payload,
        ]);

        return response()->json(['data' => $rule], 201);
    }

    public function show(Request $request, string $ruleId): JsonResponse
    {
        $rule = $this->resolveRule($request, $ruleId);

        return response()->json(['data' => $rule]);
    }

    public function update(Request $request, string $ruleId): JsonResponse
    {
        $rule = $this->resolveRule($request, $ruleId);
        $payload = $this->validateRulePayload($request, true);
        $rule->fill($payload);
        $rule->save();

        return response()->json(['data' => $rule->fresh()]);
    }

    public function destroy(Request $request, string $ruleId): JsonResponse
    {
        $rule = $this->resolveRule($request, $ruleId);
        $rule->delete();

        return response()->json(status: 204);
    }

    public function execute(
        Request $request,
        string $ruleId,
        AutomationEngineService $engineService
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $rule = $this->resolveRule($request, $ruleId);
        $payload = $request->validate([
            'trigger_payload' => ['sometimes', 'array'],
        ]);

        /** @var array<string, mixed> $triggerPayload */
        $triggerPayload = $payload['trigger_payload'] ?? [];
        $run = $engineService->executeRule($rule, $user, $triggerPayload);

        return response()->json([
            'data' => $run,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateRulePayload(Request $request, bool $partial): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:120'],
            'status' => ['sometimes', 'string', 'in:active,paused'],
            'trigger' => [$required, 'array'],
            'trigger.type' => [$required, 'string', 'in:event,schedule,metric_threshold'],
            'conditions' => [$required, 'array', 'max:10'],
            'conditions.*.field' => ['required', 'string'],
            'conditions.*.operator' => ['required', 'string', 'in:equals,not_equals,contains,greater_than,less_than,in'],
            'conditions.*.value' => ['nullable'],
            'actions' => [$required, 'array', 'min:1', 'max:10'],
            'actions.*.type' => ['required', 'string', 'in:create_task,update_task,schedule_event,log_habit,create_journal_entry,send_notification'],
            'actions.*.payload' => ['required', 'array'],
        ]);
    }

    private function resolveRule(Request $request, string $ruleId): AutomationRule
    {
        /** @var User $user */
        $user = $request->user();

        return AutomationRule::query()
            ->where('tenant_id', $user->tenant_id)
            ->where('user_id', $user->id)
            ->findOrFail($ruleId);
    }
}
