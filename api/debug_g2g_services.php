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
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

$services = callG2G('/services');
echo json_encode($services, JSON_PRETTY_PRINT);
