<?php

namespace App\Services\Suppliers;

use App\Contracts\SupplierServiceInterface;
use App\Models\Order;
use App\Models\SupplierConnection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class ReloadlyService implements SupplierServiceInterface
{
    protected ?SupplierConnection $connection = null;
    protected string $baseUrl;
    protected string $authUrl = 'https://auth.reloadly.com/oauth/token';

    public function setConnection(SupplierConnection $connection): self
    {
        $this->connection = $connection;
        $this->baseUrl = $connection->endpoint ?? 'https://giftcards-sandbox.reloadly.com';
        return $this;
    }

    /**
     * Get Access Token (with caching)
     */
    public function getAccessToken(): string
    {
        $cacheKey = "reloadly_token_{$this->connection->id}";
        
        return Cache::remember($cacheKey, 3600, function () {
            $config = $this->connection->config;
            
            $audience = str_contains($this->baseUrl, 'sandbox') 
                ? 'https://giftcards-sandbox.reloadly.com' 
                : 'https://giftcards.reloadly.com';

            $response = Http::withoutVerifying()->timeout(60)->post($this->authUrl, [
                'client_id'     => $config['client_id'] ?? null,
                'client_secret' => $config['client_secret'] ?? null,
                'grant_type'    => 'client_credentials',
                'audience'      => $audience,
            ]);

            if ($response->failed()) {
                throw new Exception("Reloadly Authentication Failed: " . $response->body());
            }

            return $response->json('access_token');
        });
    }

    public function fetchProducts(int $page = 1, int $size = 200, array $filters = []): array
    {
        $token = $this->getAccessToken();
        
        $response = Http::withoutVerifying()->timeout(60)->withToken($token)
            ->get("{$this->baseUrl}/products", array_merge([
                'page' => $page,
                'size' => $size,
            ], $filters));

        return $response->json() ?? [];
    }

    public function getProductDetails(string $externalId): array
    {
        $token = $this->getAccessToken();
        
        $response = Http::withoutVerifying()->timeout(60)->withToken($token)
            ->get("{$this->baseUrl}/products/{$externalId}");

        return $response->json() ?? [];
    }

    public function placeOrder(Order $order): array
    {
        $token = $this->getAccessToken();
        $results = [];

        foreach ($order->items as $item) {
            $product = $item->product;
            
            // Only process products linked to this supplier
            if (!$product || $product->supplier_id != $this->connection->id) {
                continue;
            }

            try {
                $payload = [
                    'productId'        => (int) $product->supplier_product_id,
                    'quantity'         => (int) $item->quantity,
                    'senderName'       => 'UpgraderCX',
                    'recipientEmail'   => $order->user->email,
                    'unitPrice'        => (float) $product->cost_price,
                    'customIdentifier' => "ITEM-" . $item->id . "-" . uniqid()
                ];

                $response = Http::withoutVerifying()->timeout(60)->withToken($token)
                    ->withHeaders(['Accept' => 'application/com.reloadly.giftcards-v1+json'])
                    ->post("{$this->baseUrl}/orders", $payload);

                if ($response->successful()) {
                    $orderData = $response->json();
                    $transactionId = $orderData['transactionId'] ?? $orderData['id'] ?? null;

                    $item->update([
                        'supplier_order_id'  => $transactionId,
                        'supplier_reference' => $orderData['customIdentifier'] ?? null,
                    ]);
                    
                    // Immediately try to get the redeem code if available in response
                    if (!empty($orderData['codes'])) {
                        $item->update(['credentials' => $orderData['codes']]);
                    } else if ($transactionId) {
                        // If not in response, fetch it explicitly
                        try {
                            $codes = $this->getRedeemCode($transactionId);
                            if (!empty($codes)) {
                                $item->update(['credentials' => $codes]);
                                $orderData['codes'] = $codes; // For the result array
                            }
                        } catch (Exception $codeEx) {
                            Log::warning("Immediate code fetch failed for Transaction #{$transactionId}: " . $codeEx->getMessage());
                        }
                    }

                    $results[] = ['item_id' => $item->id, 'status' => 'SUCCESS', 'data' => $orderData];
                } else {
                    $results[] = [
                        'item_id' => $item->id, 
                        'status' => 'FAILED', 
                        'error' => $response->json('message', 'Unknown error')
                    ];
                }
            } catch (Exception $e) {
                $results[] = ['item_id' => $item->id, 'status' => 'ERROR', 'message' => $e->getMessage()];
            }
        }

        return $results;
    }

    public function getRedeemCode(string $externalTransactionId): array
    {
        $token = $this->getAccessToken();
        
        $response = Http::withoutVerifying()->timeout(60)->withToken($token)
            ->withHeaders(['Accept' => 'application/com.reloadly.giftcards-v2+json'])
            ->get("{$this->baseUrl}/orders/transactions/{$externalTransactionId}/cards");

        return $response->json() ?? [];
    }

    public function getBalance(): float
    {
        $token = $this->getAccessToken();
        
        $response = Http::withoutVerifying()->timeout(60)->withToken($token)
            ->get("{$this->baseUrl}/accounts/balance");

        return (float) ($response->json('amount') ?? $response->json('balance', 0));
    }
}
