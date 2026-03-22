<?php

namespace App\Services;

use App\Models\BlogPost;
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
        
        $enabled = ($config['auto_post_enabled'] ?? false) == true;
        $webhookUrl = $config['webhook_url'] ?? null;

        if (!$enabled || !$webhookUrl) {
            Log::channel('automation')->info('Discord: Skipping post share (disabled or missing webhook URL).');
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
