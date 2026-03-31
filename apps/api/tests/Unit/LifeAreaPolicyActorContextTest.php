<?php

namespace Tests\Unit;

use App\Actors\ActorContext;
use App\Models\LifeArea;
use App\Models\Tenant;
use App\Models\User;
use App\Policies\LifeAreaPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class LifeAreaPolicyActorContextTest extends TestCase
{
    use RefreshDatabase;

    public function test_policy_allows_supported_actor_context(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $lifeArea = LifeArea::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);

        $request = Request::create('/api/v1/life-areas', 'GET');
        $request->attributes->set(
            ActorContext::REQUEST_ATTRIBUTE,
            new ActorContext(ActorContext::HUMAN_USER, $user->id, null)
        );
        $this->app->instance('request', $request);

        $policy = new LifeAreaPolicy;

        $this->assertTrue($policy->view($user, $lifeArea));
        $this->assertTrue($policy->create($user));
    }

    public function test_policy_rejects_unsupported_actor_context(): void
    {
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $lifeArea = LifeArea::factory()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
        ]);

        $request = Request::create('/api/v1/life-areas', 'GET');
        $request->attributes->set(
            ActorContext::REQUEST_ATTRIBUTE,
            new ActorContext('unsupported', $user->id, null)
        );
        $this->app->instance('request', $request);

        $policy = new LifeAreaPolicy;

        $this->assertFalse($policy->view($user, $lifeArea));
        $this->assertFalse($policy->create($user));
    }
}
