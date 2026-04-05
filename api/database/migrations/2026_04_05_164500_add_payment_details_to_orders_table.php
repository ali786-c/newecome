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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('card_last4', 4)->nullable()->after('payment_method');
            $table->string('card_brand')->nullable()->after('card_last4');
            $table->string('card_holder_name')->nullable()->after('card_brand');
            $table->timestamp('paid_at')->nullable()->after('card_holder_name');
        });

        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->string('card_last4', 4)->nullable()->after('payment_method');
            $table->string('card_brand')->nullable()->after('card_last4');
            $table->string('card_holder_name')->nullable()->after('card_brand');
            $table->timestamp('paid_at')->nullable()->after('card_holder_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['card_last4', 'card_brand', 'card_holder_name', 'paid_at']);
        });

        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->dropColumn(['card_last4', 'card_brand', 'card_holder_name', 'paid_at']);
        });
    }
};
