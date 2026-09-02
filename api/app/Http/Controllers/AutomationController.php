<?php

namespace App\Http\Controllers;

use App\Models\AutomationRule;
use App\Models\AutomationChannel;
use App\Models\ChannelPost;
use App\Models\Product;
use App\Models\Setting;
use App\Services\DiscordService;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class AutomationController extends Controller
{
    /* ─────────────────────────────────────────────
     | Legacy Rules CRUD
     ───────────────────────────────────────────── */
    public function rules(Request $request): JsonResponse
    {
        $rules = AutomationRule::orderBy('name')->get();
        return response()->json(['data' => $rules]);
    }

    public function createRule(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'       => 'required|string|max:255',
            'trigger'    => 'required|string',
            'conditions' => 'nullable|array',
            'actions'    => 'required|array',
            'is_enabled' => 'nullable|boolean',
        ]);
        $rule = AutomationRule::create($data);
        return response()->json(['data' => $rule, 'message' => 'Automation rule created.'], 201);
    }

    public function updateRule(Request $request, int $id): JsonResponse
    {
        $rule = AutomationRule::findOrFail($id);
        $data = $request->validate([
            'name'       => 'sometimes|string|max:255',
            'trigger'    => 'sometimes|string',
            'conditions' => 'nullable|array',
            'actions'    => 'sometimes|array',
            'is_enabled' => 'nullable|boolean',
        ]);
        $rule->update($data);
        return response()->json(['data' => $rule, 'message' => 'Rule updated.']);
    }

    public function deleteRule(int $id): JsonResponse
    {
        AutomationRule::findOrFail($id)->delete();
        return response()->json(['message' => 'Rule deleted.']);
    }

    /* ─────────────────────────────────────────────
     | Multi-Channel Management
     ───────────────────────────────────────────── */
    public function getChannels(Request $request): JsonResponse
    {
        $platform = $request->query('platform');
        $query = AutomationChannel::query();
        if ($platform) {
            $query->where('platform', $platform);
        }
        return response()->json(['data' => $query->get()]);
    }

    public function createChannel(Request $request): JsonResponse
    {
        $data = $request->validate([
            'platform' => 'required|string|in:discord,telegram',
            'name'     => 'required|string|max:255',
            'target'   => 'required|string', // webhook_url or chat_id
            'token'    => 'nullable|string', // bot_token for telegram
            'is_active'=> 'boolean',
        ]);
        
        $channel = AutomationChannel::create($data);
        return response()->json(['data' => $channel, 'message' => 'Channel added successfully.']);
    }

    public function updateChannel(Request $request, int $id): JsonResponse
    {
        $channel = AutomationChannel::findOrFail($id);
        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'target'   => 'sometimes|string',
            'token'    => 'nullable|string',
            'is_active'=> 'boolean',
        ]);
        
        $channel->update($data);
        return response()->json(['data' => $channel, 'message' => 'Channel updated.']);
    }

    public function toggleChannel(int $id): JsonResponse
    {
        $channel = AutomationChannel::findOrFail($id);
        $channel->update(['is_active' => !$channel->is_active]);
        return response()->json(['data' => $channel, 'message' => 'Channel status toggled.']);
    }

    public function deleteChannel(int $id): JsonResponse
    {
        AutomationChannel::findOrFail($id)->delete();
        return response()->json(['message' => 'Channel deleted.']);
    }

    /* ─────────────────────────────────────────────
     | Modules — Real DB-backed state
     ───────────────────────────────────────────── */
    public function modules(): JsonResponse
    {
        $randomCfg   = $this->getRandomConfig();
        $featuredCfg = $this->getFeaturedConfigData();
        $stockCfg    = $this->getStockConfigData();

        // Real last_run / next_run from ChannelPost and settings
        $lastRandomPost = ChannelPost::where('trigger', 'random')
            ->latest()->first();

        $now = Carbon::now();

        $modules = [
            [
                'id'          => 'random_post',
                'name'        => 'Random Product Posting',
                'description' => 'Auto-post random eligible products to Telegram/Discord on schedule',
                'enabled'     => $randomCfg['enabled'] ?? false,
                'last_run_at' => $lastRandomPost?->created_at?->toISOString(),
                'next_run_at' => $this->computeNextRun($randomCfg),
                'jobs_24h'    => ChannelPost::where('trigger', 'random')
                                    ->where('created_at', '>=', $now->copy()->subDay())
                                    ->count(),
                'failures_24h' => ChannelPost::where('trigger', 'random')
                                    ->where('status', 'failed')
                                    ->where('created_at', '>=', $now->copy()->subDay())
                                    ->count(),
            ],
            [
                'id'          => 'featured_rotation',
                'name'        => 'Featured Product Rotation',
                'description' => 'Automatically rotate which products are marked as featured',
                'enabled'     => $featuredCfg['enabled'] ?? true,
                'last_run_at' => null,
                'next_run_at' => null,
                'jobs_24h'    => 0,
                'failures_24h' => 0,
            ],
            [
                'id'          => 'stock_suppression',
                'name'        => 'Stock Suppression',
                'description' => 'Auto-hide or badge products at low/zero stock',
                'enabled'     => $stockCfg['enabled'] ?? true,
                'last_run_at' => null,
                'next_run_at' => null,
                'jobs_24h'    => 0,
                'failures_24h' => 0,
            ],
            [
                'id'          => 'import_review',
                'name'        => 'Import Review Queue',
                'description' => 'Draft-to-publish workflow for CSV/API imported products',
                'enabled'     => true,
                'jobs_24h'    => 0,
                'failures_24h' => 0,
            ],
            [
                'id'          => 'recently_updated',
                'name'        => 'Recently Updated Tagging',
                'description' => 'Auto-tag products with recent price or content changes',
                'enabled'     => false,
                'jobs_24h'    => 0,
                'failures_24h' => 0,
            ],
            [
                'id'          => 'reseller_markup',
                'name'        => 'Reseller Markup Tracking',
                'description' => 'Track base cost vs selling price and margin analysis',
                'enabled'     => true,
                'jobs_24h'    => 0,
                'failures_24h' => 0,
            ],
        ];

        return response()->json(['data' => $modules]);
    }

    public function toggleModule(Request $request, string $id): JsonResponse
    {
        $request->validate(['enabled' => 'required|boolean']);

        // Persist toggle in settings
        Setting::setValue("module_{$id}_enabled", $request->enabled ? '1' : '0');

        // For random_post also update the main config
        if ($id === 'random_post') {
            $config = $this->getRandomConfig();
            $config['enabled'] = (bool) $request->enabled;
            Setting::setValue('automation_random_post', json_encode($config));
        }

        return response()->json([
            'message' => "Module {$id} " . ($request->enabled ? 'enabled' : 'disabled') . '.',
            'data'    => ['id' => $id, 'enabled' => (bool) $request->enabled],
        ]);
    }

    /* ─────────────────────────────────────────────
     | Random Post Config — Real DB read/write
     ───────────────────────────────────────────── */
    public function getRandomPostConfig(): JsonResponse
    {
        $config = $this->getRandomConfig();
        return response()->json(['data' => $config]);
    }

    public function updateRandomPostConfig(Request $request): JsonResponse
    {
        // Handle granular toggles
        if ($request->has('automation_new_product_post')) {
            Setting::setValue('automation_new_product_post', $request->automation_new_product_post ? '1' : '0');
        }
        if ($request->has('automation_product_update_notification')) {
            Setting::setValue('automation_product_update_notification', $request->automation_product_update_notification ? '1' : '0');
        }

        // Merge with existing config so partial updates don't wipe data
        $existing = $this->getRandomConfig();
        $incoming = $request->except(['automation_new_product_post', 'automation_product_update_notification']);
        $merged   = array_replace_recursive($existing, $incoming);

        Setting::setValue('automation_random_post', json_encode($merged));

        return response()->json(['message' => 'Random post configuration updated.', 'data' => $merged]);
    }

    /* ─────────────────────────────────────────────
     | Pause Toggle — Real DB-backed
     ───────────────────────────────────────────── */
    public function togglePause(Request $request): JsonResponse
    {
        $request->validate(['paused' => 'required|boolean']);

        $config = $this->getRandomConfig();
        $config['paused'] = (bool) $request->paused;
        Setting::setValue('automation_random_post', json_encode($config));

        return response()->json([
            'message' => 'Automation ' . ($request->paused ? 'paused' : 'resumed') . '.',
            'data'    => ['is_paused' => (bool) $request->paused],
        ]);
    }

    /* ─────────────────────────────────────────────
     | Health — Real stats from ChannelPost table
     ───────────────────────────────────────────── */
    public function getHealth(): JsonResponse
    {
        $config = $this->getRandomConfig();
        $now    = Carbon::now();

        $total      = ChannelPost::where('created_at', '>=', $now->copy()->subDay())->count();
        $successful = ChannelPost::where('status', 'sent')
                        ->where('created_at', '>=', $now->copy()->subDay())->count();
        $failed     = ChannelPost::where('status', 'failed')
                        ->where('created_at', '>=', $now->copy()->subDay())->count();
        $skipped    = $total - $successful - $failed;

        $lastSuccessful = ChannelPost::where('status', 'sent')->latest()->first();

        return response()->json(['data' => [
            'total_jobs_24h'    => $total,
            'successful_24h'    => $successful,
            'failed_24h'        => $failed,
            'skipped_24h'       => max(0, $skipped),
            'success_rate'      => $total > 0 ? round(($successful / $total) * 100, 1) : 0.0,
            'next_scheduled_at' => $this->computeNextRun($config),
            'last_successful_at'=> $lastSuccessful?->created_at?->toISOString(),
            'is_paused'         => $config['paused'] ?? false,
        ]]);
    }

    /* ─────────────────────────────────────────────
     | Test Run — Actually sends to Discord/Telegram
     ───────────────────────────────────────────── */
    public function testRun(Request $request): JsonResponse
    {
        $request->validate(['channel' => 'required|in:telegram,discord']);
        $channel = $request->channel;

        // Pick an eligible product
        $product = Product::where('status', 'active')
            ->where('random_post_eligible', true)
            ->inRandomOrder()
            ->first();

        if (!$product) {
            // Try any active product for test
            $product = Product::where('status', 'active')->inRandomOrder()->first();
        }

        if (!$product) {
            return response()->json(['data' => [
                'product_id'   => null,
                'product_name' => null,
                'channel'      => $channel,
                'preview_text' => 'No products found to test with.',
                'would_post'   => false,
            ]]);
        }

        $sent = false;
        $error = null;

        try {
            if ($channel === 'discord') {
                $discordService = app(DiscordService::class);
                $sent = $discordService->sendProductPost($product, 'manual');
            } else {
                $telegramService = app(TelegramService::class);
                $sent = $telegramService->sendProductPost($product, 'manual');
            }
        } catch (\Exception $e) {
            $error = $e->getMessage();
            Log::channel('automation')->error("Test run exception ({$channel}): " . $e->getMessage());
        }

        $previewText = "🎲 Random Pick!\n\n🔥 {$product->name}\n💰 €" . number_format($product->price, 2) .
            ($product->compare_price ? ' ~~€' . number_format($product->compare_price, 2) . '~~' : '') .
            "\n📦 " . ($product->stock_status === 'in_stock' ? 'In Stock' : ucfirst($product->stock_status)) .
            "\n\n🔗 /products/{$product->slug}";

        return response()->json(['data' => [
            'product_id'   => $product->id,
            'product_name' => $product->name,
            'channel'      => $channel,
            'preview_text' => $previewText,
            'would_post'   => true,
            'sent'         => $sent,
            'error'        => $error,
        ]]);
    }

    public function retryJob(int $id): JsonResponse
    {
        $post = ChannelPost::find($id);
        if (!$post || !$post->product) {
            return response()->json(['message' => 'Job not found.'], 404);
        }

        $sent = false;
        try {
            if ($post->channel === 'discord') {
                $sent = app(DiscordService::class)->sendProductPost($post->product, 'random');
            } elseif ($post->channel === 'telegram') {
                $sent = app(TelegramService::class)->sendProductPost($post->product, 'random');
            }
            if ($sent) {
                $post->update(['status' => 'sent', 'error' => null]);
            }
        } catch (\Exception $e) {
            $post->update(['status' => 'failed', 'error' => $e->getMessage()]);
        }

        return response()->json(['message' => "Job {$id} retried.", 'sent' => $sent]);
    }

    /* ─────────────────────────────────────────────
     | Job History — Real data from ChannelPost
     ───────────────────────────────────────────── */
    public function jobs(Request $request): JsonResponse
    {
        $query = ChannelPost::with('product')->latest();

        if ($request->filled('channel') && $request->channel !== 'all') {
            $query->where('channel', $request->channel);
        }
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('trigger', $request->type === 'random_post' ? 'random' : $request->type);
        }

        $perPage = (int) ($request->per_page ?? 20);
        $page    = $request->paginate(false)
            ? $query->paginate($perPage)
            : $query->limit($perPage)->get();

        $jobs = $query->limit($perPage)->get()->map(function ($post) {
            return [
                'id'           => $post->id,
                'type'         => 'random_post',
                'status'       => $post->status === 'sent' ? 'completed' : ($post->status ?? 'completed'),
                'channel'      => $post->channel,
                'product_id'   => $post->product_id,
                'product_name' => $post->product?->name,
                'error_message'=> $post->error,
                'scheduled_at' => $post->created_at?->toISOString(),
                'completed_at' => $post->status === 'sent' ? $post->updated_at?->toISOString() : null,
                'created_at'   => $post->created_at?->toISOString(),
                'trigger'      => $post->trigger ?? 'random',
            ];
        });

        return response()->json([
            'data' => $jobs,
            'meta' => ['total' => ChannelPost::count()],
        ]);
    }

    /* ─────────────────────────────────────────────
     | Featured Rotation
     ───────────────────────────────────────────── */
    public function getFeaturedConfig(): JsonResponse
    {
        return response()->json(['data' => $this->getFeaturedConfigData()]);
    }

    public function updateFeaturedConfig(Request $request): JsonResponse
    {
        $existing = $this->getFeaturedConfigData();
        $merged   = array_merge($existing, $request->all());
        Setting::setValue('automation_featured_rotation', json_encode($merged));
        return response()->json(['message' => 'Featured rotation configuration updated.', 'data' => $merged]);
    }

    public function triggerFeaturedRotation(): JsonResponse
    {
        $config = $this->getFeaturedConfigData();
        $max    = $config['max_featured'] ?? 6;

        // Unfeature all current featured products
        Product::where('is_featured', true)->update(['is_featured' => false]);

        // Pick new featured products
        $query = Product::where('status', 'active');
        if ($config['require_in_stock'] ?? true) {
            $query->where('stock_status', 'in_stock');
        }
        if ($config['require_image'] ?? true) {
            $query->whereNotNull('image_url')->where('image_url', '!=', '');
        }

        $products = $query->inRandomOrder()->limit($max)->get();
        foreach ($products as $product) {
            $product->update(['is_featured' => true]);
        }

        return response()->json(['message' => 'Featured rotation complete.', 'data' => ['rotated' => $products->count()]]);
    }

    /* ─────────────────────────────────────────────
     | Stock Suppression
     ───────────────────────────────────────────── */
    public function getStockConfig(): JsonResponse
    {
        return response()->json(['data' => $this->getStockConfigData()]);
    }

    public function updateStockConfig(Request $request): JsonResponse
    {
        $existing = $this->getStockConfigData();
        $merged   = array_merge($existing, $request->all());
        Setting::setValue('automation_stock_suppression', json_encode($merged));
        return response()->json(['message' => 'Stock suppression configuration updated.', 'data' => $merged]);
    }

    /* ─────────────────────────────────────────────
     | Import Queue — Real products in 'draft' status
     ───────────────────────────────────────────── */
    public function getImportQueue(): JsonResponse
    {
        $items = Product::whereIn('status', ['draft', 'pending_review'])
            ->orWhere('compliance_status', 'pending')
            ->latest()
            ->limit(50)
            ->get()
            ->map(function ($p) {
                return [
                    'id'            => $p->id,
                    'product_name'  => $p->name,
                    'source'        => $p->supplier_id ? 'api' : 'manual',
                    'imported_by'   => 'Admin',
                    'status'        => $p->status === 'draft' ? 'pending' : $p->status,
                    'field_warnings'=> $this->getProductWarnings($p),
                    'price'         => (float) $p->price,
                    'category_name' => $p->category?->name,
                    'created_at'    => $p->created_at?->toISOString(),
                ];
            });

        return response()->json(['data' => $items]);
    }

    public function approveImport(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 'active', 'compliance_status' => 'approved']);
        return response()->json(['message' => "Product #{$id} approved and set to active."]);
    }

    public function rejectImport(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 'inactive', 'compliance_status' => 'rejected']);
        return response()->json(['message' => "Product #{$id} rejected."]);
    }

    /* ─────────────────────────────────────────────
     | Reseller Markup Preview — Real product margins
     ───────────────────────────────────────────── */
    public function getMarkupPreview(): JsonResponse
    {
        $products = Product::whereNotNull('cost_price')
            ->where('cost_price', '>', 0)
            ->where('status', 'active')
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($p) {
                $cost    = (float) $p->cost_price;
                $price   = (float) $p->price;
                $margin  = $price - $cost;
                $markup  = $cost > 0 ? round(($margin / $cost) * 100, 1) : 0;
                return [
                    'product_id'      => $p->id,
                    'product_name'    => $p->name,
                    'base_cost'       => $cost,
                    'website_price'   => $price,
                    'markup_percent'  => $markup,
                    'margin_amount'   => round($margin, 2),
                    'suggested_price' => round($cost * 1.5, 2),
                ];
            });

        return response()->json(['data' => $products]);
    }

    /* ─────────────────────────────────────────────
     | Private Helpers
     ───────────────────────────────────────────── */
    private function getRandomConfig(): array
    {
        $json = Setting::getValue('automation_random_post');
        if ($json) {
            $config = json_decode($json, true) ?? [];
        } else {
            $config = [];
        }

        // Defaults
        return array_merge([
            'enabled'   => false,
            'paused'    => false,
            'frequency' => 'twice_daily',
            'time_slots'=> ['10:00', '20:00'],
            'timezone'  => 'UTC',
            'channels'  => ['telegram' => true, 'discord' => true],
            'eligibility' => [
                'require_in_stock' => true,
                'require_approved' => false,
                'require_image'    => false,
                'cooldown_days'    => 7,
            ],
            'safety' => [
                'price_check_before_post' => true,
                'compliance_gate'         => false,
                'skip_flagged'            => true,
            ],
            'automation_new_product_post'           => Setting::getValue('automation_new_product_post', '0') === '1',
            'automation_product_update_notification'=> Setting::getValue('automation_product_update_notification', '0') === '1',
        ], $config);
    }

    private function getFeaturedConfigData(): array
    {
        $json = Setting::getValue('automation_featured_rotation');
        return $json ? (json_decode($json, true) ?? []) : [
            'enabled'                        => true,
            'rotation_interval_hours'        => 24,
            'max_featured'                   => 6,
            'require_in_stock'               => true,
            'require_image'                  => true,
            'category_distribution'          => true,
            'exclude_recently_unfeatured_days'=> 3,
            'notify_on_rotation'             => true,
        ];
    }

    private function getStockConfigData(): array
    {
        $json = Setting::getValue('automation_stock_suppression');
        return $json ? (json_decode($json, true) ?? []) : [
            'enabled'                      => true,
            'auto_hide_at_zero'            => true,
            'auto_disable_sync_at_zero'    => true,
            'low_stock_threshold'          => 5,
            'low_stock_badge'              => true,
            'notify_admin_on_low_stock'    => true,
            'notify_admin_on_out_of_stock' => true,
            'auto_restore_on_restock'      => true,
        ];
    }

    private function computeNextRun(array $config): ?string
    {
        if (!($config['enabled'] ?? false) || ($config['paused'] ?? false)) {
            return null;
        }

        $slots    = $config['time_slots'] ?? ['10:00', '20:00'];
        $timezone = $config['timezone'] ?? 'UTC';
        $now      = Carbon::now($timezone);
        $next     = null;

        foreach ($slots as $slot) {
            [$h, $m]  = explode(':', $slot);
            $candidate = $now->copy()->setHour((int)$h)->setMinute((int)$m)->setSecond(0);
            if ($candidate->isFuture()) {
                if (!$next || $candidate->lt($next)) {
                    $next = $candidate;
                }
            }
        }

        // If all slots passed today, get first slot tomorrow
        if (!$next && !empty($slots)) {
            [$h, $m] = explode(':', $slots[0]);
            $next    = $now->copy()->addDay()->setHour((int)$h)->setMinute((int)$m)->setSecond(0);
        }

        return $next?->utc()->toISOString();
    }

    private function getProductWarnings(Product $product): array
    {
        $warnings = [];
        if (!$product->image_url)           $warnings[] = 'No image provided';
        if (!$product->category_id)         $warnings[] = 'Category not assigned';
        if (!$product->price || $product->price == 0) $warnings[] = 'Price is €0.00';
        if (!$product->description)         $warnings[] = 'No description';
        return $warnings;
    }
}
