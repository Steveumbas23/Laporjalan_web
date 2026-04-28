<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReportImageCompatibilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    public function test_admin_update_skips_missing_blob_columns_but_keeps_file_path(): void
    {
        Storage::fake('public');

        Schema::shouldReceive('hasColumn')
            ->andReturnUsing(function (string $table, string $column): bool {
                if ($table !== 'reports') {
                    return true;
                }

                return !in_array($column, ['photo_data', 'photo_mime', 'admin_photo_data', 'admin_photo_mime'], true);
            });

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

        Sanctum::actingAs($admin);

        $response = $this->patch('/api/reports/'.$report->id, [
            'status' => 'done',
            'photo' => UploadedFile::fake()->image('admin-update.jpg'),
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => 'done',
        ]);

        $this->assertNotNull($response->json('admin_photo'));
    }

    public function test_report_store_skips_missing_blob_columns_but_keeps_file_path(): void
    {
        Storage::fake('public');

        Schema::shouldReceive('hasColumn')
            ->andReturnUsing(function (string $table, string $column): bool {
                if ($table !== 'reports') {
                    return true;
                }

                return !in_array($column, ['photo_data', 'photo_mime', 'admin_photo_data', 'admin_photo_mime'], true);
            });

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->post('/api/reports', [
            'address' => 'Jl. Contoh 1',
            'latitude' => 1.2345678,
            'longitude' => 2.3456789,
            'description' => 'Laporan valid',
            'photo' => UploadedFile::fake()->image('report.jpg'),
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('reports', [
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        $this->assertNotNull($response->json('photo'));
    }
}
