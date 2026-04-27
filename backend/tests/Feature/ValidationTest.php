<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    public function test_register_rejects_unexpected_fields(): void
    {
        $this->postJson('/api/register', [
            'full_name' => 'User Baru',
            'email' => 'baru@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'admin',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    public function test_login_rejects_unexpected_fields(): void
    {
        $this->postJson('/api/login', [
            'email' => 'user@example.com',
            'password' => 'secret123',
            'remember_me' => true,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['remember_me']);
    }

    public function test_report_store_rejects_unexpected_fields(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/reports', [
            'address' => 'Jl. Contoh 1',
            'latitude' => 1.2345678,
            'longitude' => 2.3456789,
            'description' => 'Laporan valid',
            'user_id' => 999,
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['user_id']);
    }

    public function test_report_update_rejects_method_spoofing_field(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $report = Report::create([
            'user_id' => $user->id,
            'full_name' => $user->full_name,
            'email' => $user->email,
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
            '_method' => 'PATCH',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['_method']);
    }

    public function test_file_path_validation_rejects_traversal_attempts(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->get('/api/files/storage/../secrets.txt')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['path']);
    }
}
