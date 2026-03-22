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
        Log::channel('automation')->info("ProductObserver: Product '{$product->name}' created. Triggering Discord check.");
        $this->discordService->sendProductPost($product, 'new');
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
            Log::channel('automation')->info("ProductObserver: Significant update detected for '{$product->name}'. Triggering Discord check.");
            $this->discordService->sendProductPost($product, 'update');
        }
    }
}
