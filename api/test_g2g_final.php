<?php
/**
 * Final G2G OpenAPI v2 Test Script
 * Verifies Services -> Brands -> Products -> Pricing
 */

$apiKey = 'M3GYBHGRMHULXK7JWFJVNGY7UNSOHXTB';
$secretKey = 'SEH1oIbuGb4SdkAruiqIg2zHvVUyrwDhyG8zBIGXFm9';
$userId = '5215028';
$baseUrl = 'https://open-api.g2g.com/v2';

function getHeaders($path, $apiKey, $userId, $secretKey) {
    $timestamp = round(microtime(true) * 1000);
    $basePath = (strpos($path, '?') !== false) ? substr($path, 0, strpos($path, '?')) : $path;
    $canonUrl = "/v2" . $basePath;
    $canonicalString = $canonUrl . $apiKey . $userId . (string)$timestamp;
    $signature = hash_hmac('sha256', $canonicalString, $secretKey);
    return [
        "g2g-api-key: $apiKey", "g2g-userid: $userId", "g2g-timestamp: $timestamp", "g2g-signature: $signature",
        "Content-Type: application/json", "Accept: application/json"
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
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($data) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// 1. SERVICES
echo "1. Fetching Services...\n";
$servicesRes = callG2G('/services');
$services = $servicesRes['payload']['service_list'] ?? [];
$gcService = null;
foreach($services as $s) if($s['service_name'] === 'Gift Cards') $gcService = $s;

if(!$gcService) die("Gift Cards service not found.\n");
$serviceId = $gcService['service_id'];

// 2. BRANDS
echo "2. Searching for iTunes/Apple Brand...\n";
$brandsRes = callG2G("/services/$serviceId/brands?q=Apple&page_size=5");
$brand = $brandsRes['payload']['brand_list'][0] ?? null;
if(!$brand) die("Apple brand not found.\n");
$brandId = $brand['brand_id'];
echo "   Selected Brand: {$brand['brand_name']} ($brandId)\n";

// 3. PRODUCTS
// We need a category ID from the hierarchy
$catId = null;
foreach($gcService['categories'] ?? [] as $mainCat) {
    if(!empty($mainCat['sub_categories'])) {
        $catId = $mainCat['sub_categories'][0]['category_id'];
        break;
    }
}

echo "3. Fetching Products (using Category ID: $catId)...\n";
$productsRes = callG2G("/products?service_id=$serviceId&brand_id=$brandId&category_id=$catId&page_size=5");
$products = $productsRes['payload']['product_list'] ?? [];

if(empty($products)) {
    echo "   No products found with category. Trying broad search...\n";
    $productsRes = callG2G("/products?service_id=$serviceId&brand_id=$brandId&page_size=5");
    $products = $productsRes['payload']['product_list'] ?? [];
}

if(empty($products)) die("   Failure: No products found for this brand.\n");

$product = $products[0];
$productId = $product['product_id'];
echo "   Selected Product: {$product['product_name']} ($productId)\n";

// 4. ATTRIBUTES
echo "4. Fetching Attributes...\n";
$attrRes = callG2G("/products/$productId/attributes");
$groups = $attrRes['payload']['attribute_group_list'] ?? [];
$selAttrs = [];
if(!empty($groups)) {
    $selAttrs[] = [
        'attribute_group_id' => $groups[0]['attribute_group_id'],
        'attribute_id' => $groups[0]['attribute_list'][0]['attribute_id']
    ];
}

// 5. PRICING
echo "5. Fetching Pricing...\n";
$pricingData = ['attributes' => $selAttrs, 'currency' => 'USD'];
$pricingRes = callG2G("/products/$productId/pricing", 'POST', $pricingData);

if(($pricingRes['code'] ?? 0) === 20000001) {
    $payload = $pricingRes['payload'];
    echo "   SUCCESS!\n";
    echo "   Recommended: $" . $payload['recommended_price'] . "\n";
    echo "   Lowest Prices from sellers:\n";
    foreach(array_slice($payload['lowest_prices'] ?? [], 0, 3) as $lp) {
        echo "   - " . $lp['username'] . ": $" . $lp['unit_price'] . "\n";
    }
} else {
    echo "   Pricing call failed or returned error.\n";
    print_r($pricingRes);
}

echo "\n--- TEST COMPLETE ---\n";
