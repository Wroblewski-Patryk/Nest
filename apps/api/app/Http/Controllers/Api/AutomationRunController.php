<?php

namespace App\Http\Controllers\Api;

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
}
