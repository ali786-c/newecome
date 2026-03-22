> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `api\app\Http\Controllers\DiscordController.php` (Domain: **Generic Logic**)

### 📐 Generic Logic Conventions & Fixes
- **[what-changed] Replaced auth Handle — prevents null/undefined runtime crashes**: -         $cfg->update(['commands' => $request->all()]);
+         $cfg->update(['commands' => array_merge($cfg->commands ?? [], $request->all())]);
-         $cfg->update(['permissions' => $request->all()]);
+         
-         return response()->json(['data' => $cfg->permissions, 'message' => 'Permissions updated.']);
+         // Handle partial update for a specific command
-     }
+         if ($request->has('command') && $request->has('data')) {
- 
+             $perms = $cfg->permissions ?? [];
-     public function postHistory(Request $request): JsonResponse
+             $found = false;
-     {
+             foreach ($perms as &$p) {
-         $posts = ChannelPost::where('channel', 'discord')->orderBy('created_at', 'desc')->paginate(15);
+                 if ($p['command'] === $request->command) {
-         return response()->json($posts);
+                     $p = array_merge($p, $request->data);
-     }
+                     $found = true;
- 
+                     break;
-     public function push(Request $request): JsonResponse
+                 }
-     {
+             }
-         $request->validate(['message' => 'required|string', 'product_id' => 'nullable|exists:products,id']);
+             if (!$found) {
- 
+                 $perms[] = array_merge(['command' => $request->command], $request->data);
-         ChannelPost::create([
+             }
-             'channel'    => 'discord',
+             $cfg->update(['permissions' => $perms]);
-             'product_id' => $request->product_id,
+         } else {
-             'message'    => $request->message,
+             // Fallback to full overwrite if data structure is different
-             'status'     => 'sent',
+             $cfg->update(['permissions' => $request->all()]);
-         ]);
+         }
- 
+         
-         return response()->json(['message' => 'Pushed to Discord.']);
+         return response()->json(['data' => $cfg->permissions, 'message' => 'Permissions updated.']);
-     public function alerts(): JsonResponse
+     public function postHistory(Request $request): JsonResponse
-         $cfg = DiscordConfig::first();
+         $posts = ChannelPost::where('channel', 'discord')->orderBy('created_at', 'desc')->paginate(15);
-         return response()->json(['data' => $cfg?->alerts ?? []]);
+         return response()->json($posts);
-     public function updateAlerts(Request $request): JsonResponse
+     public function push(Request $request): JsonResponse
-         $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
+         $request->validate(['message' => 'required|string', 'product_id' => 'nullable|exists:products,id']);
-         $cfg->update(['alerts' => $request->all()]);
+ 
-         return response()->json(['data' => $cfg->alerts, 'message' => 'Alerts updated.']);
+         ChannelPost::create([
-     }
+             'channel'    => 'discord',
- 
+             'product_id' => $request->product_id,
-     public function setWebhookUrl(Request $request): JsonResponse
+             'message'    => $request->message,
-     {
+             'status'     => 'sent',
-         $request->validate(['webhook_url' => 'required|url']);
+         ]);
-         $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
+ 
-         
+         return response()->json(['message' => 'Pushed to Discord.']);
-         $config = $cfg->config ?? [];
+     }
-         $config['webhook_url'] = $request->webhook_url;
+ 
-         $cfg->update(['config' => $config]);
+     public function alerts(): JsonResponse
- 
+     {
-         return response()->json(['data' => $cfg, 'message' => 'Product webhook URL updated.']);
+         $cfg = DiscordConfig::first();
-     }
+         return response()->json(['data' => $cfg?->alerts ?? []]);
- 
+     }
-     public function setAlertWebhookUrl(Request $request): JsonResponse
+ 
-     {
+     public function updateAlerts(Request $request): JsonResponse
-         $request->validate(['webhook_url' => 'required|url']);
+     {
-         
+         $cfg->update(['alerts' => array_merge($cfg->alerts ?? [], $request->all())]);
-         $config = $cfg->config ?? [];
+         return response()->json(['data' => $cfg->alerts, 'message' => 'Alerts updated.']);
-         $config['alert_webhook_url'] = $request->webhook_url;
+     }
-         $cfg->update(['config' => $config]);
+ 
- 
+     public function setWebhookUrl(Request $request): JsonResponse
-         return response()->json(['data' => $cfg, 'message' => 'Alert webhook URL updated.']);
+     {
-     }
+         $request->validate(['webhook_url' => 'required|url']);
- 
+         $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
-     public function setBotToken(Request $request): JsonResponse
+         
-     {
+         $config = $cfg->config ?? [];
-         $request->validate(['token' => 'required|string']);
+         $config['webhook_url'] = $request->webhook_url;
-         $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
+         $cfg->update(['config' => $config]);
-         
+ 
-         $config = $cfg->config ?? [];
+         return response()->json(['data' => $cfg, 'message' => 'Product webhook URL updated.']);
-         $config['bot_token'] = $request->token;
+     }
-         $cfg->update(['config' => $config]);
+ 
- 
+     public function setAlertWebhookUrl(Request $request): JsonResponse
-         return response()->json(['data' => $cfg, 'message' => 'Bot token updated.']);
+     {
-     }
+         $request->validate(['webhook_url' => 'required|url']);
- 
+         $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
-     public function test(): JsonResponse
+         
-     {
+         $config = $cfg->config ?? [];
-         $service = new \App\Services\DiscordService();
+         $config['alert_webhook_url'] = $request->webhook_url;
-         $result = $service->sendTestMessage();
+         $cfg->update(['config' => $config]);
-         if ($result['ok']) {
+         return response()->json(['data' => $cfg, 'message' => 'Alert webhook URL updated.']);
-             return response()->json(['data' => ['success' => true], 'message' => $result['description']]);
+     }
-         }
+ 
- 
+     public function setBotToken(Request $request): JsonResponse
-         return response()->json(['data' => ['success' => false], 'message' => $result['description']], 400);
+     {
-     }
+         $request->validate(['token' => 'required|string']);
- }
+         $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
- 
+         
+         $config = $cfg->config ?? [];
+         $config['bot_token'] = $request->token;
+         $cfg->update(['config' => $config]);
+ 
+         return response()->json(['data' => $cfg, 'message' => 'Bot token updated.']);
+     }
+ 
+     public function test(): JsonResponse
+     {
+         $service = new \App\Services\DiscordService();
+         $result = $service->sendTestMessage();
+ 
+         if ($result['ok']) {
+             return response()->json(['data' => ['success' => true], 'message' => $result['description']]);
+         }
+ 
+         return response()->json(['data' => ['success' => false], 'message' => $result['description']], 400);
+     }
+ }
+ 
- **[what-changed] what-changed in DiscordController.php**: -         $cfg->update(['config' => $request->all()]);
+         $cfg->update(['config' => array_merge($cfg->config ?? [], $request->all())]);
- **[what-changed] what-changed in DiscordController.php**: File updated (external): api/app/Http/Controllers/DiscordController.php

Content summary (131 lines):
<?php

namespace App\Http\Controllers;

use App\Models\DiscordConfig;
use App\Models\ChannelPost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DiscordController extends Controller
{
    public function getConfig(): JsonResponse
    {
        return response()->json(['data' => DiscordConfig::first()]);
    }

    public function updateConfig(Request $request): JsonResponse
    {
        $cfg = DiscordConfig::firstOrCreate(['id' => 1]);
        $cfg->update(['config' => $r
- **[what-changed] what-changed in AutomationController.php**: - }
+ 
- 
+     /* ── Job History ── */
+     public function jobs(Request $request): JsonResponse
+     {
+         // For now, return empty as the table is being populated by workers
+         // In a real scenario, this would query a dedicated automation_jobs table or filtered SyncLogs
+         return response()->json(['data' => [], 'meta' => ['total' => 0]]);
+     }
+ }
+ 
- **[what-changed] what-changed in SupplierImportController.php**: -                 'last_sync_at'      => $sp->last_sync_at ? $sp->last_sync_at->toISOString() : null,
+                 'last_sync_at'      => $sp->last_sync_at ? $sp->last_sync_at->toIso8601String() : null,
- **[what-changed] what-changed in ProductController.php**: File updated (external): api/app/Http/Controllers/ProductController.php

Content summary (170 lines):
<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'supplier'])
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('slug', 'like', "%{$request->
- **[what-changed] what-changed in SupplierImportController.php**: File updated (external): api/app/Http/Controllers/SupplierImportController.php

Content summary (231 lines):
<?php

namespace App\Http\Controllers;

use App\Models\SupplierConnection;
use App\Models\SupplierProduct;
use App\Models\Product;
use App\Models\SupplierSyncLog;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Artisan;

class SupplierImportController extends Controller
{
    /**
     * List all supplier connections.
     */
    public function connections(): JsonResponse
    {
        $connections
- **[convention] convention in AutomationController.php**: File updated (external): api/app/Http/Controllers/AutomationController.php

Content summary (217 lines):
<?php

namespace App\Http\Controllers;

use App\Models\AutomationRule;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AutomationController extends Controller
{
    public function rules(Request $request): JsonResponse
    {
        $rules = AutomationRule::orderBy('name')->get();
        return response()->json(['data' => $rules]);
    }

    public function createRule(Request $request): JsonResponse
    {
        $data = $request->validate([
      
- **[what-changed] Replaced auth Services — prevents null/undefined runtime crashes**: - use Illuminate\Support\Facades\Cache;
+ use App\Services\TelegramService;
- use Illuminate\Support\Facades\Log;
+ use App\Services\DiscordService;
- 
+ use App\Models\DiscordConfig;
- class AdminBlogAutomationController extends Controller
+ use Illuminate\Http\Request;
- {
+ use Illuminate\Http\JsonResponse;
-     public function show(): \Illuminate\Http\JsonResponse
+ use Illuminate\Support\Facades\Cache;
-     {
+ use Illuminate\Support\Facades\Log;
-         $config = BlogAutomationConfig::firstOrCreate([], [
+ 
-             'posts_per_day' => 1,
+ class AdminBlogAutomationController extends Controller
-             'mode' => 'draft',
+ {
-             'default_tone' => 'professional',
+     public function show(): \Illuminate\Http\JsonResponse
-             'model_text' => 'gemini-2.5-flash',
+     {
-             'model_image' => 'gemini-3.1-flash-image-preview',
+         $config = BlogAutomationConfig::firstOrCreate([], [
-             'is_enabled' => false,
+             'posts_per_day' => 1,
-         ]);
+             'mode' => 'draft',
- 
+             'default_tone' => 'professional',
-         return response()->json(['data' => $config]);
+             'model_text' => 'gemini-2.5-flash',
-     }
+             'model_image' => 'gemini-3.1-flash-image-preview',
- 
+             'is_enabled' => false,
-     public function update(Request $request): JsonResponse
+         ]);
-     {
+ 
-         $config = BlogAutomationConfig::first();
+         return response()->json(['data' => $config]);
- 
+     }
-         $data = $request->validate([
+ 
-             'posts_per_day' => 'sometimes|integer|min:1|max:24',
+     public function update(Request $request): JsonResponse
-             'mode'          => 'sometimes|in:auto,draft',
+     {
-             'default_tone'  => 'sometimes|string|max:255',
+         $config = BlogAutomationConfig::first();
-             'model_text'    => 'sometimes|string|max:255',
+ 
-             'model_image'   => 'sometimes|string|max:255',
+         $data = $request->validate([
-             'is_enabled'    => 'sometimes|boolean',
+             'posts_per_day' => 'sometimes|integer|min:1|max:24',
-         ]);
+             'mode'          => 'sometimes|in:auto,draft',
- 
+             'default_tone'  => 'sometimes|string|max:255',
-         if ($config) {
+             'model_text'    => 'sometimes|string|max:255',
-             $config->update($data);
+             'model_image'   => 'sometimes|string|max:255',
-         } else {
+             'is_enabled'    => 'sometimes|boolean',
-             $config = BlogAutomationConfig::create($data);
+         ]);
-         }
+ 
- 
+         if ($config) {
-         return response()->json(['data' => $config, 'message' => 'AI Blog configuration updated.']);
+             $config->update($data);
-     }
+         } else {
- 
+             $config = BlogAutomationConfig::create($data);
-     public function trigger()
+         }
-     {
+ 
-         // Increase time limit for this request (AI takes ~60s)
+         return response()->json(['data' => $config, 'message' => 'AI Blog configuration updated.']);
-         set_time_limit(0);
+     }
-         ignore_user_abort(true);
+ 
- 
+     public function trigger()
-         // Pick the keyword with the oldest 'last_used_at' timestamp (LRU Algorithm)
+     {
-         $keyword = BlogKeyword::where('status', 'active')
+         // Increase time limit for this request (AI takes ~60s)
-             ->orderBy('last_used_at', 'asc')
+         set_time_limit(0);
-             ->first();
+         ignore_user_abort(true);
-         if (!$keyword) {
+         // Pick the keyword with the oldest 'last_used_at' timestamp (LRU Algorithm)
-             return response()->json(['message' => 'No active keywords found.'], 400);
+         $keyword = BlogKeyword::where('status', 'active')
-         }
+             ->orderBy('last_used_at', 'asc')
- 
+             ->first();
-         // Update usage tracking BEFORE dispatch to prevent race conditions
+ 
-         $keyword->update([
+         if (!$keyword) {
-             'last_used_at' => now(),
+             return response()->json(['message' => 'No active keywords found.'], 400);
-             'usage_count' => ($keyword->usage_count ?? 0) + 1
+         }
-         ]);
+ 
- 
+         // Update usage tracking BEFORE dispatch to prevent race conditions
-         // Set initial status
+         $keyword->update([
-         Cache::put('ai_blog_generation_status', [
+             'last_used_at' => now(),
-             'active' => true,
+             'usage_count' => ($keyword->usage_count ?? 0) + 1
-             'message' => 'Engine Warming Up...',
+         ]);
-             'percentage' => 5,
+ 
-             'last_updated' => now()->toISOString()
+         // Set initial status
-         ], 300);
+         Cache::put('ai_blog_generation_status', [
- 
+             'active' => true,
-         // Run it IMMEDIATELY for manual clicks
+             'message' => 'Engine Warming Up...',
-         // dispatchSync will run it in the current request
+             'percentage' => 5,
-         GenerateAIBlogJob::dispatchSync($keyword);
+             'last_updated' => now()->toISOString()
- 
+         ], 300);
-         return response()->json(['message' => 'AI Blog Generation completed.']);
+ 
-     }
+         // Run it IMMEDIATELY for manual clicks
- 
+         // dispatchSync will run it in the current request
-     public function status()
+         GenerateAIBlogJob::dispatchSync($keyword);
-     {
+ 
-         $status = Cache::get('ai_blog_generation_status', [
+         return response()->json(['message' => 'AI Blog Generation completed.']);
-             'active' => false,
+     }
-             'message' => 'Idle',
+ 
-             'percentage' => 0
+     public function status()
-         ]);
+     {
- 
+         $status = Cache::get('ai_blog_generation_status', [
-         return response()->json($status);
+             'active' => false,
-     }
+             'message' => 'Idle',
- 
+             'percentage' => 0
-     public function getTelegramConfig(): JsonResponse
+         ]);
-     {
+ 
-         return response()->json([
+         return response()->json($status);
-             'data' => [
+     }
-                 'enabled' => Setting::getValue('telegram_auto_post_enabled', '0') === '1',
+ 
-                 'token'   => Setting::getValue('telegram_bot_token', ''),
+     public function getTelegramConfig(): JsonResponse
-                 'channel_id' => Setting::getValue('telegram_channel_id', ''),
+     {
-             ]
+         return response()->json([
-         ]);
+             'data' => [
-     }
+                 'enabled' => Setting::getValue('telegram_auto_post_enabled', '0') === '1',
- 
+                 'token'   => Setting::getValue('telegram_bot_token', ''),
-     public function updateTelegramConfig(Request $request): JsonResponse
+                 'channel_id' => Setting::getValue('telegram_channel_id', ''),
-     {
+             ]
-         $request->validate([
+         ]);
-             'enabled' => 'required|boolean',
+     }
-             'token'   => 'nullable|string',
+ 
-             'channel_id' => 'nullable|string',
+     public function updateTelegramConfig(Request $request): JsonResponse
-         ]);
+     {
- 
+         $request->validate([
-         Setting::setValue('telegram_auto_post_enabled', $request->enabled ? '1' : '0');
+             'enabled' => 'required|boolean',
-         Setting::setValue('telegram_bot_token', $request->token);
+             'token'   => 'nullable|string',
-         Setting::setValue('telegram_channel_id', $request->channel_id);
+             'channel_id' => 'nullable|string',
- 
+         ]);
-         return response()->json(['message' => 'Telegram configuration updated.']);
+ 
-     }
+         Setting::setValue('telegram_auto_post_enabled', $request->enabled ? '1' : '0');
- 
+         Setting::setValue('telegram_bot_token', $request->token);
-     public function testTelegram(Request $request): JsonResponse
+         Setting::setValue('telegram_channel_id', $request->channel_id);
-     {
+ 
-         $service = new TelegramService();
+         return response()->json(['message' => 'Telegram configuration updated.']);
-         $result = $service->sendTestMessage();
+     }
-         if (isset($result['ok']) && $result['ok']) {
+     public function testTelegram(Request $request): JsonResponse
-             return response()->json(['message' => 'Test message sent successfully!']);
+     {
-         }
+         $service = new TelegramService();
- 
+         $result = $service->sendTestMessage();
-         $error = $result['description'] ?? 'Unknown Error (Check bot permissions)';
+ 
-         Log::channel('automation')->error("Telegram Test Failed: " . json_encode($result));
+         if (isset($result['ok']) && $result['ok']) {
- 
+             return response()->json(['message' => 'Test message sent successfully!']);
-         return response()->json([
+         }
-             'message' => 'Telegram Test Failed: ' . $error,
+ 
-             'details' => $result
+         $error = $result['description'] ?? 'Unknown Error (Check bot permissions)';
-         ], 400);
+         Log::channel('automation')->error("Telegram Test Failed: " . json_encode($result));
-     }
+ 
- 
+         return response()->json([
-     public function sendPostToTelegram(int $id): JsonResponse
+             'message' => 'Telegram Test Failed: ' . $error,
-     {
+             'details' => $result
-         $post = \App\Models\BlogPost::findOrFail($id);
+         ], 400);
-         $service = new TelegramService();
+     }
-         $success = $service->sendBlogPost($post);
+ 
- 
+     public function sendPostToTelegram(int $id): JsonResponse
-         if ($success) {
+     {
-             return response()->json(['message' => 'Blog post sent to Telegram!']);
+         $post = \App\Models\BlogPost::findOrFail($id);
-         }
+         $service = new TelegramService();
- 
+         $success = $service->sendBlogPost($post);
-         return response()->json([
+ 
-             'message' => 'Failed to send to Telegram. Check automation logs.',
+         if ($success) {
-         ], 400);
+             return response()->json(['message' => 'Blog post sent to Telegram!']);
-     }
+         }
-     public function getPinterestConfig(): JsonResponse
+         return response()->json([
-     {
+             'message' => 'Failed to send to Telegram. Check automation logs.',
-         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
+         ], 400);
-         $data = $config->config ?? [];
+     }
-         
+ 
-         return response()->json([
+     public function getPinterestConfig(): JsonResponse
-             'data' => [
+     {
-                 'enabled' => ($data['auto_post_enabled'] ?? false) == true,
+         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
-                 'connected' => $config->status === 'active',
+         $data = $config->config ?? [];
-                 'selected_board_id' => $data['board_id'] ?? null,
+         
-                 'boards' => $config->boards ?? []
+         return response()->json([
-             ]
+             'data' => [
-         ]);
+                 'enabled' => ($data['auto_post_enabled'] ?? false) == true,
-     }
+                 'connected' => $config->status === 'active',
- 
+                 'selected_board_id' => $data['board_id'] ?? null,
-     public function updatePinterestConfig(Request $request): JsonResponse
+                 'boards' => $config->boards ?? []
-     {
+             ]
-         $request->validate([
+         ]);
-             'enabled' => 'required|boolean',
+     }
-             'board_id' => 'nullable|string',
+ 
-         ]);
+     public function updatePinterestConfig(Request $request): JsonResponse
- 
+     {
-         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
+         $request->validate([
-         $current = $config->config ?? [];
+             'enabled' => 'required|boolean',
-         $current['auto_post_enabled'] = $request->enabled;
+             'board_id' => 'nullable|string',
-         if ($request->has('board_id')) {
+         ]);
-             $current['board_id'] = $request->board_id;
+ 
-         }
+         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
- 
+         $current = $config->config ?? [];
-         $config->update(['config' => $current]);
+         $current['auto_post_enabled'] = $request->enabled;
- 
+         if ($request->has('board_id')) {
-         return response()->json(['message' => 'Pinterest configuration updated.']);
+             $current['board_id'] = $request->board_id;
-     }
+         }
-     public function testPinterest(): \Illuminate\Http\JsonResponse
+         $config->update(['config' => $current]);
-     {
+ 
-         $service = new PinterestService();
+         return response()->json(['message' => 'Pinterest configuration updated.']);
-         $boards = $service->getBoards();
+     }
-         if (!empty($boards)) {
+     public function testPinterest(): \Illuminate\Http\JsonResponse
-             return response()->json(['message' => 'Connection successful! Boards synchronized.']);
+     {
-         }
+         $service = new PinterestService();
- 
+         $boards = $service->getBoards();
-         return response()->json([
+ 
-             'message' => 'Pinterest Connection Failed. Please check your credentials and authorize.',
+         if (!empty($boards)) {
-         ], 400);
+             return response()->json(['message' => 'Connection successful! Boards synchronized.']);
-     }
+         }
-     public function sendPostToPinterest(int $id): \Illuminate\Http\JsonResponse
+         return response()->json([
-     {
+             'message' => 'Pinterest Connection Failed. Please check your credentials and authorize.',
-         $post = \App\Models\BlogPost::findOrFail($id);
+         ], 400);
-         $service = new PinterestService();
+     }
-         $result = $service->sendBlogPost($post);
+ 
- 
+     public function sendPostToPinterest(int $id): \Illuminate\Http\JsonResponse
-         if ($result && isset($result['id'])) {
+     {
-             return response()->json(['message' => 'Blog post shared on Pinterest!']);
+         $post = \App\Models\BlogPost::findOrFail($id);
-         }
+         $service = new PinterestService();
- 
+         $result = $service->sendBlogPost($post);
-         return response()->json([
+ 
-             'message' => 'Failed to share on Pinterest. Ensure you have authorized and selected a board.',
+         if ($result && isset($result['id'])) {
-         ], 400);
+             return response()->json(['message' => 'Blog post shared on Pinterest!']);
-     }
+         }
- }
+ 
- 
+         return response()->json([
+             'message' => 'Failed to share on Pinterest. Ensure you have authorized and selected a board.',
+         ], 400);
+     }
+ 
+     public function getDiscordConfig(): JsonResponse
+     {
+         $config = DiscordConfig::firstOrCreate(['id' => 1]);
+         $data = $config->config ?? [];
+         
+         return response()->json([
+             'data' => [
+                 'enabled' => ($data['auto_post_enabled'] ?? false) == true,
+                 'webhook_url' => $data['webhook_url'] ?? '',
+             ]
+         ]);
+     }
+ 
+     public function updateDiscordConfig(Request $request): JsonResponse
+     {
+         $request->validate([
+             'enabled' => 'required|boolean',
+             'webhook_url' => 'nullable|url',
+         ]);
+ 
+         $config = DiscordConfig::firstOrCreate(['id' => 1]);
+         $current = $config->config ?? [];
+         $current['auto_post_enabled'] = $request->enabled;
+         $current['webhook_url'] = $request->webhook_url;
+ 
+         $config->update(['config' => $current]);
+ 
+         return response()->json(['message' => 'Discord configuration updated.']);
+     }
+ 
+     public function testDiscord(): JsonResponse
+     {
+         $service = new DiscordService();
+         $result = $service->sendTestMessage();
+ 
+         if ($result['ok']) {
+             return response()->json(['message' => 'Test message sent to Discord!']);
+         }
+ 
+         return response()->json([
+             'message' => 'Discord Test Failed: ' . $result['description'],
+         ], 400);
+     }
+ 
+     public function sendPostToDiscord(int $id): JsonResponse
+     {
+         $post = \App\Models\BlogPost::findOrFail($id);
+         $service = new DiscordService();
+         $success = $service->sendBlogPost($post);
+ 
+         if ($success) {
+             return response()->json(['message' => 'Blog post shared on Discord!']);
+         }
+ 
+         return response()->json([
+             'message' => 'Failed to share on Discord. Check automation logs.',
+         ], 400);
+     }
+ }
+ 
- **[what-changed] what-changed in AdminBlogAutomationController.php**: -     public function show(): JsonResponse
+     public function show(): \Illuminate\Http\JsonResponse
-     public function testPinterest(): JsonResponse
+     public function testPinterest(): \Illuminate\Http\JsonResponse
-     public function sendPostToPinterest(int $id): JsonResponse
+     public function sendPostToPinterest(int $id): \Illuminate\Http\JsonResponse
- **[what-changed] Replaced auth Request — prevents null/undefined runtime crashes**: -     /**
+     public function saveManualToken(Request $request): \Illuminate\Http\JsonResponse
-      * Get user boards from Pinterest.
+     {
-      */
+         $request->validate([
-     public function getBoards(): JsonResponse
+             'access_token' => 'required|string',
-     {
+             'refresh_token' => 'nullable|string',
-         $boards = $this->pinterestService->getBoards();
+         ]);
-         return response()->json(['data' => $boards]);
+ 
-     }
+         $cfg = PinterestConfig::firstOrCreate(['id' => 1]);
- 
+         $currentConfig = $cfg->config ?? [];
-     /**
+         
-      * Test the Pinterest connection by fetching boards.
+         $cfg->update([
-      */
+             'config' => array_merge($currentConfig, [
-     public function testConnection(): JsonResponse
+                 'access_token' => $request->access_token,
-     {
+                 'refresh_token' => $request->refresh_token,
-         $boards = $this->pinterestService->getBoards();
+                 'expires_at' => null // Manual tokens might not have an expiry provided
-         if (!empty($boards) || count($boards) === 0) {
+             ]),
-             return response()->json(['success' => true, 'message' => 'Connection successful.']);
+             'status' => 'active'
-         }
+         ]);
-         return response()->json(['success' => false, 'message' => 'Connection failed.'], 500);
+ 
-     }
+         return response()->json(['message' => 'Manual tokens saved successfully.']);
- }
+     }
+     /**
+      * Get user boards from Pinterest.
+      */
+     public function getBoards(): \Illuminate\Http\JsonResponse
+     {
+         $boards = $this->pinterestService->getBoards();
+         return response()->json(['data' => $boards]);
+     }
+ 
+     /**
+      * Test the Pinterest connection by fetching boards.
+      */
+     public function testConnection(): \Illuminate\Http\JsonResponse
+     {
+         $boards = $this->pinterestService->getBoards();
+         if (!empty($boards) || count($boards) === 0) {
+             return response()->json(['success' => true, 'message' => 'Connection successful.']);
+         }
+         return response()->json(['success' => false, 'message' => 'Connection failed.'], 500);
+     }
+ }
+ 
- **[what-changed] Replaced auth Request**: -     public function handleCallback(Request $request): JsonResponse
+     public function handleCallback(Request $request)
-         $state = $request->get('state');
+         
- 
+         if (!$code) {
-         // Optional: Validate state against session
+             return redirect(env('FRONTEND_URL', 'https://upgradercx.com') . '/admin/integrations?error=no_code');
-         // if ($state !== session('pinterest_oauth_state')) { ... }
+         }
-         if (!$code) {
+         $tokens = $this->pinterestService->getTokenFromCode($code);
-             return response()->json(['message' => 'Authorization failed: No code provided.'], 400);
+         
-         }
+         if ($tokens) {
- 
+             return redirect(env('FRONTEND_URL', 'https://upgradercx.com') . '/admin/integrations?success=pinterest_connected');
-         $tokens = $this->pinterestService->getTokenFromCode($code);
+         }
-         if ($tokens) {
+ 
-             return response()->json(['message' => 'Pinterest connected successfully.']);
+         return redirect(env('FRONTEND_URL', 'https://upgradercx.com') . '/admin/integrations?error=token_exchange_failed');
-         }
+     }
-         return response()->json(['message' => 'Failed to exchange code for tokens.'], 500);
+     /**
-     }
+      * Get user boards from Pinterest.
- 
+      */
-     /**
+     public function getBoards(): JsonResponse
-      * Get user boards from Pinterest.
+     {
-      */
+         $boards = $this->pinterestService->getBoards();
-     public function getBoards(): JsonResponse
+         return response()->json(['data' => $boards]);
-     {
+     }
-         $boards = $this->pinterestService->getBoards();
+ 
-         return response()->json(['data' => $boards]);
+     /**
-     }
+      * Test the Pinterest connection by fetching boards.
- 
+      */
-     /**
+     public function testConnection(): JsonResponse
-      * Test the Pinterest connection by fetching boards.
+     {
-      */
+         $boards = $this->pinterestService->getBoards();
-     public function testConnection(): JsonResponse
+         if (!empty($boards) || count($boards) === 0) {
-     {
+             return response()->json(['success' => true, 'message' => 'Connection successful.']);
-         $boards = $this->pinterestService->getBoards();
+         }
-         if (!empty($boards) || count($boards) === 0) {
+         return response()->json(['success' => false, 'message' => 'Connection failed.'], 500);
-             return response()->json(['success' => true, 'message' => 'Connection successful.']);
+     }
-         }
+ }
-         return response()->json(['success' => false, 'message' => 'Connection failed.'], 500);
+ 
-     }
- }
- 
- **[what-changed] Replaced auth Services — prevents null/undefined runtime crashes**: - use App\Services\TelegramService;
+ use App\Services\PinterestService;
- use Illuminate\Http\Request;
+ use Illuminate\Support\Facades\Cache;
- use Illuminate\Http\JsonResponse;
+ use Illuminate\Support\Facades\Log;
- use Illuminate\Support\Facades\Cache;
+ 
- 
+ class AdminBlogAutomationController extends Controller
- class AdminBlogAutomationController extends Controller
+ {
- {
+     public function show(): JsonResponse
-     public function show(): JsonResponse
+     {
-     {
+         $config = BlogAutomationConfig::firstOrCreate([], [
-         $config = BlogAutomationConfig::firstOrCreate([], [
+             'posts_per_day' => 1,
-             'posts_per_day' => 1,
+             'mode' => 'draft',
-             'mode' => 'draft',
+             'default_tone' => 'professional',
-             'default_tone' => 'professional',
+             'model_text' => 'gemini-2.5-flash',
-             'model_text' => 'gemini-2.5-flash',
+             'model_image' => 'gemini-3.1-flash-image-preview',
-             'model_image' => 'gemini-3.1-flash-image-preview',
+             'is_enabled' => false,
-             'is_enabled' => false,
+         ]);
-         ]);
+ 
- 
+         return response()->json(['data' => $config]);
-         return response()->json(['data' => $config]);
+     }
-     }
+ 
- 
+     public function update(Request $request): JsonResponse
-     public function update(Request $request): JsonResponse
+     {
-     {
+         $config = BlogAutomationConfig::first();
-         $config = BlogAutomationConfig::first();
+ 
- 
+         $data = $request->validate([
-         $data = $request->validate([
+             'posts_per_day' => 'sometimes|integer|min:1|max:24',
-             'posts_per_day' => 'sometimes|integer|min:1|max:24',
+             'mode'          => 'sometimes|in:auto,draft',
-             'mode'          => 'sometimes|in:auto,draft',
+             'default_tone'  => 'sometimes|string|max:255',
-             'default_tone'  => 'sometimes|string|max:255',
+             'model_text'    => 'sometimes|string|max:255',
-             'model_text'    => 'sometimes|string|max:255',
+             'model_image'   => 'sometimes|string|max:255',
-             'model_image'   => 'sometimes|string|max:255',
+             'is_enabled'    => 'sometimes|boolean',
-             'is_enabled'    => 'sometimes|boolean',
+         ]);
-         ]);
+ 
- 
+         if ($config) {
-         if ($config) {
+             $config->update($data);
-             $config->update($data);
+         } else {
-         } else {
+             $config = BlogAutomationConfig::create($data);
-             $config = BlogAutomationConfig::create($data);
+         }
-         }
+ 
- 
+         return response()->json(['data' => $config, 'message' => 'AI Blog configuration updated.']);
-         return response()->json(['data' => $config, 'message' => 'AI Blog configuration updated.']);
+     }
-     }
+ 
- 
+     public function trigger()
-     public function trigger()
+     {
-     {
+         // Increase time limit for this request (AI takes ~60s)
-         // Increase time limit for this request (AI takes ~60s)
+         set_time_limit(0);
-         set_time_limit(0);
+         ignore_user_abort(true);
-         ignore_user_abort(true);
+ 
- 
+         // Pick the keyword with the oldest 'last_used_at' timestamp (LRU Algorithm)
-         // Pick the keyword with the oldest 'last_used_at' timestamp (LRU Algorithm)
+         $keyword = BlogKeyword::where('status', 'active')
-         $keyword = BlogKeyword::where('status', 'active')
+             ->orderBy('last_used_at', 'asc')
-             ->orderBy('last_used_at', 'asc')
+             ->first();
-             ->first();
+ 
- 
+         if (!$keyword) {
-         if (!$keyword) {
+             return response()->json(['message' => 'No active keywords found.'], 400);
-             return response()->json(['message' => 'No active keywords found.'], 400);
+         }
-         }
+ 
- 
+         // Update usage tracking BEFORE dispatch to prevent race conditions
-         // Update usage tracking BEFORE dispatch to prevent race conditions
+         $keyword->update([
-         $keyword->update([
+             'last_used_at' => now(),
-             'last_used_at' => now(),
+             'usage_count' => ($keyword->usage_count ?? 0) + 1
-             'usage_count' => ($keyword->usage_count ?? 0) + 1
+         ]);
-         ]);
+ 
- 
+         // Set initial status
-         // Set initial status
+         Cache::put('ai_blog_generation_status', [
-         Cache::put('ai_blog_generation_status', [
+             'active' => true,
-             'active' => true,
+             'message' => 'Engine Warming Up...',
-             'message' => 'Engine Warming Up...',
+             'percentage' => 5,
-             'percentage' => 5,
+             'last_updated' => now()->toISOString()
-             'last_updated' => now()->toISOString()
+         ], 300);
-         ], 300);
+ 
- 
+         // Run it IMMEDIATELY for manual clicks
-         // Run it IMMEDIATELY for manual clicks
+         // dispatchSync will run it in the current request
-         // dispatchSync will run it in the current request
+         GenerateAIBlogJob::dispatchSync($keyword);
-         GenerateAIBlogJob::dispatchSync($keyword);
+ 
- 
+         return response()->json(['message' => 'AI Blog Generation completed.']);
-         return response()->json(['message' => 'AI Blog Generation completed.']);
+     }
-     }
+ 
- 
+     public function status()
-     public function status()
+     {
-     {
+         $status = Cache::get('ai_blog_generation_status', [
-         $status = Cache::get('ai_blog_generation_status', [
+             'active' => false,
-             'active' => false,
+             'message' => 'Idle',
-             'message' => 'Idle',
+             'percentage' => 0
-             'percentage' => 0
+         ]);
-         ]);
+ 
- 
+         return response()->json($status);
-         return response()->json($status);
+     }
-     }
+ 
- 
+     public function getTelegramConfig(): JsonResponse
-     public function getTelegramConfig(): JsonResponse
+     {
-     {
+         return response()->json([
-         return response()->json([
+             'data' => [
-             'data' => [
+                 'enabled' => Setting::getValue('telegram_auto_post_enabled', '0') === '1',
-                 'enabled' => Setting::getValue('telegram_auto_post_enabled', '0') === '1',
+                 'token'   => Setting::getValue('telegram_bot_token', ''),
-                 'token'   => Setting::getValue('telegram_bot_token', ''),
+                 'channel_id' => Setting::getValue('telegram_channel_id', ''),
-                 'channel_id' => Setting::getValue('telegram_channel_id', ''),
+             ]
-             ]
+         ]);
-         ]);
+     }
-     }
+ 
- 
+     public function updateTelegramConfig(Request $request): JsonResponse
-     public function updateTelegramConfig(Request $request): JsonResponse
+     {
-     {
+         $request->validate([
-         $request->validate([
+             'enabled' => 'required|boolean',
-             'enabled' => 'required|boolean',
+             'token'   => 'nullable|string',
-             'token'   => 'nullable|string',
+             'channel_id' => 'nullable|string',
-             'channel_id' => 'nullable|string',
+         ]);
-         ]);
+ 
- 
+         Setting::setValue('telegram_auto_post_enabled', $request->enabled ? '1' : '0');
-         Setting::setValue('telegram_auto_post_enabled', $request->enabled ? '1' : '0');
+         Setting::setValue('telegram_bot_token', $request->token);
-         Setting::setValue('telegram_bot_token', $request->token);
+         Setting::setValue('telegram_channel_id', $request->channel_id);
-         Setting::setValue('telegram_channel_id', $request->channel_id);
+ 
- 
+         return response()->json(['message' => 'Telegram configuration updated.']);
-         return response()->json(['message' => 'Telegram configuration updated.']);
+     }
-     }
+ 
- 
+     public function testTelegram(Request $request): JsonResponse
-     public function testTelegram(Request $request): JsonResponse
+     {
-     {
+         $service = new TelegramService();
-         $service = new TelegramService();
+         $result = $service->sendTestMessage();
-         $result = $service->sendTestMessage();
+ 
- 
+         if (isset($result['ok']) && $result['ok']) {
-         if (isset($result['ok']) && $result['ok']) {
+             return response()->json(['message' => 'Test message sent successfully!']);
-             return response()->json(['message' => 'Test message sent successfully!']);
+         }
-         }
+ 
- 
+         $error = $result['description'] ?? 'Unknown Error (Check bot permissions)';
-         $error = $result['description'] ?? 'Unknown Error (Check bot permissions)';
+         Log::channel('automation')->error("Telegram Test Failed: " . json_encode($result));
-         Log::channel('automation')->error("Telegram Test Failed: " . json_encode($result));
+ 
- 
+         return response()->json([
-         return response()->json([
+             'message' => 'Telegram Test Failed: ' . $error,
-             'message' => 'Telegram Test Failed: ' . $error,
+             'details' => $result
-             'details' => $result
+         ], 400);
-         ], 400);
+     }
-     }
+ 
- 
+     public function sendPostToTelegram(int $id): JsonResponse
-     public function sendPostToTelegram(int $id): JsonResponse
+     {
-     {
+         $post = \App\Models\BlogPost::findOrFail($id);
-         $post = \App\Models\BlogPost::findOrFail($id);
+         $service = new TelegramService();
-         $service = new TelegramService();
+         $success = $service->sendBlogPost($post);
-         $success = $service->sendBlogPost($post);
+ 
- 
+         if ($success) {
-         if ($success) {
+             return response()->json(['message' => 'Blog post sent to Telegram!']);
-             return response()->json(['message' => 'Blog post sent to Telegram!']);
+         }
-         }
+ 
- 
+         return response()->json([
-         return response()->json([
+             'message' => 'Failed to send to Telegram. Check automation logs.',
-             'message' => 'Failed to send to Telegram. Check automation logs.',
+         ], 400);
-         ], 400);
+     }
-     }
+ 
- }
+     public function getPinterestConfig(): JsonResponse
- 
+     {
+         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
+         $data = $config->config ?? [];
+         
+         return response()->json([
+             'data' => [
+                 'enabled' => ($data['auto_post_enabled'] ?? false) == true,
+                 'connected' => $config->status === 'active',
+                 'selected_board_id' => $data['board_id'] ?? null,
+                 'boards' => $config->boards ?? []
+             ]
+         ]);
+     }
+ 
+     public function updatePinterestConfig(Request $request): JsonResponse
+     {
+         $request->validate([
+             'enabled' => 'required|boolean',
+             'board_id' => 'nullable|string',
+         ]);
+ 
+         $config = \App\Models\PinterestConfig::firstOrCreate(['id' => 1]);
+         $current = $config->config ?? [];
+         $current['auto_post_enabled'] = $request->enabled;
+         if ($request->has('board_id')) {
+             $current['board_id'] = $request->board_id;
+         }
+ 
+         $config->update(['config' => $current]);
+ 
+         return response()->json(['message' => 'Pinterest configuration updated.']);
+     }
+ 
+     public function testPinterest(): JsonResponse
+     {
+         $service = new PinterestService();
+         $boards = $service->getBoards();
+ 
+         if (!empty($boards)) {
+             return response()->json(['message' => 'Connection successful! Boards synchronized.']);
+         }
+ 
+         return response()->json([
+             'message' => 'Pinterest Connection Failed. Please check your credentials and authorize.',
+         ], 400);
+     }
+ 
+     public function sendPostToPinterest(int $id): JsonResponse
+     {
+         $post = \App\Models\BlogPost::findOrFail($id);
+         $service = new PinterestService();
+         $result = $service->sendBlogPost($post);
+ 
+         if ($result && isset($result['id'])) {
+             return response()->json(['message' => 'Blog post shared on Pinterest!']);
+         }
+ 
+         return response()->json([
+             'message' => 'Failed to share on Pinterest. Ensure you have authorized and selected a board.',
+         ], 400);
+     }
+ }
+ 
- **[what-changed] what-changed in PinterestController.php**: File updated (external): api/app/Http/Controllers/PinterestController.php

Content summary (125 lines):
<?php

namespace App\Http\Controllers;

use App\Models\PinterestConfig;
use App\Services\PinterestService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class PinterestController extends Controller
{
    protected $pinterestService;

    public function __construct(PinterestService $pinterestService)
    {
        $this->pinterestService = $pinterestService;
    }

    /**
     * Get the Pinterest configuration.
     */
    public function ge
- **[convention] problem-fix in AdminBlogAutomationController.php — confirmed 3x**: -         public function sendPostToTelegram(int $id): JsonResponse
+     }
-     {
+ 
-         $post = \App\Models\BlogPost::findOrFail($id);
+     public function sendPostToTelegram(int $id): JsonResponse
-         $service = new TelegramService();
+     {
-         $success = $service->sendBlogPost($post);
+         $post = \App\Models\BlogPost::findOrFail($id);
- 
+         $service = new TelegramService();
-         if ($success) {
+         $success = $service->sendBlogPost($post);
-             return response()->json(['message' => 'Blog post sent to Telegram!']);
+ 
-         }
+         if ($success) {
- 
+             return response()->json(['message' => 'Blog post sent to Telegram!']);
-         return response()->json([
+         }
-             'message' => 'Failed to send to Telegram. Check automation logs.',
+ 
-         ], 400);
+         return response()->json([
-     }
+             'message' => 'Failed to send to Telegram. Check automation logs.',
- }
+         ], 400);
- }
+     }
- 
+ }
+ 
