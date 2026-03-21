<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Models\Setting;
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
        $token = Setting::getValue('telegram_bot_token');
        $channelId = Setting::getValue('telegram_channel_id');

        if (!$enabled || !$token || !$channelId) {
            Log::channel('automation')->info('Telegram: Skipping post share (disabled or missing config).');
            return false;
        }

        try {
            $websiteUrl = config('app.url');
            
            // If APP_URL points to /api, we need the parent directory for frontend links
            if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
                $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
            }

            if (!$websiteUrl || str_contains($websiteUrl, 'localhost')) {
                Log::channel('automation')->warning('Telegram Warning: APP_URL is not set correctly or is localhost. Using fallback logic.');
            }

            $postUrl = rtrim($websiteUrl, '/') . '/blog/' . $post->slug;

            // Simple formatting for Telegram - Strip all tags first to be safe
            $cleanTitle = strip_tags($post->title);
            $cleanExcerpt = strip_tags($post->excerpt ?? '');
            
            $caption = "<b>" . htmlspecialchars($cleanTitle) . "</b>\n\n";
            $caption .= htmlspecialchars($cleanExcerpt) . "\n\n";
            $caption .= "🔗 <a href='{$postUrl}'>Read Full Article</a>";

            // Telegram sendPhoto caption limit is 1024 characters.
            if (strlen($caption) > 1000) {
                $caption = Str::limit($caption, 950) . "\n\n🔗 <a href='{$postUrl}'>Read Full Article</a>";
            }

            // If we have an image, use sendPhoto. Otherwise sendSendMessage.
            if ($post->image_url) {
                $filename = basename($post->image_url);
                $localPath = public_path('blog_images/' . $filename);
                
                Log::channel('automation')->info("Telegram: Attempting photo send for post {$post->id}", [
                    'image_url' => $post->image_url,
                    'local_path' => $localPath,
                    'exists' => file_exists($localPath)
                ]);

                if (file_exists($localPath)) {
                    // Method 1: Direct File Upload (Most reliable)
                    $response = Http::withoutVerifying()
                        ->timeout(30)
                        ->attach('photo', file_get_contents($localPath), $filename)
                        ->post("https://api.telegram.org/bot{$token}/sendPhoto", [
                            'chat_id' => $channelId,
                            'caption' => $caption,
                            'parse_mode' => 'HTML',
                        ]);
                } else {
                    // Method 2: Fallback to URL (if local file missing)
                    $photoUrl = $post->image_url;
                    if (!str_starts_with($photoUrl, 'http')) {
                        $photoUrl = rtrim($websiteUrl, '/') . '/' . ltrim($photoUrl, '/');
                    }
                    
                    $response = Http::withoutVerifying()
                        ->timeout(30)
                        ->post("https://api.telegram.org/bot{$token}/sendPhoto", [
                            'chat_id' => $channelId,
                            'photo'   => $photoUrl,
                            'caption' => $caption,
                            'parse_mode' => 'HTML',
                        ]);
                }

                if ($response->successful()) {
                    Log::channel('automation')->info("Telegram: Post successfully shared with image: {$post->title}");
                    return true;
                }

                $errorBody = $response->body();
                Log::channel('automation')->warning("Telegram: sendPhoto failed for post {$post->id}. Status: " . $response->status() . " Body: " . $errorBody);
                Log::error("Telegram sendPhoto error [{$post->id}]: " . $errorBody);
            }

            // Fallback or No Image: Send as regular message
            Log::channel('automation')->info("Telegram: Attempting fallback sendMessage for post {$post->id}");
            $response = Http::withoutVerifying()->timeout(20)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $channelId,
                'text'    => $caption,
                'parse_mode' => 'HTML',
            ]);

            if ($response->successful()) {
                Log::channel('automation')->info("Telegram: Post successfully shared via sendMessage: {$post->title}");
                return true;
            }

            $finalError = $response->body();
            Log::channel('automation')->error("Telegram API Error (Final) for post {$post->id}. Status: " . $response->status() . " Body: " . $finalError);
            return false;

        } catch (\Exception $e) {
            Log::channel('automation')->error("Telegram Service Exception: " . $e->getMessage());
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
