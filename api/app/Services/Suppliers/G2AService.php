<?php

namespace App\Services\Suppliers;

use App\Contracts\SupplierServiceInterface;
use App\Models\Order;
use App\Models\SupplierConnection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class G2AService implements SupplierServiceInterface
{
    protected ?SupplierConnection $connection = null;
    protected string $baseUrl;
    protected string $authUrl;

    public function setConnection(SupplierConnection $connection): self
    {
        $this->connection = $connection;
        $this->baseUrl = $connection->endpoint ?? 'https://sandboxapi.g2a.com';
        $this->authUrl = $this->baseUrl . '/oauth/token';
        return $this;
    }

    /**
     * Get OAuth2 Access Token (v3/v4 Seller API)
     */
    public function getAccessToken(): string
    {
        $cacheKey = "g2a_token_{$this->connection->id}";
        
        return Cache::remember($cacheKey, 3500, function () {
            $config = $this->connection->config;
            
            $response = Http::withoutVerifying()->timeout(60)->asForm()->post($this->authUrl, [
                'client_id'     => $config['client_id'] ?? null,
                'client_secret' => $config['client_secret'] ?? null,
                'grant_type'    => 'client_credentials',
            ]);

            if ($response->failed()) {
                throw new Exception("G2A Authentication Failed: " . $response->body());
            }

            return $response->json('access_token');
        });
    }

    /**
     * Generate Signature Header (v1 Purchasing API)
     */
    protected function getSignature(): array
    {
        $apiKey = $this->connection->api_key;
        $apiSecret = $this->connection->config['client_secret'] ?? '';
        $email = $this->connection->config['email'] ?? '';

        // G2A v1 Signature: hash_hmac('sha256', api_key + api_secret + email, api_secret)
        $hash = hash_hmac('sha256', $apiKey . $apiSecret . $email, $apiSecret);

        return [
            'Authorization' => "{$apiKey}, {$hash}",
            'Accept'        => 'application/json',
        ];
    }

    public function fetchProducts(int $page = 1, int $size = 200, array $filters = []): array
    {
        $token = $this->getAccessToken();
        
        // G2A v3 offers endpoint
        $response = Http::withoutVerifying()->timeout(60)->withToken($token)
            ->get("{$this->baseUrl}/v1/products", array_merge([
                'page' => $page,
                'limit' => $size,
            ], $filters));

        return $response->json() ?? [];
    }

    public function getProductDetails(string $externalId): array
    {
        $token = $this->getAccessToken();
        
        $response = Http::withoutVerifying()->timeout(60)->withToken($token)
            ->get("{$this->baseUrl}/v1/products/{$externalId}");

        return $response->json() ?? [];
    }

    public function placeOrder(Order $order): array
    {
        // G2A Purchasing (v1) flow
        // 1. Create Order
        // 2. Pay Order
        // 3. Get Items
        
        $results = [];
        foreach ($order->items as $item) {
            $product = $item->product;
            if (!$product || $product->supplier_id != $this->connection->id) {
                continue;
            }

            try {
                // Step 1: Create Order
                $payload = [
                    'order_id' => $order->id . '-' . $item->id,
                    'hash'     => $product->supplier_product_id,
                ];

                $response = Http::withoutVerifying()->timeout(60)
                    ->withHeaders($this->getSignature())
                    ->post("{$this->baseUrl}/v1/order/create", $payload);

                if ($response->successful()) {
                    $g2aOrder = $response->json();
                    $g2aOrderId = $g2aOrder['order_id'] ?? null;

                    // Step 2: Pay for the order
                    $payResponse = Http::withoutVerifying()->timeout(60)
                        ->withHeaders($this->getSignature())
                        ->post("{$this->baseUrl}/v1/order/pay/{$g2aOrderId}");

                    if ($payResponse->successful()) {
                        $item->update([
                            'supplier_order_id' => $g2aOrderId,
                            'status' => 'fulfilling',
                        ]);

                        $results[] = [
                            'item_id' => $item->id,
                            'status' => 'SUCCESS',
                            'data' => $payResponse->json()
                        ];
                    } else {
                        $results[] = ['item_id' => $item->id, 'status' => 'FAILED', 'error' => 'Payment failed: ' . $payResponse->body()];
                    }
                } else {
                    $results[] = ['item_id' => $item->id, 'status' => 'FAILED', 'error' => 'Order creation failed: ' . $response->body()];
                }
            } catch (Exception $e) {
                $results[] = ['item_id' => $item->id, 'status' => 'ERROR', 'message' => $e->getMessage()];
            }
        }

        return $results;
    }

    public function getRedeemCode(string $externalTransactionId): array
    {
        // G2A v1 endpoint to get digital keys
        $response = Http::withoutVerifying()->timeout(60)
            ->withHeaders($this->getSignature())
            ->get("{$this->baseUrl}/v1/order/items/{$externalTransactionId}");

        $data = $response->json();
        // G2A usually returns an array of keys
        return $data['keys'] ?? [];
    }

    public function getBalance(): float
    {
        // G2A v1 balance endpoint
        $response = Http::withoutVerifying()->timeout(60)
            ->withHeaders($this->getSignature())
            ->get("{$this->baseUrl}/v1/balance");

        return (float) ($response->json('balance') ?? 0);
    }

    public function formatProductData(array $raw): array
    {
        return [
            'name'        => $raw['name'] ?? $raw['productName'] ?? 'N/A',
            'description' => $raw['description'] ?? null,
            'price'       => (float) ($raw['minPrice'] ?? $raw['price'] ?? 0),
            'category'    => $raw['category'] ?? 'Digital',
            'image_url'   => $raw['image'] ?? $raw['image_url'] ?? null,
            'data'        => $raw,
            'status'      => 'available',
        ];
    }
}
