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
        Schema::table('orders', function (Blueprint $row) {
            $row->foreignId('coupon_id')->nullable()->constrained('coupons')->onDelete('set null');
            $row->decimal('discount_amount', 10, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $row) {
            $row->dropForeign(['coupon_id']);
            $row->dropColumn(['coupon_id', 'discount_amount']);
        });
    }
};
