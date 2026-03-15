<?php

namespace App\Http\Middleware;

use App\Observability\MetricCounter;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AttachTraceId
{
    public function __construct(
        private readonly MetricCounter $metrics
    ) {}

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $traceId = (string) ($request->header('X-Trace-Id') ?: Str::uuid());

        $request->attributes->set('trace_id', $traceId);
        Log::withContext([
            'trace_id' => $traceId,
            'path' => $request->path(),
            'method' => $request->method(),
        ]);

        $response = $next($request);
        $response->headers->set('X-Trace-Id', $traceId);

        $this->metrics->increment('api.requests.total');
        if ($response->getStatusCode() >= 500) {
            $this->metrics->increment('api.requests.error');
        }

        return $response;
    }
}
