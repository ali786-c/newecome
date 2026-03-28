<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SupplierConnection;

class G2GConnectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        SupplierConnection::updateOrCreate(
            ['type' => 'g2g'],
            [
                'name'     => 'G2G OpenAPI v2',
                'api_key'  => 'M3GYBHGRMHULXK7JWFJVNGY7UNSOHXTB',
                'config'   => [
                    'user_id'           => '5215028',
                    'secret_key'        => 'SEH1oIbuGb4SdkAruiqIg2zHvVUyrwDhyG8zBIGXFm9',
                    'default_service_id' => '8f88b6fd-93df-4a07-b8b0-7d90b152b81f',
                ],
                'is_active' => true,
            ]
        );
    }
}
