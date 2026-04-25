<?php
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
    return ["g2g-api-key: $apiKey", "g2g-userid: $userId", "g2g-timestamp: $timestamp", "g2g-signature: $signature", "Content-Type: application/json", "Accept: application/json"];
}

function call($path) {
    global $baseUrl, $apiKey, $userId, $secretKey;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . $path);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, getHeaders($path, $apiKey, $userId, $secretKey));
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $res = curl_exec($ch);
    curl_close($ch);
    return json_decode($res, true);
}

$serviceId = '8f88b6fd-93df-4a07-b8b0-7d90b152b81f'; // Gift Cards
echo "Listing products for Gift Cards service (service_id: $serviceId)...\n";

$res = call("/products?service_id=$serviceId&page_size=30");
$products = $res['payload']['product_list'] ?? [];

if(empty($products)) {
    echo "No products found in Gift Cards. Checking 'Activation Links' service...\n";
    $serviceId = '09b50a9c-9608-4be2-bc07-2147251a5d7f';
    $res = call("/products?service_id=$serviceId&page_size=30");
    $products = $res['payload']['product_list'] ?? [];
}

if(empty($products)) {
    echo "No products found in Activation Links. Checking 'Accounts' service...\n";
    $serviceId = 'f6a1aba5-473a-4044-836a-8968bbab16d7';
    $res = call("/products?service_id=$serviceId&page_size=30");
    $products = $res['payload']['product_list'] ?? [];
}

if(empty($products)) {
    die("Final Failure: No products found across major services with this API Key.\n");
}

echo "Found " . count($products) . " products. Details of first 5:\n";
foreach(array_slice($products, 0, 5) as $p) {
    echo "- Name: {$p['product_name']} | ID: {$p['product_id']} | Brand: {$p['brand_id']}\n";
}

$p = $products[0];
$pid = $p['product_id'];

echo "\nFetching Pricing for {$p['product_name']}...\n";
$attrRes = call("/products/$pid/attributes");
$groups = $attrRes['payload']['attribute_group_list'] ?? [];
$sel = [];
if(!empty($groups)) $sel[] = ['attribute_group_id' => $groups[0]['attribute_group_id'], 'attribute_id' => $groups[0]['attribute_list'][0]['attribute_id']];

$url = "/products/$pid/pricing";
$headers = getHeaders($url, $apiKey, $userId, $secretKey);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['attributes' => $sel, 'currency' => 'USD']));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$res = curl_exec($ch);
curl_close($ch);
$pricing = json_decode($res, true);

echo "Pricing Results:\n";
print_r($pricing['payload'] ?? $pricing);
