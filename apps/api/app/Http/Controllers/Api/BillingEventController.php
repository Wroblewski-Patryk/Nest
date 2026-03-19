<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TenantBillingEvent;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillingEventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $events = TenantBillingEvent::query()
            ->where('tenant_id', $user->tenant_id)
            ->when($request->filled('event_name'), function ($query) use ($request): void {
                $query->where('event_name', $request->string('event_name')->toString());
            })
            ->orderByDesc('occurred_at')
            ->paginate((int) $request->integer('per_page', 20));

        return response()->json([
            'data' => $events->items(),
            'meta' => [
                'page' => $events->currentPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ],
        ]);
    }
}
