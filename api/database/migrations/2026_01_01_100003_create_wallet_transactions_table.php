<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('type'); // top_up|spend|refund|admin_credit|admin_debit
            $table->decimal('amount', 10, 2);
            $table->string('description')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_ref')->nullable();
            $table->string('status')->default('completed'); // pending|completed|failed
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('wallet_transactions'); }
};
