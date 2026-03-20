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
    $service = SupplierServiceFactory::make($conn);
    echo "Service Factory resolved: " . get_class($service) . "\n";

    // 3. Test Balance
    echo "Fetching Balance...\n";
    $balance = $service->getBalance();
    echo "Balance: {$balance}\n";

    // 4. Test Fetch Products
    echo "Fetching Products (Sample)...\n";
    $productsResponse = $service->fetchProducts();
    
    // Check if it's a paginated response with 'content' key
    $products = $productsResponse['content'] ?? $productsResponse;
    echo "Fetched " . count($products) . " products.\n";

    if (count($products) > 0 && isset($products[0])) {
        echo "Example Product: " . ($products[0]['productName'] ?? $products[0]['name'] ?? 'N/A') . "\n";
    } else {
        echo "Response Structure: " . json_encode($productsResponse, JSON_PRETTY_PRINT) . "\n";
        
        $token = $service->getAccessToken();
        echo "Trying to fetch Brands instead...\n";
        $response = Http::withoutVerifying()->withToken($token)
            ->get("{$conn->endpoint}/brands");
        $brands = $response->json() ?? [];
        echo "Fetched " . count($brands) . " brands.\n";

        echo "Trying to fetch Categories...\n";
        $response = Http::withoutVerifying()->withToken($token)
            ->get("{$conn->endpoint}/categories");
        $categories = $response->json() ?? [];
        echo "Fetched " . count($categories) . " categories.\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
