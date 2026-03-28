<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();

            // RELASI KE USER
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');

            // DATA PELAPOR (snapshot)
            $table->string('full_name');
            $table->string('email');

            // LOKASI
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            // LAPORAN
            $table->string('photo'); // path gambar
            $table->text('description');

            // STATUS LAPORAN
            $table->enum('status', ['pending', 'process', 'done'])
                  ->default('pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};