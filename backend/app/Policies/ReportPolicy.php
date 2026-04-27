<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->accessAuthenticatedApi($user);
    }

    public function view(User $user, Report $report): bool
    {
        return $user->role === 'admin' || $report->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $this->accessAuthenticatedApi($user);
    }

    public function update(User $user, Report $report): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Report $report): bool
    {
        return $user->role === 'admin';
    }

    private function accessAuthenticatedApi(User $user): bool
    {
        return !empty($user->id);
    }
}
