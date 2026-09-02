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

    echo "--- DEEP RELOADLY SUBSCRIPTION SCAN ---\n";
    
    // Expanded Keywords
    $keywords = [
        'month', 'year', 'day', 'week', 'subscription', 'membership', 'pass', 
        'gold', 'plus', 'ultimate', 'access', 'duration', 'period', 'premium',
        '30 d', '60 d', '90 d', '120 d', '180 d', '365 d', '1 m', '3 m', '6 m', '12 m', '1 y'
    ];
    
    $timeBasedProducts = [];
    $totalInspected = 0;

    // Fetch up to 20 pages of 100 products (2000 products total)
    for ($page = 1; $page <= 20; $page++) {
        $pResponse = Http::withoutVerifying()->withToken($token)->get("{$baseUrl}/products", ['page' => $page, 'size' => 100]);
        $content = $pResponse->json('content') ?? [];
        if (empty($content)) break;
        
        $totalInspected += count($content);
        
        foreach ($content as $p) {
            $name = $p['productName'];
            $brand = $p['brand']['brandName'] ?? 'N/A';
            $desc = $p['redeemInstruction']['verbose'] ?? '';
            $fullText = strtolower($name . " " . $brand . " " . $desc);
            
            $match = null;
            foreach ($keywords as $kw) {
                if (str_contains($fullText, $kw)) {
                    $match = $kw;
                    break;
                }
            }

            if ($match) {
                $timeBasedProducts[] = [
                    'name' => $name,
                    'brand' => $brand,
                    'id' => $p['productId'],
                    'match' => $match,
                    'denoms' => $p['fixedRecipientDenominations'] ?? [],
                    'type' => $p['denominationType']
                ];
            }
        }
    }

    echo "Inspected $totalInspected products.\n";
    echo "Found " . count($timeBasedProducts) . " possible time-based products.\n\n";

    // Sort by brand for better readability
    usort($timeBasedProducts, fn($a, $b) => strcmp($a['brand'], $b['brand']));

    $currentBrand = '';
    foreach ($timeBasedProducts as $tp) {
        if ($tp['brand'] !== $currentBrand) {
            $currentBrand = $tp['brand'];
            echo "\n--- $currentBrand ---\n";
        }
        $d = !empty($tp['denoms']) ? " (Denoms: " . implode(', ', $tp['denoms']) . ")" : "";
        echo "[ID: {$tp['id']}] {$tp['name']} - Keyword: '{$tp['match']}'$d\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
