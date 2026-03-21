<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('blog:automation-cron')->dailyAt('09:00');

Artisan::command('supplier:sync-prices', function () {
    $suppliers = \App\Models\SupplierConnection::where('is_active', true)->get();
    foreach ($suppliers as $supplier) {
        \App\Jobs\SyncSupplierPricesJob::dispatch($supplier->id);
        $this->info("Dispatched sync job for supplier: {$supplier->name}");
    }
})->purpose('Sync prices for all active suppliers');

Artisan::command('fulfill:retry {order_id}', function ($order_id) {
    echo "Retrying fulfillment for Order #{$order_id}...\n";
    $service = app(\App\Services\OrderFulfillmentService::class);
    $order = \App\Models\Order::find($order_id);
    if (!$order) {
        echo "Order not found.\n";
        return;
    }
    $result = $service->fulfill($order);
    echo "Result Status: {$result['status']}\n";
})->purpose('Retry fulfillment for a specific order');
