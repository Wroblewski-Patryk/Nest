<?php

namespace App\Policies\Concerns;

use App\Actors\ActorContext;

trait ResolvesActorContextForPolicy
{
    protected function hasSupportedActorContext(): bool
    {
        $request = request();
        if ($request === null) {
            return true;
        }

        $context = $request->attributes->get(ActorContext::REQUEST_ATTRIBUTE);
        if (! $context instanceof ActorContext) {
            return true;
        }

        return in_array($context->actorType, ActorContext::ALLOWED_TYPES, true);
    }
}
