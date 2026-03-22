<?php

namespace App\Observers;

use App\Models\Product;
use App\Models\Setting;
use App\Services\DiscordService;
use Illuminate\Support\Facades\Log;

class ProductObserver
{
    protected $discordService;

    public function __construct(DiscordService $discordService)
    {
        $this->discordService = $discordService;
    }

    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        // Check if individual product discord is enabled
        if ($product->discord_enabled) {
            Log::channel('automation')->info("ProductObserver: Product '{$product->name}' created with Discord enabled. Sending notification.");
            $this->discordService->sendProductPost($product, 'new');
            return;
        }

        // Or check global setting if we want to auto-post ALL new products
        $globalEnabled = Setting::getValue('automation_new_product_post', '0') === '1';
        if ($globalEnabled && $product->status === 'active') {
            Log::channel('automation')->info("ProductObserver: Global 'new product' notification enabled. Sending notification for '{$product->name}'.");
            $this->discordService->sendProductPost($product, 'new');
        }
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        $globalUpdatesEnabled = Setting::getValue('automation_product_update_notification', '0') === '1';

        if (!$globalUpdatesEnabled) {
            return;
        }

        // Significant changes: Price or Stock Status
        $priceChanged = $product->isDirty('price');
        $stockChanged = $product->isDirty('stock_status');

        if ($priceChanged || $stockChanged) {
            Log::channel('automation')->info("ProductObserver: Significant update for '{$product->name}' (Price/Stock). Sending notification.");
            $this->discordService->sendProductPost($product, 'update');
        }
    }
}
