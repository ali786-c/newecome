<?php

/**
 * Technical Test for G2G OpenAPI v2
 * This script verifies the authentication and data retrieval from G2G.
 */

$apiKey = 'M3GYBHGRMHULXK7JWFJVNGY7UNSOHXTB';
$secretKey = 'SEH1oIbuGb4SdkAruiqIg2zHvVUyrwDhyG8zBIGXFm9';
$userId = '5215028';
$baseUrl = 'https://open-api.g2g.com/v2';

function getHeaders($path, $apiKey, $userId, $secretKey) {
    $timestamp = round(microtime(true) * 1000);
    
    // Canonical path for signature: /v2 + base path (EXCLUDING query parameters)
    $basePath = (strpos($path, '?') !== false) ? substr($path, 0, strpos($path, '?')) : $path;
    $canonUrl = "/v2" . $basePath;
    
    $canonicalString = $canonUrl . $apiKey . $userId . (string)$timestamp;
    $signature = hash_hmac('sha256', $canonicalString, $secretKey);

    return [
        "g2g-api-key: $apiKey",
        "g2g-userid: $userId",
        "g2g-timestamp: $timestamp",
        "g2g-signature: $signature",
        "Content-Type: application/json",
        "Accept: application/json"
    ];
}

function callG2G($path, $method = 'GET', $data = null) {
    global $baseUrl, $apiKey, $userId, $secretKey;
    
    $url = $baseUrl . $path;
    $headers = getHeaders($path, $apiKey, $userId, $secretKey);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        echo "CURL Error: " . curl_error($ch) . "\n";
    }
    
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

echo "--- STEP 1: Fetching Services ---\n";
$servicesRes = callG2G('/services');
if ($servicesRes['code'] !== 200) {
    echo "Failed to fetch services. Code: {$servicesRes['code']}\nRaw: {$servicesRes['raw']}\n";
    exit;
}

$services = $servicesRes['body']['payload']['service_list'] ?? [];
echo "Found " . count($services) . " services.\n";

$giftCardService = null;
foreach ($services as $s) {
    if (stripos($s['service_name'], 'Gift Cards') !== false) {
        $giftCardService = $s;
        break;
    }
}

if (!$giftCardService) {
    echo "Gift Cards service not found. Using first service.\n";
    $giftCardService = $services[0] ?? null;
}

if (!$giftCardService) {
    echo "No services available.\n";
    exit;
}

$serviceId = $giftCardService['service_id'];
$categories = $giftCardService['categories'] ?? [];
echo "Using Service: {$giftCardService['service_name']} (ID: $serviceId)\n";
echo "Found " . count($categories) . " categories in this service.\n";
foreach ($categories as $cat) {
    echo "- Category: {$cat['category_name']} (ID: {$cat['category_id']})\n";
}

echo "\n--- STEP 2: Fetching Apple Brands for Service ---\n";
$brandsRes = callG2G("/services/$serviceId/brands?q=Apple&page_size=10");
$brands = $brandsRes['body']['payload']['brand_list'] ?? [];
echo "Found " . count($brands) . " brands matching 'Apple'.\n";

$targetBrand = $brands[0] ?? null;

if (!$targetBrand) {
     echo "No Apple brands found, falling back to first brand.\n";
     $brandsRes = callG2G("/services/$serviceId/brands?page_size=1");
     $targetBrand = $brandsRes['body']['payload']['brand_list'][0] ?? null;
}

if (!$targetBrand) {
     echo "No brands found.\n";
     exit;
}

$brandId = $targetBrand['brand_id'];
echo "Using Brand: {$targetBrand['brand_name']} (ID: $brandId)\n";

echo "\n--- STEP 3: Fetching Products for Brand ---\n";
// Try with service_id and brand_id
$productsRes = callG2G("/products?service_id=$serviceId&brand_id=$brandId&page_size=10");
$products = $productsRes['body']['payload']['product_list'] ?? [];

// If empty, try with category_id from the first category
if (empty($products) && !empty($categories)) {
    $catId = $categories[0]['category_id'];
    echo "No products found with service/brand. Trying category_id: $catId\n";
    $productsRes = callG2G("/products?category_id=$catId&service_id=$serviceId&brand_id=$brandId&page_size=10");
    $products = $productsRes['body']['payload']['product_list'] ?? [];
}

// If still empty, try broad search for brand in the service
if (empty($products)) {
    echo "Still no products found for this brand. Trying broad search for Brand ID in /products\n";
    $productsRes = callG2G("/products?brand_id=$brandId&page_size=10");
     $products = $productsRes['body']['payload']['product_list'] ?? [];
}

echo "Found " . count($products) . " products.\n";

foreach (array_slice($products, 0, 3) as $p) {
    echo "- {$p['product_name']} (ID: {$p['product_id']})\n";
}

$targetProduct = $products[0] ?? null;
if (!$targetProduct) {
    echo "No products found.\n";
    exit;
}

$productId = $targetProduct['product_id'];

echo "\n--- STEP 4: Fetching Attributes for Product ---\n";
$attrRes = callG2G("/products/$productId/attributes");
$attrPayload = $attrRes['body']['payload'] ?? [];
$groups = $attrPayload['attribute_group_list'] ?? [];
echo "Found " . count($groups) . " attribute groups.\n";

$attributeIds = [];
if (!empty($groups)) {
    $firstGroup = $groups[0];
    $attr = $firstGroup['attribute_list'][0] ?? null;
    if ($attr) {
        $attributeIds[] = [
            'attribute_group_id' => $firstGroup['attribute_group_id'],
            'attribute_id' => $attr['attribute_id']
        ];
        echo "Selected attribute: {$attr['attribute_name']} from {$firstGroup['attribute_group_name']}\n";
    }
}

echo "\n--- STEP 5: Fetching Pricing ---\n";
$pricingData = [
    'attributes' => $attributeIds,
    'currency' => 'EUR'
];
$pricingRes = callG2G("/products/$productId/pricing", 'POST', $pricingData);

if ($pricingRes['code'] === 200) {
    $payload = $pricingRes['body']['payload'] ?? [];
    echo "Recommended Price: " . ($payload['recommended_price'] ?? 'N/A') . " EUR\n";
    echo "Last Transaction Price: " . ($payload['last_transaction_price'] ?? 'N/A') . " EUR\n";
    
    $lowestPrices = $payload['lowest_prices'] ?? [];
    echo "Lowest Prices (" . count($lowestPrices) . " sellers):\n";
    foreach (array_slice($lowestPrices, 0, 5) as $lp) {
        echo "- Seller: {$lp['username']} | Price: {$lp['unit_price']} EUR\n";
    }
} else {
    echo "Failed to fetch pricing. Code: {$pricingRes['code']}\nRaw: {$pricingRes['raw']}\n";
}

echo "\n--- TEST COMPLETED ---\n";
