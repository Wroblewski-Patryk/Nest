<?php

namespace App\AI\Policy;

class AiPlanningPolicyService
{
    /**
     * @return array{allowed: bool, reason_codes: list<string>}
     */
    public function evaluateWeeklyPlanningContext(?string $context): array
    {
        if ($context === null || trim($context) === '') {
            return [
                'allowed' => true,
                'reason_codes' => [],
            ];
        }

        $normalized = mb_strtolower($context);
        $reasonCodes = [];

        if ($this->containsAny($normalized, [
            'someone else',
            'other person account',
            'steal',
            'password',
            'private data',
        ])) {
            $reasonCodes[] = 'policy_privacy_boundary';
        }

        if ($this->containsAny($normalized, [
            '24/7',
            'no sleep',
            'skip sleep',
            'all night',
            'without rest',
        ])) {
            $reasonCodes[] = 'policy_wellbeing_guardrail';
        }

        return [
            'allowed' => $reasonCodes === [],
            'reason_codes' => array_values(array_unique($reasonCodes)),
        ];
    }

    /**
     * @param  list<string>  $phrases
     */
    private function containsAny(string $text, array $phrases): bool
    {
        foreach ($phrases as $phrase) {
            if (str_contains($text, $phrase)) {
                return true;
            }
        }

        return false;
    }
}
