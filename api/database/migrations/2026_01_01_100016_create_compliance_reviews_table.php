<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('compliance_reviews', function (Blueprint $table) {
            $table->id();
            $table->morphs('reviewable');
            $table->unsignedBigInteger('reviewer_id')->nullable();
            $table->string('status')->default('pending'); // pending|approved|rejected|flagged
            $table->text('notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('compliance_reviews'); }
};
