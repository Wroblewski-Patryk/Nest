<?php

namespace App\Providers;

use App\Integrations\Adapters\GoogleTasksAdapter;
use App\Integrations\Adapters\TrelloAdapter;
use App\Integrations\IntegrationAdapterRegistry;
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
            ]);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
