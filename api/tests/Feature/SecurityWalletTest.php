<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SecurityWalletTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_spend_another_users_wallet_balance()
    {
        // 1. Create a victim user with balance
        $victim = User::create([
            'name' => 'Victim User',
            'email' => 'victim@example.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
            'wallet_balance' => 100.00
        ]);

        // 2. Create a product
        $product = Product::create([
            'name' => 'Expensive Item',
            'slug' => 'expensive-item',
            'price' => 50.00,
            'description' => 'Test',
            'stock' => 10
        ]);

        // 3. Attempt to checkout as GUEST using victim's email and wallet
        $payload = [
            'email' => 'victim@example.com',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'payment_method' => 'wallet'
        ];

        // This should FAIL with 401 or 422 requiring authentication
        $response = $this->postJson('/orders', $payload);

        // Current behavior (VULNERABLE) would be 201 or 422 'Insufficient' if balance was 0
        // We want it to be 401 Unauthorized for sensitive payment methods if not logged in
        $response->assertStatus(401);
    }
}
