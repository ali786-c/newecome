<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('telegram_configs', function (Blueprint $table) {
            $table->id();
            $table->json('config')->nullable();
            $table->json('commands')->nullable();
            $table->json('permissions')->nullable();
            $table->timestamps();
        });

        Schema::create('discord_configs', function (Blueprint $table) {
            $table->id();
            $table->json('config')->nullable();
            $table->json('commands')->nullable();
            $table->json('permissions')->nullable();
            $table->json('alerts')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('discord_configs');
        Schema::dropIfExists('telegram_configs');
    }
};
