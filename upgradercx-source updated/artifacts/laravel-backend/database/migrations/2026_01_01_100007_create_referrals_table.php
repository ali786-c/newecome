<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('referrer_id')->index();
            $table->unsignedBigInteger('referred_id')->nullable()->unique();
            $table->string('status')->default('pending'); // pending|converted|rejected
            $table->decimal('commission', 10, 2)->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('referrals'); }
};
