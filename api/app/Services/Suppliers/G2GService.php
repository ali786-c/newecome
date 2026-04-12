<?php

namespace App\Services\Suppliers;

use App\Contracts\SupplierServiceInterface;
use App\Models\Order;
use App\Models\SupplierConnection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class G2GService implements SupplierServiceInterface
{
    protected ?SupplierConnection $connection = null;
    protected string $baseUrl = 'https://open-api.g2g.com/v2';

    public function setConnection(SupplierConnection $connection): self
    {
        $this->connection = $connection;
        return $this;
    }

    /**
     * Generate G2G v2 Signature Headers
     */
    protected function getHeaders(string $path, string $method = 'GET'): array
    {
        $apiKey = $this->connection->api_key;
        $userId = $this->connection->client_id ?? $this->connection->config['user_id'] ?? '';
        $secretKey = $this->connection->config['secret_key'] ?? '';

        if (empty($apiKey) || empty($userId) || empty($secretKey)) {
            Log::error("G2G: Missing credentials for connection #{$this->connection->id}");
        }

        $timestamp = round(microtime(true) * 1000);
        
        // Canonical path for signature: /v2 + base path (EXCLUDING query parameters for GET)
        $basePath = (strpos($path, '?') !== false) ? substr($path, 0, strpos($path, '?')) : $path;
        $canonUrl = "/v2" . $basePath;
        
        $canonicalString = $canonUrl . $apiKey . $userId . (string)$timestamp;
        $signature = hash_hmac('sha256', $canonicalString, $secretKey);

        $headers = [
            'g2g-api-key'   => $apiKey,
            'g2g-userid'    => $userId,
            'g2g-timestamp' => $timestamp,
            'g2g-signature' => $signature,
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
        ];

        return $headers;
    }

    /**
     * Fetch products from G2G
     * Note: G2G requires service_id and brand_id to fetch products effectively.
     */
    public function fetchProducts(array $filters = []): array
    {
        $serviceId = $filters['service_id'] ?? $this->connection->config['default_service_id'] ?? '8f88b6fd-93df-4a07-b8b0-7d90b152b81f'; // Default to Gift Cards
        $brandId = $filters['brand_id'] ?? null;

        if (!$brandId) {
            return [];
        }

        $path = "/products?service_id={$serviceId}&brand_id={$brandId}";
        
        $response = Http::withoutVerifying()->timeout(60)
            ->withHeaders($this->getHeaders($path))
            ->get($this->baseUrl . $path);

        if ($response->failed()) {
            Log::error("G2G Fetch Products Failed: " . $response->body());
            return [];
        }

        $data = $response->json();
        return $data['payload']['product_list'] ?? [];
    }

    public function getRedeemCode(string $externalTransactionId): array
    {
        // G2G v2 doesn't have a direct "Redeem Code" endpoint in the same way as v1/Reloadly
        // Usually codes are retrieved via the Order Details or Callback
        return ['status' => 'PENDING', 'message' => 'G2G code retrieval happens via account/callback'];
    }

    public function getProductDetails(string $externalId): array
    {
        // G2G v2 Product Details via query parameter on /products
        $path = "/products?product_id={$externalId}";
        
        $response = Http::withoutVerifying()->timeout(60)
            ->withHeaders($this->getHeaders($path))
            ->get($this->baseUrl . $path);

        if ($response->failed()) {
            return [];
        }

        $products = $response->json('payload.product_list') ?? [];
        return !empty($products) ? $products[0] : [];
    }

    /**
     * Get Market Price/Stock for a product
     * Currently uses a fallback list if Search Offers fails
     */
    public function getOffers(string $brandId): array
    {
        $path = "/offers/search";
        $payload = [
            'filter' => [
                'brand_id' => $brandId,
                'status'   => 'live'
            ],
            'page_size' => 50, // Increased for more offers
            'page'      => 1
        ];

        $response = Http::withoutVerifying()->timeout(60)
            ->withHeaders($this->getHeaders($path, 'POST'))
            ->post($this->baseUrl . $path, $payload);

        if ($response->successful()) {
            return $response->json('payload.results') ?? [];
        }

        return [];
    }

    /**
     * NEW: Fetch products WITH pricing data for reselling
     */
    public function fetchProductsWithPricing(array $filters = []): array
    {
        $serviceId = $filters['service_id'] ?? $this->connection->config['default_service_id'] ?? '8f88b6fd-93df-4a07-b8b0-7d90b152b81f';
        $brandId = $filters['brand_id'] ?? null;

        if (!$brandId) {
            return [];
        }

        // 1. Get basic product info
        $products = $this->fetchProducts($filters);

        if (empty($products)) {
            return [];
        }

        // 2. Get pricing offers for this brand
        $offers = $this->getOffers($brandId);

        // 3. Merge pricing data with products
        foreach ($products as &$product) {
            // Find offers for this specific product
            $productOffers = array_filter($offers, function($offer) use ($product) {
                return ($offer['product_id'] ?? null) === $product['product_id'];
            });

            $product['offers'] = array_values($productOffers);
            $product['offer_count'] = count($productOffers);

            // Calculate pricing summary
            if (!empty($productOffers)) {
                $prices = array_column($productOffers, 'retail_price');
                $quantities = array_column($productOffers, 'quantity');

                $product['pricing'] = [
                    'lowest_price' => !empty($prices) ? min($prices) : null,
                    'highest_price' => !empty($prices) ? max($prices) : null,
                    'average_price' => !empty($prices) ? round(array_sum($prices) / count($prices), 2) : null,
                    'total_stock' => array_sum($quantities),
                    'currency' => $productOffers[0]['currency'] ?? 'USD'
                ];

                // Add markup for resale (you can adjust this)
                $basePrice = $product['pricing']['lowest_price'];
                $product['resale_price'] = $basePrice ? round($basePrice * 1.15, 2) : null; // 15% markup
                $product['profit_margin'] = $basePrice ? round(($product['resale_price'] - $basePrice) / $basePrice * 100, 1) : null;
            } else {
                $product['pricing'] = null;
                $product['resale_price'] = null;
                $product['profit_margin'] = null;
            }
        }

        return $products;
    }

    /**
     * NEW: Bulk fetch pricing from multiple brands
     */
    public function fetchBulkPricing(array $brandIds): array
    {
        $allOffers = [];

        foreach ($brandIds as $brandId) {
            $offers = $this->getOffers($brandId);
            if (!empty($offers)) {
                $allOffers[$brandId] = $offers;
            }

            // Small delay to avoid rate limiting
            usleep(100000); // 0.1 seconds
        }

        return $allOffers;
    }

    /**
     * NEW: Get all brands with their pricing status
     */
    public function getBrandsWithPricingStatus(string $serviceId): array
    {
        // Get all brands for the service
        $path = "/services/$serviceId/brands?language=en&page_size=100";
        $response = Http::withoutVerifying()->timeout(60)
            ->withHeaders($this->getHeaders($path))
            ->get($this->baseUrl . $path);

        if (!$response->successful()) {
            return [];
        }

        $brands = $response->json('payload.brand_list') ?? [];

        // Check pricing for each brand (sample first 10 for performance)
        $brandsWithPricing = [];
        foreach (array_slice($brands, 0, 10) as $brand) {
            $offers = $this->getOffers($brand['brand_id']);
            $brand['has_pricing'] = !empty($offers);
            $brand['offer_count'] = count($offers);
            $brandsWithPricing[] = $brand;
        }

        return $brandsWithPricing;
    }

    public function placeOrder(Order $order): array
    {
        // G2G v2 Order placement (Placeholder - requires complex flow)
        Log::info("G2G: Place Order called for Order #{$order->id} (Not yet implemented)");
        return ['status' => 'PENDING', 'message' => 'G2G automated ordering coming soon'];
    }

    public function getBalance(): float
    {
        // G2G v2 Balance/Store verification
        $path = "/store";
        $response = Http::withoutVerifying()->timeout(60)
            ->withHeaders($this->getHeaders($path))
            ->get($this->baseUrl . $path);

        // Many G2G v2 accounts might return 400/404 for /store if not fully set up
        return (float) ($response->json('payload.balance') ?? 0);
    }

    public function formatProductData(array $raw): array
    {
        return [
            'name'        => $raw['product_name'] ?? 'N/A',
            'description' => $raw['region_name'] ?? null,
            'price'       => 0, // Needs separate offer search to fill
            'category'    => $raw['service_name'] ?? 'Digital',
            'image_url'   => null,
            'data'        => $raw,
            'status'      => 'available',
            'stock'       => 0, // Needs separate offer search to fill
        ];
    }
}
