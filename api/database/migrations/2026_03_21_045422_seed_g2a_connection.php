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
        DB::table('supplier_connections')->updateOrInsert(
            ['name' => 'G2A Sandbox'],
            [
                'type'       => 'g2a',
                'endpoint'   => 'https://sandboxapi.g2a.com',
                'api_key'    => 'SANDBOX_API_KEY', // Placeholder
                'config'     => json_encode([
                    'client_id'     => env('G2A_CLIENT_ID', 'sandbox_client_id'),
                    'client_secret' => env('G2A_CLIENT_SECRET', 'sandbox_client_secret'),
                    'email'         => env('G2A_EMAIL', 'admin@example.com'),
                ]),
                'balance'    => 0.00,
                'is_active'  => true,
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
        DB::table('supplier_connections')->where('name', 'G2A Sandbox')->delete();
    }
};
