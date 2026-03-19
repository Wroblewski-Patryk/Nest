<?php

use App\Http\Middleware\AttachTraceId;
use App\Http\Middleware\EnforceBillingEntitlements;
use App\Http\Middleware\EnforceTenantUsageQuota;
use App\Http\Middleware\EnsureAiSurfaceEnabled;
use App\Tenancy\Exceptions\TenantQuotaExceededException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/health',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            AttachTraceId::class,
        ]);
        $middleware->alias([
            'ai.surface' => EnsureAiSurfaceEnabled::class,
            'entitlements' => EnforceBillingEntitlements::class,
            'tenant.usage' => EnforceTenantUsageQuota::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $errorEnvelope = static function (
            Request $request,
            int $status,
            string $code,
            string $message,
            bool $retryable,
            array $details = [],
            ?array $legacyErrors = null
        ) {
            if (! $request->is('api/*')) {
                return null;
            }

            $payload = [
                'message' => $message,
                'error' => [
                    'code' => $code,
                    'retryable' => $retryable,
                    'http_status' => $status,
                    'details' => $details,
                    ...$details,
                ],
                'meta' => [
                    'contract_version' => '2026-03-19.error.v1',
                ],
            ];

            if ($legacyErrors !== null) {
                $payload['errors'] = $legacyErrors;
            }

            return response()->json($payload, $status);
        };

        $exceptions->render(function (TenantQuotaExceededException $exception, Request $request) use ($errorEnvelope) {
            $details = [
                'resource' => $exception->resource(),
                'limit' => $exception->limit(),
                'current' => $exception->current(),
            ];

            return $errorEnvelope(
                request: $request,
                status: 429,
                code: 'tenant_quota_exceeded',
                message: $exception->getMessage(),
                retryable: false,
                details: $details
            );
        });

        $exceptions->render(function (ValidationException $exception, Request $request) use ($errorEnvelope) {
            return $errorEnvelope(
                request: $request,
                status: 422,
                code: 'validation_failed',
                message: $exception->getMessage(),
                retryable: false,
                details: [],
                legacyErrors: $exception->errors()
            );
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) use ($errorEnvelope) {
            return $errorEnvelope(
                request: $request,
                status: 401,
                code: 'auth_required',
                message: $exception->getMessage(),
                retryable: false
            );
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request) use ($errorEnvelope) {
            return $errorEnvelope(
                request: $request,
                status: 403,
                code: 'forbidden',
                message: $exception->getMessage(),
                retryable: false
            );
        });

        $exceptions->render(function (AccessDeniedHttpException $exception, Request $request) use ($errorEnvelope) {
            return $errorEnvelope(
                request: $request,
                status: 403,
                code: 'forbidden',
                message: $exception->getMessage() !== '' ? $exception->getMessage() : 'Forbidden.',
                retryable: false
            );
        });

        $exceptions->render(function (ModelNotFoundException $exception, Request $request) use ($errorEnvelope) {
            return $errorEnvelope(
                request: $request,
                status: 404,
                code: 'resource_not_found',
                message: 'Resource not found.',
                retryable: false
            );
        });

        $exceptions->render(function (NotFoundHttpException $exception, Request $request) use ($errorEnvelope) {
            return $errorEnvelope(
                request: $request,
                status: 404,
                code: 'resource_not_found',
                message: 'Resource not found.',
                retryable: false
            );
        });

        $exceptions->render(function (TooManyRequestsHttpException $exception, Request $request) use ($errorEnvelope) {
            $retryAfter = $exception->getHeaders()['Retry-After'] ?? null;

            return $errorEnvelope(
                request: $request,
                status: 429,
                code: 'rate_limited',
                message: 'Too many requests.',
                retryable: true,
                details: [
                    'retry_after' => $retryAfter !== null ? (int) $retryAfter : null,
                ]
            );
        });
    })->create();
