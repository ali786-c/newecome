<?php

namespace App\Http\Controllers;

use App\Models\BlogAutomationConfig;
use App\Models\BlogKeyword;
use App\Jobs\GenerateAIBlogJob;
use App\Models\Setting;
use App\Services\PinterestService;
use App\Services\TelegramService;
use App\Services\DiscordService;
use App\Models\DiscordConfig;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AdminBlogAutomationController extends Controller
{
    public function show(): \Illuminate\Http\JsonResponse
    {
        $config = BlogAutomationConfig::firstOrCreate([], [
            'posts_per_day' => 1,
            'mode' => 'draft',
            'default_tone' => 'professional',
            'model_text' => 'gemini-2.5-flash',
            'model_image' => 'gemini-3.1-flash-image-preview',
            'is_enabled' => false,
        ]);

        return response()->json(['data' => $config]);
    }

    public function update(Request $request): JsonResponse
    {
        $config = BlogAutomationConfig::first();

        $data = $request->validate([
            'posts_per_day' => 'sometimes|integer|min:1|max:24',
            'mode'          => 'sometimes|in:auto,draft',
            'default_tone'  => 'sometimes|string|max:255',
            'model_text'    => 'sometimes|string|max:255',
            'model_image'   => 'sometimes|string|max:255',
            'is_enabled'    => 'sometimes|boolean',
        ]);

        if ($config) {
            $config->update($data);
        } else {
            $config = BlogAutomationConfig::create($data);
        }

        return response()->json(['data' => $config, 'message' => 'AI Blog configuration updated.']);
    }

    public function trigger()
    {
        // Increase time limit for this request (AI takes ~60s)
        set_time_limit(0);
        ignore_user_abort(true);

        // Pick the keyword with the oldest 'last_used_at' timestamp (LRU Algorithm)
        $keyword = BlogKeyword::where('status', 'active')
            ->orderBy('last_used_at', 'asc')
            ->first();

        if (!$keyword) {
            return response()->json(['message' => 'No active keywords found.'], 400);
        }

        // Update usage tracking BEFORE dispatch to prevent race conditions
        $keyword->update([
            'last_used_at' => now(),
            'usage_count' => ($keyword->usage_count ?? 0) + 1
        ]);

        // Set initial status
        Cache::put('ai_blog_generation_status', [
            'active' => true,
            'message' => 'Engine Warming Up...',
            'percentage' => 5,
            'last_updated' => now()->toISOString()
        ], 300);

        // Run it IMMEDIATELY for manual clicks
        // dispatchSync will run it in the current request
        GenerateAIBlogJob::dispatchSync($keyword);

        return response()->json(['message' => 'AI Blog Generation completed.']);
    }

    public function status()
    {
        $status = Cache::get('ai_blog_generation_status', [
            'active' => false,
            'message' => 'Idle',
            'percentage' => 0
        ]);

        return response()->json($status);
    }

    public function getTelegramConfig(): JsonResponse
    {
        return response()->json([
            'data' => [
                'enabled' => Setting::getValue('telegram_auto_post_enabled', '0') === '1',
                'token'   => Setting::getValue('telegram_bot_token', ''),
                'channel_id' => Setting::getValue('telegram_channel_id', ''),
            ]
        ]);
    }

    public function updateTelegramConfig(Request $request): JsonResponse
    {
        $request->validate([
            'enabled' => 'required|boolean',
            'token'   => 'nullable|string',
            'channel_id' => 'nullable|string',
        ]);

        Setting::setValue('telegram_auto_post_enabled', $request->enabled ? '1' : '0');
        Setting::setValue('telegram_bot_token', $request->token);
        Setting::setValue('telegram_channel_id', $request->channel_id);

        return response()->json(['message' => 'Telegram configuration updated.']);
    }

    public function testTelegram(Request $request): JsonResponse
    {
        $service = new TelegramService();
        $result = $service->sendTestMessage();

        if (isset($result['ok']) && $result['ok']) {
            return response()->json(['message' => 'Test message sent successfully!']);
        }

        $error = $result['description'] ?? 'Unknown Error (Check bot permissions)';
        Log::channel('automation')->error("Telegram Test Failed: " . json_encode($result));

        return response()->json([
            'message' => 'Telegram Test Failed: ' . $error,
            'details' => $result
        ], 400);
    }

    public function sendPostToTelegram(int $id): JsonResponse
    {
        $post = \App\Models\BlogPost::findOrFail($id);
        $service = new TelegramService();
        $success = $service->sendBlogPost($post);

        if ($success) {
            return response()->json(['message' => 'Blog post sent to Telegram!']);
        }

        return response()->json([
            'message' => 'Failed to send to Telegram. Check automation logs.',
        ], 400);
    }

    public function getPinterestConfig(): JsonResponse
    {
        $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
        $data = $config->config ?? [];
        
        return response()->json([
            'data' => [
                'enabled' => ($data['auto_post_enabled'] ?? false) == true,
                'connected' => $config->status === 'active',
                'selected_board_id' => $data['board_id'] ?? null,
                'boards' => $config->boards ?? []
            ]
        ]);
    }

    public function updatePinterestConfig(Request $request): JsonResponse
    {
        $request->validate([
            'enabled' => 'required|boolean',
            'board_id' => 'nullable|string',
        ]);

        $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
        $current = $config->config ?? [];
        $current['auto_post_enabled'] = $request->enabled;
        if ($request->has('board_id')) {
            $current['board_id'] = $request->board_id;
        }

        $config->update(['config' => $current]);

        return response()->json(['message' => 'Pinterest configuration updated.']);
    }

    public function testPinterest(): \Illuminate\Http\JsonResponse
    {
        $service = new PinterestService();
        $boards = $service->getBoards();

        if (!empty($boards)) {
            return response()->json(['message' => 'Connection successful! Boards synchronized.']);
        }

        return response()->json([
            'message' => 'Pinterest Connection Failed. Please check your credentials and authorize.',
        ], 400);
    }

    public function sendPostToPinterest(int $id): \Illuminate\Http\JsonResponse
    {
        $post = \App\Models\BlogPost::findOrFail($id);
        $service = new PinterestService();
        $result = $service->sendBlogPost($post);

        if ($result && isset($result['id'])) {
            return response()->json(['message' => 'Blog post shared on Pinterest!']);
        }

        return response()->json([
            'message' => 'Failed to share on Pinterest. Ensure you have authorized and selected a board.',
        ], 400);
    }

    public function getDiscordConfig(): JsonResponse
    {
        $config = DiscordConfig::firstOrCreate(['id' => 1]);
        $data = $config->config ?? [];
        
        return response()->json([
            'data' => [
                'enabled' => ($data['auto_post_enabled'] ?? false) == true,
                'webhook_url' => $data['webhook_url'] ?? '',
            ]
        ]);
    }

    public function updateDiscordConfig(Request $request): JsonResponse
    {
        $request->validate([
            'enabled' => 'required|boolean',
            'webhook_url' => 'nullable|url',
        ]);

        $config = DiscordConfig::firstOrCreate(['id' => 1]);
        $current = $config->config ?? [];
        $current['auto_post_enabled'] = $request->enabled;
        $current['webhook_url'] = $request->webhook_url;

        $config->update(['config' => $current]);

        return response()->json(['message' => 'Discord configuration updated.']);
    }

    public function testDiscord(): JsonResponse
    {
        $service = new DiscordService();
        $result = $service->sendTestMessage();

        if ($result['ok']) {
            return response()->json(['message' => 'Test message sent to Discord!']);
        }

        return response()->json([
            'message' => 'Discord Test Failed: ' . $result['description'],
        ], 400);
    }

    public function sendPostToDiscord(int $id): JsonResponse
    {
        $post = \App\Models\BlogPost::findOrFail($id);
        $service = new DiscordService();
        $success = $service->sendBlogPost($post);

        if ($success) {
            return response()->json(['message' => 'Blog post shared on Discord!']);
        }

        return response()->json([
            'message' => 'Failed to share on Discord. Check automation logs.',
        ], 400);
    }
}
