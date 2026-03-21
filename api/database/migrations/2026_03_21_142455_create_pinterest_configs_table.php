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
        Schema::create('pinterest_configs', function (Blueprint $table) {
            $table->id();
            $table->json('config')->nullable(); // Store client_id, client_secret, refresh_token, etc.
            $table->json('boards')->nullable(); // Store fetched boards for selection
            $table->string('status')->default('disconnected'); // active, disconnected, error
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pinterest_configs');
    }
};
