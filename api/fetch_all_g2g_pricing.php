<?php
/**
 * G2G Bulk Pricing Fetcher - Fetch pricing from ALL brands
 * This is what you need to populate your website with reseller products
 */

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

class G2GBulkPricingFetcher {
    private string $apiKey;
    private string $userId;
    private string $secretKey;
    private string $baseUrl = 'https://open-api.g2g.com/v2';
    private array $allPricingData = [];

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
            CURLOPT_TIMEOUT => 30, // Shorter timeout for bulk operations
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
     * Fetch all services
     */
    public function fetchAllServices(): array {
        $result = $this->makeRequest('GET', '/services');
        return $result['status'] === 200 ? $result['data']['payload']['service_list'] ?? [] : [];
    }

    /**
     * Fetch all brands for a service (with pagination)
     */
    public function fetchAllBrands(string $serviceId): array {
        $allBrands = [];
        $after = null;
        $page = 0;

        do {
            $page++;
            $url = "/services/$serviceId/brands?language=en&page_size=100";
            if ($after) {
                $url .= "&after=$after";
            }

            $result = $this->makeRequest('GET', $url);

            if ($result['status'] !== 200) break;

            $brands = $result['data']['payload']['brand_list'] ?? [];
            $allBrands = array_merge($allBrands, $brands);

            $after = $result['data']['payload']['after'] ?? null;

            // Safety limit to prevent infinite loops
            if ($page > 20) break;

        } while ($after);

        return $allBrands;
    }

    /**
     * Fetch pricing for a single brand
     */
    public function fetchBrandPricing(string $brandId): array {
        $payload = [
            'filter' => [
                'brand_id' => $brandId,
                'status' => 'live'
            ],
            'page_size' => 50, // Get more offers per brand
            'page' => 1
        ];

        $result = $this->makeRequest('POST', '/offers/search', $payload);

        if ($result['status'] !== 200) {
            return [];
        }

        return $result['data']['payload']['results'] ?? [];
    }

    /**
     * Bulk fetch pricing from ALL brands (THIS IS WHAT YOU NEED!)
     */
    public function fetchAllPricing(): array {
        echo "\n🚀 STARTING BULK PRICING FETCH\n";
        echo str_repeat("=", 60) . "\n";

        // Get all services
        $services = $this->fetchAllServices();
        echo "📦 Found " . count($services) . " services\n";

        $totalBrands = 0;
        $totalOffers = 0;

        foreach ($services as $service) {
            $serviceId = $service['service_id'];
            $serviceName = $service['service_name'];

            echo "\n🔍 Processing Service: $serviceName\n";

            // Get all brands for this service
            $brands = $this->fetchAllBrands($serviceId);
            echo "  🏷️  Found " . count($brands) . " brands\n";

            $serviceOffers = 0;

            // Process brands in batches to avoid timeouts
            $batchSize = 10;
            for ($i = 0; $i < count($brands); $i += $batchSize) {
                $batch = array_slice($brands, $i, $batchSize);

                foreach ($batch as $brand) {
                    $brandId = $brand['brand_id'];
                    $brandName = $brand['brand_name'];

                    // Fetch pricing for this brand
                    $offers = $this->fetchBrandPricing($brandId);

                    if (!empty($offers)) {
                        // Store the data
                        $this->allPricingData[] = [
                            'service_id' => $serviceId,
                            'service_name' => $serviceName,
                            'brand_id' => $brandId,
                            'brand_name' => $brandName,
                            'offers' => $offers,
                            'offer_count' => count($offers)
                        ];

                        $serviceOffers += count($offers);
                        echo "    ✅ $brandName: " . count($offers) . " offers\n";
                    }
                }

                // Small delay between batches
                if ($i + $batchSize < count($brands)) {
                    sleep(1);
                }
            }

            $totalBrands += count($brands);
            $totalOffers += $serviceOffers;

            echo "  📊 $serviceName: $serviceOffers offers from " . count($brands) . " brands\n";
        }

        echo "\n🎉 BULK FETCH COMPLETE!\n";
        echo str_repeat("=", 60) . "\n";
        echo "📦 Total Services: " . count($services) . "\n";
        echo "🏷️  Total Brands: $totalBrands\n";
        echo "💰 Total Offers: $totalOffers\n";

        return $this->allPricingData;
    }

    /**
     * Get summary of all pricing data
     */
    public function getPricingSummary(): array {
        $summary = [
            'total_services' => 0,
            'total_brands' => 0,
            'total_offers' => 0,
            'services' => []
        ];

        foreach ($this->allPricingData as $data) {
            $summary['total_services']++;
            $summary['total_brands']++;
            $summary['total_offers'] += $data['offer_count'];

            $summary['services'][] = [
                'name' => $data['service_name'],
                'brands' => 1,
                'offers' => $data['offer_count']
            ];
        }

        return $summary;
    }

    /**
     * Export pricing data to JSON file
     */
    public function exportToJson(string $filename = 'g2g_pricing_data.json'): void {
        $data = [
            'exported_at' => date('Y-m-d H:i:s'),
            'summary' => $this->getPricingSummary(),
            'pricing_data' => $this->allPricingData
        ];

        file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));
        echo "\n💾 Data exported to: $filename\n";
    }

    /**
     * Show sample offers for demonstration
     */
    public function showSampleOffers(int $limit = 5): void {
        echo "\n🎯 SAMPLE OFFERS (First $limit from each brand with pricing)\n";
        echo str_repeat("=", 70) . "\n";

        $count = 0;
        foreach ($this->allPricingData as $brandData) {
            if ($count >= $limit) break;

            echo "🏷️  Brand: {$brandData['brand_name']} ({$brandData['service_name']})\n";

            foreach (array_slice($brandData['offers'], 0, 3) as $offer) {
                $price = $offer['retail_price'] ?? $offer['price'] ?? 'N/A';
                $currency = $offer['currency'] ?? 'USD';
                $quantity = $offer['quantity'] ?? 'N/A';
                $seller = $offer['seller_name'] ?? 'Unknown';

                echo "   💵 $price $currency | 📦 $quantity units | 👤 $seller\n";
            }
            echo "\n";
            $count++;
        }
    }
}

// Run the bulk fetcher
try {
    $fetcher = new G2GBulkPricingFetcher();

    // Fetch all pricing data
    $pricingData = $fetcher->fetchAllPricing();

    // Show summary
    $summary = $fetcher->getPricingSummary();
    echo "\n📊 FINAL SUMMARY:\n";
    echo "- Services with pricing: {$summary['total_services']}\n";
    echo "- Brands with pricing: {$summary['total_brands']}\n";
    echo "- Total offers found: {$summary['total_offers']}\n";

    // Show sample offers
    if (!empty($pricingData)) {
        $fetcher->showSampleOffers(3);
    }

    // Export to file
    $fetcher->exportToJson();

    echo "\n✅ SUCCESS! You now have all available pricing data for resale.\n";
    echo "💡 Next: Import this data into your website's database\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
