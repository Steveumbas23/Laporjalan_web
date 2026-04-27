<?php

namespace App\Providers;

use App\Models\Report;
use App\Models\User;
use App\Policies\ReportPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Report::class, ReportPolicy::class);

        Gate::define('accessAuthenticatedApi', fn (User $user) => !empty($user->id));
        Gate::define('viewUserCount', fn (User $user, string $modelClass) => $user->role === 'admin');
    }
}
