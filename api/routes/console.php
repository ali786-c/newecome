<?php

use App\Models\Setting;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Laravel Scheduler — UpgraderCX
|--------------------------------------------------------------------------
| Runs every minute via cron:
|   * * * * * cd /path/to/api && php artisan schedule:run >> /dev/null 2>&1
|--------------------------------------------------------------------------
*/

/* ── AI Blog Automation ── */
Schedule::command('blog:automation-cron')->dailyAt('09:00');

/* ── Random Product Auto-Post (Dynamic Frequency from DB settings) ── */
Schedule::call(function () {
    $configJson = Setting::getValue('automation_random_post');
    $config     = $configJson ? json_decode($configJson, true) : [];

    // Skip if disabled or paused
    if (!($config['enabled'] ?? false) || ($config['paused'] ?? false)) {
        return;
    }

    $frequency = $config['frequency'] ?? 'twice_daily';
    $slots     = $config['time_slots'] ?? ['10:00', '20:00'];
    $timezone  = $config['timezone'] ?? 'UTC';
    $now       = \Illuminate\Support\Carbon::now($timezone);

    $shouldFire = false;

    switch ($frequency) {
        case 'hourly':
            // Fire at the top of every hour
            if ($now->minute === 0) {
                $shouldFire = true;
            }
            break;

        case 'every_6h':
            // Fire at 0:00, 6:00, 12:00, 18:00
            if ($now->minute === 0 && in_array($now->hour, [0, 6, 12, 18])) {
                $shouldFire = true;
            }
            break;

        case 'once_daily':
        case 'twice_daily':
        case 'three_daily':
            // Match current time to configured slots (within 1-minute window)
            foreach ($slots as $slot) {
                [$slotH, $slotM] = explode(':', $slot);
                if ($now->hour === (int)$slotH && $now->minute === (int)$slotM) {
                    $shouldFire = true;
                    break;
                }
            }
            break;

        case 'weekly':
            // Fire on Mondays at the first configured time slot
            if ($now->dayOfWeek === 1 && !empty($slots)) {
                [$slotH, $slotM] = explode(':', $slots[0]);
                if ($now->hour === (int)$slotH && $now->minute === (int)$slotM) {
                    $shouldFire = true;
                }
            }
            break;

        default:
            // Fallback: twice daily at 10:00 and 20:00
            if (($now->hour === 10 || $now->hour === 20) && $now->minute === 0) {
                $shouldFire = true;
            }
    }

    if ($shouldFire) {
        \App\Jobs\PostRandomProductJob::dispatch();
        \Illuminate\Support\Facades\Log::channel('automation')->info(
            "Scheduler: Dispatched PostRandomProductJob. Frequency={$frequency}, Time=" . $now->format('H:i')
        );
    }
})->everyMinute()->name('random-product-post-dynamic')->withoutOverlapping();

/* ── Supplier Synchronization (Automated) ── */
Schedule::command('app:sync-supplier-products --mode=full')->everySixHours();
Schedule::command('app:sync-supplier-products --mode=incremental')->hourly();
Schedule::job(new \App\Jobs\SupplierBalanceCheckJob)->everyFiveMinutes();

/* ── Supplier Price Sync ── */
Schedule::command('supplier:sync-prices')->everySixHours();

/*
|--------------------------------------------------------------------------
| Artisan Commands (Manual triggers via CLI)
|--------------------------------------------------------------------------
*/

/* Manual: Fire a single random post immediately */
Artisan::command('product:random-post', function () {
    \App\Jobs\PostRandomProductJob::dispatch();
    $this->info('PostRandomProductJob dispatched successfully.');
    $this->info('Check storage/logs/automation.log for results.');
})->purpose('Manually dispatch a random product post to Discord/Telegram');

/* Manual: Test Discord post with a specific product */
Artisan::command('product:test-discord {product_id?}', function ($product_id = null) {
    $product = $product_id
        ? \App\Models\Product::find($product_id)
        : \App\Models\Product::where('status', 'active')->inRandomOrder()->first();

    if (!$product) {
        $this->error('No product found.');
        return;
    }

    $this->info("Testing Discord post for: {$product->name}");
    $result = app(\App\Services\DiscordService::class)->sendProductPost($product, 'manual');
    $this->info($result ? '✅ Discord: SUCCESS' : '❌ Discord: FAILED');
})->purpose('Test Discord product posting');

/* Manual: Test Telegram post with a specific product */
Artisan::command('product:test-telegram {product_id?}', function ($product_id = null) {
    $product = $product_id
        ? \App\Models\Product::find($product_id)
        : \App\Models\Product::where('status', 'active')->inRandomOrder()->first();

    if (!$product) {
        $this->error('No product found.');
        return;
    }

    $this->info("Testing Telegram post for: {$product->name}");
    $result = app(\App\Services\TelegramService::class)->sendProductPost($product, 'manual');
    $this->info($result ? '✅ Telegram: SUCCESS' : '❌ Telegram: FAILED');
})->purpose('Test Telegram product posting');

/* Manual: Retry fulfillment for a specific order */
Artisan::command('fulfill:retry {order_id}', function ($order_id) {
    $order = \App\Models\Order::find($order_id);
    if (!$order) {
        $this->error("Order #{$order_id} not found.");
        return;
    }
    $this->info("Retrying fulfillment for Order #{$order_id}...");
    $service = app(\App\Services\OrderFulfillmentService::class);
    $result  = $service->fulfill($order);
    $this->info("Result Status: {$result['status']}");
})->purpose('Retry fulfillment for a specific order');

/* Manual: Sync supplier prices */
Artisan::command('supplier:sync-prices', function () {
    $suppliers = \App\Models\SupplierConnection::where('is_active', true)->get();
    if ($suppliers->isEmpty()) {
        $this->warn('No active supplier connections found.');
        return;
    }
    foreach ($suppliers as $supplier) {
        \App\Jobs\SyncSupplierPricesJob::dispatch($supplier->id);
        $this->info("Dispatched sync job for supplier: {$supplier->name}");
    }
})->purpose('Sync prices for all active suppliers');

/* Manual: Show automation config */
Artisan::command('automation:status', function () {
    $configJson = Setting::getValue('automation_random_post');
    $config = $configJson ? json_decode($configJson, true) : [];
    $this->info('=== Random Post Automation Status ===');
    $this->info('Enabled:   ' . (($config['enabled'] ?? false) ? 'YES' : 'NO'));
    $this->info('Paused:    ' . (($config['paused'] ?? false) ? 'YES' : 'NO'));
    $this->info('Frequency: ' . ($config['frequency'] ?? 'twice_daily'));
    $this->info('Slots:     ' . implode(', ', $config['time_slots'] ?? ['10:00', '20:00']));
    $this->info('Discord:   ' . (($config['channels']['discord'] ?? true) ? 'ON' : 'OFF'));
    $this->info('Telegram:  ' . (($config['channels']['telegram'] ?? true) ? 'ON' : 'OFF'));
    $this->info('Last post: ' . (\App\Models\ChannelPost::where('trigger', 'random')->latest()->first()?->created_at ?? 'Never'));
})->purpose('Show automation configuration and status');

/* Manual: Test email integration */
Artisan::command('mail:test {email}', function ($email) {
    $this->info("Starting Email Test for: {$email}");
    $mailService = app(\App\Services\MailjetMailService::class);

    $user = \App\Models\User::where('email', $email)->first() ?? \App\Models\User::first();
    if ($user) {
        $this->info("Sending Test Welcome Email to {$email}...");
        $oldEmail    = $user->email;
        $user->email = $email;
        $res         = $mailService->sendWelcomeEmail($user);
        $this->comment($res ? '✅ Welcome Email SENT' : '❌ Welcome Email FAILED');
        $user->email = $oldEmail;
    }

    $order = \App\Models\Order::latest()->first();
    if ($order) {
        $this->info("Sending Test Order Confirmation...");
        if ($order->user) $order->user->email = $email;
        $res = $mailService->sendOrderConfirmation($order);
        $this->comment($res ? '✅ Order Confirmation SENT' : '❌ Order Confirmation FAILED');
    }

    $this->info('All test sequences completed.');
})->purpose('Test Mailjet email integration with a specific address');
