<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('supplier_price_orig', 16, 4)->nullable()->after('cost_price');
            $table->string('supplier_currency_orig', 10)->nullable()->after('supplier_price_orig');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('unit_cost_orig', 16, 4)->nullable()->after('unit_cost');
            $table->string('currency_orig', 10)->nullable()->after('unit_cost_orig');
        });

        // Add default exchange rates to settings
        $now = now();
        $rates = [
            ['key' => 'exchange_rate_USD_EUR', 'value' => '0.92', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'exchange_rate_BRL_EUR', 'value' => '0.17', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'exchange_rate_CAD_EUR', 'value' => '0.68', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'exchange_rate_AED_EUR', 'value' => '0.25', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'exchange_rate_AUD_EUR', 'value' => '0.61', 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'site_base_currency', 'value' => 'EUR', 'created_at' => $now, 'updated_at' => $now],
        ];

        foreach ($rates as $rate) {
            DB::table('settings')->updateOrInsert(['key' => $rate['key']], $rate);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['supplier_price_orig', 'supplier_currency_orig']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['unit_cost_orig', 'currency_orig']);
        });
    }
};
