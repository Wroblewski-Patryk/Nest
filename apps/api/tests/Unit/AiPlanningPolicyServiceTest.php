<?php

namespace Tests\Unit;

use App\AI\Policy\AiPlanningPolicyService;
use Tests\TestCase;

class AiPlanningPolicyServiceTest extends TestCase
{
    public function test_service_allows_empty_or_safe_context(): void
    {
        $service = new AiPlanningPolicyService;

        $this->assertSame(
            ['allowed' => true, 'reason_codes' => []],
            $service->evaluateWeeklyPlanningContext(null)
        );
        $this->assertSame(
            ['allowed' => true, 'reason_codes' => []],
            $service->evaluateWeeklyPlanningContext('Plan balanced sprint and recovery.')
        );
    }

    public function test_service_flags_privacy_and_wellbeing_violations(): void
    {
        $service = new AiPlanningPolicyService;

        $privacy = $service->evaluateWeeklyPlanningContext('Use someone else private data and password.');
        $wellbeing = $service->evaluateWeeklyPlanningContext('Plan 24/7 output with no sleep.');

        $this->assertFalse($privacy['allowed']);
        $this->assertSame(['policy_privacy_boundary'], $privacy['reason_codes']);
        $this->assertFalse($wellbeing['allowed']);
        $this->assertSame(['policy_wellbeing_guardrail'], $wellbeing['reason_codes']);
    }
}
