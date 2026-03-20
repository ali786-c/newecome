<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('blog:automation-cron')->daily();

Artisan::command('supplier:sync-prices', function () {
    $suppliers = \App\Models\SupplierConnection::where('is_active', true)->get();
    foreach ($suppliers as $supplier) {
        \App\Jobs\SyncSupplierPricesJob::dispatch($supplier->id);
        $this->info("Dispatched sync job for supplier: {$supplier->name}");
    }
})->purpose('Bulk sync prices from all active suppliers');

Schedule::command('supplier:sync-prices')->everySixHours();
