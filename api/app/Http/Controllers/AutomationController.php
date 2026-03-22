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
            'name'        => 'required|string|max:255',
            'trigger'     => 'required|string',
            'conditions'  => 'nullable|array',
            'actions'     => 'required|array',
            'is_enabled'  => 'nullable|boolean',
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

    public function modules(): JsonResponse
    {
        return response()->json(['data' => [
            ['id' => 'random_post',          'name' => 'Random Post',           'status' => 'active'],
            ['id' => 'featured_rotation',    'name' => 'Featured Rotation',     'status' => 'active'],
            ['id' => 'stock_suppression',    'name' => 'Stock Suppression',     'status' => 'active'],
            ['id' => 'discord_sync',         'name' => 'Discord Sync',          'status' => 'active'],
            ['id' => 'telegram_broadcast',   'name' => 'Telegram Broadcast',    'status' => 'active'],
        ]]);
    }

    public function toggleModule(Request $request, string $id): JsonResponse
    {
        $request->validate(['enabled' => 'required|boolean']);
        return response()->json(['message' => "Module $id " . ($request->enabled ? 'enabled' : 'disabled') . '.']);
    }

    /* ── Random Post ── */
    public function getRandomPostConfig(): JsonResponse
    {
        $config = Setting::getValue('automation_random_post');
        if ($config) {
            $data = json_decode($config, true);
            
            // Inject granular toggles if not in JSON
            $data['automation_new_product_post'] = Setting::getValue('automation_new_product_post', '0') === '1';
            $data['automation_product_update_notification'] = Setting::getValue('automation_product_update_notification', '0') === '1';
            
            return response()->json(['data' => $data]);
        }

        return response()->json(['data' => [
            'enabled' => false,
            'frequency' => 'daily',
            'time_slots' => ['09:00'],
            'timezone' => 'UTC',
            'channels' => ['telegram' => false, 'discord' => false],
            'eligibility' => [
                'require_in_stock' => true,
                'require_approved' => true,
                'require_image' => false,
                'cooldown_days' => 7
            ],
            'safety' => [
                'price_check_before_post' => true,
                'compliance_gate' => true,
                'skip_flagents' => true
            ],
            'automation_new_product_post' => false,
            'automation_product_update_notification' => false
        ]]);
    }

    public function updateRandomPostConfig(Request $request): JsonResponse
    {
        // Handle granular toggles first
        if ($request->has('automation_new_product_post')) {
            Setting::setValue('automation_new_product_post', $request->automation_new_product_post ? '1' : '0');
        }
        if ($request->has('automation_product_update_notification')) {
            Setting::setValue('automation_product_update_notification', $request->automation_product_update_notification ? '1' : '0');
        }

        // Store the rest as JSON
        $data = $request->except(['automation_new_product_post', 'automation_product_update_notification']);
        Setting::setValue('automation_random_post', json_encode($data));

        return response()->json(['message' => 'Random post configuration updated.']);
    }

    public function togglePause(Request $request): JsonResponse
    {
        $request->validate(['paused' => 'required|boolean']);
        return response()->json(['message' => 'Automation ' . ($request->paused ? 'paused' : 'resumed') . '.']);
    }

    public function getHealth(): JsonResponse
    {
        return response()->json(['data' => [
            'total_jobs_24h' => 7,
            'successful_24h' => 4,
            'failed_24h' => 1,
            'skipped_24h' => 1,
            'success_rate' => 80.0,
            'next_scheduled_at' => now()->addHours(2)->toISOString(),
            'is_paused' => false,
        ]]);
    }

    public function testRun(Request $request): JsonResponse
    {
        $request->validate(['channel' => 'required|in:telegram,discord']);
        return response()->json(['data' => [
            'preview_text' => "Test post for {$request->channel} generated successfully.",
        ]]);
    }

    public function retryJob(int $id): JsonResponse
    {
        return response()->json(['message' => "Job $id queued for retry."]);
    }

    /* ── Featured Rotation ── */
    public function getFeaturedConfig(): JsonResponse
    {
        return response()->json(['data' => [
            'enabled' => true,
            'rotation_interval_hours' => 24,
            'max_featured' => 6,
            'require_in_stock' => true,
            'require_image' => true,
            'category_distribution' => true,
            'exclude_recently_unfeatured_days' => 3,
            'notify_on_rotation' => true
        ]]);
    }

    public function updateFeaturedConfig(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Featured rotation configuration updated.']);
    }

    /* ── Stock Suppression ── */
    public function getStockConfig(): JsonResponse
    {
        return response()->json(['data' => [
            'enabled' => true,
            'auto_hide_at_zero' => true,
            'auto_disable_sync_at_zero' => true,
            'low_stock_threshold' => 5,
            'low_stock_badge' => true,
            'notify_admin_on_low_stock' => true,
            'notify_admin_on_out_of_stock' => true,
            'auto_restore_on_restock' => true
        ]]);
    }

    public function updateStockConfig(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Stock suppression configuration updated.']);
    }

    /* ── Import Queue ── */
    public function getImportQueue(): JsonResponse
    {
        return response()->json(['data' => []]);
    }

    public function approveImport(int $id): JsonResponse
    {
        return response()->json(['message' => "Import $id approved."]);
    }

    public function rejectImport(int $id): JsonResponse
    {
        return response()->json(['message' => "Import $id rejected."]);
    }

    public function getMarkupPreview(): JsonResponse
    {
        return response()->json(['data' => []]);
    }
}
