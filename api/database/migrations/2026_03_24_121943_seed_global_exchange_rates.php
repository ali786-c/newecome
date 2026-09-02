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
        $rates = [
            'exchange_rate_USD_EUR' => 0.92,
            'exchange_rate_BRL_EUR' => 0.17,
            'exchange_rate_CAD_EUR' => 0.68,
            'exchange_rate_AED_EUR' => 0.25,
            'exchange_rate_AUD_EUR' => 0.61,
            'exchange_rate_DKK_EUR' => 0.134,
            'exchange_rate_GBP_EUR' => 1.157,
            'exchange_rate_HKD_EUR' => 0.118,
            'exchange_rate_IDR_EUR' => 0.000051,
            'exchange_rate_INR_EUR' => 0.011,
            'exchange_rate_MYR_EUR' => 0.219,
            'exchange_rate_PHP_EUR' => 0.0144,
            'exchange_rate_PLN_EUR' => 0.234,
            'exchange_rate_SAR_EUR' => 0.229,
            'exchange_rate_SGD_EUR' => 0.675,
            'exchange_rate_THB_EUR' => 0.0266,
            'exchange_rate_TWD_EUR' => 0.0269,
            'exchange_rate_VND_EUR' => 0.0000325,
            'exchange_rate_EUR_EUR' => 1.0,
        ];

        foreach ($rates as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                [
                    'value' => (string) $value,
                    'updated_at' => now(),
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse needed to avoid breaking existing manual settings
    }
};
