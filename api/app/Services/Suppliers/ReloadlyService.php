<?php

namespace App\Services\Suppliers;

use App\Contracts\SupplierServiceInterface;
use App\Models\Order;
use App\Models\SupplierConnection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
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
        // To be implemented in Phase 5
        return ['status' => 'pending'];
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

        return (float) $response->json('balance', 0);
    }
}
