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

    // 1. Test Welcome Email
    $user = \App\Models\User::where('email', $email)->first() ?? \App\Models\User::first();
    if ($user) {
        $this->info("Sending Test Welcome Email... (to {$user->email})");
        $oldEmail = $user->email;
        $user->email = $email; // Force target email for test
        $res = $brevoMail->sendWelcomeEmail($user);
        $this->comment($res ? "Welcome Email SENT" : "Welcome Email FAILED");
        $user->email = $oldEmail;
    }

    // 2. Test Order Receipt & Confirmation
    $order = \App\Models\Order::latest()->first();
    if ($order) {
        $this->info("Sending Test Order Confirmation... (using Order #{$order->order_number})");
        if ($order->user) $order->user->email = $email;
        
        $res = $brevoMail->sendOrderConfirmation($order);
        $this->comment($res ? "Order Confirmation SENT" : "Order Confirmation FAILED");
        
        $this->info("Sending Test Order Delivered... (using Order #{$order->order_number})");
        $res = $brevoMail->sendOrderDelivered($order);
        $this->comment($res ? "Order Delivered SENT" : "Order Delivered FAILED");
    }

    // 3. Test Wallet Deposit
    $tx = \App\Models\WalletTransaction::where('type', 'top_up')->latest()->first();
    if ($tx) {
        $this->info("Sending Test Deposit Confirmation... (using Amount {$tx->amount})");
        if ($tx->user) $tx->user->email = $email;
        
        $res = $brevoMail->sendDepositConfirmation($tx);
        $this->comment($res ? "Deposit Confirmation SENT" : "Deposit Confirmation FAILED");
    }

    // 4. Test Ticket Notification
    $ticket = \App\Models\Ticket::latest()->first();
    if ($ticket) {
        $this->info("Sending Test Ticket Notification... (using Ticket #{$ticket->id})");
        if ($ticket->user) $ticket->user->email = $email;
        
        $res = $brevoMail->sendTicketUpdate($ticket);
        $this->comment($res ? "Ticket Notification SENT" : "Ticket Notification FAILED");
    }

    $this->info("All test sequences completed.");
})->purpose('Test Brevo email integration with a specific address');
