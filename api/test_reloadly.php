<?php

use App\Models\SupplierConnection;
use App\Services\Suppliers\ReloadlyService;
use App\Services\Suppliers\SupplierServiceFactory;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// 1. Create/Update Supplier Connection in DB
$conn = SupplierConnection::updateOrCreate(
    ['type' => 'reloadly'],
    [
        'name'      => 'Reloadly Sandbox',
        'endpoint'  => 'https://giftcards-sandbox.reloadly.com',
        'api_key'   => 'SANDBOX_KEY', // unused now since we use config
        'config'    => [
            'client_id'     => env('RELOADLY_CLIENT_ID'),
            'client_secret' => env('RELOADLY_CLIENT_SECRET'),
        ],
        'is_active' => true,
    ]
);

echo "Supplier Connection created/updated ID: {$conn->id}\n";

try {
    // 2. Resolve Service
    $factory = new SupplierServiceFactory();
    $service = $factory->make($conn);
    echo "Service Factory resolved: " . get_class($service) . "\n";

    // 3. Test Balance
    echo "Fetching Balance...\n";
    $balance = $service->getBalance();
    echo "Balance: {$balance}\n";

    // 4. Test Fetch Brands
    echo "\n--- FETCHING ALL BRANDS ---\n";
    $token = $service->getAccessToken();
    $response = Http::withoutVerifying()->withToken($token)
        ->get("https://giftcards-sandbox.reloadly.com/brands");
    $brands = $response->json() ?? [];
    echo "Found total " . count($brands) . " Brands.\n";
    echo "Top 20 Brands Sample:\n";
    $brandNames = array_map(fn($b) => $b['name'], array_slice($brands, 0, 20));
    echo implode(", ", $brandNames) . "...\n";

    // 5. Test Fetch Categories
    echo "\n--- FETCHING ALL CATEGORIES ---\n";
    $response = Http::withoutVerifying()->withToken($token)
        ->get("https://giftcards-sandbox.reloadly.com/categories");
    $categories = $response->json() ?? [];
    echo "Found total " . count($categories) . " Categories.\n";
    foreach ($categories as $cat) {
        echo " - " . ($cat['name'] ?? 'N/A') . " (ID: " . ($cat['id'] ?? 'N/A') . ")\n";
    }

    // 6. Detailed Product Summary
    echo "\n--- PRODUCT DIVERSITY ANALYSIS ---\n";
    $productsResponse = $service->fetchProducts(1, 500); // Fetch more
    $products = $productsResponse['content'] ?? $productsResponse;
    $countries = [];
    foreach ($products as $p) {
        $country = $p['country']['name'] ?? 'Unknown';
        $countries[$country] = ($countries[$country] ?? 0) + 1;
    }
    arsort($countries);
    echo "Top Countries in Sample (500 products):\n";
    foreach (array_slice($countries, 0, 10) as $c => $count) {
        echo " - $c: $count products\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
