<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            if (!Schema::hasColumn('reports', 'address')) {
                $table->string('address')->nullable()->after('email');
            }
            if (!Schema::hasColumn('reports', 'admin_photo')) {
                $table->string('admin_photo')->nullable()->after('photo');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            if (Schema::hasColumn('reports', 'admin_photo')) {
                $table->dropColumn('admin_photo');
            }
            if (Schema::hasColumn('reports', 'address')) {
                $table->dropColumn('address');
            }
        });
    }
};
