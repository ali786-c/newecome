<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\Setting;
use App\Services\DiscordService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PostRandomProductJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(DiscordService $discordService): void
    {
        $configJson = Setting::getValue('automation_random_post');
        $config = $configJson ? json_decode($configJson, true) : [];

        if (!($config['enabled'] ?? false)) {
            Log::channel('automation')->info('PostRandomProductJob: Random posting is disabled in settings.');
            return;
        }

        $eligibility = $config['eligibility'] ?? [];
        
        $query = Product::where('status', 'active')
            ->where('random_post_eligible', true);

        if ($eligibility['require_in_stock'] ?? true) {
            $query->where('stock_status', 'in_stock');
        }

        if ($eligibility['require_image'] ?? false) {
            $query->whereNotNull('image_url')->where('image_url', '!=', '');
        }

        $product = $query->inRandomOrder()->first();

        if (!$product) {
            Log::channel('automation')->warning('PostRandomProductJob: No eligible products found for random posting.');
            return;
        }

        Log::channel('automation')->info("PostRandomProductJob: Selected random product '{$product->name}'. Sending to Discord.");
        
        $discordService->sendProductPost($product, 'random');
    }
}
