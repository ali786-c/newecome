<?php

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

class G2GSmartFinder {
    private string $apiKey;
    private string $userId;
    private string $secretKey;
    private string $baseUrl = 'https://open-api.g2g.com/v2';

    public function __construct() {
        $this->apiKey = getenv('G2G_API_KEY') ?: '';
        $this->userId = getenv('G2G_USER_ID') ?: '';
        $this->secretKey = getenv('G2G_SECRET_KEY') ?: '';

        if (!$this->apiKey || !$this->userId || !$this->secretKey) {
            throw new Exception("Missing G2G credentials");
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

    public function findServiceWithPricing(): void {
        echo "\n🔍 SEARCHING FOR SERVICES WITH PRICING\n";
        echo str_repeat("=", 60) . "\n";

        // Get services
        $result = $this->makeRequest('GET', '/services');
        $services = $result['data']['payload']['service_list'] ?? [];

        if (empty($services)) {
            echo "❌ No services found\n";
            return;
        }

        // Prioritize Gift Cards service (most likely to have pricing)
        $targetServices = [];
        foreach ($services as $service) {
            if (stripos($service['service_name'], 'gift card') !== false) {
                array_unshift($targetServices, $service);
            } else {
                $targetServices[] = $service;
            }
        }

        echo "Testing " . count($targetServices) . " services...\n\n";

        foreach (array_slice($targetServices, 0, 5) as $service) {
            $serviceId = $service['service_id'];
            $serviceName = $service['service_name'];
            echo "Service: $serviceName\n";

            // Get brands for this service
            $brandRes = $this->makeRequest('GET', "/services/$serviceId/brands?language=en");
            $brands = $brandRes['data']['payload']['brand_list'] ?? [];

            if (empty($brands)) {
                echo "  ⊘ No brands found\n\n";
                continue;
            }

            echo "  Brands: " . count($brands) . " found\n";

            // Test first few brands for offers
            foreach (array_slice($brands, 0, 3) as $brand) {
                $brandId = $brand['brand_id'];
                $brandName = $brand['brand_name'];

                // Try to get offers
                $offerRes = $this->makeRequest('POST', '/offers/search', [
                    'filter' => ['brand_id' => $brandId, 'status' => 'live'],
                    'page_size' => 3,
                    'page' => 1
                ]);

                if ($offerRes['status'] === 200) {
                    $offers = $offerRes['data']['payload']['results'] ?? [];
                    if (!empty($offers)) {
                        echo "  ✅ FOUND: $brandName\n";
                        foreach ($offers as $offer) {
                            $price = $offer['retail_price'] ?? 'N/A';
                            $qty = $offer['quantity'] ?? 'N/A';
                            echo "     • Price: $price | Qty: $qty\n";
                        }
                        echo "\n✅ SUCCESS! Service with pricing: $serviceName → $brandName\n";
                        echo "Service ID: $serviceId\n";
                        echo "Brand ID: $brandId\n";
                        return;
                    }
                }
            }
            echo "  ✗ No active pricing found\n\n";
        }

        echo "\n⚠️  No services with active pricing found in your account.\n";
        echo "Next steps:\n";
        echo "1. Check G2G dashboard for inventory\n";
        echo "2. Ensure sellers are set to 'live'\n";
        echo "3. Contact G2G support\n";
    }
}

try {
    $finder = new G2GSmartFinder();
    $finder->findServiceWithPricing();
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
