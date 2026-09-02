<?php

namespace App\Jobs;

use App\Models\ChannelPost;
use App\Models\Product;
use App\Models\Setting;
use App\Services\DiscordService;
use App\Services\TelegramService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PostRandomProductJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 60;

    /**
     * Execute the job.
     */
    public function handle(DiscordService $discordService, TelegramService $telegramService): void
    {
        // 1. Load config
        $configJson = Setting::getValue('automation_random_post');
        $config     = $configJson ? json_decode($configJson, true) : [];

        // 2. Check master enabled flag
        if (!($config['enabled'] ?? false)) {
            Log::channel('automation')->info('PostRandomProductJob: Random posting is DISABLED in settings. Skipping.');
            return;
        }

        // 3. Check pause flag
        if ($config['paused'] ?? false) {
            Log::channel('automation')->info('PostRandomProductJob: Automation is PAUSED. Skipping.');
            return;
        }

        // 4. Determine which channels to post to
        $channels    = $config['channels'] ?? ['discord' => true, 'telegram' => true];
        $postDiscord = $channels['discord'] ?? true;
        $postTelegram = $channels['telegram'] ?? true;

        if (!$postDiscord && !$postTelegram) {
            Log::channel('automation')->info('PostRandomProductJob: All channels disabled. Skipping.');
            return;
        }

        // 5. Build eligibility query
        $eligibility  = $config['eligibility'] ?? [];
        $cooldownDays = (int) ($eligibility['cooldown_days'] ?? 7);

        $query = Product::where('status', 'active')
                        ->where('random_post_eligible', true);

        // Require in stock
        if ($eligibility['require_in_stock'] ?? true) {
            $query->where('stock_status', 'in_stock');
        }

        // Require image
        if ($eligibility['require_image'] ?? false) {
            $query->whereNotNull('image_url')->where('image_url', '!=', '');
        }

        // Price range filters
        if (!empty($eligibility['min_price'])) {
            $query->where('price', '>=', (float) $eligibility['min_price']);
        }
        if (!empty($eligibility['max_price'])) {
            $query->where('price', '<=', (float) $eligibility['max_price']);
        }

        // Cooldown: exclude products posted recently
        if ($cooldownDays > 0) {
            $recentlyPostedIds = ChannelPost::where('created_at', '>=', now()->subDays($cooldownDays))
                ->whereNotNull('product_id')
                ->pluck('product_id')
                ->toArray();

            if (!empty($recentlyPostedIds)) {
                $query->whereNotIn('id', $recentlyPostedIds);
            }
        }

        // 6. Pick a random eligible product
        $product = $query->inRandomOrder()->first();

        if (!$product) {
            Log::channel('automation')->warning('PostRandomProductJob: No eligible products found. Cooldown may be blocking all products.');

            // Fallback: ignore cooldown and try again
            $fallback = Product::where('status', 'active')
                ->where('random_post_eligible', true);
            if ($eligibility['require_in_stock'] ?? true) {
                $fallback->where('stock_status', 'in_stock');
            }
            $product = $fallback->inRandomOrder()->first();

            if (!$product) {
                Log::channel('automation')->error('PostRandomProductJob: No eligible products found even after cooldown bypass. Aborting.');
                return;
            }

            Log::channel('automation')->info("PostRandomProductJob: Using fallback product (cooldown bypassed): '{$product->name}'");
        } else {
            Log::channel('automation')->info("PostRandomProductJob: Selected product '{$product->name}' (ID: {$product->id}).");
        }

        // 7. Post to channels and log results
        $discordSent  = false;
        $telegramSent = false;
        $errors       = [];

        if ($postDiscord) {
            try {
                $discordSent = $discordService->sendProductPost($product, 'random');
                Log::channel('automation')->info("PostRandomProductJob: Discord result for '{$product->name}': " . ($discordSent ? 'SUCCESS' : 'FAILED'));
            } catch (\Exception $e) {
                $errors[] = "Discord: {$e->getMessage()}";
                Log::channel('automation')->error("PostRandomProductJob: Discord exception: {$e->getMessage()}");
            }

            // Log discord post
            ChannelPost::create([
                'product_id' => $product->id,
                'channel'    => 'discord',
                'trigger'    => 'random',
                'message'    => "Random post: {$product->name}",
                'status'     => $discordSent ? 'sent' : 'failed',
                'error'      => $discordSent ? null : ($errors[count($errors) - 1] ?? 'Unknown error'),
            ]);
        }

        if ($postTelegram) {
            try {
                $telegramSent = $telegramService->sendProductPost($product, 'random');
                Log::channel('automation')->info("PostRandomProductJob: Telegram result for '{$product->name}': " . ($telegramSent ? 'SUCCESS' : 'FAILED'));
            } catch (\Exception $e) {
                $errors[] = "Telegram: {$e->getMessage()}";
                Log::channel('automation')->error("PostRandomProductJob: Telegram exception: {$e->getMessage()}");
            }

            // Log telegram post
            ChannelPost::create([
                'product_id' => $product->id,
                'channel'    => 'telegram',
                'trigger'    => 'random',
                'message'    => "Random post: {$product->name}",
                'status'     => $telegramSent ? 'sent' : 'failed',
                'error'      => $telegramSent ? null : (end($errors) ?: 'Unknown error'),
            ]);
        }

        Log::channel('automation')->info("PostRandomProductJob: Completed. Discord={$discordSent}, Telegram={$telegramSent}");
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::channel('automation')->error("PostRandomProductJob: Job FAILED with exception: {$exception->getMessage()}");
    }
}
