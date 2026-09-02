<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('channel')->nullable(); // telegram|discord|supplier
            $table->string('event');
            $table->string('status')->default('success'); // success|warning|error
            $table->json('payload')->nullable();
            $table->text('error')->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('sync_logs'); }
};
