<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            if (!Schema::hasColumn('reports', 'photo_data')) {
                $table->mediumText('photo_data')->nullable()->after('photo');
            }
            if (!Schema::hasColumn('reports', 'photo_mime')) {
                $table->string('photo_mime', 100)->nullable()->after('photo_data');
            }
            if (!Schema::hasColumn('reports', 'admin_photo_data')) {
                $table->mediumText('admin_photo_data')->nullable()->after('admin_photo');
            }
            if (!Schema::hasColumn('reports', 'admin_photo_mime')) {
                $table->string('admin_photo_mime', 100)->nullable()->after('admin_photo_data');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            if (Schema::hasColumn('reports', 'admin_photo_mime')) {
                $table->dropColumn('admin_photo_mime');
            }
            if (Schema::hasColumn('reports', 'admin_photo_data')) {
                $table->dropColumn('admin_photo_data');
            }
            if (Schema::hasColumn('reports', 'photo_mime')) {
                $table->dropColumn('photo_mime');
            }
            if (Schema::hasColumn('reports', 'photo_data')) {
                $table->dropColumn('photo_data');
            }
        });
    }
};
