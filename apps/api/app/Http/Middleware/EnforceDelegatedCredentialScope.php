<?php

namespace App\Http\Middleware;

use App\Auth\DelegatedCredentialScopeCatalog;
use App\Models\User;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnforceDelegatedCredentialScope
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user instanceof User) {
            return $next($request);
        }

        $token = $user->currentAccessToken();
        if (! $token instanceof PersonalAccessToken || ! DelegatedCredentialScopeCatalog::isDelegatedToken($token)) {
            return $next($request);
        }

        if ($token->getAttribute('revoked_at') !== null) {
            throw new AuthenticationException('Delegated credential has been revoked.');
        }

        if ($token->expires_at !== null && $token->expires_at->isPast()) {
            throw new AuthenticationException('Delegated credential has expired.');
        }

        $requiredScope = DelegatedCredentialScopeCatalog::requiredScopeForRequest($request);
        if ($requiredScope === null) {
            throw new AuthorizationException('Delegated credential is not allowed for this route.');
        }

        if (! $token->can($requiredScope)) {
            throw new AuthorizationException("Missing delegated credential scope [{$requiredScope}].");
        }

        return $next($request);
    }
}

