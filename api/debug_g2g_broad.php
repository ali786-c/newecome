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

echo "Broad Discovery: /products?page_size=100\n";
$res = call("/products?page_size=100");
echo "Found " . count($res['payload']['product_list'] ?? []) . " products.\n";
if(!empty($res['payload']['product_list'])) {
    print_r(array_slice($res['payload']['product_list'], 0, 5));
} else {
    echo "Still empty. Trying with language=en\n";
    $res = call("/products?language=en&page_size=100");
    echo "Found " . count($res['payload']['product_list'] ?? []) . " products.\n";
}

echo "\nFull debug of /services response for service 'Items':\n";
$res = call("/products?service_id=0765978e-3fdf-48b4-bed3-184823aa439e&page_size=10");
echo "Found " . count($res['payload']['product_list'] ?? []) . " products in Items.\n";
