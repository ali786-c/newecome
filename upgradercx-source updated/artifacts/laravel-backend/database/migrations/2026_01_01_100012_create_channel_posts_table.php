<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('channel_posts', function (Blueprint $table) {
            $table->id();
            $table->string('channel'); // telegram|discord
            $table->unsignedBigInteger('product_id')->nullable()->index();
            $table->text('message');
            $table->string('status')->default('sent'); // sent|failed|queued
            $table->text('error')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('channel_posts'); }
};
