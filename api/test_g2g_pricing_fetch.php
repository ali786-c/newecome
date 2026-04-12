<?php
/**
 * G2G Pricing Fetch Test - Demonstrates how to get product pricing
 *
 * This test shows:
 * 1. How to fetch services
 * 2. How to fetch brands
 * 3. How to fetch products
 * 4. How to fetch pricing/offers (when available)
 * 5. Complete workflow for reselling
 */

// Simple environment loader
function loadEnv($filePath) {
    if (!file_exists($filePath)) return false;
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        [$key, $value] = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value, '\'"'));
    }
    return true;
}

loadEnv(__DIR__ . '/.env');

class G2GPricingTester {
    private string $apiKey;
    private string $userId;
    private string $secretKey;
    private string $baseUrl = 'https://open-api.g2g.com/v2';

    public function __construct() {
        $this->apiKey = getenv('G2G_API_KEY') ?: '';
        $this->userId = getenv('G2G_USER_ID') ?: '';
        $this->secretKey = getenv('G2G_SECRET_KEY') ?: '';

        if (!$this->apiKey || !$this->userId || !$this->secretKey) {
            throw new Exception("❌ Missing G2G credentials");
        }
    }

    private function getHeaders(string $path, string $method = 'GET'): array {
        $timestamp = round(microtime(true) * 1000);
        $canonPath = (strpos($path, '?') !== false) ? substr($path, 0, strpos($path, '?')) : $path;
        $canonUrl = "/v2" . $canonPath;
        $canonicalString = $canonUrl . $this->apiKey . $this->userId . (string)$timestamp;
        $signature = hash_hmac('sha256', $canonicalString, $this->secretKey);

        return [
            'g2g-api-key' => $this->apiKey,
            'g2g-userid' => $this->userId,
            'g2g-timestamp' => $timestamp,
            'g2g-signature' => $signature,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    private function makeRequest(string $method, string $path, ?array $payload = null): array {
        $url = $this->baseUrl . $path;
        $headers = $this->getHeaders($path, $method);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => array_map(fn($k, $v) => "$k: $v", array_keys($headers), $headers),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);

        if ($payload && in_array($method, ['POST', 'PUT'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return ['status' => $httpCode, 'data' => json_decode($response, true) ?? []];
    }

    /**
     * Step 1: Get all available services
     */
    public function step1_GetServices(): array {
        echo "\n🔍 STEP 1: FETCHING SERVICES\n";
        echo str_repeat("=", 50) . "\n";

        $result = $this->makeRequest('GET', '/services');

        if ($result['status'] !== 200) {
            echo "❌ Failed to fetch services\n";
            return [];
        }

        $services = $result['data']['payload']['service_list'] ?? [];
        echo "✅ Found " . count($services) . " services:\n";

        foreach ($services as $service) {
            echo "  • {$service['service_name']} (ID: {$service['service_id']})\n";
        }

        return $services;
    }

    /**
     * Step 2: Get brands for a specific service
     */
    public function step2_GetBrands(string $serviceId, string $serviceName): array {
        echo "\n🏷️  STEP 2: FETCHING BRANDS FOR '$serviceName'\n";
        echo str_repeat("=", 50) . "\n";

        $result = $this->makeRequest('GET', "/services/$serviceId/brands?language=en");

        if ($result['status'] !== 200) {
            echo "❌ Failed to fetch brands\n";
            return [];
        }

        $brands = $result['data']['payload']['brand_list'] ?? [];
        echo "✅ Found " . count($brands) . " brands:\n";

        // Show first 5 brands as examples
        foreach (array_slice($brands, 0, 5) as $brand) {
            echo "  • {$brand['brand_name']} (ID: {$brand['brand_id']})\n";
        }

        if (count($brands) > 5) {
            echo "  ... and " . (count($brands) - 5) . " more brands\n";
        }

        return $brands;
    }

    /**
     * Step 3: Get products for a specific brand
     */
    public function step3_GetProducts(string $serviceId, string $brandId, string $brandName): array {
        echo "\n📦 STEP 3: FETCHING PRODUCTS FOR '$brandName'\n";
        echo str_repeat("=", 50) . "\n";

        $result = $this->makeRequest('GET', "/products?service_id=$serviceId&brand_id=$brandId");

        if ($result['status'] !== 200) {
            echo "❌ Failed to fetch products\n";
            return [];
        }

        $products = $result['data']['payload']['product_list'] ?? [];
        echo "✅ Found " . count($products) . " products:\n";

        foreach ($products as $product) {
            $region = $product['region_name'] ?? 'Global';
            echo "  • {$product['product_name']} (ID: {$product['product_id']}, Region: $region)\n";
        }

        return $products;
    }

    /**
     * Step 4: Get pricing/offers for a brand (THE KEY STEP FOR RESELLING)
     */
    public function step4_GetPricing(string $brandId, string $brandName): array {
        echo "\n💰 STEP 4: FETCHING PRICING FOR '$brandName' (RESELLER DATA)\n";
        echo str_repeat("=", 60) . "\n";

        $payload = [
            'filter' => [
                'brand_id' => $brandId,
                'status' => 'live'
            ],
            'page_size' => 20,  // Get more results
            'page' => 1
        ];

        echo "📤 Sending request to /offers/search:\n";
        echo json_encode($payload, JSON_PRETTY_PRINT) . "\n\n";

        $result = $this->makeRequest('POST', '/offers/search', $payload);

        echo "📥 Response Status: {$result['status']}\n";

        if ($result['status'] !== 200) {
            echo "❌ No pricing data available for this brand\n";
            echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT) . "\n";
            return [];
        }

        $offers = $result['data']['payload']['results'] ?? [];
        echo "✅ Found " . count($offers) . " live offers with pricing:\n\n";

        // Display pricing data in a nice format
        foreach ($offers as $i => $offer) {
            $price = $offer['retail_price'] ?? $offer['price'] ?? 'N/A';
            $quantity = $offer['quantity'] ?? 'N/A';
            $currency = $offer['currency'] ?? 'USD';
            $seller = $offer['seller_name'] ?? 'Unknown Seller';
            $minQty = $offer['min_quantity'] ?? 1;
            $maxQty = $offer['max_quantity'] ?? $quantity;

            echo "🎯 OFFER #" . ($i + 1) . ":\n";
            echo "   💵 Price: $price $currency\n";
            echo "   📦 Stock: $quantity units\n";
            echo "   👤 Seller: $seller\n";
            echo "   📊 Quantity Range: $minQty - $maxQty\n";
            echo "   🏷️  Product ID: " . ($offer['product_id'] ?? 'N/A') . "\n";
            echo "   📝 Description: " . ($offer['description'] ?? 'N/A') . "\n";
            echo "\n";
        }

        return $offers;
    }

    /**
     * Complete reseller workflow demonstration
     */
    public function demonstrateResellerWorkflow(): void {
        echo "\n🚀 G2G RESELLER WORKFLOW DEMONSTRATION\n";
        echo str_repeat("=", 60) . "\n";
        echo "This shows how to fetch products with pricing for resale on your website\n\n";

        // Step 1: Get services
        $services = $this->step1_GetServices();
        if (empty($services)) return;

        // Find Gift Cards service (most common for reselling)
        $giftCardService = null;
        foreach ($services as $service) {
            if (stripos($service['service_name'], 'gift card') !== false) {
                $giftCardService = $service;
                break;
            }
        }

        if (!$giftCardService) {
            echo "⚠️  No Gift Cards service found, using first available service\n";
            $giftCardService = $services[0];
        }

        $serviceId = $giftCardService['service_id'];
        $serviceName = $giftCardService['service_name'];

        // Step 2: Get brands
        $brands = $this->step2_GetBrands($serviceId, $serviceName);
        if (empty($brands)) return;

        // Use first brand as example
        $brand = $brands[0];
        $brandId = $brand['brand_id'];
        $brandName = $brand['brand_name'];

        // Step 3: Get products
        $products = $this->step3_GetProducts($serviceId, $brandId, $brandName);

        // Step 4: Get pricing (THE IMPORTANT PART FOR RESELLING)
        $offers = $this->step4_GetPricing($brandId, $brandName);

        // Summary
        echo "\n📊 WORKFLOW SUMMARY\n";
        echo str_repeat("=", 50) . "\n";
        echo "Services Found: " . count($services) . "\n";
        echo "Brands Found: " . count($brands) . "\n";
        echo "Products Found: " . count($products) . "\n";
        echo "Live Offers Found: " . count($offers) . "\n";

        if (count($offers) > 0) {
            echo "\n✅ SUCCESS: You can resell these products!\n";
            echo "💡 Next: Integrate this data into your website's product catalog\n";
        } else {
            echo "\n⚠️  NO PRICING DATA: No live offers available for resale\n";
            echo "💡 This means no other sellers have listed products for this brand yet\n";
            echo "💡 Try different brands or check back later\n";
        }

        echo "\n🔄 To get pricing for ALL brands, you would:\n";
        echo "1. Loop through all brands in step 2\n";
        echo "2. For each brand, call step 4 (get pricing)\n";
        echo "3. Store pricing data in your database\n";
        echo "4. Display on your website with markup\n";
    }

    /**
     * Show how to integrate pricing into Laravel
     */
    public function showLaravelIntegration(): void {
        echo "\n🔧 LARAVEL INTEGRATION EXAMPLE\n";
        echo str_repeat("=", 50) . "\n";

        $code = '
<?php
// In your G2GService.php - Modified fetchProducts method

public function fetchProductsWithPricing(array $filters = []): array
{
    $serviceId = $filters["service_id"] ?? "8f88b6fd-93df-4a07-b8b0-7d90b152b81f";
    $brandId = $filters["brand_id"] ?? null;

    if (!$brandId) {
        return [];
    }

    // 1. Get products
    $products = $this->fetchProducts($filters);

    // 2. Get pricing for this brand
    $offers = $this->getOffers($brandId);

    // 3. Merge pricing data with products
    foreach ($products as &$product) {
        $product["offers"] = array_filter($offers, function($offer) use ($product) {
            return $offer["product_id"] === $product["product_id"];
        });

        // Add best price info
        if (!empty($product["offers"])) {
            $prices = array_column($product["offers"], "retail_price");
            $product["lowest_price"] = min($prices);
            $product["highest_price"] = max($prices);
            $product["total_stock"] = array_sum(array_column($product["offers"], "quantity"));
        }
    }

    return $products;
}

// Usage in Controller:
public function getProducts(Request $request)
{
    $service = app(G2GService::class)->setConnection($connection);
    $products = $service->fetchProductsWithPricing([
        "service_id" => $request->service_id,
        "brand_id" => $request->brand_id
    ]);

    return response()->json($products);
}
';

        echo $code . "\n";
    }
}

try {
    $tester = new G2GPricingTester();
    $tester->demonstrateResellerWorkflow();
    $tester->showLaravelIntegration();

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
