<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$clientId = 'pjS2YPiolL1Z8vZudtlP3dWG868KYgjn';
$clientSecret = 'MZrAKssoU7-3iVbkFzcxkJQ97vH3b1-TWfAsxyi1qu6ZuKTNg2MZ4xJwdycZPlO';
$baseUrl = 'https://giftcards-sandbox.reloadly.com';
$authUrl = 'https://auth.reloadly.com/oauth/token';

try {
    $authResponse = Http::withoutVerifying()->post($authUrl, [
        'client_id'     => $clientId,
        'client_secret' => $clientSecret,
        'grant_type'    => 'client_credentials',
        'audience'      => 'https://giftcards-sandbox.reloadly.com',
    ]);
    $token = $authResponse->json('access_token');

    echo "--- RELOADLY SUBSCRIPTION PATTERN ANALYSIS ---\n";
    
    $targetBrands = ['Netflix', 'Spotify', 'Apple', 'Google Play', 'PlayStation', 'Xbox', 'Amazon', 'Steam', 'Hulu', 'Disney', 'Minecraft', 'Roblox', 'Nintendo'];
    $brandsFound = [];
    $totalInspected = 0;

    for ($page = 1; $page <= 6; $page++) {
        $pResponse = Http::withoutVerifying()->withToken($token)->get("{$baseUrl}/products", ['page' => $page, 'size' => 100]);
        $content = $pResponse->json('content') ?? [];
        $totalInspected += count($content);
        
        foreach ($content as $p) {
            $brandName = $p['brand']['brandName'] ?? 'N/A';
            $pName = $p['productName'];
            $pId = $p['productId'];
            
            // Check if it's one of our target brands
            $isTarget = false;
            foreach ($targetBrands as $tb) {
                if (stripos($brandName, $tb) !== false || stripos($pName, $tb) !== false) {
                    $isTarget = true;
                    break;
                }
            }

            if ($isTarget) {
                $brandsFound[$brandName][] = [
                    'name' => $pName,
                    'id' => $pId,
                    'type' => $p['denominationType'], // RANGE or FIXED
                    'denoms' => $p['fixedRecipientDenominations'] ?? [],
                    'min' => $p['minRecipientDenomination'] ?? null,
                    'max' => $p['maxRecipientDenomination'] ?? null,
                    'currency' => $p['recipientCurrencyCode']
                ];
            }
            
            // Also catch anything with "Month" or "Year" or "Day" in name
            if (stripos($pName, 'month') !== false || stripos($pName, 'year') !== false || stripos($pName, 'day') !== false) {
                if (!isset($brandsFound[$brandName])) {
                     $brandsFound[$brandName] = [];
                }
                // Check if already added
                $exists = false;
                foreach ($brandsFound[$brandName] as $item) {
                    if ($item['id'] == $pId) { $exists = true; break; }
                }
                if (!$exists) {
                    $brandsFound[$brandName][] = [
                        'name' => $pName,
                        'id' => $pId,
                        'type' => $p['denominationType'],
                        'denoms' => $p['fixedRecipientDenominations'] ?? [],
                        'min' => $p['minRecipientDenomination'] ?? null,
                        'max' => $p['maxRecipientDenomination'] ?? null,
                        'currency' => $p['recipientCurrencyCode']
                    ];
                }
            }
        }
    }

    echo "Inspected $totalInspected products.\n";
    echo "Summary of Subscription/Time-based Brands:\n";

    foreach ($brandsFound as $brand => $products) {
        echo "\n[$brand]\n";
        foreach ($products as $p) {
            $info = $p['type'] === 'FIXED' 
                ? "FIXED: " . implode(', ', $p['denoms']) 
                : "RANGE: " . $p['min'] . " - " . $p['max'];
            echo " - " . $p['name'] . " (ID: " . $p['id'] . ") | $info " . $p['currency'] . "\n";
        }
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
