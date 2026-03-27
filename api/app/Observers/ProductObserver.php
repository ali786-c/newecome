<?php

namespace App\Observers;

use App\Models\Product;
use App\Models\Setting;
use App\Services\DiscordService;
use Illuminate\Support\Facades\Log;

class ProductObserver
{
    protected $discordService;
    protected $telegramService;

    public function __construct(DiscordService $discordService, \App\Services\TelegramService $telegramService)
    {
        $this->discordService = $discordService;
        $this->telegramService = $telegramService;
    }

    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        Log::channel('automation')->info("ProductObserver: Product '{$product->name}' created. Triggering Discord/Telegram check.");
        $this->discordService->sendProductPost($product, 'new');
        $this->telegramService->sendProductPost($product, 'new');
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        // Significant changes: Price or Stock Status
        $priceChanged = $product->wasChanged('price');
        $stockChanged = $product->wasChanged('stock_status');

        if ($priceChanged || $stockChanged) {
            Log::channel('automation')->info("ProductObserver: Significant update detected for '{$product->name}'. Triggering Discord/Telegram check.");
            $this->discordService->sendProductPost($product, 'update');
            $this->telegramService->sendProductPost($product, 'update');
        }
    }
}
