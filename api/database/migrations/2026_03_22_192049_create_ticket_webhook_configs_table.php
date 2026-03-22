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
        Schema::create('ticket_webhook_configs', function (Blueprint $table) {
            $table->id();
            $table->boolean('telegram_enabled')->default(false);
            $table->string('telegram_chat_id')->nullable();
            $table->boolean('discord_enabled')->default(false);
            $table->string('discord_webhook_url')->nullable();
            $table->boolean('notify_on_create')->default(true);
            $table->boolean('notify_on_reply')->default(true);
            $table->boolean('notify_on_staff_reply')->default(true);
            $table->boolean('notify_on_status_change')->default(true);
            $table->boolean('notify_on_close')->default(true);
            $table->boolean('notify_high_priority_only')->default(false);
            $table->boolean('include_message_preview')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_webhook_configs');
    }
};
