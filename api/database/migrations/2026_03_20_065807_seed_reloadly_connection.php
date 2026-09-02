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
        \DB::table('supplier_connections')->updateOrInsert(
            ['type' => 'reloadly'],
            [
                'name'      => 'Reloadly Sandbox',
                'endpoint'  => 'https://giftcards-sandbox.reloadly.com',
                'is_active' => true,
                'config'    => json_encode([
                    'client_id'     => 'pjS2YPiolL1Z8vZudtlP3dWG868KYgjn',
                    'client_secret' => 'MZrAKssoU7-3iVbkFzcxkJQ97vH3b1-TWfAsxyi1qu6ZuKTNg2MZ4xJwdycZPlO',
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \DB::table('supplier_connections')->where('type', 'reloadly')->delete();
    }
};
