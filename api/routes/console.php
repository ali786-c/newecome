<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('blog:automation-cron')->daily();

Artisan::command('supplier:sync-prices', function () {
    $suppliers = \App\Models\SupplierConnection::where('is_active', true)->get();
    foreach ($suppliers as $supplier) {
        \App\Jobs\SyncSupplierPricesJob::dispatch($supplier->id);
        $this->info("Dispatched sync job for supplier: {$supplier->name}");
    }
})->purpose('Sync prices for all active suppliers');

Artisan::command('fulfill:retry {order_id}', function ($orderId) {
    echo "Retrying fulfillment for Order #{$orderId}...\n";
    $service = app(\App\Services\OrderFulfillmentService::class);
    $order = \App\Models\Order::find($orderId);
    if (!$order) {
        echo "Order not found.\n";
        return;
    }
    $result = $service->fulfill($order);
    echo "Result Status: {$result['status']}\n";
})->purpose('Retry fulfillment for a specific order');
