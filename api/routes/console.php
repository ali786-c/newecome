<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('blog:automation-cron')->dailyAt('09:00');
Schedule::command('product:random-post')->dailyAt('10:00');
Schedule::command('product:random-post')->dailyAt('20:00');

// Supplier Synchronization (Automated)
Schedule::command('app:sync-supplier-products --mode=full')->everySixHours();
Schedule::command('app:sync-supplier-products --mode=incremental')->hourly();
Schedule::job(new \App\Jobs\SupplierBalanceCheckJob)->everyFiveMinutes();

Artisan::command('product:random-post', function () {
    \App\Jobs\PostRandomProductJob::dispatch(app(\App\Services\DiscordService::class));
    $this->info("Handled random product post job.");
})->purpose('Post a random eligible product to Discord');

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

Artisan::command('mail:test {email}', function ($email) {
    $this->info("Starting Brevo Email Test for: $email");
    $brevoMail = app(\App\Services\BrevoMailService::class);

    // 1. Test Order Receipt
    $order = \App\Models\Order::latest()->first();
    if ($order) {
        $this->info("Sending Test Order Receipt... (using Order #{$order->order_number})");
        // Temporarily override email for test
        $oldEmail = $order->user->email ?? null;
        if ($order->user) $order->user->email = $email; 
        
        $res = $brevoMail->sendOrderReceipt($order);
        $this->comment($res ? "Order Receipt SENT" : "Order Receipt FAILED");
    }

    // 2. Test Ticket Notification
    $ticket = \App\Models\Ticket::latest()->first();
    if ($ticket) {
        $this->info("Sending Test Ticket Notification... (using Ticket #{$ticket->id})");
        if ($ticket->user) $ticket->user->email = $email;
        
        $res = $brevoMail->sendTicketUpdate($ticket);
        $this->comment($res ? "Ticket Notification SENT" : "Ticket Notification FAILED");
    }

    $this->info("Test sequence completed.");
})->purpose('Test Brevo email integration with a specific address');
