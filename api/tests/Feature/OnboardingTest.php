<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_creates_new_user_automatically()
    {
        // Seed a product
        $product = Product::create([
            'name' => 'Test Product',
            'slug' => 'test-product-' . uniqid(),
            'price' => 10.00,
            'description' => 'Test',
            'stock' => 100
        ]);

        $payload = [
            'email' => 'newuser@example.com',
            'name' => 'John New',
            'password' => 'password123',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1]
            ],
            'payment_method' => 'payhub'
        ];

        $response = $this->postJson('/orders', $payload);

        $response->assertStatus(201);
        $response->assertJsonStructure(['access_token', 'data']);
        
        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'role' => 'customer'
        ]);
        
        $user = User::where('email', 'newuser@example.com')->first();
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->assertEquals('John New', $user->name);
    }

    public function test_checkout_fails_for_existing_user_with_wrong_password()
    {
        $user = User::create([
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'password' => Hash::make('correct-password'),
            'role' => 'customer'
        ]);

        $product = Product::create([
            'name' => 'Test Product',
            'slug' => 'test-product-' . uniqid(),
            'price' => 10.00,
            'description' => 'Test',
            'stock' => 100
        ]);

        $payload = [
            'email' => 'existing@example.com',
            'password' => 'wrong-password',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'payment_method' => 'payhub'
        ];

        $response = $this->postJson('/orders', $payload);

        $response->assertStatus(401);
        $response->assertJson(['message' => 'Incorrect password for this email.']);
    }

    public function test_checkout_works_for_existing_user_with_correct_password()
    {
        $user = User::create([
            'name' => 'Existing User',
            'email' => 'existing@example.com',
            'password' => Hash::make('correct-password'),
            'role' => 'customer'
        ]);

        $product = Product::create([
            'name' => 'Test Product',
            'slug' => 'test-product-' . uniqid(),
            'price' => 10.00,
            'description' => 'Test',
            'stock' => 100
        ]);

        $payload = [
            'email' => 'existing@example.com',
            'password' => 'correct-password',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
            'payment_method' => 'payhub'
        ];

        $response = $this->postJson('/orders', $payload);

        $response->assertStatus(201);
        $response->assertJsonStructure(['access_token', 'data']);
        $this->assertNotNull($response->json('access_token'));
    }
}
