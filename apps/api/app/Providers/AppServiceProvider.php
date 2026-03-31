<?php

namespace App\Providers;

use App\Integrations\Adapters\ClickUpAdapter;
use App\Integrations\Adapters\GoogleCalendarAdapter;
use App\Integrations\Adapters\GoogleTasksAdapter;
use App\Integrations\Adapters\MicrosoftTodoAdapter;
use App\Integrations\Adapters\ObsidianAdapter;
use App\Integrations\Adapters\TodoistAdapter;
use App\Integrations\Adapters\TrelloAdapter;
use App\Integrations\IntegrationAdapterRegistry;
use App\Models\Goal;
use App\Models\IntegrationSyncConflict;
use App\Models\IntegrationSyncFailure;
use App\Models\LifeArea;
use App\Models\Task;
use App\Models\TaskList;
use App\Notifications\MobilePush\LogMobilePushGateway;
use App\Notifications\MobilePush\MobilePushGateway;
use App\Observability\MetricCounter;
use App\Policies\GoalPolicy;
use App\Policies\IntegrationSyncConflictPolicy;
use App\Policies\IntegrationSyncFailurePolicy;
use App\Policies\LifeAreaPolicy;
use App\Policies\TaskListPolicy;
use App\Policies\TaskPolicy;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(IntegrationAdapterRegistry::class, function (): IntegrationAdapterRegistry {
            return new IntegrationAdapterRegistry([
                new TrelloAdapter,
                new GoogleTasksAdapter,
                new TodoistAdapter,
                new ClickUpAdapter,
                new MicrosoftTodoAdapter,
                new GoogleCalendarAdapter,
                new ObsidianAdapter,
            ]);
        });

        $this->app->singleton(MetricCounter::class, fn (): MetricCounter => new MetricCounter);
        $this->app->singleton(MobilePushGateway::class, fn (): MobilePushGateway => new LogMobilePushGateway);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(LifeArea::class, LifeAreaPolicy::class);
        Gate::policy(IntegrationSyncConflict::class, IntegrationSyncConflictPolicy::class);
        Gate::policy(IntegrationSyncFailure::class, IntegrationSyncFailurePolicy::class);
        Gate::policy(TaskList::class, TaskListPolicy::class);
        Gate::policy(Task::class, TaskPolicy::class);
        Gate::policy(Goal::class, GoalPolicy::class);

        Queue::after(function (JobProcessed $event): void {
            app(MetricCounter::class)->increment('queue.jobs.processed');
        });

        Queue::failing(function (JobFailed $event): void {
            app(MetricCounter::class)->increment('queue.jobs.failed');
        });
    }
}
