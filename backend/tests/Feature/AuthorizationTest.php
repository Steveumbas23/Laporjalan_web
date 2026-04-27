<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_only_sees_their_own_reports(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $ownReport = Report::create([
            'user_id' => $owner->id,
            'full_name' => $owner->full_name,
            'email' => $owner->email,
            'address' => 'Owner address',
            'latitude' => 1.2345678,
            'longitude' => 2.3456789,
            'photo' => 'reports/photos/owner.jpg',
            'description' => 'Owner report',
            'status' => 'pending',
        ]);

        Report::create([
            'user_id' => $otherUser->id,
            'full_name' => $otherUser->full_name,
            'email' => $otherUser->email,
            'address' => 'Other address',
            'latitude' => 3.4567891,
            'longitude' => 4.5678912,
            'photo' => 'reports/photos/other.jpg',
            'description' => 'Other report',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($owner);

        $response = $this->getJson('/api/reports');

        $response
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $ownReport->id);
    }

    public function test_regular_user_cannot_update_or_delete_reports(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);

        $report = Report::create([
            'user_id' => $admin->id,
            'full_name' => $admin->full_name,
            'email' => $admin->email,
            'address' => 'Admin address',
            'latitude' => 1.2345678,
            'longitude' => 2.3456789,
            'photo' => 'reports/photos/admin.jpg',
            'description' => 'Admin report',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($user);

        $this->patchJson("/api/reports/{$report->id}", [
            'status' => 'done',
        ])->assertForbidden();

        $this->deleteJson("/api/reports/{$report->id}")
            ->assertForbidden();
    }

    public function test_regular_user_cannot_view_someone_elses_report_file(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();

        Report::create([
            'user_id' => $owner->id,
            'full_name' => $owner->full_name,
            'email' => $owner->email,
            'address' => 'Owner address',
            'latitude' => 1.2345678,
            'longitude' => 2.3456789,
            'photo' => 'reports/photos/private.jpg',
            'description' => 'Private report',
            'status' => 'pending',
        ]);

        Sanctum::actingAs($intruder);

        $this->get('/api/files/storage/reports/photos/private.jpg')
            ->assertForbidden();
    }

    public function test_only_admin_can_access_user_count_endpoint(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'user']);

        Sanctum::actingAs($user);
        $this->getJson('/api/users/count')->assertForbidden();

        Sanctum::actingAs($admin);
        $this->getJson('/api/users/count')
            ->assertOk()
            ->assertJsonStructure(['total']);
    }
}
