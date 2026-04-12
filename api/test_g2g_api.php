<?php
/**
 * G2G API Integration Test Script
 * 
 * This script tests:
 * 1. Authentication & signature generation
 * 2. Services listing
 * 3. Brands fetching
 * 4. Products fetching (with pricing via offers)
 * 5. Account access verification
 * 
 * Usage: php test_g2g_api.php
 */

// Simple environment loader (no external dependencies)
function loadEnv($filePath)
{
    if (!file_exists($filePath)) {
        return false;
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value, '\'"');
        putenv("$key=$value");
    }
    return true;
}

// Load .env file
loadEnv(__DIR__ . '/.env');

class G2GApiTester
{
    private string $apiKey;
    private string $userId;
    private string $secretKey;
    private string $baseUrl = 'https://open-api.g2g.com/v2';
    private bool $verbose = true;

    public function __construct()
    {
        $this->apiKey = getenv('G2G_API_KEY') ?: '';
        $this->userId = getenv('G2G_USER_ID') ?: '';
        $this->secretKey = getenv('G2G_SECRET_KEY') ?: '';

        if (!$this->apiKey || !$this->userId || !$this->secretKey) {
            throw new Exception("❌ Missing G2G credentials. Please set G2G_API_KEY, G2G_USER_ID, and G2G_SECRET_KEY in .env or environment variables.");
        }
    }

    /**
     * Generate G2G v2 signature headers
     */
    private function getHeaders(string $path, string $method = 'GET'): array
    {
        $timestamp = round(microtime(true) * 1000);
        
        // Remove query params for canonical path
        $canonPath = (strpos($path, '?') !== false) ? substr($path, 0, strpos($path, '?')) : $path;
        $canonUrl = "/v2" . $canonPath;
        
        $canonicalString = $canonUrl . $this->apiKey . $this->userId . (string)$timestamp;
        $signature = hash_hmac('sha256', $canonicalString, $this->secretKey);

        return [
            'g2g-api-key'   => $this->apiKey,
            'g2g-userid'    => $this->userId,
            'g2g-timestamp' => $timestamp,
            'g2g-signature' => $signature,
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
        ];
    }

    /**
     * Make HTTP request to G2G API
     */
    private function makeRequest(string $method, string $path, ?array $payload = null): array
    {
        $url = $this->baseUrl . $path;
        $headers = $this->getHeaders($path, $method);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $this->formatHeaders($headers),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 60,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);

        if ($payload && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'status' => $httpCode,
            'data' => json_decode($response, true) ?? [],
            'raw' => $response
        ];
    }

    /**
     * Format headers array for curl
     */
    private function formatHeaders(array $headers): array
    {
        $formatted = [];
        foreach ($headers as $key => $value) {
            $formatted[] = "$key: $value";
        }
        return $formatted;
    }

    /**
     * Test 1: Verify credentials & account access
     */
    public function testAccountAccess(): bool
    {
        $this->log("\n🔐 TEST 1: ACCOUNT ACCESS", '=');
        
        $result = $this->makeRequest('GET', '/store');
        
        $this->log("Endpoint: GET /store");
        $this->log("Status Code: {$result['status']}");
        
        if ($result['status'] === 200) {
            $this->log("✅ Account Access: SUCCESSFUL");
            if (isset($result['data']['payload'])) {
                $this->log("Response: " . json_encode($result['data']['payload'], JSON_PRETTY_PRINT), 'debug');
            }
            return true;
        } else {
            $this->log("❌ Account Access: FAILED");
            $this->log("Response: " . $result['raw'], 'error');
            return false;
        }
    }

    /**
     * Test 2: List all services
     */
    public function testGetServices(): array
    {
        $this->log("\n📦 TEST 2: GET SERVICES", '=');
        
        $result = $this->makeRequest('GET', '/services');
        
        $this->log("Endpoint: GET /services");
        $this->log("Status Code: {$result['status']}");
        
        if ($result['status'] !== 200) {
            $this->log("❌ Failed to fetch services", 'error');
            return [];
        }

        $services = $result['data']['payload']['service_list'] ?? [];
        $this->log("✅ Found " . count($services) . " services");
        
        foreach ($services as $service) {
            $this->log("  • {$service['service_name']} (ID: {$service['service_id']})", 'debug');
        }

        return $services;
    }

    /**
     * Test 3: Get brands for a service
     */
    public function testGetBrands(string $serviceId): array
    {
        $this->log("\n🏷️  TEST 3: GET BRANDS", '=');
        
        $result = $this->makeRequest('GET', "/services/$serviceId/brands?language=en");
        
        $this->log("Endpoint: GET /services/$serviceId/brands");
        $this->log("Status Code: {$result['status']}");
        
        if ($result['status'] !== 200) {
            $this->log("❌ Failed to fetch brands", 'error');
            return [];
        }

        $brands = $result['data']['payload']['brand_list'] ?? [];
        $this->log("✅ Found " . count($brands) . " brands");
        
        foreach (array_slice($brands, 0, 5) as $brand) {
            $this->log("  • {$brand['brand_name']} (ID: {$brand['brand_id']})", 'debug');
        }

        return $brands;
    }

    /**
     * Test 4: Get products for a brand
     */
    public function testGetProducts(string $serviceId, string $brandId): array
    {
        $this->log("\n📚 TEST 4: GET PRODUCTS", '=');
        
        $result = $this->makeRequest('GET', "/products?service_id=$serviceId&brand_id=$brandId");
        
        $this->log("Endpoint: GET /products?service_id=$serviceId&brand_id=$brandId");
        $this->log("Status Code: {$result['status']}");
        
        if ($result['status'] !== 200) {
            $this->log("❌ Failed to fetch products", 'error');
            return [];
        }

        $products = $result['data']['payload']['product_list'] ?? [];
        $this->log("✅ Found " . count($products) . " products");
        
        foreach (array_slice($products, 0, 3) as $product) {
            $region = $product['region_name'] ?? 'N/A';
            $this->log("  • {$product['product_name']} (ID: {$product['product_id']}, Region: {$region})", 'debug');
        }

        return $products;
    }

    /**
     * Test 5: Search offers (to get pricing)
     */
    public function testGetPricing(string $brandId): array
    {
        $this->log("\n💰 TEST 5: GET PRICING (Search Offers)", '=');
        
        $payload = [
            'filter' => [
                'brand_id' => $brandId,
                'status' => 'live'
            ],
            'page_size' => 5,
            'page' => 1
        ];

        $result = $this->makeRequest('POST', '/offers/search', $payload);
        
        $this->log("Endpoint: POST /offers/search");
        $this->log("Status Code: {$result['status']}");
        $this->log("Payload: " . json_encode($payload, JSON_PRETTY_PRINT), 'debug');
        
        if ($result['status'] !== 200) {
            $this->log("❌ Failed to fetch pricing/offers", 'error');
            $this->log("Response: " . json_encode($result['data'], JSON_PRETTY_PRINT), 'error');
            return [];
        }

        $offers = $result['data']['payload']['results'] ?? [];
        $this->log("✅ Found " . count($offers) . " offers with pricing");
        
        foreach (array_slice($offers, 0, 3) as $offer) {
            $price = $offer['retail_price'] ?? $offer['price'] ?? 'N/A';
            $quantity = $offer['quantity'] ?? 'N/A';
            $status = $offer['status'] ?? 'N/A';
            $this->log("  • Price: $price, Quantity: $quantity, Status: $status", 'debug');
        }

        return $offers;
    }

    /**
     * Comprehensive test workflow
     */
    public function runFullTest(): void
    {
        try {
            $this->log("\n🚀 G2G API INTEGRATION TEST STARTED\n", 'header');
            $this->log("API Key: " . substr($this->apiKey, 0, 8) . "***");
            $this->log("User ID: {$this->userId}");

            // Test account access
            if (!$this->testAccountAccess()) {
                $this->log("\n⚠️  Cannot access account. Stopping tests.", 'error');
                return;
            }

            // Get services
            $services = $this->testGetServices();
            if (empty($services)) {
                $this->log("\n⚠️  No services found. Cannot continue.", 'error');
                return;
            }

            // Use first service (typically Gift Cards)
            $serviceId = $services[0]['service_id'];
            $serviceName = $services[0]['service_name'];
            $this->log("\n📌 Using service: $serviceName ($serviceId)");

            // Get brands
            $brands = $this->testGetBrands($serviceId);
            if (empty($brands)) {
                $this->log("\n⚠️  No brands found. Cannot continue.", 'error');
                return;
            }

            // Use first brand
            $brandId = $brands[0]['brand_id'];
            $brandName = $brands[0]['brand_name'];
            $this->log("\n📌 Using brand: $brandName ($brandId)");

            // Get products
            $products = $this->testGetProducts($serviceId, $brandId);
            if (empty($products)) {
                $this->log("\n⚠️  No products found.", 'error');
                return;
            }

            // Get pricing
            $offers = $this->testGetPricing($brandId);
            if (empty($offers)) {
                $this->log("\n⚠️  No offers found. Pricing may not be available for this brand.", 'warning');
            }

            $this->printSummary($services, $brands, $products, $offers);

        } catch (Exception $e) {
            $this->log("\n❌ ERROR: " . $e->getMessage(), 'error');
        }
    }

    /**
     * Print test summary
     */
    private function printSummary(array $services, array $brands, array $products, array $offers): void
    {
        $this->log("\n📊 TEST SUMMARY", '=');
        $this->log("✅ Services Available: " . count($services));
        $this->log("✅ Brands Found: " . count($brands));
        $this->log("✅ Products Found: " . count($products));
        $this->log("✅ Offers/Pricing Found: " . count($offers));
        
        $pricingStatus = count($offers) > 0 ? "✅ AVAILABLE" : "⚠️  NO OFFERS FOUND";
        $this->log("\n💰 Pricing Status: $pricingStatus");
        
        if (count($offers) > 0) {
            $firstOffer = $offers[0];
            $this->log("Sample Price: " . ($firstOffer['retail_price'] ?? 'N/A'));
            $this->log("Sample Quantity: " . ($firstOffer['quantity'] ?? 'N/A'));
        }

        $this->log("\n🎉 TEST COMPLETED SUCCESSFULLY!\n", 'header');
    }

    /**
     * Logging utility
     */
    private function log(string $message, string $type = 'info'): void
    {
        $colors = [
            'header' => "\033[1;44m",
            'error' => "\033[1;31m",
            'warning' => "\033[1;33m",
            'debug' => "\033[36m",
            'info' => "\033[32m",
            'reset' => "\033[0m",
            '=' => "\033[1;37m",
        ];

        $color = $colors[$type] ?? $colors['info'];
        $reset = $colors['reset'];

        if (php_sapi_name() === 'cli') {
            echo "{$color}{$message}{$reset}\n";
        } else {
            echo htmlspecialchars($message) . "<br>\n";
        }
    }
}

// Run the test
try {
    $tester = new G2GApiTester();
    $tester->runFullTest();
} catch (Exception $e) {
    if (php_sapi_name() === 'cli') {
        echo "\033[1;31m❌ ERROR: " . $e->getMessage() . "\033[0m\n";
    } else {
        echo "<h1>❌ ERROR: " . htmlspecialchars($e->getMessage()) . "</h1>";
    }
    exit(1);
}
