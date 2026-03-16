<?php

namespace App\Providers;

use App\Integrations\Adapters\GoogleCalendarAdapter;
use App\Integrations\Adapters\GoogleTasksAdapter;
use App\Integrations\Adapters\ObsidianAdapter;
use App\Integrations\Adapters\TodoistAdapter;
use App\Integrations\Adapters\TrelloAdapter;
use App\Integrations\IntegrationAdapterRegistry;
use App\Observability\MetricCounter;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Queue\Events\JobProcessed;
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
                new GoogleCalendarAdapter,
                new ObsidianAdapter,
            ]);
        });

        $this->app->singleton(MetricCounter::class, fn (): MetricCounter => new MetricCounter);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Queue::after(function (JobProcessed $event): void {
            app(MetricCounter::class)->increment('queue.jobs.processed');
        });

        Queue::failing(function (JobFailed $event): void {
            app(MetricCounter::class)->increment('queue.jobs.failed');
        });
    }
}
