<?php

namespace App\Actors;

final class ActorContext
{
    public const REQUEST_ATTRIBUTE = 'nest.actor_context';

    public const HUMAN_USER = 'human_user';

    public const AI_AGENT = 'ai_agent';

    public const DELEGATED_AGENT = 'delegated_agent';

    /**
     * @var array<int, string>
     */
    public const ALLOWED_TYPES = [
        self::HUMAN_USER,
        self::AI_AGENT,
        self::DELEGATED_AGENT,
    ];

    public function __construct(
        public readonly string $actorType,
        public readonly ?string $actorUserId,
        public readonly ?string $delegatorUserId,
    ) {}

    public function toArray(): array
    {
        return [
            'actor_type' => $this->actorType,
            'actor_user_id' => $this->actorUserId,
            'delegator_user_id' => $this->delegatorUserId,
        ];
    }
}
