<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'              => 'Admin User',
                'password'          => Hash::make('password'),
                'role'              => 'admin',
                'status'            => 'active',
                'wallet_balance'    => 0.00,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name'              => 'Demo Customer',
                'password'          => Hash::make('password'),
                'role'              => 'customer',
                'status'            => 'active',
                'wallet_balance'    => 25.00,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'john@example.com'],
            [
                'name'              => 'John Smith',
                'password'          => Hash::make('password'),
                'role'              => 'customer',
                'status'            => 'active',
                'wallet_balance'    => 10.50,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'maria@example.com'],
            [
                'name'              => 'Maria Garcia',
                'password'          => Hash::make('password'),
                'role'              => 'customer',
                'status'            => 'active',
                'wallet_balance'    => 42.00,
                'email_verified_at' => now(),
            ]
        );
    }
}
