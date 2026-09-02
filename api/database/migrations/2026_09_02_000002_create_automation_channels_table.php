<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('automation_channels', function (Blueprint $table) {
            $table->id();
            $table->string('platform'); // 'discord' or 'telegram'
            $table->string('name');
            $table->string('target'); // Discord Webhook URL or Telegram Chat ID
            $table->string('token')->nullable(); // Telegram Bot Token (if different from default)
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('automation_channels');
    }
};
