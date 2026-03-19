<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PayHubService
{
    /**
     * Generate HMAC-SHA256 signature for the given payload.
     */
    public function generateSignature(array $payload): string
    {
        ksort($payload);
        unset($payload['signature']);
        $baseString = http_build_query($payload);
        
        return hash_hmac('sha256', $baseString, config('services.payhub.secret'));
    }

    /**
     * Verify if the provided signature matches the payload.
     */
    public function verifyWebhookSignature(array $payload, string $signature): bool
    {
        $calculated = $this->generateSignature($payload);
        return hash_equals($calculated, $signature);
    }

    /**
     * Create a checkout session on the Pay Hub.
     */
    public function createCheckout(Order $order): array
    {
        $payload = [
            'order_id' => (string)$order->id,
            'amount' => (float)$order->total,
            'currency' => config('services.payhub.currency', 'EUR'),
            'customer_email' => $order->user->email ?? null,
            'success_url' => config('services.payhub.success_url') . "?order_id={$order->id}",
            'cancel_url' => config('services.payhub.cancel_url') . "?order_id={$order->id}",
        ];

        $signature = $this->generateSignature($payload);

        try {
            $response = Http::withHeaders([
                'X-PayHub-Client-ID' => config('services.payhub.client_id'),
                'X-PayHub-Signature' => $signature,
                'Accept' => 'application/json',
            ])->post(config('services.payhub.url') . '/checkout/create', $payload);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'checkout_url' => $response->json('checkout_url'),
                    'invoice_id' => $response->json('invoice_id'),
                ];
            }

            Log::error("Pay Hub API Error: " . $response->body());
            return ['success' => false, 'message' => $response->json('message', 'Unknown Pay Hub error')];

        } catch (\Exception $e) {
            Log::error("Pay Hub Communication Failed: " . $e->getMessage());
            return ['success' => false, 'message' => 'Could not connect to payment gateway.'];
        }
    }
}
