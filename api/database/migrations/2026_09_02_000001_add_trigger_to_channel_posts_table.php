<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add 'trigger' column to channel_posts table for tracking post source.
 * Also make 'message' nullable so posts can be created without message text.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('channel_posts', function (Blueprint $table) {
            // Add trigger column: random | new | update | manual | blog
            if (!Schema::hasColumn('channel_posts', 'trigger')) {
                $table->string('trigger')->default('random')->after('channel');
            }

            // Make message nullable (it's optional for product posts)
            if (Schema::hasColumn('channel_posts', 'message')) {
                $table->text('message')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('channel_posts', function (Blueprint $table) {
            if (Schema::hasColumn('channel_posts', 'trigger')) {
                $table->dropColumn('trigger');
            }
        });
    }
};
