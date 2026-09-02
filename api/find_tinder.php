<?php

require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\Suppliers\ReloadlyService;
use App\Models\SupplierConnection;

$s = new SupplierConnection(['endpoint' => 'https://giftcards-sandbox.reloadly.com', 'config' => ['client_id' => env('RELOADLY_CLIENT_ID'), 'client_secret' => env('RELOADLY_CLIENT_SECRET')]]);
$svc = new ReloadlyService();
$svc->setConnection($s);

$res = $svc->fetchProducts(1, 2000);
foreach ($res['content'] as $p) {
    if (stripos($p['productName'], 'tinder') !== false) {
        print_r($p);
        break;
    }
}
