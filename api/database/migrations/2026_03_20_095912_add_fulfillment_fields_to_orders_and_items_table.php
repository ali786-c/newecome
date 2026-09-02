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
            $table->string('fulfillment_status')->default('pending')->after('status');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('supplier_order_id')->nullable()->after('credentials');
            $table->string('supplier_reference')->nullable()->after('supplier_order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('fulfillment_status');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['supplier_order_id', 'supplier_reference']);
        });
    }
};
