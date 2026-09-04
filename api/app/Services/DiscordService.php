<?php

namespace App\Services;

use App\Models\Order;
use App\Models\BlogPost;
use App\Models\Product;
use App\Models\DiscordConfig;
use App\Models\AutomationChannel;
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

            // Check for new Multi-Channel setup
        $channels = AutomationChannel::where('platform', 'discord')->where('is_active', true)->get();

        if ($channels->isEmpty()) {
            // Fallback to legacy config
            if (!$webhookUrl) {
                Log::channel('automation')->info('Discord: Skipping blog post share (missing webhook URL).');
                return false;
            }
            // Create a fake channel object to reuse the loop
            $channels = collect([(object)[
                'name' => 'Legacy Webhook',
                'target' => $webhookUrl
            ]]);
        }

        $allSuccess = true;

        foreach ($channels as $channel) {
            $url = $channel->target;
            try {
                $response = Http::withoutVerifying()
                    ->timeout(30)
                    ->post($url, $payload);

                if ($response->successful()) {
                    Log::channel('automation')->info("Discord: Blog post successfully shared to {$channel->name}: {$post->title}");
                } else {
                    Log::channel('automation')->error("Discord: Error sharing to {$channel->name}: " . $response->body());
                    $allSuccess = false;
                }
            } catch (\Exception $e) {
                Log::channel('automation')->error("Discord Exception ({$channel->name}): " . $e->getMessage());
                $allSuccess = false;
            }
        }
        
        } catch (\Exception $e) {
            Log::channel('automation')->error('Discord Exception (Blog Post): ' . $e->getMessage());
            return false;
        }

        return $allSuccess;
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

        // Check per-trigger automation toggle from DiscordConfig
        $triggerToggles = [
            'new'    => 'product_new_auto_post',
            'update' => 'product_update_auto_post',
            'random' => 'product_random_auto_post',
        ];

        if (isset($triggerToggles[$trigger])) {
            $toggleKey = $triggerToggles[$trigger];
            // Read from config; default true so existing installs keep working
            $isEnabled = $config[$toggleKey] ?? true;
            if (!$isEnabled) {
                Log::channel('automation')->info("Discord Product: Skipping {$trigger} post — toggle '{$toggleKey}' is OFF in config.");
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
                                'value' => '**€' . number_format($product->price, 2) . '**' . ($product->compare_price ? ' ~~€' . number_format($product->compare_price, 2) . '~~' : ''),
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

            // Check for new Multi-Channel setup
        $channels = AutomationChannel::where('platform', 'discord')->where('is_active', true)->get();

        if ($channels->isEmpty()) {
            if (!$webhookUrl) {
                Log::channel('automation')->info('Discord Product: Missing webhook URL.');
                return false;
            }
            $channels = collect([(object)[
                'name' => 'Legacy Webhook',
                'target' => $webhookUrl
            ]]);
        }

        $allSuccess = true;

        foreach ($channels as $channel) {
            $url = $channel->target;
            try {
                $response = Http::withoutVerifying()
                    ->timeout(30)
                    ->post($url, $payload);

                if ($response->successful()) {
                    Log::channel('automation')->info("Discord Product: Success to {$channel->name} for '{$product->name}' ({$trigger})");
                } else {
                    Log::channel('automation')->error("Discord Product: Error to {$channel->name}: " . $response->body());
                    $allSuccess = false;
                }
            } catch (\Exception $e) {
                Log::channel('automation')->error("Discord Product Exception ({$channel->name}): " . $e->getMessage());
                $allSuccess = false;
            }
        }
        
        } catch (\Exception $e) {
            Log::channel('automation')->error('Discord Exception (Product Post): ' . $e->getMessage());
            return false;
        }

        return $allSuccess;
    }

    /**
     * Send a notification for a new order to the Discord alert webhook.
     */
    public function sendOrderNotification(Order $order): bool
    {
        Log::info("Discord Alert: Attempting notification for order " . $order->order_number);
        $configModel = DiscordConfig::first();
        $config = $configModel?->config ?? [];
        $alerts = $configModel?->alerts ?? [];

        // Check if order notifications are enabled in alert config (Default to true if not set)
        if (!($alerts['order_completed'] ?? true)) {
            Log::info("Discord Alert: Skipping - 'order_completed' alert is explicitly DISABLED in config.");
            return false;
        }

        // Use alert_webhook_url, fall back to webhook_url
        $webhookUrl = $config['alert_webhook_url'] ?? $config['webhook_url'] ?? null;

        if (!$webhookUrl) {
            Log::error("Discord Alert: ABORTED - Missing webhook URL (both alert and product).");
            return false;
        }

        Log::info("Discord Alert: Using webhook: " . substr($webhookUrl, 0, 30) . "...");

        try {
            $websiteUrl = config('app.url');
            if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
                $websiteUrl = Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
            }

            // Prepare item list
            $items = $order->items->map(function ($item) {
                return "- {$item->product_name} (x{$item->quantity})";
            })->join("\n");

            $payload = [
                'username' => 'UpgraderCX Alerts',
                'embeds' => [
                    [
                        'title' => "🎉 New Order Received! " . $order->order_number,
                        'description' => "A new order has been placed on the store.",
                        'color' => 3066993, // Green (#2ECC71)
                        'fields' => [
                            [
                                'name' => 'Customer',
                                'value' => $order->user?->name ?? 'Guest',
                                'inline' => true
                            ],
                            [
                                'name' => 'Total Amount',
                                'value' => '**' . ($order->currency ?? '€') . number_format($order->total, 2) . '**',
                                'inline' => true
                            ],
                            [
                                'name' => 'Payment Method',
                                'value' => ucfirst(str_replace('_', ' ', $order->payment_method ?? 'Unknown')),
                                'inline' => true
                            ],
                            [
                                'name' => 'Items',
                                'value' => $items ?: 'No details available',
                                'inline' => false
                            ]
                        ],
                        'footer' => [
                            'text' => 'UpgraderCX Order Notification',
                            'icon_url' => rtrim($websiteUrl, '/') . '/favicon.ico'
                        ],
                        'timestamp' => now()->toISOString()
                    ]
                ]
            ];

            $response = Http::withoutVerifying()->timeout(10)->post($webhookUrl, $payload);

            if ($response->successful()) {
                Log::info("Discord Alert: Order notification sent for {$order->order_number}");
                return true;
            }

            Log::error("Discord Alert Error (Order): " . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::error("Discord Alert Exception (Order): " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a notification for a new support ticket or reply to the Discord alert webhook.
     */
    public function sendTicketNotification(\App\Models\Ticket $ticket, ?\App\Models\TicketMessage $message = null): bool
    {
        Log::info("Discord Alert: Ticket notification for #" . $ticket->id);
        $configModel = DiscordConfig::first();
        $config = $configModel?->config ?? [];
        
        $webhookUrl = $config['alert_webhook_url'] ?? $config['webhook_url'] ?? null;

        if (!$webhookUrl) {
            Log::error("Discord Alert: Missing webhook URL for ticket notification.");
            return false;
        }

        try {
            $websiteUrl = config('app.url');
            if (str_ends_with(rtrim($websiteUrl, '/'), '/api')) {
                $websiteUrl = \Illuminate\Support\Str::replaceLast('/api', '', rtrim($websiteUrl, '/'));
            }

            $isReply = $message !== null;
            $ticketUrl = rtrim($websiteUrl, '/') . '/admin/tickets/' . $ticket->id;
            
            $title = $isReply ? "💬 New Ticket Reply: #{$ticket->id}" : "🎟️ New Support Ticket: #{$ticket->id}";
            $color = $isReply ? 15105570 : 3447003; // Orange for reply, Blue for new (#E67E22, #3498DB)
            
            $content = $isReply ? ($message->message ?? '') : ($ticket->messages()->first()?->message ?? '');
            $content = \Illuminate\Support\Str::limit(strip_tags($content), 1000);

            $payload = [
                'username' => 'UpgraderCX Support Alerts',
                'embeds' => [
                    [
                        'title' => $title,
                        'url' => $ticketUrl,
                        'description' => "**Subject:** {$ticket->subject}\n\n**Message:**\n{$content}",
                        'color' => $color,
                        'fields' => [
                            [
                                'name' => 'Customer',
                                'value' => $ticket->user?->name ?? 'Unknown',
                                'inline' => true
                            ],
                            [
                                'name' => 'Priority',
                                'value' => ucfirst($ticket->priority),
                                'inline' => true
                            ],
                            [
                                'name' => 'Category',
                                'value' => ucfirst($ticket->category),
                                'inline' => true
                            ]
                        ],
                        'footer' => [
                            'text' => 'UpgraderCX Ticket Notification',
                            'icon_url' => rtrim($websiteUrl, '/') . '/favicon.ico'
                        ],
                        'timestamp' => now()->toISOString()
                    ]
                ]
            ];

            $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(10)->post($webhookUrl, $payload);

            if ($response->successful()) {
                Log::info("Discord Alert: Ticket notification sent for #{$ticket->id}");
                return true;
            }

            Log::error("Discord Alert Error (Ticket): " . $response->body());
            return false;

        } catch (\Exception $e) {
            Log::error("Discord Alert Exception (Ticket): " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send a simple test message to verify connectivity.
     */
    public function sendTestMessage($message = "Hello from your UpgraderCX AI Blogging Engine! 🚀", $type = 'product')
    {
        $configModel = DiscordConfig::first();
        $config = $configModel?->config ?? [];
        
        $webhookUrl = ($type === 'alert') 
            ? ($config['alert_webhook_url'] ?? $config['webhook_url'] ?? null)
            : ($config['webhook_url'] ?? null);

        if (!$webhookUrl) {
            return [
                'ok' => false,
                'description' => "Missing Webhook URL configuration for " . $type . "."
            ];
        }

        try {
            $payload = [
                'content' => $message,
                'username' => 'UpgraderCX Tester'
            ];

            $response = Http::withoutVerifying()->timeout(10)->post($webhookUrl, $payload);

            if ($response->successful()) {
                return ['ok' => true, 'description' => 'Test message sent successfully to ' . $type . ' webhook!'];
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
