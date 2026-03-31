<?php

namespace App\Http\Middleware;

use App\Auth\DelegatedCredentialScopeCatalog;
use App\Models\ActorBoundaryAudit;
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
        if (! $token instanceof PersonalAccessToken) {
            return $next($request);
        }

        $tokenMode = DelegatedCredentialScopeCatalog::resolveTokenMode($token);
        if ($tokenMode === null) {
            return $next($request);
        }

        if ($tokenMode === 'delegated' && ! $user->isHumanPrincipal()) {
            $this->recordBoundaryAudit($request, $user, $tokenMode, 'boundary_mismatch');
            throw new AuthorizationException('Delegated credential requires human principal.');
        }

        if ($tokenMode === 'ai_agent' && ! $user->isAiAgentPrincipal()) {
            $this->recordBoundaryAudit($request, $user, $tokenMode, 'boundary_mismatch');
            throw new AuthorizationException('AI agent credential requires ai_agent principal.');
        }

        if ($user->isAiAgentPrincipal() && $user->agent_status === User::AGENT_STATUS_REVOKED) {
            $this->recordBoundaryAudit($request, $user, $tokenMode, 'ai_agent_revoked');
            throw new AuthenticationException('AI agent principal has been revoked.');
        }

        if ($token->getAttribute('revoked_at') !== null) {
            $this->recordBoundaryAudit($request, $user, $tokenMode, 'credential_revoked');
            throw new AuthenticationException('Delegated credential has been revoked.');
        }

        if ($token->expires_at !== null && $token->expires_at->isPast()) {
            $this->recordBoundaryAudit($request, $user, $tokenMode, 'credential_expired');
            throw new AuthenticationException('Delegated credential has expired.');
        }

        $requiredScope = DelegatedCredentialScopeCatalog::requiredScopeForRequest($request);
        if ($requiredScope === null) {
            $this->recordBoundaryAudit($request, $user, $tokenMode, 'route_not_allowed');
            throw new AuthorizationException('Delegated credential is not allowed for this route.');
        }

        if (! $token->can($requiredScope)) {
            $this->recordBoundaryAudit($request, $user, $tokenMode, 'missing_scope', $requiredScope);
            throw new AuthorizationException("Missing delegated credential scope [{$requiredScope}].");
        }

        return $next($request);
    }

    private function recordBoundaryAudit(
        Request $request,
        User $user,
        string $tokenMode,
        string $reason,
        ?string $requiredScope = null
    ): void {
        ActorBoundaryAudit::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'principal_type' => (string) ($user->principal_type ?? User::PRINCIPAL_HUMAN_USER),
            'token_mode' => $tokenMode,
            'route' => '/'.$request->path(),
            'method' => $request->method(),
            'reason' => $reason,
            'required_scope' => $requiredScope,
            'metadata' => [
                'actor_type' => $tokenMode === 'ai_agent' ? 'ai_agent' : 'delegated_agent',
            ],
            'occurred_at' => now(),
        ]);
    }
}
