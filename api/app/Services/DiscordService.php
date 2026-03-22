<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Models\Product;
use App\Models\DiscordConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DiscordService
{
    /**
     * Send a blog post to the configured Discord webhook.
     *
     * @param BlogPost $post
     * @return bool
     */
    public function sendBlogPost(BlogPost $post)
    {
        $configModel = DiscordConfig::first();
        $config = $configModel?->config ?? [];
        
        // Hardcoded to true for permanent automation
        $enabled = true;
        $webhookUrl = $config['webhook_url'] ?? null;

        if (!$webhookUrl) {
            Log::channel('automation')->info('Discord: Skipping blog post share (missing webhook URL).');
            return false;
        }

        try {
            $websiteUrl = config('app.url');
            
            // If APP_URL points to /api, we need the parent directory for frontend links
            if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
                $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
            }

            $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;
            $imageUrl = $post->image_url;

            // Ensure full URL for image
            if ($imageUrl && !str_starts_with($imageUrl, 'http')) {
                $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
            }

            $payload = [
                'username' => 'UpgraderCX Bot',
                'embeds' => [
                    [
                        'title' => "🚀 New Article: " . strip_tags($post->title),
                        'description' => strip_tags($post->excerpt ?? ''),
                        'url' => $postUrl,
                        'color' => 5814783, // Elegant Purple (#58B9FF is 5814783 in dec)
                        'image' => [
                            'url' => $imageUrl
                        ],
                        'footer' => [
                            'text' => 'Read more on UpgraderCX',
                            'icon_url' => rtrim($websiteUrl, '/') . '/favicon.ico'
                        ],
                        'timestamp' => now()->toISOString()
                    ]
                ]
            ];

            $response = Http::withoutVerifying()
                ->timeout(10)
                ->post($webhookUrl, $payload);

            if ($response->successful()) {
                Log::channel('automation')->info("Discord: Post successfully shared: {$post->title}");
                return true;
            }

            Log::channel('automation')->error("Discord Webhook Error: " . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::channel('automation')->error("Discord Service Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a product to the configured Discord webhook.
     *
     * @param Product $product
     * @param string $trigger (new, update, random, manual)
     * @return bool
     */
    public function sendProductPost(Product $product, string $trigger = 'new')
    {
        $configModel = DiscordConfig::first();
        $config = $configModel?->config ?? [];
        
        $webhookUrl = $config['webhook_url'] ?? null;

        if (!$webhookUrl) {
            Log::channel('automation')->info('Discord Product: Missing webhook URL.');
            return false;
        }

        // Check for specific automation toggle based on trigger
        $autoToggles = [
            'new'    => 'product_new_auto_post',
            'update' => 'product_update_auto_post',
            'random' => 'product_random_auto_post',
        ];

        if (isset($autoToggles[$trigger])) {
        // Hardcoded to true for permanent automation
        $isEnabled = true;
        if (!$isEnabled) {
            Log::channel('automation')->info("Discord Product: Skipping {$trigger} post (disabled in config).");
            return false;
        }
        }

        try {
            $websiteUrl = config('app.url');
            if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
                $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
            }

            $productUrl = rtrim($websiteUrl, '/') . '/products/' . $product->slug;
            $imageUrl = $product->image_url;

            if ($imageUrl && !str_starts_with($imageUrl, 'http')) {
                $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
            }

            $headlines = [
                'new'    => "🚀 **New Arrival!**",
                'update' => "🔄 **Product Updated!**",
                'random' => "🎲 **Today's Featured Deal!**",
                'manual' => "📢 **Featured Product!**",
            ];

            $headline = $headlines[$trigger] ?? "🛒 **Featured Product!**";

            $payload = [
                'username' => 'UpgraderCX Bot',
                'embeds' => [
                    [
                        'title' => $headline . " " . $product->name,
                        'description' => strip_tags($product->short_description ?? $product->description ?? ''),
                        'url' => $productUrl,
                        'color' => 5814783,
                        'fields' => [
                            [
                                'name' => 'Price',
                                'value' => '**$' . number_format($product->price, 2) . '**' . ($product->compare_price ? ' ~~$' . number_format($product->compare_price, 2) . '~~' : ''),
                                'inline' => true
                            ],
                            [
                                'name' => 'Availability',
                                'value' => $product->stock_status === 'in_stock' ? '✅ In Stock' : ($product->stock_status === 'limited' ? '⚠️ Limited Stock' : '❌ Out of Stock'),
                                'inline' => true
                            ],
                            [
                                'name' => 'Category',
                                'value' => $product->category?->name ?? 'Digital Service',
                                'inline' => true
                            ]
                        ],
                        'image' => [
                            'url' => $imageUrl
                        ],
                        'footer' => [
                            'text' => 'Shop now on UpgraderCX',
                            'icon_url' => rtrim($websiteUrl, '/') . '/favicon.ico'
                        ],
                        'timestamp' => now()->toISOString()
                    ]
                ]
            ];

            $response = Http::withoutVerifying()->timeout(10)->post($webhookUrl, $payload);

            if ($response->successful()) {
                Log::channel('automation')->info("Discord Product: Shared successfully: {$product->name} (Trigger: {$trigger})");
                return true;
            }

            Log::channel('automation')->error("Discord Product Webhook Error: " . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::channel('automation')->error("Discord Product Service Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a simple test message to verify connectivity.
     */
    public function sendTestMessage($message = "Hello from your UpgraderCX AI Blogging Engine! 🚀")
    {
        $configModel = DiscordConfig::first();
        $webhookUrl = $configModel?->config['webhook_url'] ?? null;

        if (!$webhookUrl) {
            return [
                'ok' => false,
                'description' => "Missing Webhook URL configuration."
            ];
        }

        try {
            $payload = [
                'content' => $message,
                'username' => 'UpgraderCX Tester'
            ];

            $response = Http::withoutVerifying()->timeout(10)->post($webhookUrl, $payload);

            if ($response->successful()) {
                return ['ok' => true, 'description' => 'Test message sent successfully!'];
            }

            return [
                'ok' => false,
                'description' => 'Discord Error: ' . $response->body()
            ];
        } catch (\Exception $e) {
            return [
                'ok' => false,
                'description' => 'Connection Error: ' . $e->getMessage()
            ];
        }
    }
}
