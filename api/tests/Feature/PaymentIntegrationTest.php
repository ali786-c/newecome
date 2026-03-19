<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Services\PayHubService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;
use Mockery\MockInterface;

class PaymentIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup config for Pay Hub
        config(['services.payhub.client_id' => 'test_client']);
        config(['services.payhub.secret' => 'test_secret']);
        config(['services.payhub.url' => 'https://api.payhub.test']);
    }

    /**
     * Test successful Order creation with Wallet payment.
     */
    public function test_order_creation_with_wallet_payment(): void
    {
        $user = User::factory()->create(['wallet_balance' => 100.00]);
        $orderAmount = 29.99;

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'payment_method' => 'wallet',
            'items' => [
                ['product_id' => 1, 'quantity' => 1] // Assuming product 1 exists in seeder or factory
            ]
        ]);

        $response->assertStatus(201);
        $this->assertEquals(70.01, $user->fresh()->wallet_balance);
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'status' => 'completed',
            'payment_method' => 'wallet'
        ]);
    }

    /**
     * Test successful Order creation with Pay Hub redirect.
     */
    public function test_order_creation_with_payhub_redirect(): void
    {
        $user = User::factory()->create();
        
        // Mock the Pay Hub API response
        Http::fake([
            'https://api.payhub.test/checkout/create' => Http::response([
                'checkout_url' => 'https://checkout.payhub.test/12345',
                'invoice_id' => 'INV-123'
            ], 200)
        ]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'payment_method' => 'payhub',
            'items' => [
                ['product_id' => 1, 'quantity' => 1]
            ]
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment(['checkout_url' => 'https://checkout.payhub.test/12345']);
        
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_method' => 'payhub'
        ]);
    }

    /**
     * Test invalid webhook signature.
     */
    public function test_webhook_with_invalid_signature(): void
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->postJson('/api/webhooks/payhub', [
            'order_id' => $order->id,
            'status' => 'paid',
            'hub_reference' => 'HUB-123'
        ], [
            'X-PayHub-Signature' => 'invalid_sig'
        ]);

        $response->assertStatus(401);
        $this->assertEquals('pending', $order->fresh()->status);
    }
}
