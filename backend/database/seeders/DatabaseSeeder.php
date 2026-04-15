<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'user@laporjalan.local'],
            [
                'full_name' => 'Demo User',
                'password' => 'password123',
                'role' => 'user',
            ]
        );

        User::query()->firstOrCreate(
            ['email' => 'admin@laporjalan.local'],
            [
                'full_name' => 'Demo Admin',
                'password' => 'password123',
                'role' => 'admin',
            ]
        );
    }
}
