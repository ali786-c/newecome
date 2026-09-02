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
        Schema::create('blog_automation_configs', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('posts_per_day')->default(1);
            $table->enum('mode', ['auto', 'draft'])->default('draft');
            $table->string('default_tone')->default('professional');
            $table->string('model_text')->default('gemini-2.5-flash');
            $table->string('model_image')->default('gemini-3.1-flash-image-preview');
            $table->boolean('is_enabled')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_automation_configs');
    }
};
