<?php

namespace App\Http\Middleware;

use App\Actors\ActorContext;
use App\Auth\DelegatedCredentialScopeCatalog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class ResolveActorContext
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $actorUserId = $user?->id !== null ? (string) $user->id : null;
        $currentToken = $user?->currentAccessToken();

        $actorType = ActorContext::HUMAN_USER;
        if (
            $currentToken instanceof PersonalAccessToken
            && DelegatedCredentialScopeCatalog::isDelegatedToken($currentToken)
        ) {
            $actorType = ActorContext::DELEGATED_AGENT;
        } else {
            $rawHeaderType = Str::lower((string) $request->header('X-Nest-Actor-Type', ''));
            if (
                in_array($rawHeaderType, [ActorContext::AI_AGENT, ActorContext::DELEGATED_AGENT], true)
                && app()->environment(['local', 'testing'])
            ) {
                $actorType = $rawHeaderType;
            }
        }

        $delegatorUserId = null;
        if ($actorType === ActorContext::DELEGATED_AGENT) {
            $headerDelegator = (string) $request->header('X-Nest-Delegator-User-Id', '');
            $delegatorUserId = Str::isUuid($headerDelegator) ? $headerDelegator : $actorUserId;
        }

        $context = new ActorContext(
            actorType: $actorType,
            actorUserId: $actorUserId,
            delegatorUserId: $delegatorUserId,
        );

        $request->attributes->set(ActorContext::REQUEST_ATTRIBUTE, $context);

        $response = $next($request);
        $response->headers->set('X-Nest-Actor-Type', $context->actorType);

        return $response;
    }
}
