<?php

namespace App\Http\Controllers;

use App\Models\AutomationRule;
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

    public function jobs(Request $request): JsonResponse
    {
        return response()->json(['data' => [], 'message' => 'Queue monitoring via Laravel Horizon.']);
    }

    public function triggerRandomPost(): JsonResponse
    {
        return response()->json(['message' => 'Random post triggered.']);
    }

    public function triggerFeaturedRotation(): JsonResponse
    {
        return response()->json(['message' => 'Featured rotation triggered.']);
    }

    public function toggleStockSuppression(Request $request): JsonResponse
    {
        $request->validate(['enabled' => 'required|boolean']);
        return response()->json(['message' => 'Stock suppression ' . ($request->enabled ? 'enabled' : 'disabled') . '.']);
    }
}
