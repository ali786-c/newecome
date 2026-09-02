<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\Suppliers\ReloadlyService;
use App\Models\SupplierConnection;

// Create a dummy connection object to avoid DB/Encryption issues
$supplier = new SupplierConnection();
$supplier->id = 999; // Dummy ID
$supplier->name = "Reloadly Debug";
$supplier->endpoint = env('RELOADLY_API_URL', 'https://giftcards-sandbox.reloadly.com');
$supplier->config = [
    'client_id' => env('RELOADLY_CLIENT_ID'),
    'client_secret' => env('RELOADLY_CLIENT_SECRET'),
];

$service = new ReloadlyService();
$service->setConnection($supplier);

$productIds = [
    18744, // Tinder Plus & Gold GB (Subscription)
    13628, // Xbox Game Pass 3 Month US (Monthly)
    15843, // World of Warcraft 60 days (Days)
    15363, // Netflix Spain (Range/Value)
];

echo "--- FETCHING RAW PRODUCT DATA FOR ANALYSIS (ENV MODE) ---\n\n";

try {
    $response = $service->fetchProducts(1, 2000);
    $all = $response['content'] ?? [];
    
    foreach ($productIds as $id) {
        $found = false;
        foreach ($all as $p) {
            if ($p['productId'] == $id) {
                echo "ID: $id\n";
                echo "NAME: " . $p['productName'] . "\n";
                echo "TYPE: " . $p['denominationType'] . "\n";
                echo "DENOMS: " . json_encode($p['fixedRecipientDenominations'] ?? []) . "\n";
                echo "MIN/MAX: " . ($p['minRecipientDenomination'] ?? 'N/A') . " / " . ($p['maxRecipientDenomination'] ?? 'N/A') . "\n";
                echo "FULL JSON CLIP:\n" . json_encode($p, JSON_PRETTY_PRINT) . "\n";
                echo "-------------------------------------------\n";
                $found = true;
                break;
            }
        }
        if (!$found) echo "ID: $id NOT FOUND IN THIS SCAN\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
