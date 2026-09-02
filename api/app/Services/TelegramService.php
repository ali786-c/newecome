<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Models\Setting;
use App\Models\AutomationChannel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TelegramService
{
    /**
     * Send a blog post to the configured Telegram channel.
     *
     * @param BlogPost $post
     * @return bool
     */
    public function sendBlogPost(BlogPost $post)
    {
        $enabled = Setting::getValue('telegram_auto_post_enabled', '0') === '1';

        $channels = AutomationChannel::where('platform', 'telegram')->where('is_active', true)->get();

        if ($channels->isEmpty()) {
            $token = Setting::getValue('telegram_bot_token');
            $channelId = Setting::getValue('telegram_channel_id');
            if (!$enabled || !$token || !$channelId) {
                Log::channel('automation')->info('Telegram: Skipping post share (disabled or missing config).');
                return false;
            }
            $channels = collect([(object)['name' => 'Legacy Telegram', 'target' => $channelId, 'token' => $token]]);
        }

        try {
            $websiteUrl = config('app.url');
            if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
                $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
            }

            if (!$websiteUrl || str_contains($websiteUrl, 'localhost')) {
                Log::channel('automation')->warning('Telegram Warning: APP_URL is not set correctly or is localhost. Using fallback logic.');
            }

            $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;

            $cleanTitle = strip_tags($post->title);
            $cleanExcerpt = strip_tags($post->excerpt ?? '');
            
            $caption = "<b>" . htmlspecialchars($cleanTitle) . "</b>\n\n";
            $caption .= htmlspecialchars($cleanExcerpt) . "\n\n";
            $caption .= "🔗 <a href='{$postUrl}'>Read Full Article</a>";

            if (strlen($caption) > 1000) {
                $caption = Str::limit($caption, 950) . "\n\n🔗 <a href='{$postUrl}'>Read Full Article</a>";
            }

            $filename = $post->image_url ? basename($post->image_url) : null;
            $localPath = $filename ? public_path('blog_images/' . $filename) : null;
            $photoUrl = $post->image_url;
            if ($photoUrl && !str_starts_with($photoUrl, 'http')) {
                $photoUrl = rtrim($websiteUrl, '/') . '/' . ltrim($photoUrl, '/');
            }

            $allSuccess = true;

            foreach ($channels as $channel) {
                $botToken = $channel->token ?? Setting::getValue('telegram_bot_token');
                $chatId = $channel->target;

                if (!$botToken || !$chatId) {
                    continue; // Skip invalid channels
                }

                $sent = false;

                if ($filename) {
                    if (file_exists($localPath)) {
                        $response = Http::withoutVerifying()
                            ->timeout(30)
                            ->attach('photo', file_get_contents($localPath), $filename)
                            ->post("https://api.telegram.org/bot{$botToken}/sendPhoto", [
                                'chat_id' => $chatId,
                                'caption' => $caption,
                                'parse_mode' => 'HTML',
                            ]);
                    } else {
                        $response = Http::withoutVerifying()->timeout(30)->post("https://api.telegram.org/bot{$botToken}/sendPhoto", [
                            'chat_id' => $chatId,
                            'photo'   => $photoUrl,
                            'caption' => $caption,
                            'parse_mode' => 'HTML',
                        ]);
                    }

                    if ($response->successful()) {
                        Log::channel('automation')->info("Telegram: Blog post successfully shared with image to {$channel->name}: {$post->title}");
                        $sent = true;
                    } else {
                        Log::channel('automation')->warning("Telegram: sendPhoto failed for {$channel->name}. Status: " . $response->status() . " Body: " . $response->body());
                    }
                }

                if (!$sent) {
                    $response = Http::withoutVerifying()->timeout(20)->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                        'chat_id' => $chatId,
                        'text'    => $caption,
                        'parse_mode' => 'HTML',
                    ]);

                    if ($response->successful()) {
                        Log::channel('automation')->info("Telegram: Blog post successfully shared via sendMessage to {$channel->name}: {$post->title}");
                    } else {
                        Log::channel('automation')->error("Telegram API Error (Final) for {$channel->name}. Status: " . $response->status() . " Body: " . $response->body());
                        $allSuccess = false;
                    }
                }
            }

            return $allSuccess;

        } catch (\Exception $e) {
            Log::channel('automation')->error("Telegram Service Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a product to the configured Telegram channel.
     *
     * @param Product $product
     * @param string $trigger (new, update, random, manual)
     * @return bool
     */
    public function sendProductPost(\App\Models\Product $product, string $trigger = 'new')
    {
        $enabled = Setting::getValue('telegram_auto_post_enabled', '0') === '1';
        
        $channels = AutomationChannel::where('platform', 'telegram')->where('is_active', true)->get();

        if ($channels->isEmpty()) {
            $token = Setting::getValue('telegram_bot_token');
            $channelId = Setting::getValue('telegram_channel_id');
            if (!$enabled || !$token || !$channelId) {
                Log::channel('automation')->info('Telegram Product: Skipping post share (disabled or missing config).');
                return false;
            }
            $channels = collect([(object)['name' => 'Legacy Telegram', 'target' => $channelId, 'token' => $token]]);
        }

        try {
            $websiteUrl = config('app.url');
            if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
                $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
            }

            $productUrl = rtrim($websiteUrl, '/') . '/products/' . $product->slug;
            
            $headlines = [
                'new'    => "🚀 <b>New Arrival!</b>",
                'update' => "🔄 <b>Product Updated!</b>",
                'random' => "🎲 <b>Today's Featured Deal!</b>",
                'manual' => "📢 <b>Featured Product!</b>",
            ];

            $headline = $headlines[$trigger] ?? "🛒 <b>Featured Product!</b>";

            $caption = "{$headline} " . htmlspecialchars($product->name) . "\n\n";
            $caption .= htmlspecialchars(strip_tags($product->short_description ?? $product->description ?? '')) . "\n\n";
            
            $caption .= "<b>Price:</b> €" . number_format($product->price, 2);
            if ($product->compare_price) {
                $caption .= " <strike>€" . number_format($product->compare_price, 2) . "</strike>";
            }
            $caption .= "\n";
            
            $statusStr = $product->stock_status === 'in_stock' ? '✅ In Stock' : ($product->stock_status === 'limited' ? '⚠️ Limited Stock' : '❌ Out of Stock');
            $caption .= "<b>Availability:</b> {$statusStr}\n";
            $caption .= "<b>Category:</b> " . htmlspecialchars($product->category?->name ?? 'Digital Service') . "\n\n";
            
            $caption .= "🔗 <a href='{$productUrl}'>View Product Details</a>";

            $imageUrl = null;
            if ($product->image_url) {
                $imageUrl = $product->image_url;
                if (!str_starts_with($imageUrl, 'http')) {
                    $imageUrl = rtrim($websiteUrl, '/') . '/' . ltrim($imageUrl, '/');
                }
            }

            $allSuccess = true;

            foreach ($channels as $channel) {
                $botToken = $channel->token ?? Setting::getValue('telegram_bot_token');
                $chatId = $channel->target;

                if (!$botToken || !$chatId) {
                    continue; // Skip invalid channels
                }

                $sent = false;

                // Attempt to send with photo if image exists
                if ($imageUrl) {
                    $response = Http::withoutVerifying()->timeout(20)->post("https://api.telegram.org/bot{$botToken}/sendPhoto", [
                        'chat_id' => $chatId,
                        'photo'   => $imageUrl,
                        'caption' => $caption,
                        'parse_mode' => 'HTML',
                    ]);

                    if ($response->successful()) {
                        Log::channel('automation')->info("Telegram Product: Shared successfully with photo to {$channel->name}");
                        $sent = true;
                    } else {
                        Log::channel('automation')->warning("Telegram Product: sendPhoto failed for {$channel->name}. Status: " . $response->status());
                    }
                }

                // Fallback to text message if photo failed or no image
                if (!$sent) {
                    $response = Http::withoutVerifying()->timeout(20)->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                        'chat_id' => $chatId,
                        'text'    => $caption,
                        'parse_mode' => 'HTML',
                    ]);

                    if ($response->successful()) {
                        Log::channel('automation')->info("Telegram Product: Shared successfully via text to {$channel->name}");
                    } else {
                        Log::channel('automation')->error("Telegram Product API Error ({$channel->name}): " . $response->body());
                        $allSuccess = false;
                    }
                }
            }

            return $allSuccess;

        } catch (\Exception $e) {
            Log::channel('automation')->error("Telegram Product Service Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Simple test method to verify connectivity.
     */
    public function sendTestMessage($message = "Hello from your AI Blog System! 🚀")
    {
        $token = Setting::getValue('telegram_bot_token');
        $channelId = Setting::getValue('telegram_channel_id');

        if (!$token || !$channelId) {
            return [
                'ok' => false,
                'description' => "Missing configuration (Token or Channel ID)."
            ];
        }

        try {
            $response = Http::withoutVerifying()->timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $channelId,
                'text'    => $message,
                'parse_mode' => 'HTML',
            ]);

            if (!$response->successful()) {
                Log::channel('automation')->error("Telegram Test Failed. Response: " . $response->body());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::channel('automation')->error("Telegram Test Exception: " . $e->getMessage());
            return [
                'ok' => false,
                'description' => "Connection Error: " . $e->getMessage()
            ];
        }
    }
}
