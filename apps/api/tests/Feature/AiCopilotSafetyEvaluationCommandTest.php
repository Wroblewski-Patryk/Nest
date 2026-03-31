<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class AiCopilotSafetyEvaluationCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_produces_scorecard_with_all_safety_categories(): void
    {
        $exitCode = Artisan::call('ai:copilot-safety-eval', [
            '--json' => true,
        ]);

        $this->assertSame(0, $exitCode);

        /** @var array<string, mixed>|null $scorecard */
        $scorecard = json_decode(Artisan::output(), true);
        $this->assertIsArray($scorecard);
        $this->assertSame('ai-copilot-safety-eval.v1', $scorecard['schema_version'] ?? null);
        $this->assertSame('pass', data_get($scorecard, 'summary.status'));

        $this->assertGreaterThan(0, (int) data_get($scorecard, 'categories.policy.total'));
        $this->assertSame(
            (int) data_get($scorecard, 'categories.policy.total'),
            (int) data_get($scorecard, 'categories.policy.passed')
        );

        $this->assertGreaterThan(0, (int) data_get($scorecard, 'categories.hallucination.total'));
        $this->assertSame(
            (int) data_get($scorecard, 'categories.hallucination.total'),
            (int) data_get($scorecard, 'categories.hallucination.passed')
        );

        $this->assertGreaterThan(0, (int) data_get($scorecard, 'categories.action_safety.total'));
        $this->assertSame(
            (int) data_get($scorecard, 'categories.action_safety.total'),
            (int) data_get($scorecard, 'categories.action_safety.passed')
        );
    }

    public function test_command_blocks_promotion_when_minimum_score_threshold_is_not_met(): void
    {
        $exitCode = Artisan::call('ai:copilot-safety-eval', [
            '--json' => true,
            '--min-score' => 101,
        ]);

        $this->assertSame(1, $exitCode);

        /** @var array<string, mixed>|null $scorecard */
        $scorecard = json_decode(Artisan::output(), true);
        $this->assertIsArray($scorecard);
        $this->assertSame('fail', data_get($scorecard, 'summary.status'));
        $this->assertSame(101.0, (float) data_get($scorecard, 'threshold.min_score_percent'));
    }
}
