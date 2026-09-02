<?php

$clientId = 'pjS2YPiolL1Z8vZudtlP3dWG868KYgjn';
$clientSecret = 'MZrAKssoU7-3iVbkFzcxkJQ97vH3b1-TWfAsxyi1qu6ZuKTNg2MZ4xJwdycZPlO';
$authUrl = 'https://auth.reloadly.com/oauth/token';
$apiUrl = 'https://giftcards-sandbox.reloadly.com';

echo "1. Authenticating...\n";

$ch = curl_init($authUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'client_id' => $clientId,
    'client_secret' => $clientSecret,
    'grant_type' => 'client_credentials',
    'audience' => 'https://giftcards-sandbox.reloadly.com'
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$tokenData = json_decode($response, true);
$token = $tokenData['access_token'] ?? null;

if (!$token) {
    echo "Auth failed: " . $response . "\n";
    exit(1);
}

echo "Auth Success! Token acquired.\n";

$productsToCheck = [
    'Netflix',
    'World of Warcraft',
    'Target',
    'Amazon',
    'Google Play'
];

echo "2. Fetching Products...\n";

$ch = curl_init("$apiUrl/products?size=200");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/com.reloadly.giftcards-v1+json"
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$data = json_decode($response, true);
$products = $data['content'] ?? [];

echo "Found " . count($products) . " products in first page.\n\n";

echo str_pad("Product Name", 40) . " | " . str_pad("Type", 10) . " | " . str_pad("Pricing", 40) . "\n";
echo str_repeat("-", 95) . "\n";

foreach ($products as $p) {
    $match = false;
    foreach ($productsToCheck as $check) {
        if (stripos($p['productName'], $check) !== false) {
            $match = true;
            break;
        }
    }

    if ($match) {
        $type = $p['denominationType'] ?? 'N/A';
        $pricing = '';
        if ($type === 'FIXED') {
            $pricing = "Fixed: [" . implode(", ", array_slice($p['fixedRecipientDenominations'], 0, 5)) . (count($p['fixedRecipientDenominations']) > 5 ? "..." : "") . "] " . $p['recipientCurrencyCode'];
        } else {
            $pricing = "Range: " . $p['minRecipientDenomination'] . " - " . $p['maxRecipientDenomination'] . " " . $p['recipientCurrencyCode'];
        }
        
        echo str_pad($p['productName'], 40) . " | " . str_pad($type, 10) . " | " . $pricing . "\n";
    }
}
