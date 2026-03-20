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
    protected function getAccessToken(): string
    {
        $cacheKey = "reloadly_token_{$this->connection->id}";
        
        return Cache::remember($cacheKey, 3600, function () {
            $config = $this->connection->config;
            
            $response = Http::post($this->authUrl, [
                'client_id'     => $config['client_id'] ?? null,
                'client_secret' => $config['client_secret'] ?? null,
                'grant_type'    => 'client_credentials',
                'audience'      => 'https://giftcards.reloadly.com',
            ]);

            if ($response->failed()) {
                throw new Exception("Reloadly Authentication Failed: " . $response->body());
            }

            return $response->json('access_token');
        });
    }

    public function fetchProducts(): array
    {
        $token = $this->getAccessToken();
        
        $response = Http::withToken($token)
            ->get("{$this->baseUrl}/products");

        return $response->json('content') ?? [];
    }

    public function getProductDetails(string $externalId): array
    {
        $token = $this->getAccessToken();
        
        $response = Http::withToken($token)
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
        
        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/com.reloadly.giftcards-v2+json'])
            ->get("{$this->baseUrl}/orders/transactions/{$externalTransactionId}/cards");

        return $response->json() ?? [];
    }

    public function getBalance(): float
    {
        $token = $this->getAccessToken();
        
        $response = Http::withToken($token)
            ->get("{$this->baseUrl}/accounts/balance");

        return (float) $response->json('balance', 0);
    }
}
